"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { monthToPeriod, round2 } from "@/lib/rentas/labels";

/**
 * Captura de Rentas: cargos, pagos con aplicación y gastos con prorrateo.
 * Siempre con rol operator/admin (RLS lo exige también). Todo lo capturado
 * lleva source = 'captura' y created_by del usuario.
 */

export type FormState = { error?: string; warning?: string; fields?: Record<string, string> } | undefined;

type Enums = Database["public"]["Enums"];

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => {
  const raw = str(fd, k).replace(/,/g, "");
  if (raw === "") return NaN;
  return Number(raw);
};
const dateOk = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s + "T12:00:00").getTime());
const isUuid = (s: string) => /^[0-9a-f-]{36}$/i.test(s);

function oneOf<T extends string>(v: string, allowed: readonly T[]): v is T {
  return (allowed as readonly string[]).includes(v);
}

const CONCEPTS = ["rent", "maintenance", "service", "other"] as const satisfies readonly Enums["charge_concept"][];
const METHODS = ["transfer", "cash", "check", "card", "other"] as const satisfies readonly Enums["payment_method"][];
const CATEGORIES = ["electricity", "water", "phone", "maintenance", "property_tax", "insurance", "repairs", "admin_fee", "other"] as const satisfies readonly Enums["expense_category"][];
const CLASSES = ["pending", "stone_expense", "tenant_passthrough", "both"] as const satisfies readonly Enums["expense_classification"][];
const TAX_TREATMENTS = ["iva_incluido", "mas_iva", "exento"] as const satisfies readonly Enums["tax_treatment"][];

function dbMessage(msg: string) {
  // Mensajes de los triggers ya vienen en español; los de Postgres se traducen a lo útil.
  if (/charges_folio_unique|duplicate key/.test(msg)) return "Ya existe un cargo con ese folio. Revisa el folio o déjalo vacío.";
  if (/lease_terms_no_overlap/.test(msg)) return "Las fechas se traslapan con otra condición del contrato. Ajusta la fecha de inicio.";
  if (/row-level security/.test(msg)) return "Tu rol no permite registrar esto.";
  return msg;
}

// ---------------------------------------------------------------- cargos

export async function createCharge(_prev: FormState, fd: FormData): Promise<FormState> {
  const me = await requireRole("operator");
  const leaseId = str(fd, "lease_id");
  const concept = str(fd, "concept");
  const period = monthToPeriod(str(fd, "period"));
  const folio = str(fd, "invoice_folio") || null;
  const invoiceDate = str(fd, "invoice_date") || null;
  const dueDate = str(fd, "due_date") || null;
  const subtotal = num(fd, "subtotal");
  const tax = num(fd, "tax_amount");
  const notes = str(fd, "notes") || null;

  if (!isUuid(leaseId)) return { error: "Elige el contrato al que corresponde el cargo." };
  if (!oneOf(concept, CONCEPTS)) return { error: "Elige un concepto de la lista." };
  if (!period) return { error: "Indica el mes del cargo (columna MES), por ejemplo 2026-11." };
  if (!Number.isFinite(subtotal) || subtotal < 0) return { error: "El subtotal debe ser un monto en pesos, sin IVA, mayor o igual a cero." };
  if (!Number.isFinite(tax) || tax < 0) return { error: "El IVA debe ser un monto mayor o igual a cero (0 si está exento)." };
  if (invoiceDate && !dateOk(invoiceDate)) return { error: "La fecha de factura no es válida. Usa el selector de fecha." };
  if (dueDate && !dateOk(dueDate)) return { error: "La fecha de vencimiento no es válida. Usa el selector de fecha." };
  if (invoiceDate && dueDate && dueDate < invoiceDate) return { error: "El vencimiento no puede ser anterior a la fecha de factura." };

  const supabase = await createClient();
  const { data: lease } = await supabase
    .from("leases")
    .select("id, tenant_id, development_id, status, lease_units(unit_id)")
    .eq("id", leaseId)
    .maybeSingle();
  if (!lease) return { error: "No encontramos ese contrato. Recarga la página e inténtalo de nuevo." };
  if (lease.status !== "active") return { error: "El contrato no está activo. Solo se cargan rentas a contratos activos." };

  const unitId = lease.lease_units?.[0]?.unit_id ?? null;
  const { error } = await supabase.from("charges").insert({
    org_id: me.membership.orgId,
    tenant_id: lease.tenant_id,
    lease_id: lease.id,
    unit_id: unitId,
    development_id: lease.development_id,
    concept,
    period,
    invoice_folio: folio,
    invoice_date: invoiceDate,
    due_date: dueDate,
    subtotal: round2(subtotal),
    tax_amount: round2(tax),
    source: "captura",
    notes,
    created_by: me.id,
  });
  if (error) return { error: dbMessage(error.message) };

  revalidatePath("/rentas");
  redirect("/rentas?ok=cargo");
}

