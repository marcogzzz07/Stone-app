import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Lecturas de patrimonio (inmuebles, unidades, superficies, geometrías),
 * calendario, documentos e importaciones. RLS: cualquier miembro lee
 * patrimonio; cargos y gastos de la ficha solo llegan a admin/operator.
 */

type Enums = Database["public"]["Enums"];
export type Verification = Enums["verification_status"];
export type Occupancy = Enums["occupancy_status"];
export type UnitKind = Enums["unit_kind"];

const n = (v: number | string | null | undefined) => (v == null ? 0 : Number(v));
const CHART = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6", "chart-7"] as const;

export interface DevelopmentRow {
  id: string;
  code: string;
  name: string;
  city: string | null;
  address: string | null;
  description: string | null;
  chartOrder: number | null;
  chartToken: string;
  isShared: boolean;
  unitsTotal: number;
  unitsStone: number;
  unitsOccupied: number;
  rentableM2: number;
  pactadoRent: number;
  hasGeometry: boolean;
}

export interface UnitRow {
  id: string;
  code: string;
  name: string;
  kind: UnitKind;
  developmentId: string | null;
  developmentName: string | null;
  referenceOnly: boolean;
  occupancy: Occupancy;
  listRent: number | null;
  rentableM2: number | null;
  ownerName: string | null;
  tenantName: string | null;
  currentRent: number | null;
  notes: string | null;
  hasGeometry: boolean;
}

export interface CriticalDateRow {
  id: string;
  kind: Enums["critical_date_kind"];
  title: string;
  dueOn: string;
  targetType: string | null;
  targetId: string | null;
  done: boolean;
  notes: string | null;
}

async function activeTermsByLease() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: terms } = await supabase
    .from("lease_terms")
    .select("lease_id, rent_total, effective_from, effective_to")
    .lte("effective_from", today)
    .or(`effective_to.is.null,effective_to.gte.${today}`);
  const map = new Map<string, number>();
  for (const t of terms ?? []) map.set(t.lease_id, n(t.rent_total));
  return map;
}

export async function listDevelopmentRows(): Promise<DevelopmentRow[]> {
  const supabase = await createClient();
  const [{ data: devs }, { data: units }, { data: surfaces }, { data: geoms }, { data: leases }, rentByLease] = await Promise.all([
    supabase.from("developments").select("id, code, name, city, address, description, chart_order, is_shared").order("chart_order"),
    supabase.from("units").select("id, development_id, reference_only, occupancy"),
    supabase.from("surfaces").select("target_id, value_m2").eq("target_type", "unit").eq("kind", "rentable"),
    supabase.from("geometries").select("target_id").eq("target_type", "development").eq("is_current", true),
    supabase.from("leases").select("id, development_id").eq("status", "active"),
    activeTermsByLease(),
  ]);
  const m2 = new Map((surfaces ?? []).map((s) => [s.target_id, n(s.value_m2)]));
  const geo = new Set((geoms ?? []).map((g) => g.target_id));
  return (devs ?? []).map((d) => {
    const us = (units ?? []).filter((u) => u.development_id === d.id);
    const stone = us.filter((u) => !u.reference_only);
    return {
      id: d.id,
      code: d.code,
      name: d.name,
      city: d.city,
      address: d.address,
      description: d.description,
      chartOrder: d.chart_order,
      chartToken: CHART[((d.chart_order ?? 3) - 1) % CHART.length] ?? "chart-3",
      isShared: d.is_shared,
      unitsTotal: us.length,
      unitsStone: stone.length,
      unitsOccupied: stone.filter((u) => u.occupancy === "occupied").length,
      rentableM2: stone.reduce((s, u) => s + (m2.get(u.id) ?? 0), 0),
      pactadoRent: (leases ?? []).filter((l) => l.development_id === d.id).reduce((s, l) => s + (rentByLease.get(l.id) ?? 0), 0),
      hasGeometry: geo.has(d.id),
    };
  });
}

