import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Lecturas de Rentas y cobranza sobre Supabase (RLS: solo admin/operator ven
 * cargos, pagos y gastos). Los saldos y estados vienen de la vista
 * `charge_balances`; nunca se almacenan ni se recalculan aquí.
 */

type Enums = Database["public"]["Enums"];
export type ChargeConcept = Enums["charge_concept"];
export type PaymentMethod = Enums["payment_method"];
export type ExpenseCategory = Enums["expense_category"];
export type ExpenseClassification = Enums["expense_classification"];
export type ChargeStatus = "open" | "partially_paid" | "paid" | "overdue" | "void";

export interface ChargeRow {
  id: string;
  tenantId: string;
  tenantName: string;
  leaseId: string | null;
  unitCode: string | null;
  developmentName: string | null;
  concept: ChargeConcept;
  period: string;
  folio: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  total: number;
  adjustments: number;
  netTotal: number;
  paid: number;
  balance: number;
  status: ChargeStatus;
  lastPaymentDate: string | null;
  source: string;
}

export interface PaymentRow {
  id: string;
  tenantId: string;
  tenantName: string;
  effectiveDate: string;
  amount: number;
  method: PaymentMethod;
  bankRef: string | null;
  applied: number;
  unapplied: number;
  source: string;
}

export interface AllocationRow {
  id: string;
  paymentId: string;
  paymentDate: string;
  tenantName: string;
  chargeId: string;
  chargeFolio: string | null;
  chargePeriod: string;
  unitCode: string | null;
  amount: number;
}

export interface ExpenseRow {
  id: string;
  developmentName: string | null;
  unitCode: string | null;
  category: ExpenseCategory;
  vendor: string | null;
  period: string | null;
  chargedAt: string | null;
  total: number;
  classification: ExpenseClassification;
  recoverable: boolean;
  sharesCount: number;
  sharesTotal: number;
  source: string;
}

const n = (v: number | string | null | undefined) => (v == null ? 0 : Number(v));

export async function listCharges(): Promise<ChargeRow[]> {
  const supabase = await createClient();
  // La vista no expone `source`; se toma de la tabla base en el mismo embed.
  const [{ data: balances }, { data: base }] = await Promise.all([
    supabase
      .from("charge_balances")
      .select("*, tenants(display_name), units(code), developments(name)")
      .order("period", { ascending: false })
      .order("due_date", { ascending: true }),
    supabase.from("charges").select("id, source"),
  ]);
  const sourceOf = new Map((base ?? []).map((c) => [c.id, c.source]));
  return (balances ?? [])
    .filter((b) => b.charge_id && b.period && b.tenant_id)
    .map((b) => ({
      id: b.charge_id!,
      tenantId: b.tenant_id!,
      tenantName: b.tenants?.display_name ?? "—",
      leaseId: b.lease_id,
      unitCode: b.units?.code ?? null,
      developmentName: b.developments?.name ?? null,
      concept: b.concept ?? "other",
      period: b.period!,
      folio: b.invoice_folio,
      invoiceDate: b.invoice_date,
      dueDate: b.due_date,
      total: n(b.total),
      adjustments: n(b.adjustments),
      netTotal: n(b.net_total),
      paid: n(b.paid),
      balance: n(b.balance),
      status: (b.status ?? "open") as ChargeStatus,
      lastPaymentDate: b.last_payment_date,
      source: sourceOf.get(b.charge_id!) ?? "—",
    }));
}

export async function listPayments(): Promise<PaymentRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("id, tenant_id, effective_date, amount, method, bank_ref, source, tenants(display_name), payment_allocations(amount)")
    .order("effective_date", { ascending: false })
    .order("created_at", { ascending: false });
  return (data ?? []).map((p) => {
    const applied = (p.payment_allocations ?? []).reduce((s, a) => s + n(a.amount), 0);
    return {
      id: p.id,
      tenantId: p.tenant_id,
      tenantName: p.tenants?.display_name ?? "—",
      effectiveDate: p.effective_date,
      amount: n(p.amount),
      method: p.method,
      bankRef: p.bank_ref,
      applied,
      unapplied: Math.max(0, n(p.amount) - applied),
      source: p.source,
    };
  });
}

