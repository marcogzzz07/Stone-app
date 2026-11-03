import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Informe mensual de rentas y mantenimientos: replica las secciones del
 * PowerPoint que administración arma cada mes, calculado desde la base.
 *
 * Definiciones (iguales a la hoja `Resumen` del reporte, salvo donde se indica):
 * - Renta pactada del mes = suma de la condición vigente de los contratos
 *   activos en ese mes (con IVA). Importe = total ÷ 1.16; IVA = total − importe.
 * - Cobrado del mes = pagos aplicados a cargos de renta de ese período.
 * - Pendiente del mes = pactado − cobrado (puede ser negativo si se cobró de más).
 * - Pendiente del año = saldo de las facturas de renta con período ≤ mes.
 *   (El Excel usa pactado × meses − pagado con ajustes a mano; aquí es facturado − pagado.)
 * - Proyección del mes = pactado de contratos fijos + facturado de contratos
 *   de renta variable. Real del mes = cobrado de renta + cobrado de mantenimiento.
 */

const n = (v: number | string | null | undefined) => (v == null ? 0 : Number(v));
const IVA = 0.16;
export const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
export const MESES_LARGO = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export interface InmuebleRow {
  id: string;
  code: string;
  name: string;
  chart: string;
  m2: number;
  importe: number;
  iva: number;
  total: number;
  cobrado: number;
  pendienteMes: number;
  pendienteAnio: number;
}

export interface MttoRow {
  id: string;
  name: string;
  m2: number;
  facturado: number;
  importe: number;
  iva: number;
  pagado: number;
  pendienteMes: number;
  pendienteAnio: number;
}

export interface ServiciosRow {
  id: string;
  name: string;
  electricity: number;
  phone: number;
  maintenance: number;
  other: number;
  water: number;
  total: number;
}

export interface Informe {
  period: string;
  year: number;
  month: number;
  monthLabel: string;
  availableMonths: string[];
  resumen: {
    pactado: number;
    cobrado: number;
    pct: number;
    pendienteMes: number;
    inmueblesPendientes: number;
    pendienteAnio: number;
    realMes: number;
    proyMes: number;
    realAcum: number;
    proyAcum: number;
  };
  inmuebles: InmuebleRow[];
  mantenimiento: MttoRow[];
  servicios: ServiciosRow[];
  proyeccion: { month: number; label: string; proyeccion: number; real: number }[];
  tendencia: { rentas: { id: string; name: string; chart: string; values: number[] }[]; mtto: { id: string; name: string; chart: string; values: number[] }[]; months: string[] };
  playa: { owner: string; m2: number; desc: string; listRent: number | null; client: string | null; isStone: boolean }[];
  insights: { title: string; body: string; tone: "info" | "warning" }[];
}

const CHART = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6", "chart-7"];

export async function listReportMonths(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("charges").select("period").order("period");
  return [...new Set((data ?? []).map((c) => c.period))];
}

