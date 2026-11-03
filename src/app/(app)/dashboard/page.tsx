import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import { KpiVisual, StatCell } from "@/components/patrimonio/kpi-visual";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/forms/notice";
import { DeltaChip, StackedBar } from "@/components/charts/mini";
import { TrendChart } from "@/components/charts/trend-chart";
import { hasRole, requireMember } from "@/lib/auth/session";
import { listCharges, listExpenses, listPayments, type ChargeRow } from "@/lib/data/rentas";
import { listCriticalDates, listDevelopmentRows, listDiscrepancies, listUnitRows } from "@/lib/data/patrimonio";
import { daysUntil, fmtDate, fmtMXN, fmtPct, fmtPeriod } from "@/lib/format";
import { hourNow, today as todayFn } from "@/lib/data/now";

export const instant = false;

function periodMetrics(charges: ChargeRow[], period: string) {
  const cs = charges.filter((c) => c.period === period && c.status !== "void");
  const exigible = cs.reduce((s, c) => s + c.netTotal, 0);
  const applied = cs.reduce((s, c) => s + c.paid, 0);
  return { exigible, applied, pending: exigible - applied, ratio: exigible ? applied / exigible : 0, count: cs.length };
}

function greeting(name: string, h: number) {
  const g = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  const first = name.trim().split(/\s+/)[0] || "";
  return first ? `${g}, ${first}` : g;
}