export async function listUnitRows(): Promise<UnitRow[]> {
  const supabase = await createClient();
  const [{ data: units }, { data: surfaces }, { data: geoms }, { data: leaseUnits }, rentByLease] = await Promise.all([
    supabase
      .from("units")
      .select("id, code, name, kind, development_id, reference_only, occupancy, list_rent, notes, developments(name), legal_entities(name)")
      .order("code"),
    supabase.from("surfaces").select("target_id, value_m2").eq("target_type", "unit").eq("kind", "rentable"),
    supabase.from("geometries").select("target_id").eq("target_type", "unit").eq("is_current", true),
    supabase.from("lease_units").select("unit_id, leases!inner(id, status, tenants(display_name))").eq("leases.status", "active"),
    activeTermsByLease(),
  ]);
  const m2 = new Map((surfaces ?? []).map((s) => [s.target_id, n(s.value_m2)]));
  const geo = new Set((geoms ?? []).map((g) => g.target_id));
  const leaseOfUnit = new Map<string, { tenant: string | null; rent: number | null }>();
  for (const lu of leaseUnits ?? []) {
    const l = lu.leases;
    if (!l) continue;
    leaseOfUnit.set(lu.unit_id, { tenant: l.tenants?.display_name ?? null, rent: rentByLease.get(l.id) ?? null });
  }
  return (units ?? []).map((u) => ({
    id: u.id,
    code: u.code,
    name: u.name,
    kind: u.kind,
    developmentId: u.development_id,
    developmentName: u.developments?.name ?? null,
    referenceOnly: u.reference_only,
    occupancy: u.occupancy,
    listRent: u.list_rent == null ? null : n(u.list_rent),
    rentableM2: m2.get(u.id) ?? null,
    ownerName: u.legal_entities?.name ?? null,
    tenantName: leaseOfUnit.get(u.id)?.tenant ?? null,
    currentRent: leaseOfUnit.get(u.id)?.rent ?? null,
    notes: u.notes,
    hasGeometry: geo.has(u.id),
  }));
}

export async function getDevelopment(id: string) {
  const [devs, units] = await Promise.all([listDevelopmentRows(), listUnitRows()]);
  const d = devs.find((x) => x.id === id);
  if (!d) return null;
  return { dev: d, units: units.filter((u) => u.developmentId === id) };
}

export interface UnitDetail {
  unit: UnitRow;
  surfaces: { kind: Enums["surface_kind"]; valueM2: number; source: string | null; verification: Verification }[];
  leases: {
    id: string;
    tenantName: string;
    status: Enums["lease_status"];
    startDate: string | null;
    endDate: string | null;
    verification: Verification;
    rentTotal: number | null;
    termsCount: number;
    notes: string | null;
  }[];
  charges: {
    id: string;
    period: string;
    concept: string;
    folio: string | null;
    netTotal: number;
    paid: number;
    balance: number;
    status: string;
  }[];
  expenses: { id: string; period: string | null; category: string; vendor: string | null; total: number; classification: string }[];
  documents: { id: string; title: string; kind: string; sensitivity: string; updatedAt: string }[];
}