// ---------------------------------------------------------------- pagos y aplicaciones

/** Lee las aplicaciones del formulario: campos `alloc:<charge_id>` con el monto. */
function readAllocations(fd: FormData) {
  const out: { chargeId: string; amount: number }[] = [];
  for (const [k, v] of fd.entries()) {
    if (!k.startsWith("alloc:")) continue;
    const chargeId = k.slice(6);
    const amount = Number(String(v).replace(/,/g, ""));
    if (!isUuid(chargeId) || !Number.isFinite(amount) || amount <= 0) continue;
    out.push({ chargeId, amount: round2(amount) });
  }
  return out;
}

async function validateAllocations(tenantId: string, available: number, allocs: { chargeId: string; amount: number }[]) {
  const supabase = await createClient();
  const total = allocs.reduce((s, a) => s + a.amount, 0);
  if (total > available + 0.005) {
    return `Las aplicaciones suman más que el monto disponible del pago. Reduce alguna aplicación o deja parte sin aplicar.`;
  }
  if (allocs.length === 0) return null;
  const { data: balances } = await supabase
    .from("charge_balances")
    .select("charge_id, tenant_id, balance, status")
    .in("charge_id", allocs.map((a) => a.chargeId));
  for (const a of allocs) {
    const b = (balances ?? []).find((x) => x.charge_id === a.chargeId);
    if (!b) return "Uno de los cargos ya no existe. Recarga la página.";
    if (b.tenant_id !== tenantId) return "Solo se puede aplicar a cargos del mismo arrendatario.";
    if (b.status === "void") return "Uno de los cargos está anulado y no admite aplicaciones.";
    if (a.amount > Number(b.balance ?? 0) + 0.005) return "Una aplicación excede el saldo del cargo. Ajusta el monto al saldo pendiente.";
  }
  return null;
}

export async function createPayment(_prev: FormState, fd: FormData): Promise<FormState> {
  const me = await requireRole("operator");
  const tenantId = str(fd, "tenant_id");
  const effectiveDate = str(fd, "effective_date");
  const amount = num(fd, "amount");
  const method = str(fd, "method");
  const bankRef = str(fd, "bank_ref") || null;
  const notes = str(fd, "notes") || null;

  if (!isUuid(tenantId)) return { error: "Elige el arrendatario que pagó." };
  if (!dateOk(effectiveDate)) return { error: "Indica la fecha en que se recibió el pago." };
  if (!Number.isFinite(amount) || amount <= 0) return { error: "El monto del pago debe ser mayor a cero." };
  if (!oneOf(method, METHODS)) return { error: "Elige el medio de pago." };

  const allocs = readAllocations(fd);
  const invalid = await validateAllocations(tenantId, round2(amount), allocs);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      org_id: me.membership.orgId,
      tenant_id: tenantId,
      effective_date: effectiveDate,
      amount: round2(amount),
      method,
      bank_ref: bankRef,
      source: "captura",
      notes,
      created_by: me.id,
    })
    .select("id")
    .single();
  if (error || !payment) return { error: dbMessage(error?.message ?? "No se pudo registrar el pago.") };

  if (allocs.length) {
    const { error: aErr } = await supabase.from("payment_allocations").insert(
      allocs.map((a) => ({ org_id: me.membership.orgId, payment_id: payment.id, charge_id: a.chargeId, amount: a.amount })),
    );
    if (aErr) {
      revalidatePath("/rentas");
      redirect(`/rentas/pagos/${payment.id}/aplicar?error=${encodeURIComponent(dbMessage(aErr.message))}`);
    }
  }

  revalidatePath("/rentas");
  redirect(`/rentas?ok=pago${allocs.length ? "" : "-sin-aplicar"}`);
}

