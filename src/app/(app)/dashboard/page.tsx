import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KpiCard, PageHeader, SectionTitle } from "@/components/patrimonio/kpi-card";
import {
  AgingChart,
  ChargesVsCollections,
  ExpensesByCategory,
} from "@/components/charts/finance-charts";
import { CURRENT_PERIOD, TODAY, importDiscrepancies } from "@/lib/mock/data";
import {
  agingBuckets,
  expensesByCategory,
  monthCashReceived,
  monthlySeries,
  occupancyStats,
  overdueTotal,
  periodCollection,
  scheduledRent,
  stoneUnits,
  totalOutstanding,
  totalSurface,
  unappliedPayments,
  upcomingDates,
} from "@/lib/mock/queries";
import { daysUntil, fmtDate, fmtM2, fmtMXN, fmtNum, fmtPct, fmtPeriod } from "@/lib/format";

export default function DashboardPage() {
  const pc = periodCollection(CURRENT_PERIOD);
  const cash = monthCashReceived(CURRENT_PERIOD);
  const occ = occupancyStats();
  const unapplied = unappliedPayments().reduce((s, p) => s + p.unapplied, 0);
  const period = fmtPeriod(CURRENT_PERIOD);
  const metaFin = `${period} · MXN · con IVA · origen: Excel + manual · conciliación demo`;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Patrimonio administrado por Stone y situación financiera del período. Las unidades de terceros se excluyen de toda agregación."
      />

      <SectionTitle hint="Solo unidades administradas por Stone">Patrimonio</SectionTitle>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Activos y unidades Stone" value={`${stoneUnits().length}`} sub="2 desarrollos · 1 terreno independiente" meta="Inventario demo · excluye 3 unidades de referencia" />
        <KpiCard label="Superficie legal" value={fmtM2(totalSurface("legal"))} sub={`Rentable registrada: ${fmtM2(totalSurface("rentable"))}`} meta="Suma de escrituras · parcial: 1 unidad por verificar" />
        <KpiCard label="Ocupación" value={fmtPct(occ.ratio * 100)} sub={`${occ.occupied} de ${occ.known} con estado conocido`} meta={`${occ.unknown} unidad con estado desconocido excluida del cálculo`} tone="accent" />
        <KpiCard label="Área GIS estimada" value={fmtM2(totalSurface("gis_estimate"))} sub="Calculada desde polígonos" meta="EPSG:4326 · geodésico · no sustituye superficie legal" />
      </div>

      <SectionTitle hint={metaFin}>Finanzas</SectionTitle>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Renta contractual programada" value={fmtMXN(scheduledRent(CURRENT_PERIOD))} sub="Contratos activos, condición vigente" meta="No es ingreso: monto pactado según lease_terms" />
        <KpiCard label="Cargos del período" value={fmtMXN(pc.exigible)} sub={`${pc.count} cargos registrados`} meta="Renta + mantenimiento repercutido · excluye borradores" />
        <KpiCard label="Cobranza del período" value={fmtPct(pc.ratio * 100)} sub={`${fmtMXN(pc.applied)} aplicado a cargos de ${period.split(" ")[0]}`} meta="Pagos aplicados ÷ exigible del período (métrica por período de cargo)" tone="accent" />
        <KpiCard label="Cobros recibidos en el mes" value={fmtMXN(cash)} sub={`Incluye ${fmtMXN(unapplied)} sin aplicar (anticipo)`} meta="Métrica por fecha de cobro · puede incluir meses anteriores" />
        <KpiCard label="Saldo por cobrar total" value={fmtMXN(totalOutstanding())} sub="Todos los períodos abiertos" meta="Exigible − aplicaciones − ajustes" />
        <KpiCard label="Vencido" value={fmtMXN(overdueTotal(TODAY))} sub="Cargos con saldo y fecha de vencimiento pasada" meta={`Al ${fmtDate(TODAY)} · estado derivado, no persistido`} tone="warn" />
        <KpiCard label="Gastos operativos del mes" value={fmtMXN(expensesByCategory(CURRENT_PERIOD).reduce((s, e) => s + e.total, 0))} sub="1 gasto con clasificación pendiente" meta="Devengados · pagados y por pagar · no incluye recuperaciones" />
        <KpiCard label="Discrepancias de importación" value={`${importDiscrepancies.length}`} sub="3 de severidad alta" meta="Del informe de referencia · bloquean conciliación" tone="warn" />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <SectionTitle hint="MXN con IVA · ago–oct 2026">Cargos vs. cobros por mes</SectionTitle>
          <ChargesVsCollections data={monthlySeries()} />
          <p className="mt-2 text-[11px] text-muted-foreground">
            «Aplicado a esos cargos» y «cobros recibidos en el mes» son métricas distintas (spec §7.5): la
            segunda puede incluir adeudos de meses anteriores y anticipos.
          </p>
        </Card>
        <Card className="p-4">
          <SectionTitle hint={`al ${fmtDate(TODAY)}`}>Antigüedad de saldos</SectionTitle>
          <AgingChart data={agingBuckets(TODAY)} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <SectionTitle hint={period}>Gastos por categoría</SectionTitle>
          <ExpensesByCategory data={expensesByCategory(CURRENT_PERIOD)} />
        </Card>
        <Card className="p-4">
          <SectionTitle>Próximos vencimientos</SectionTitle>
          <ul className="divide-y">
            {upcomingDates(TODAY).map((d) => {
              const days = daysUntil(d.date);
              return (
                <li key={d.id} className="flex items-start gap-3 py-2.5 text-sm">
                  <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{d.title}</div>
                    <div className="text-xs text-muted-foreground">{fmtDate(d.date)} · {d.kind}</div>
                  </div>
                  <span className={`tnum shrink-0 text-xs ${days <= 30 ? "font-medium text-warn-foreground dark:text-warn" : "text-muted-foreground"}`}>
                    {days} d
                  </span>
                </li>
              );
            })}
          </ul>
          <Link href="/calendario" className="mt-2 inline-flex items-center gap-1 text-xs text-accent-foreground hover:underline">
            Ver calendario <ArrowUpRight className="size-3" />
          </Link>
        </Card>
        <Card className="p-4">
          <SectionTitle hint="No se corrigen automáticamente">Discrepancias de importación</SectionTitle>
          <ul className="divide-y">
            {importDiscrepancies.map((d) => (
              <li key={d.id} className="flex items-start gap-3 py-2.5 text-sm">
                <AlertTriangle className={`mt-0.5 size-4 shrink-0 ${d.severity === "alta" ? "text-warn-foreground" : "text-muted-foreground"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{d.title}</span>
                    {d.amount != null && <span className="tnum shrink-0 text-xs">{fmtMXN(d.amount)}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{d.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="mt-6 text-[11px] text-muted-foreground">
        Definiciones: cobranza del período = pagos aplicados a cargos del período ÷ total exigible de esos cargos. Saldo por cobrar ≠ facturado − cobrado del mes. Los depósitos en garantía no se incluyen en ingreso. Cifras demo: {fmtNum(stoneUnits().length)} unidades sintéticas.
      </p>
    </>
  );
}