export default async function DashboardPage() {
  const me = await requireMember();
  const canOperate = hasRole(me.membership.role, "operator");
  const [today, hour] = await Promise.all([todayFn(), hourNow()]);

  const [devs, units, dates, discrepancies, charges, payments, expenses] = await Promise.all([
    listDevelopmentRows(),
    listUnitRows(),
    listCriticalDates(),
    listDiscrepancies(),
    canOperate ? listCharges() : Promise.resolve([] as ChargeRow[]),
    canOperate ? listPayments() : Promise.resolve([]),
    canOperate ? listExpenses() : Promise.resolve([]),
  ]);

  const periods = [...new Set(charges.map((c) => c.period))].sort();
  const currentPeriod = periods[periods.length - 1] ?? `${today.slice(0, 7)}-01`;
  const prevPeriod = periods[periods.length - 2] ?? null;
  const pc = periodMetrics(charges, currentPeriod);
  const prev = prevPeriod ? periodMetrics(charges, prevPeriod) : null;
  const series = periods.slice(-9).map((p) => {
    const m = periodMetrics(charges, p);
    const ym = p.slice(0, 7);
    return {
      period: p,
      cargos: m.exigible,
      cobrosAplicados: m.applied,
      cobrosCaja: payments.filter((x) => x.effectiveDate.startsWith(ym)).reduce((s, x) => s + x.amount, 0),
      gastos: expenses.filter((e) => e.period === p).reduce((s, e) => s + e.total, 0),
    };
  });
  const outstanding = charges.filter((c) => c.status !== "void").reduce((s, c) => s + Math.max(0, c.balance), 0);
  const overdue = charges.filter((c) => c.status === "overdue").reduce((s, c) => s + c.balance, 0);
  const unapplied = payments.reduce((s, p) => s + p.unapplied, 0);
  const pactado = devs.reduce((s, d) => s + d.pactadoRent, 0);
  const delta = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);

  const stone = units.filter((u) => !u.referenceOnly && u.kind !== "terreno");
  const known = stone.filter((u) => u.occupancy !== "unknown");
  const occupied = known.filter((u) => u.occupancy === "occupied");
  const occRatio = known.length ? occupied.length / known.length : 0;

  const byDev = devs.map((d) => ({
    id: d.id,
    name: d.name,
    value: charges.filter((c) => c.period === currentPeriod && c.status !== "void" && c.developmentName === d.name).reduce((s, c) => s + c.netTotal, 0),
    color: `var(--${d.chartToken})`,
  }));
  const byDevSum = byDev.reduce((s, d) => s + d.value, 0);
  const byDevTotal = byDevSum || 1;

  const nextDate = dates.filter((d) => !d.done && d.dueOn >= today)[0];
  const openIssues = discrepancies.filter((d) => d.status === "open");
  const period = fmtPeriod(currentPeriod);
  const last = series[series.length - 1];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] leading-9 font-semibold text-ink">{greeting(me.fullName, hour)}</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/rentas"><CalendarDays className="size-4" /> {period}</Link>
        </Button>
      </div>

      {!canOperate && (
        <Notice tone="info" title="Vista de consulta">Las cifras de cobranza solo se muestran a Administración y al Administrador.</Notice>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiVisual
          label="Renta pactada"
          value={fmtMXN(pactado)}
          info="Suma de la renta mensual con IVA de los contratos activos, según su condición vigente. No es ingreso."
          foot={`${devs.length} inmuebles · ${units.filter((u) => !u.referenceOnly).length} unidades Stone`}
        />
        <KpiVisual
          label="Cobranza del período"
          value={canOperate ? fmtPct(pc.ratio * 100) : "—"}
          info="Pagos aplicados a cargos del período ÷ facturado del período. MXN con IVA."
          delta={prev ? <DeltaChip value={delta(pc.ratio, prev.ratio)} /> : undefined}
          foot={canOperate ? `${fmtMXN(pc.applied)} cobrado de ${fmtMXN(pc.exigible)}` : undefined}
        />
        <KpiVisual
          label="Saldo por cobrar"
          value={canOperate ? fmtMXN(outstanding) : "—"}
          info="Facturado − pagado − ajustes, todos los períodos, al día de hoy."
          delta={overdue > 0 ? <span className="num rounded-md bg-danger-soft px-1.5 py-0.5 text-[11px] font-semibold text-danger">{fmtMXN(overdue)} vencido</span> : undefined}
          foot={canOperate ? `${fmtMXN(unapplied)} sin aplicar` : undefined}
        />
        <KpiVisual
          label="Ocupación Stone"
          value={fmtPct(occRatio * 100)}
          info={`${occupied.length} ocupadas de ${known.length} con estado conocido; ${stone.length - known.length} sin validar. Excluye terrenos y unidades de terceros.`}
          foot={`${occupied.length} ocupadas de ${stone.length} operables`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3 xl:items-start">
        <Card className="gap-0 p-0 xl:col-span-2">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-xs font-medium tracking-wider text-ink-3 uppercase">Facturado vs. cobrado</h2>
            <span className="text-[11px] text-ink-3">MXN con IVA · por período de cargo</span>
          </div>
          {canOperate && series.length ? (
            <>
              <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-4">
                <div>
                  <div className="text-sm text-ink-2">Facturado en {period.toLowerCase()}</div>
                  <div className="flex items-center gap-2">
                    <span className="num text-3xl font-semibold">{fmtMXN(pc.exigible)}</span>
                    {prev && <DeltaChip value={delta(pc.exigible, prev.exigible)} />}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-1" /> Facturado</span>
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-2" /> Cobrado</span>
                </div>
              </div>
              <div className="px-2 pt-2">
                <TrendChart data={series} />
              </div>
              <div className="grid grid-cols-3 divide-x border-t text-sm">
                <StatCell label="Pendiente del período" value={fmtMXN(pc.pending)} />
                <StatCell label="Cobros recibidos en el mes" value={fmtMXN(last?.cobrosCaja ?? 0)} />
                <StatCell label="Gastos del mes" value={fmtMXN(last?.gastos ?? 0)} />
              </div>
            </>
          ) : (
            <div className="grid h-64 place-items-center text-sm text-ink-3">{canOperate ? "Sin cargos registrados." : "Sin acceso a cobranza con tu rol."}</div>
          )}
        </Card>

        <Card className="gap-0 p-0">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-xs font-medium tracking-wider text-ink-3 uppercase">Facturado por inmueble</h2>
          </div>
          <div className="space-y-4 px-5 py-4">
            <div>
              <div className="text-sm text-ink-2">{period}</div>
              <div className="num text-3xl font-semibold">{canOperate ? fmtMXN(byDevSum) : "—"}</div>
            </div>
            {canOperate && <StackedBar parts={byDev} />}
            <ul className="divide-y text-sm">
              {byDev.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-2.5">
                  <span className="size-2.5 rounded-sm" style={{ background: d.color }} />
                  <Link href={`/propiedades/${d.id}`} className="flex-1 hover:underline">{d.name}</Link>
                  {canOperate && (
                    <>
                      <span className="num">{fmtMXN(d.value)}</span>
                      <span className="num w-10 text-right text-xs text-ink-3">{Math.round((d.value / byDevTotal) * 100)} %</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
            {openIssues.length > 0 && (
              <Link href="/configuracion/importaciones" className="flex items-center gap-3 rounded-lg border bg-warning-soft px-3 py-2.5 text-sm hover:bg-warning-soft/70">
                <AlertTriangle className="size-4 shrink-0 text-warning" />
                <span className="flex-1 leading-snug">{openIssues.length} discrepancias de importación por revisar</span>
                <ArrowRight className="size-4 shrink-0 text-ink-3" />
              </Link>
            )}
            {nextDate && (
              <Link href="/calendario" className="flex items-center gap-3 rounded-lg border bg-info-soft px-3 py-2.5 text-sm hover:bg-info-soft/70">
                <Sparkles className="size-4 shrink-0 text-info" />
                <span className="flex-1 leading-snug">{nextDate.title} · en {daysUntil(nextDate.dueOn, today)} días</span>
                <ArrowRight className="size-4 shrink-0 text-ink-3" />
              </Link>
            )}
          </div>
        </Card>
      </div>

      <p className="text-[11px] text-ink-3">
        Histórico importado del reporte mensual (Excel) con corte a {period.toLowerCase()} · MXN con IVA · al {fmtDate(today)} · excluye unidades de terceros.
      </p>
    </div>
  );
}