export async function allocatePayment(_prev: FormState, fd: FormData): Promise<FormState> {
  const me = await requireRole("operator");
  const paymentId = str(fd, "payment_id");
  if (!isUuid(paymentId)) return { error: "Pago no válido." };

  const supabase = await createClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, tenant_id, amount, payment_allocations(amount)")
    .eq("id", paymentId)
    .maybeSingle();
  if (!payment) return { error: "No encontramos el pago." };
  const applied = (payment.payment_allocations ?? []).reduce((s, a) => s + Number(a.amount), 0);
  const available = round2(Number(payment.amount) - applied);

  const allocs = readAllocations(fd);
  if (!allocs.length) return { error: "Captura al menos un monto a aplicar." };
  const invalid = await validateAllocations(payment.tenant_id, available, allocs);
  if (invalid) return { error: invalid };

  const { error } = await supabase.from("payment_allocations").insert(
    allocs.map((a) => ({ org_id: me.membership.orgId, payment_id: payment.id, charge_id: a.chargeId, amount: a.amount })),
  );
  if (error) return { error: dbMessage(error.message) };

  revalidatePath("/rentas");
  redirect("/rentas?ok=aplicacion");
}

// ---------------------------------------------------------------- gastos y prorrateo

export async function createExpense(_prev: FormState, fd: FormData): Promise<FormState> {
  const me = await requireRole("operator");
  const developmentId = str(fd, "development_id") || null;
  const unitId = str(fd, "unit_id") || null;
  const category = str(fd, "category");
  const vendor = str(fd, "vendor") || null;
  const period = monthToPeriod(str(fd, "period")) || null;
  const chargedAt = str(fd, "charged_at") || null;
  const subtotal = num(fd, "subtotal");
  const tax = num(fd, "tax_amount");
  const classification = str(fd, "classification");
  const recoverable = fd.get("recoverable") === "on";
  const notes = str(fd, "notes") || null;

  if (!developmentId && !unitId) return { error: "Indica el inmueble o la unidad a la que corresponde el gasto." };
  if (developmentId && !isUuid(developmentId)) return { error: "Inmueble no válido." };
  if (unitId && !isUuid(unitId)) return { error: "Unidad no válida." };
  if (!oneOf(category, CATEGORIES)) return { error: "Elige la categoría del gasto." };
  if (!Number.isFinite(subtotal) || subtotal < 0) return { error: "El subtotal debe ser un monto sin IVA mayor o igual a cero." };
  if (!Number.isFinite(tax) || tax < 0) return { error: "El IVA debe ser un monto mayor o igual a cero." };
  if (!oneOf(classification, CLASSES)) return { error: "Elige la clasificación del gasto." };
  if (chargedAt && !dateOk(chargedAt)) return { error: "La fecha de cobro del proveedor no es válida." };

  // Prorrateo: filas share:<n>:party / pct / factor
  const total = round2(subtotal + tax);
  const shares: { entity_id: string | null; tenant_id: string | null; share_pct: number; factor: number; amount: number; rule_note: string | null }[] = [];
  for (let i = 0; i < 12; i++) {
    const party = str(fd, `share:${i}:party`);
    if (!party) continue;
    const [kind, id] = party.split(":");
    const pct = num(fd, `share:${i}:pct`);
    const factorRaw = str(fd, `share:${i}:factor`);
    const factor = factorRaw === "" ? 1 : Number(factorRaw);
    const note = str(fd, `share:${i}:note`) || null;
    if (!isUuid(id) || (kind !== "entity" && kind !== "tenant")) return { error: `Fila ${i + 1} del prorrateo: elige a quién corresponde.` };
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) return { error: `Fila ${i + 1} del prorrateo: el porcentaje va de 0 a 100.` };
    if (!Number.isFinite(factor) || factor <= 0) return { error: `Fila ${i + 1} del prorrateo: el factor debe ser mayor a cero (1 si no aplica).` };
    shares.push({
      entity_id: kind === "entity" ? id : null,
      tenant_id: kind === "tenant" ? id : null,
      share_pct: pct,
      factor,
      amount: round2((total * pct) / 100 * factor),
      rule_note: note,
    });
  }

  const supabase = await createClient();
  const { data: expense, error } = await supabase
    .from("expenses")
    .insert({
      org_id: me.membership.orgId,
      development_id: developmentId,
      unit_id: unitId,
      category,
      vendor,
      period,
      charged_at: chargedAt,
      subtotal: round2(subtotal),
      tax_amount: round2(tax),
      classification,
      recoverable,
      source: "captura",
      notes,
      created_by: me.id,
    })
    .select("id")
    .single();
  if (error || !expense) return { error: dbMessage(error?.message ?? "No se pudo registrar el gasto.") };

  if (shares.length) {
    const { error: sErr } = await supabase
      .from("expense_shares")
      .insert(shares.map((s) => ({ ...s, org_id: me.membership.orgId, expense_id: expense.id })));
    if (sErr) return { warning: `El gasto quedó registrado, pero el prorrateo no: ${dbMessage(sErr.message)}` };
  }

  revalidatePath("/rentas");
  redirect("/rentas?ok=gasto&tab=gastos");
}