export async function buildInforme(period: string): Promise<Informe | null> {
  const supabase = await createClient();
  const year = Number(period.slice(0, 4));
  const month = Number(period.slice(5, 7));

  const [{ data: devs }, { data: leases }, { data: terms }, { data: leaseUnits }, { data: charges }, { data: allocs }, { data: expenses }, { data: units }, months] = await Promise.all([
    supabase.from("developments").select("id, code, name, chart_order").order("chart_order"),
    supabase.from("leases").select("id, development_id, status, start_date, end_date"),
    supabase.from("lease_terms").select("lease_id, effective_from, effective_to, rent_total, notes"),
    supabase.from("lease_units").select("lease_id, rented_m2"),
    supabase.from("charges").select("id, development_id, lease_id, concept, period, total, voided_at").lte("period", period),
    supabase.from("payment_allocations").select("charge_id, amount"),
    supabase.from("expenses").select("development_id, category, total").eq("period", period),
    supabase.from("units").select("id, name, notes, list_rent, reference_only, developments!inner(code), legal_entities(name, is_stone)").eq("developments.code", "CP"),
    listReportMonths(),
  ]);
  if (!devs?.length) return null;
  const { data: playaSurfaces } = await supabase.from("surfaces").select("target_id, value_m2").eq("target_type", "unit").eq("kind", "rentable").in("target_id", (units ?? []).map((u) => u.id));
  const playaM2 = new Map((playaSurfaces ?? []).map((s) => [s.target_id, n(s.value_m2)]));

  const paidByCharge = new Map<string, number>();
  for (const a of allocs ?? []) paidByCharge.set(a.charge_id, (paidByCharge.get(a.charge_id) ?? 0) + n(a.amount));
  const m2ByLease = new Map<string, number>();
  for (const lu of leaseUnits ?? []) m2ByLease.set(lu.lease_id, (m2ByLease.get(lu.lease_id) ?? 0) + n(lu.rented_m2));
  const variableLeases = new Set((terms ?? []).filter((t) => /variable/i.test(t.notes ?? "")).map((t) => t.lease_id));

  /** Renta pactada vigente de un contrato en un mes dado (día 1). */
  function termRent(leaseId: string, m: number) {
    const day = `${year}-${String(m).padStart(2, "0")}-01`;
    const last = new Date(year, m, 0).toISOString().slice(0, 10);
    const lease = (leases ?? []).find((l) => l.id === leaseId);
    if (!lease) return 0;
    if (lease.start_date && lease.start_date > last) return 0;
    // Un contrato activo sigue contando aunque su fecha de fin haya pasado (sigue
    // facturando hasta que se marque terminado); el vencimiento solo aplica a expirados.
    if (lease.status !== "active" && lease.end_date && lease.end_date < day) return 0;
    const t = (terms ?? []).filter((t) => t.lease_id === leaseId && t.effective_from <= last && (!t.effective_to || t.effective_to >= day)).sort((a, b) => (a.effective_from < b.effective_from ? 1 : -1))[0];
    return t ? n(t.rent_total) : 0;
  }
  const pactadoDev = (devId: string, m: number) => (leases ?? []).filter((l) => l.development_id === devId && l.status !== "void" && l.status !== "draft").reduce((s, l) => s + termRent(l.id, m), 0);
  const facturadoDev = (devId: string, m: number, concept: "rent" | "maintenance", onlyVariable = false) =>
    (charges ?? [])
      .filter((c) => c.development_id === devId && c.concept === concept && Number(c.period.slice(5, 7)) === m && !c.voided_at && (!onlyVariable || (c.lease_id && variableLeases.has(c.lease_id))))
      .reduce((s, c) => s + n(c.total), 0);
  const cobradoDev = (devId: string, m: number, concept: "rent" | "maintenance") =>
    (charges ?? [])
      .filter((c) => c.development_id === devId && c.concept === concept && Number(c.period.slice(5, 7)) === m && !c.voided_at)
      .reduce((s, c) => s + Math.min(n(c.total), paidByCharge.get(c.id) ?? 0), 0);
  const pendienteAnioDev = (devId: string, concept: "rent" | "maintenance") =>
    (charges ?? [])
      .filter((c) => c.development_id === devId && c.concept === concept && !c.voided_at)
      .reduce((s, c) => s + Math.max(0, n(c.total) - (paidByCharge.get(c.id) ?? 0)), 0);

  const inmuebles: InmuebleRow[] = devs.map((d, i) => {
    const active = (leases ?? []).filter((l) => l.development_id === d.id && termRent(l.id, month) > 0);
    const total = pactadoDev(d.id, month);
    const importe = Math.round((total / (1 + IVA)) * 100) / 100;
    const cobrado = cobradoDev(d.id, month, "rent");
    return {
      id: d.id,
      code: d.code,
      name: d.name,
      chart: CHART[((d.chart_order ?? i + 1) - 1) % 7],
      m2: active.reduce((s, l) => s + (m2ByLease.get(l.id) ?? 0), 0),
      importe,
      iva: Math.round((total - importe) * 100) / 100,
      total,
      cobrado,
      pendienteMes: Math.round((total - cobrado) * 100) / 100,
      pendienteAnio: pendienteAnioDev(d.id, "rent"),
    };
  });

  const mantenimiento: MttoRow[] = devs
    .map((d) => {
      const facturado = facturadoDev(d.id, month, "maintenance");
      const pagado = cobradoDev(d.id, month, "maintenance");
      const pendienteAnio = pendienteAnioDev(d.id, "maintenance");
      const importe = Math.round((facturado / (1 + IVA)) * 100) / 100;
      const active = (leases ?? []).filter((l) => l.development_id === d.id && termRent(l.id, month) > 0);
      return { id: d.id, name: d.name, m2: active.reduce((s, l) => s + (m2ByLease.get(l.id) ?? 0), 0), facturado, importe, iva: Math.round((facturado - importe) * 100) / 100, pagado, pendienteMes: Math.round((facturado - pagado) * 100) / 100, pendienteAnio };
    })
    .filter((r) => r.facturado > 0 || r.pagado > 0 || r.pendienteAnio > 0);

  const servicios: ServiciosRow[] = devs
    .map((d) => {
      const es = (expenses ?? []).filter((e) => e.development_id === d.id);
      const sum = (cat: string) => es.filter((e) => e.category === cat).reduce((s, e) => s + n(e.total), 0);
      const row = { id: d.id, name: d.name, electricity: sum("electricity"), phone: sum("phone"), maintenance: sum("maintenance"), other: es.filter((e) => !["electricity", "phone", "maintenance", "water"].includes(e.category)).reduce((s, e) => s + n(e.total), 0), water: sum("water"), total: 0 };
      row.total = row.electricity + row.phone + row.maintenance + row.other + row.water;
      return row;
    })
    .filter((r) => r.total > 0);

  const proyeccion = Array.from({ length: month }, (_, i) => i + 1).map((m) => {
    const proy = devs.reduce((s, d) => {
      const fixed = (leases ?? []).filter((l) => l.development_id === d.id && !variableLeases.has(l.id) && l.status !== "void" && l.status !== "draft").reduce((x, l) => x + termRent(l.id, m), 0);
      return s + fixed + facturadoDev(d.id, m, "rent", true);
    }, 0);
    const real = devs.reduce((s, d) => s + cobradoDev(d.id, m, "rent") + cobradoDev(d.id, m, "maintenance"), 0);
    return { month: m, label: MESES[m - 1], proyeccion: proy, real };
  });

  const monthsLabels = proyeccion.map((p) => p.label);
  const tendencia = {
    months: monthsLabels,
    rentas: inmuebles.map((d) => ({ id: d.id, name: d.name, chart: d.chart, values: proyeccion.map((p) => cobradoDev(d.id, p.month, "rent")) })),
    mtto: inmuebles.map((d) => ({ id: d.id, name: d.name, chart: d.chart, values: proyeccion.map((p) => cobradoDev(d.id, p.month, "maintenance")) })).filter((r) => r.values.some((v) => v > 0)),
  };

  const playa = (units ?? [])
    .map((u) => {
      const client = (u.notes ?? "").match(/Cliente según Propiedades Playa: ([^·]+)/)?.[1]?.trim() ?? null;
      return { owner: u.legal_entities?.name ?? (u.reference_only ? "Tercero" : "Stone Inmuebles"), isStone: u.legal_entities?.is_stone ?? !u.reference_only, m2: playaM2.get(u.id) ?? 0, desc: u.name.replace(/^Central de Playa · /, ""), listRent: u.list_rent == null ? null : n(u.list_rent), client };
    })
    .sort((a, b) => Number(a.isStone) - Number(b.isStone) || a.owner.localeCompare(b.owner) || a.desc.localeCompare(b.desc));

  const pactado = inmuebles.reduce((s, r) => s + r.total, 0);
  const cobrado = inmuebles.reduce((s, r) => s + r.cobrado, 0);
  const pendienteMes = inmuebles.reduce((s, r) => s + r.pendienteMes, 0);
  const pendienteAnio = inmuebles.reduce((s, r) => s + r.pendienteAnio, 0);
  const cur = proyeccion[proyeccion.length - 1];
  const realAcum = proyeccion.reduce((s, p) => s + p.real, 0);
  const proyAcum = proyeccion.reduce((s, p) => s + p.proyeccion, 0);
  const conPendiente = inmuebles.filter((r) => r.pendienteMes > 0.5);
  const topAnio = [...inmuebles].sort((a, b) => b.pendienteAnio - a.pendienteAnio)[0];
  const fmt = (v: number) => "$" + Math.round(v).toLocaleString("es-MX");
  const mesLargo = MESES_LARGO[month - 1];
  const insights: Informe["insights"] = [];
  if (conPendiente.length) {
    insights.push({ title: conPendiente.length === 1 ? `Pendiente concentrado en ${conPendiente[0].name}` : `Pendiente concentrado en ${conPendiente.length} inmuebles`, body: `${conPendiente.map((r) => `${r.name} (${fmt(r.pendienteMes)})`).join(" y ")} suman el pendiente de ${mesLargo}.`, tone: "warning" });
  } else {
    insights.push({ title: `${mesLargo.charAt(0).toUpperCase() + mesLargo.slice(1)} sin pendiente de renta`, body: "Todos los inmuebles cobraron la renta pactada del mes.", tone: "info" });
  }
  if (topAnio && pendienteAnio > 0) {
    insights.push({ title: `${topAnio.name}: ${Math.round((topAnio.pendienteAnio / pendienteAnio) * 100)}% del pendiente del año`, body: `Acumula ${fmt(topAnio.pendienteAnio)} de los ${fmt(pendienteAnio)} pendientes de rentas en ${year}.`, tone: "warning" });
  }
  insights.push({ title: proyAcum && realAcum / proyAcum >= 0.98 ? "Acumulado en línea con la proyección" : "Acumulado por debajo de la proyección", body: `Real de enero a ${mesLargo}: ${fmt(realAcum)} contra ${fmt(proyAcum)} proyectado (${proyAcum ? Math.round((realAcum / proyAcum) * 100) : 0}%).`, tone: "info" });
  if (cur) {
    insights.push({ title: cur.real >= cur.proyeccion ? `${mesLargo.charAt(0).toUpperCase() + mesLargo.slice(1)} por arriba de lo proyectado` : `${mesLargo.charAt(0).toUpperCase() + mesLargo.slice(1)} por debajo de lo proyectado`, body: `Real de ${fmt(cur.real)} contra ${fmt(cur.proyeccion)} proyectado (${cur.proyeccion ? Math.round((cur.real / cur.proyeccion) * 100) : 0}%).`, tone: "info" });
  }

  return {
    period,
    year,
    month,
    monthLabel: `${mesLargo.charAt(0).toUpperCase() + mesLargo.slice(1)} ${year}`,
    availableMonths: months,
    resumen: { pactado, cobrado, pct: pactado ? cobrado / pactado : 0, pendienteMes, inmueblesPendientes: conPendiente.length, pendienteAnio, realMes: cur?.real ?? 0, proyMes: cur?.proyeccion ?? 0, realAcum, proyAcum },
    inmuebles,
    mantenimiento,
    servicios,
    proyeccion,
    tendencia,
    playa,
    insights,
  };
}