export async function getUnitDetail(id: string): Promise<UnitDetail | null> {
  const units = await listUnitRows();
  const unit = units.find((u) => u.id === id);
  if (!unit) return null;
  const supabase = await createClient();
  const [{ data: surfaces }, { data: leaseUnits }, { data: charges }, { data: expenses }, { data: links }, rentByLease] = await Promise.all([
    supabase.from("surfaces").select("kind, value_m2, source, verification").eq("target_type", "unit").eq("target_id", id),
    supabase
      .from("lease_units")
      .select("leases(id, status, start_date, end_date, verification, notes, tenants(display_name), lease_terms(id))")
      .eq("unit_id", id),
    supabase.from("charge_balances").select("charge_id, period, concept, invoice_folio, net_total, paid, balance, status").eq("unit_id", id).order("period", { ascending: false }),
    supabase.from("expenses").select("id, period, category, vendor, total, classification").eq("unit_id", id).order("period", { ascending: false }),
    supabase.from("document_links").select("documents(id, title, kind, sensitivity, updated_at)").eq("target_type", "unit").eq("target_id", id),
    activeTermsByLease(),
  ]);
  return {
    unit,
    surfaces: (surfaces ?? []).map((s) => ({ kind: s.kind, valueM2: n(s.value_m2), source: s.source, verification: s.verification })),
    leases: (leaseUnits ?? [])
      .map((lu) => lu.leases)
      .filter((l): l is NonNullable<typeof l> => !!l)
      .map((l) => ({
        id: l.id,
        tenantName: l.tenants?.display_name ?? "—",
        status: l.status,
        startDate: l.start_date,
        endDate: l.end_date,
        verification: l.verification,
        rentTotal: rentByLease.get(l.id) ?? null,
        termsCount: l.lease_terms?.length ?? 0,
        notes: l.notes,
      }))
      .sort((a, b) => (a.status === "active" ? -1 : 1) - (b.status === "active" ? -1 : 1)),
    charges: (charges ?? [])
      .filter((c) => c.charge_id && c.period)
      .map((c) => ({ id: c.charge_id!, period: c.period!, concept: c.concept ?? "other", folio: c.invoice_folio, netTotal: n(c.net_total), paid: n(c.paid), balance: n(c.balance), status: c.status ?? "open" })),
    expenses: (expenses ?? []).map((e) => ({ id: e.id, period: e.period, category: e.category, vendor: e.vendor, total: n(e.total), classification: e.classification })),
    documents: (links ?? [])
      .map((l) => l.documents)
      .filter((d): d is NonNullable<typeof d> => !!d)
      .map((d) => ({ id: d.id, title: d.title, kind: d.kind, sensitivity: d.sensitivity, updatedAt: d.updated_at })),
  };
}

export async function listCriticalDates(): Promise<CriticalDateRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("critical_dates").select("id, kind, title, due_on, target_type, target_id, done_at, notes").order("due_on");
  return (data ?? []).map((d) => ({ id: d.id, kind: d.kind, title: d.title, dueOn: d.due_on, targetType: d.target_type, targetId: d.target_id, done: !!d.done_at, notes: d.notes }));
}

export async function listDocuments() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("id, title, kind, sensitivity, bucket, updated_at, document_links(target_type, target_id), document_versions(version)")
    .order("updated_at", { ascending: false });
  return (data ?? []).map((d) => ({
    id: d.id,
    title: d.title,
    kind: d.kind,
    sensitivity: d.sensitivity,
    bucket: d.bucket,
    updatedAt: d.updated_at,
    version: Math.max(0, ...(d.document_versions ?? []).map((v) => v.version)),
    links: d.document_links ?? [],
  }));
}

// ---------------------------------------------------------------- importaciones

export interface DiscrepancyRow {
  id: string;
  kind: string;
  severity: Enums["severity"];
  sheet: string | null;
  cell: string | null;
  description: string;
  expected: number | null;
  actual: number | null;
  targetType: string | null;
  targetId: string | null;
  status: Enums["discrepancy_status"];
  resolution: string | null;
  createdAt: string;
}

export async function listImportBatches() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("import_batches")
    .select("id, file_name, report_period, status, summary, applied_at, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []).map((b) => ({ id: b.id, fileName: b.file_name, reportPeriod: b.report_period, status: b.status, summary: (b.summary ?? {}) as Record<string, unknown>, appliedAt: b.applied_at, createdAt: b.created_at }));
}

export async function listDiscrepancies(): Promise<DiscrepancyRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("import_discrepancies")
    .select("id, kind, severity, sheet, cell_ref, description, expected, actual, target_type, target_id, status, resolution, created_at")
    .order("status")
    .order("severity", { ascending: false })
    .order("created_at");
  return (data ?? []).map((d) => ({
    id: d.id,
    kind: d.kind,
    severity: d.severity,
    sheet: d.sheet,
    cell: d.cell_ref,
    description: d.description,
    expected: d.expected == null ? null : n(d.expected),
    actual: d.actual == null ? null : n(d.actual),
    targetType: d.target_type,
    targetId: d.target_id,
    status: d.status,
    resolution: d.resolution,
    createdAt: d.created_at,
  }));
}

export async function countOpenDiscrepancies() {
  const supabase = await createClient();
  const { count } = await supabase.from("import_discrepancies").select("id", { count: "exact", head: true }).eq("status", "open");
  return count ?? 0;
}