// ---------------------------------------------------------------- condiciones de contrato

export async function createLeaseTerm(_prev: FormState, fd: FormData): Promise<FormState> {
  const me = await requireRole("operator");
  const leaseId = str(fd, "lease_id");
  const effectiveFrom = str(fd, "effective_from");
  const rentTotal = num(fd, "rent_total");
  const maintenanceRaw = str(fd, "maintenance_total");
  const maintenance = maintenanceRaw === "" ? 0 : num(fd, "maintenance_total");
  const taxTreatment = str(fd, "tax_treatment");
  const dueDayRaw = str(fd, "due_day");
  const dueDay = dueDayRaw === "" ? null : Number(dueDayRaw);
  const depositRaw = str(fd, "deposit_amount");
  const deposit = depositRaw === "" ? null : num(fd, "deposit_amount");
  const increaseRule = str(fd, "increase_rule") || null;
  const notes = str(fd, "notes") || null;

  if (!isUuid(leaseId)) return { error: "Contrato no válido." };
  if (!dateOk(effectiveFrom)) return { error: "Indica desde qué fecha aplica la nueva condición." };
  if (!Number.isFinite(rentTotal) || rentTotal < 0) return { error: "La renta mensual debe ser un monto mayor o igual a cero." };
  if (!Number.isFinite(maintenance) || maintenance < 0) return { error: "El mantenimiento debe ser un monto mayor o igual a cero (0 si no aplica)." };
  if (!oneOf(taxTreatment, TAX_TREATMENTS)) return { error: "Elige el tratamiento de IVA." };
  if (dueDay != null && (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31)) return { error: "El día de pago va del 1 al 31." };
  if (deposit != null && (!Number.isFinite(deposit) || deposit < 0)) return { error: "El depósito debe ser un monto mayor o igual a cero." };

  const supabase = await createClient();
  const { data: terms } = await supabase
    .from("lease_terms")
    .select("id, effective_from, effective_to")
    .eq("lease_id", leaseId)
    .order("effective_from", { ascending: false });
  const latest = terms?.[0];
  if (latest && latest.effective_from >= effectiveFrom) {
    return { error: `Ya hay una condición que inicia el ${latest.effective_from}. La nueva debe iniciar después de esa fecha.` };
  }

  // Cierra la condición vigente el día anterior al inicio de la nueva.
  if (latest && !latest.effective_to) {
    const prevDay = new Date(effectiveFrom + "T12:00:00");
    prevDay.setDate(prevDay.getDate() - 1);
    const { error: closeErr } = await supabase
      .from("lease_terms")
      .update({ effective_to: prevDay.toISOString().slice(0, 10) })
      .eq("id", latest.id);
    if (closeErr) return { error: dbMessage(closeErr.message) };
  }

  const { error } = await supabase.from("lease_terms").insert({
    org_id: me.membership.orgId,
    lease_id: leaseId,
    effective_from: effectiveFrom,
    rent_total: round2(rentTotal),
    maintenance_total: round2(maintenance),
    tax_treatment: taxTreatment,
    due_day: dueDay,
    deposit_amount: deposit == null ? null : round2(deposit),
    increase_rule: increaseRule ? { rule: increaseRule } : null,
    source: "captura",
    notes,
    created_by: me.id,
  });
  if (error) return { error: dbMessage(error.message) };

  revalidatePath("/contratos");
  revalidatePath(`/contratos/${leaseId}/condiciones`);
  redirect(`/contratos/${leaseId}/condiciones?ok=1`);
}

// ---------------------------------------------------------------- edición de contrato (lápiz)

const LEASE_STATUSES = ["draft", "active", "expired", "terminated", "void"] as const satisfies readonly Enums["lease_status"][];
const VERIFICATIONS = ["confirmado", "por_verificar", "no_disponible"] as const satisfies readonly Enums["verification_status"][];

