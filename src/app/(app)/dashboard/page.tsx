import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarDays, Download, MoreHorizontal, Sparkles } from "lucide-react";
import { KpiVisual, StatCell } from "@/components/patrimonio/kpi-visual";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeltaChip, MiniBars, Ring, Sparkline, StackedBar, UnitDots } from "@/components/charts/mini";
import { TrendChart } from "@/components/charts/trend-chart";
import { CURRENT_PERIOD, TODAY, developments, importDiscrepancies, units } from "@/lib/mock/data";
import {
  agingBuckets,
  chargesOfPeriod,
  monthlySeries,
  occupancyStats,
  overdueTotal,
  periodCollection,
  scheduledRent,
  stoneUnits,
  totalOutstanding,
  unappliedPayments,
  upcomingDates,
} from "@/lib/mock/queries";
import { daysUntil, fmtDate, fmtMXN, fmtPct, fmtPeriod } from "@/lib/format";

export default function DashboardPage() {
  const pc = periodCollection(CURRENT_PERIOD);
  const prev = periodCollection("2026-09-01");
  const series = monthlySeries();
  const occ = occupancyStats();
  const unapplied = unappliedPayments().reduce((s, p) => s + p.unapplied, 0);
  const period = fmtPeriod(CURRENT_PERIOD);
  const delta = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);

  // Cargos del período por desarrollo (solo unidades Stone).
  const byDev = developments.map((d, i) => ({
    id: d.id,
    name: d.name.replace("[DEMO] ", ""),
    value: chargesOfPeriod(CURRENT_PERIOD)
      .filter((c) => units.find((u) => u.id === c.unitId)?.developmentId === d.id)
      .reduce((s, c) => s + c.total, 0),
    color: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "var(--chart-7)"][i] ?? "var(--chart-3)",
  }));
  const byDevTotal = byDev.reduce((s, d) => s + d.value, 0) || 1;
  const nextDate = upcomingDates(TODAY, 1)[0];
  const topIssue = importDiscrepancies[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] leading-9 font-semibold text-ink">
            Buenas noches, Marco
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Así va el patrimonio de Stone en {period.toLowerCase()}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border bg-card p-0.5 text-sm">
            {["Mes", "Trimestre", "Año"].map((o, i) => (
              <button
                key={o}
                type="button"
                className={`rounded-[5px] px-3 py-1 ${i === 0 ? "bg-primary text-on-primary" : "text-muted-foreground hover:bg-muted"}`}
                aria-pressed={i === 0}
              >
                {o}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm"><CalendarDays className="size-4" /> {period}</Button>
          <Button size="sm"><Download className="size-4" /> Exportar</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiVisual
          label="Renta pactada"
          value={fmtMXN(scheduledRent(CURRENT_PERIOD))}
          info="Monto pactado en contratos activos. No es ingreso."
          visual={<Sparkline values={series.map((s) => s.cargos)} />}
          delta={<DeltaChip value={delta(pc.exigible, prev.exigible)} />}
          foot="vs mes anterior"
        />
        <KpiVisual
          label="Cobranza del período"
          value={fmtPct(pc.ratio * 100)}
          info="Pagos aplicados a cargos del período ÷ exigible. MXN con IVA."
          visual={<Ring ratio={pc.ratio} />}
          delta={<DeltaChip value={delta(pc.ratio, prev.ratio)} />}
          foot={`${fmtMXN(pc.applied)} cobrado de ${fmtMXN(pc.exigible)}`}
        />
        <KpiVisual
          label="Saldo por cobrar"
          value={fmtMXN(totalOutstanding())}
          info="Exigible − aplicaciones − ajustes, todos los períodos."
          visual={<MiniBars values={agingBuckets(TODAY).map((b) => b.amount)} />}
          delta={<span className="num rounded-md bg-danger-soft px-1.5 py-0.5 text-[11px] font-semibold text-danger">{fmtMXN(overdueTotal(TODAY))} vencido</span>}
          foot={`${fmtMXN(unapplied)} sin aplicar`}
        />
        <KpiVisual
          label="Ocupación Stone"
          value={fmtPct(occ.ratio * 100)}
          info={`${occ.occupied} ocupadas de ${occ.known} con estado conocido; ${occ.unknown} sin validar.`}
          visual={<UnitDots states={stoneUnits().filter((u) => u.kind !== "terreno").map((u) => u.occupancy)} />}
          delta={<span className="text-[11px] text-muted-foreground">{stoneUnits().length} unidades · {developments.length} desarrollos</span>}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="gap-0 p-0 xl:col-span-2">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Cargos vs. cobrado</h2>
            <Button variant="ghost" size="icon-sm" aria-label="Más opciones"><MoreHorizontal className="size-4" /></Button>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-4">
            <div>
              <div className="text-sm text-muted-foreground">Cargos de {period.toLowerCase()}</div>
              <div className="flex items-center gap-2">
                <span className="num text-3xl font-semibold">{fmtMXN(pc.exigible)}</span>
                <DeltaChip value={delta(pc.exigible, prev.exigible)} />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-1" /> Cargos</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-2" /> Cobrado</span>
            </div>
          </div>
          <div className="px-2 pt-2">
            <TrendChart data={series} />
          </div>
          <div className="grid grid-cols-3 divide-x border-t text-sm">
            <StatCell label="Pendiente del período" value={fmtMXN(pc.pending)} />
            <StatCell label="Cobros recibidos en el mes" value={fmtMXN(series[series.length - 1].cobrosCaja)} />
            <StatCell label="Gastos del mes" value={fmtMXN(series[series.length - 1].gastos)} />
          </div>
        </Card>

        <Card className="gap-0 p-0">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Cargos por desarrollo</h2>
            <Button variant="ghost" size="icon-sm" aria-label="Más opciones"><MoreHorizontal className="size-4" /></Button>
          </div>
          <div className="space-y-4 px-5 py-4">
            <div>
              <div className="text-sm text-muted-foreground">{period}</div>
              <div className="num text-3xl font-semibold">{fmtMXN(byDevTotal)}</div>
            </div>
            <StackedBar parts={byDev} />
            <ul className="divide-y text-sm">
              {byDev.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-2.5">
                  <span className="size-2.5 rounded-sm" style={{ background: d.color }} />
                  <Link href={`/propiedades/${d.id}`} className="flex-1 hover:underline">{d.name}</Link>
                  <span className="num">{fmtMXN(d.value)}</span>
                  <span className="num w-10 text-right text-xs text-muted-foreground">{Math.round((d.value / byDevTotal) * 100)} %</span>
                </li>
              ))}
            </ul>
            <Link href="/rentas" className="flex items-center gap-3 rounded-lg border bg-warning-soft px-3 py-2.5 text-sm hover:bg-warning-soft/70">
              <AlertTriangle className="size-4 shrink-0 text-warning" />
              <span className="flex-1 leading-snug">{topIssue.title}: {fmtMXN(topIssue.amount ?? 0)} por conciliar</span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
            {nextDate && (
              <Link href="/calendario" className="flex items-center gap-3 rounded-lg border bg-info-soft px-3 py-2.5 text-sm hover:bg-info-soft/70">
                <Sparkles className="size-4 shrink-0 text-info" />
                <span className="flex-1 leading-snug">{nextDate.title.replace("[DEMO] ", "")} · en {daysUntil(nextDate.date)} días</span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            )}
          </div>
        </Card>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Datos sintéticos [DEMO] · MXN con IVA · al {fmtDate(TODAY)} · excluye unidades de terceros.
      </p>
    </div>
  );
}