export async function getPayment(id: string): Promise<PaymentRow | null> {
  const all = await listPayments();
  return all.find((p) => p.id === id) ?? null;
}

export async function listAllocations(): Promise<AllocationRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payment_allocations")
    .select("id, payment_id, charge_id, amount, created_at, payments(effective_date, tenants(display_name)), charges(invoice_folio, period, units(code))")
    .order("created_at", { ascending: false });
  return (data ?? []).map((a) => ({
    id: a.id,
    paymentId: a.payment_id,
    paymentDate: a.payments?.effective_date ?? "",
    tenantName: a.payments?.tenants?.display_name ?? "—",
    chargeId: a.charge_id,
    chargeFolio: a.charges?.invoice_folio ?? null,
    chargePeriod: a.charges?.period ?? "",
    unitCode: a.charges?.units?.code ?? null,
    amount: n(a.amount),
  }));
}

export async function listExpenses(): Promise<ExpenseRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select("id, category, vendor, period, charged_at, total, classification, recoverable, source, developments(name), units(code), expense_shares(amount)")
    .order("period", { ascending: false })
    .order("created_at", { ascending: false });
  return (data ?? []).map((e) => ({
    id: e.id,
    developmentName: e.developments?.name ?? null,
    unitCode: e.units?.code ?? null,
    category: e.category,
    vendor: e.vendor,
    period: e.period,
    chargedAt: e.charged_at,
    total: n(e.total),
    classification: e.classification,
    recoverable: e.recoverable,
    sharesCount: e.expense_shares?.length ?? 0,
    sharesTotal: (e.expense_shares ?? []).reduce((s, x) => s + n(x.amount), 0),
    source: e.source,
  }));
}

// ---------------------------------------------------------------- catálogos para captura

export interface LeaseOption {
  id: string;
  code: string | null;
  tenantId: string;
  tenantName: string;
  developmentId: string | null;
  developmentName: string | null;
  units: { id: string; code: string; name: string }[];
  status: Enums["lease_status"];
  startDate: string | null;
  endDate: string | null;
  verification: Enums["verification_status"];
  /** Condición vigente hoy (o la última registrada). */
  term: LeaseTermRow | null;
  termsCount: number;
}

export interface LeaseTermRow {
  id: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  rentTotal: number;
  rentSubtotal: number;
  rentTax: number;
  maintenanceTotal: number;
  taxTreatment: Enums["tax_treatment"];
  taxRate: number;
  dueDay: number | null;
  depositAmount: number | null;
  increaseRule: string | null;
  notes: string | null;
  source: string;
}

function ruleText(rule: unknown): string | null {
  if (!rule) return null;
  if (typeof rule === "string") return rule;
  if (typeof rule === "object" && rule && "rule" in rule) return String((rule as { rule: unknown }).rule);
  return JSON.stringify(rule);
}