/** Corrige los datos generales del contrato. Todo cambio queda en audit_logs. */
export async function updateLease(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireRole("operator");
  const leaseId = str(fd, "lease_id");
  const status = str(fd, "status");
  const verification = str(fd, "verification");
  const startDate = str(fd, "start_date") || null;
  const endDate = str(fd, "end_date") || null;
  const signedAt = str(fd, "signed_at") || null;
  const code = str(fd, "code") || null;
  const notes = str(fd, "notes") || null;
  const rentedM2Raw = str(fd, "rented_m2");
  const rentedM2 = rentedM2Raw === "" ? null : num(fd, "rented_m2");

  if (!isUuid(leaseId)) return { error: "Contrato no válido." };
  if (!oneOf(status, LEASE_STATUSES)) return { error: "Elige un estado de la lista." };
  if (!oneOf(verification, VERIFICATIONS)) return { error: "Elige una validación de la lista." };
  for (const [v, label] of [[startDate, "inicio"], [endDate, "fin"], [signedAt, "firma"]] as const) {
    if (v && !dateOk(v)) return { error: `La fecha de ${label} no es válida.` };
  }
  if (startDate && endDate && endDate < startDate) return { error: "La fecha de fin no puede ser anterior al inicio." };
  if (rentedM2 != null && (!Number.isFinite(rentedM2) || rentedM2 < 0)) return { error: "Los m² rentados deben ser un número mayor o igual a cero." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("leases")
    .update({ status, verification, start_date: startDate, end_date: endDate, signed_at: signedAt, code, notes })
    .eq("id", leaseId);
  if (error) return { error: dbMessage(error.message) };
  if (rentedM2 != null) {
    await supabase.from("lease_units").update({ rented_m2: round2(rentedM2) }).eq("lease_id", leaseId);
  }
  revalidatePath("/contratos");
  revalidatePath(`/contratos/${leaseId}/condiciones`);
  redirect(`/contratos/${leaseId}/condiciones?ok=edit`);
}

/** Corrige una condición existente (sin crear una versión nueva). */
export async function updateLeaseTerm(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireRole("operator");
  const termId = str(fd, "term_id");
  const leaseId = str(fd, "lease_id");
  const effectiveFrom = str(fd, "effective_from");
  const effectiveTo = str(fd, "effective_to") || null;
  const rentTotal = num(fd, "rent_total");
  const maintenanceRaw = str(fd, "maintenance_total");
  const maintenance = maintenanceRaw === "" ? 0 : num(fd, "maintenance_total");
  const taxTreatment = str(fd, "tax_treatment");
  const dueDayRaw = str(fd, "due_day");
  const dueDay = dueDayRaw === "" ? null : Number(dueDayRaw);
  const depositRaw = str(fd, "deposit_amount");
  const deposit = depositRaw === "" ? null : num(fd, "deposit_amount");
  const increaseRule = str(fd, "increase_rule") || null;
  const notes = str(fd, "notes") || null;

  if (!isUuid(termId) || !isUuid(leaseId)) return { error: "Condición no válida." };
  if (!dateOk(effectiveFrom)) return { error: "Indica desde qué fecha aplica." };
  if (effectiveTo && !dateOk(effectiveTo)) return { error: "La fecha de fin de la condición no es válida." };
  if (effectiveTo && effectiveTo < effectiveFrom) return { error: "La condición no puede terminar antes de empezar." };
  if (!Number.isFinite(rentTotal) || rentTotal < 0) return { error: "La renta mensual debe ser un monto mayor o igual a cero." };
  if (!Number.isFinite(maintenance) || maintenance < 0) return { error: "El mantenimiento debe ser mayor o igual a cero." };
  if (!oneOf(taxTreatment, TAX_TREATMENTS)) return { error: "Elige el tratamiento de IVA." };
  if (dueDay != null && (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31)) return { error: "El día de pago va del 1 al 31." };
  if (deposit != null && (!Number.isFinite(deposit) || deposit < 0)) return { error: "El depósito debe ser mayor o igual a cero." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("lease_terms")
    .update({
      effective_from: effectiveFrom,
      effective_to: effectiveTo,
      rent_total: round2(rentTotal),
      maintenance_total: round2(maintenance),
      tax_treatment: taxTreatment,
      due_day: dueDay,
      deposit_amount: deposit == null ? null : round2(deposit),
      increase_rule: increaseRule ? { rule: increaseRule } : null,
      notes,
    })
    .eq("id", termId)
    .eq("lease_id", leaseId);
  if (error) return { error: dbMessage(error.message) };
  revalidatePath("/contratos");
  revalidatePath(`/contratos/${leaseId}/condiciones`);
  redirect(`/contratos/${leaseId}/condiciones?ok=edit`);
}
