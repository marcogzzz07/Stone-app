// Helpers de consulta y cálculo sobre los datos sintéticos.
// Las fórmulas siguen la spec §7.5: cobranza por período de cargo vs. cobros
// por fecha de cobro son métricas distintas y se calculan por separado.
import {
  allocations,
  charges,
  criticalDates,
  developments,
  docs,
  entities,
  expenses,
  leases,
  payments,
  tenants,
  units,
} from "./data";
import type { Charge, Unit } from "./types";

export const byId = <T extends { id: string }>(list: T[]) => (id: string) =>
  list.find((x) => x.id === id);

export const getUnit = byId(units);
export const getDevelopment = byId(developments);
export const getLease = byId(leases);
export const getTenant = byId(tenants);
export const getEntity = byId(entities);

export const stoneUnits = () => units.filter((u) => !u.referenceOnly);
export const unitsOfDevelopment = (devId: string) =>
  units.filter((u) => u.developmentId === devId);

export const allocatedToCharge = (chargeId: string) =>
  allocations
    .filter((a) => a.chargeId === chargeId)
    .reduce((s, a) => s + a.amount, 0);

export const chargeBalance = (c: Charge) =>
  c.status === "void" ? 0 : Math.max(0, c.total - allocatedToCharge(c.id));

export const allocatedFromPayment = (paymentId: string) =>
  allocations
    .filter((a) => a.paymentId === paymentId)
    .reduce((s, a) => s + a.amount, 0);

export const unappliedPayments = () =>
  payments
    .map((p) => ({ ...p, unapplied: p.amount - allocatedFromPayment(p.id) }))
    .filter((p) => p.unapplied > 0.005);

export const isOverdue = (c: Charge, today: string) =>
  (c.status === "open" || c.status === "partially_paid") &&
  c.dueDate < today &&
  chargeBalance(c) > 0;

export const chargesOfPeriod = (period: string) =>
  charges.filter((c) => c.period === period && c.status !== "draft");

/** Métrica A — cobranza de cargos del período (por período de cargo). */
export function periodCollection(period: string) {
  const cs = chargesOfPeriod(period).filter((c) => c.status !== "void");
  const exigible = cs.reduce((s, c) => s + c.total, 0);
  const applied = cs.reduce((s, c) => s + allocatedToCharge(c.id), 0);
  return {
    exigible,
    applied,
    pending: exigible - applied,
    ratio: exigible ? applied / exigible : 0,
    count: cs.length,
  };
}

/** Métrica B — cobros recibidos en el mes calendario (por fecha de cobro). */
export function monthCashReceived(period: string) {
  const ym = period.slice(0, 7);
  const ps = payments.filter((p) => p.effectiveDate.startsWith(ym));
  return ps.reduce((s, p) => s + p.amount, 0);
}

export const scheduledRent = (period: string) =>
  leases
    .filter((l) => l.status === "active" && l.startDate <= period)
    .map((l) => {
      const term = [...l.terms]
        .filter((t) => t.effectiveFrom <= period)
        .sort((a, b) => (a.effectiveFrom < b.effectiveFrom ? 1 : -1))[0];
      return term ? term.baseRent * 1.16 : 0;
    })
    .reduce((s, v) => s + v, 0);

export const totalOutstanding = () =>
  charges
    .filter((c) => c.status !== "draft" && c.status !== "void")
    .reduce((s, c) => s + chargeBalance(c), 0);

export const overdueTotal = (today: string) =>
  charges.filter((c) => isOverdue(c, today)).reduce((s, c) => s + chargeBalance(c), 0);

export function agingBuckets(today: string) {
  const buckets = [
    { label: "No vencido", min: -Infinity, max: 0, amount: 0 },
    { label: "1–30 días", min: 1, max: 30, amount: 0 },
    { label: "31–60 días", min: 31, max: 60, amount: 0 },
    { label: "61–90 días", min: 61, max: 90, amount: 0 },
    { label: "> 90 días", min: 91, max: Infinity, amount: 0 },
  ];
  const t = new Date(today + "T12:00:00").getTime();
  for (const c of charges) {
    if (c.status === "draft" || c.status === "void") continue;
    const bal = chargeBalance(c);
    if (bal <= 0) continue;
    const days = Math.round(
      (t - new Date(c.dueDate + "T12:00:00").getTime()) / 86_400_000,
    );
    const b = buckets.find((b) => days >= b.min && days <= b.max) ?? buckets[0];
    b.amount += bal;
  }
  return buckets;
}

export function monthlySeries() {
  const periods = ["2026-08-01", "2026-09-01", "2026-10-01"];
  return periods.map((p) => {
    const pc = periodCollection(p);
    return {
      period: p,
      cargos: pc.exigible,
      cobrosAplicados: pc.applied,
      cobrosCaja: monthCashReceived(p),
      gastos: expenses
        .filter((e) => e.period === p)
        .reduce((s, e) => s + e.total, 0),
    };
  });
}

export const expensesByCategory = (period: string) => {
  const map = new Map<string, number>();
  for (const e of expenses.filter((e) => e.period === period)) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.total);
  }
  return [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
};

export function occupancyStats() {
  const stone = stoneUnits().filter((u) => u.kind !== "terreno");
  const known = stone.filter((u) => u.occupancy !== "desconocida");
  const occupied = known.filter((u) => u.occupancy === "ocupada");
  return {
    total: stone.length,
    known: known.length,
    occupied: occupied.length,
    unknown: stone.length - known.length,
    ratio: known.length ? occupied.length / known.length : 0,
  };
}

export const surface = (u: Unit, kind: Unit["surfaces"][number]["kind"]) =>
  u.surfaces.find((s) => s.kind === kind);

export const totalSurface = (kind: Unit["surfaces"][number]["kind"]) =>
  stoneUnits().reduce((s, u) => s + (surface(u, kind)?.valueM2 ?? 0), 0);

export const upcomingDates = (today: string, limit = 6) =>
  [...criticalDates]
    .filter((d) => d.date >= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, limit);

export const leasesOfUnit = (unitId: string) =>
  leases.filter((l) => l.unitIds.includes(unitId));

export const chargesOfUnit = (unitId: string) =>
  charges.filter((c) => c.unitId === unitId);

export const expensesOfUnit = (unitId: string) =>
  expenses.filter((e) => e.unitId === unitId);

export const docsOf = (targetType: string, targetId: string) =>
  docs.filter((d) => d.targetType === targetType && d.targetId === targetId);

export const currentTerm = (leaseId: string, asOf: string) => {
  const l = getLease(leaseId);
  if (!l) return undefined;
  return [...l.terms]
    .filter((t) => t.effectiveFrom <= asOf)
    .sort((a, b) => (a.effectiveFrom < b.effectiveFrom ? 1 : -1))[0];
};