export async function listLeases(opts: { activeOnly?: boolean } = {}): Promise<LeaseOption[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  let q = supabase
    .from("leases")
    .select("id, code, tenant_id, development_id, status, start_date, end_date, verification, tenants(display_name), developments(name), lease_units(unit_id, units(id, code, name))")
    .order("start_date", { ascending: false });
  if (opts.activeOnly) q = q.eq("status", "active");
  const [{ data: leases }, { data: terms }] = await Promise.all([
    q,
    supabase.from("lease_terms_breakdown").select("*").order("effective_from", { ascending: false }),
  ]);
  const termsByLease = new Map<string, LeaseTermRow[]>();
  for (const t of terms ?? []) {
    if (!t.lease_id || !t.id || !t.effective_from) continue;
    const row: LeaseTermRow = {
      id: t.id,
      effectiveFrom: t.effective_from,
      effectiveTo: t.effective_to,
      rentTotal: n(t.rent_total),
      rentSubtotal: n(t.rent_subtotal),
      rentTax: n(t.rent_tax),
      maintenanceTotal: n(t.maintenance_total),
      taxTreatment: t.tax_treatment ?? "iva_incluido",
      taxRate: n(t.tax_rate ?? 0.16),
      dueDay: t.due_day,
      depositAmount: t.deposit_amount == null ? null : n(t.deposit_amount),
      increaseRule: ruleText(t.increase_rule),
      notes: t.notes,
      source: t.source ?? "—",
    };
    termsByLease.set(t.lease_id, [...(termsByLease.get(t.lease_id) ?? []), row]);
  }
  return (leases ?? []).map((l) => {
    const ts = termsByLease.get(l.id) ?? [];
    const current = ts.find((t) => t.effectiveFrom <= today && (!t.effectiveTo || t.effectiveTo >= today)) ?? ts[0] ?? null;
    return {
      id: l.id,
      code: l.code,
      tenantId: l.tenant_id,
      tenantName: l.tenants?.display_name ?? "—",
      developmentId: l.development_id,
      developmentName: l.developments?.name ?? null,
      units: (l.lease_units ?? [])
        .map((lu) => lu.units)
        .filter((u): u is { id: string; code: string; name: string } => !!u),
      status: l.status,
      startDate: l.start_date,
      endDate: l.end_date,
      verification: l.verification,
      term: current,
      termsCount: ts.length,
    };
  });
}

export async function getLeaseWithTerms(id: string) {
  const supabase = await createClient();
  const [lease, { data: terms }] = await Promise.all([
    listLeases().then((ls) => ls.find((l) => l.id === id) ?? null),
    supabase.from("lease_terms_breakdown").select("*").eq("lease_id", id).order("effective_from", { ascending: false }),
  ]);
  if (!lease) return null;
  const history: LeaseTermRow[] = (terms ?? [])
    .filter((t) => t.id && t.effective_from)
    .map((t) => ({
      id: t.id!,
      effectiveFrom: t.effective_from!,
      effectiveTo: t.effective_to,
      rentTotal: n(t.rent_total),
      rentSubtotal: n(t.rent_subtotal),
      rentTax: n(t.rent_tax),
      maintenanceTotal: n(t.maintenance_total),
      taxTreatment: t.tax_treatment ?? "iva_incluido",
      taxRate: n(t.tax_rate ?? 0.16),
      dueDay: t.due_day,
      depositAmount: t.deposit_amount == null ? null : n(t.deposit_amount),
      increaseRule: ruleText(t.increase_rule),
      notes: t.notes,
      source: t.source ?? "—",
    }));
  return { lease, history };
}

export async function listTenants() {
  const supabase = await createClient();
  const { data } = await supabase.from("tenants").select("id, display_name").order("display_name");
  return (data ?? []).map((t) => ({ id: t.id, name: t.display_name }));
}

export async function listDevelopments() {
  const supabase = await createClient();
  const { data } = await supabase.from("developments").select("id, name").order("chart_order").order("name");
  return (data ?? []).map((d) => ({ id: d.id, name: d.name }));
}

export async function listOperableUnits() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("units")
    .select("id, code, name, development_id")
    .eq("reference_only", false)
    .order("code");
  return (data ?? []).map((u) => ({ id: u.id, code: u.code, name: u.name, developmentId: u.development_id }));
}

export async function listLegalEntities() {
  const supabase = await createClient();
  const { data } = await supabase.from("legal_entities").select("id, name, is_stone").order("name");
  return (data ?? []).map((e) => ({ id: e.id, name: e.name, isStone: e.is_stone }));
}

/** Cargos con saldo por arrendatario, para aplicar pagos (más antiguos primero). */
export async function listOpenChargesByTenant() {
  const charges = await listCharges();
  const map = new Map<string, ChargeRow[]>();
  for (const c of charges) {
    if (c.status === "void" || c.status === "paid" || c.balance <= 0.005) continue;
    map.set(c.tenantId, [...(map.get(c.tenantId) ?? []), c]);
  }
  for (const [k, v] of map) map.set(k, v.sort((a, b) => (a.period < b.period ? -1 : a.period > b.period ? 1 : (a.dueDate ?? "") < (b.dueDate ?? "") ? -1 : 1)));
  return map;
}
