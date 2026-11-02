import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KpiCard, PageHeader, SectionTitle } from "@/components/patrimonio/kpi-card";
import { CURRENT_PERIOD, TODAY, allocations, charges, payments } from "@/lib/mock/data";
import {
  allocatedFromPayment,
  chargeBalance,
  getLease,
  getTenant,
  getUnit,
  isOverdue,
  monthCashReceived,
  overdueTotal,
  periodCollection,
  totalOutstanding,
  unappliedPayments,
} from "@/lib/mock/queries";
import { fmtDate, fmtMXN, fmtPct, fmtPeriod } from "@/lib/format";

const STATUS: Record<string, string> = {
  draft: "Propuesta",
  open: "Exigible",
  partially_paid: "Pago parcial",
  paid: "Pagado",
  void: "Anulado",
};

export default function RentasPage() {
  const pc = periodCollection(CURRENT_PERIOD);
  const period = fmtPeriod(CURRENT_PERIOD);
  const sorted = [...charges].sort((a, b) => (a.period < b.period ? 1 : a.period > b.period ? -1 : a.dueDate < b.dueDate ? -1 : 1));
  const paysSorted = [...payments].sort((a, b) => (a.effectiveDate < b.effectiveDate ? 1 : -1));

  return (
    <>
      <PageHeader
        eyebrow="Operación"
        title="Rentas y cobranza"
        description="Cargos, pagos, aplicaciones y saldos. Las vistas por período de cargo y por fecha de cobro se presentan por separado."
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Exigible del período" value={fmtMXN(pc.exigible)} meta={`${period} · MXN con IVA · ${pc.count} cargos`} />
        <KpiCard label="Cobranza del período" value={fmtPct(pc.ratio * 100)} sub={`${fmtMXN(pc.applied)} aplicado · ${fmtMXN(pc.pending)} pendiente`} meta="Aplicaciones a cargos del período ÷ exigible" tone="accent" />
        <KpiCard label="Saldo total por cobrar" value={fmtMXN(totalOutstanding())} sub={`Vencido: ${fmtMXN(overdueTotal(TODAY))}`} meta={`Todos los períodos · al ${fmtDate(TODAY)}`} tone="warn" />
        <KpiCard label="Pagos sin aplicar" value={fmtMXN(unappliedPayments().reduce((s, p) => s + p.unapplied, 0))} sub={`${unappliedPayments().length} pago(s) · saldo a favor`} meta="Anticipos disponibles hasta su aplicación explícita" />
      </div>

      <Tabs defaultValue="periodo">
        <TabsList>
          <TabsTrigger value="periodo">Por período de cargo</TabsTrigger>
          <TabsTrigger value="cobro">Por fecha de cobro</TabsTrigger>
          <TabsTrigger value="aplicaciones">Aplicaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="periodo" className="mt-4">
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Arrendatario</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">IVA</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Aplicado</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Origen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((c) => {
                  const l = getLease(c.leaseId);
                  const bal = chargeBalance(c);
                  const od = isOverdue(c, TODAY);
                  return (
                    <TableRow key={c.id} className={c.status === "draft" ? "text-muted-foreground" : ""}>
                      <TableCell >{fmtPeriod(c.period)}</TableCell>
                      <TableCell className="font-mono text-xs">{getUnit(c.unitId)?.code}</TableCell>
                      <TableCell>{l ? getTenant(l.tenantId)?.name.replace("[DEMO] ", "") : "—"}</TableCell>
                      <TableCell className="text-xs">{c.concept.replace("_", " ")}</TableCell>
                      <TableCell className="text-xs">{fmtDate(c.dueDate)}</TableCell>
                      <TableCell className="tnum text-right">{fmtMXN(c.subtotal)}</TableCell>
                      <TableCell className="tnum text-right text-muted-foreground">{fmtMXN(c.tax)}</TableCell>
                      <TableCell className="tnum text-right font-medium">{fmtMXN(c.total)}</TableCell>
                      <TableCell className="tnum text-right">{fmtMXN(c.total - bal)}</TableCell>
                      <TableCell className={`tnum text-right ${od ? "font-semibold text-destructive" : ""}`}>{fmtMXN(bal)}</TableCell>
                      <TableCell><span className={`rounded px-1.5 py-0.5 text-xs ${od ? "bg-destructive/10 text-destructive" : "bg-muted"}`}>{STATUS[c.status]}{od && " · vencido"}</span></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.source}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
          <p className="mt-2 text-[11px] text-muted-foreground">
            «Vencido» es derivado (fecha de vencimiento pasada y saldo &gt; 0), no un estado persistido. Las propuestas (draft) no cuentan como exigibles.
          </p>
        </TabsContent>

        <TabsContent value="cobro" className="mt-4">
          <div className="mb-3 text-sm text-muted-foreground">
            Cobros recibidos en {period}: <span className="tnum font-medium text-foreground">{fmtMXN(monthCashReceived(CURRENT_PERIOD))}</span> — métrica de caja; incluye pagos a meses anteriores y anticipos.
          </div>
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha efectiva</TableHead>
                  <TableHead>Arrendatario</TableHead>
                  <TableHead>Medio</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Aplicado</TableHead>
                  <TableHead className="text-right">Sin aplicar</TableHead>
                  <TableHead>Origen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paysSorted.map((p) => {
                  const ap = allocatedFromPayment(p.id);
                  const un = p.amount - ap;
                  return (
                    <TableRow key={p.id}>
                      <TableCell>{fmtDate(p.effectiveDate)}</TableCell>
                      <TableCell>{getTenant(p.tenantId)?.name.replace("[DEMO] ", "")}</TableCell>
                      <TableCell className="capitalize text-xs">{p.method}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{p.bankRef ?? "—"}</TableCell>
                      <TableCell className="tnum text-right font-medium">{fmtMXN(p.amount)}</TableCell>
                      <TableCell className="tnum text-right">{fmtMXN(ap)}</TableCell>
                      <TableCell className={`tnum text-right ${un > 0 ? "font-medium text-stone-accent" : "text-muted-foreground"}`}>{fmtMXN(un)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.source}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="aplicaciones" className="mt-4">
          <SectionTitle hint="Un pago → varios cargos · un cargo ← varios pagos">Aplicaciones de pago</SectionTitle>
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pago</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Período del cargo</TableHead>
                  <TableHead className="text-right">Monto aplicado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map((a, i) => {
                  const p = payments.find((x) => x.id === a.paymentId)!;
                  const c = charges.find((x) => x.id === a.chargeId)!;
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">{a.paymentId}</TableCell>
                      <TableCell>{fmtDate(p.effectiveDate)}</TableCell>
                      <TableCell className="font-mono text-xs">{a.chargeId} <span className="font-sans text-muted-foreground">· {getUnit(c.unitId)?.code}</span></TableCell>
                      <TableCell >{fmtPeriod(c.period)}</TableCell>
                      <TableCell className="tnum text-right font-medium">{fmtMXN(a.amount)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Restricción: Σ aplicaciones ≤ monto del pago y ≤ saldo del cargo. Los ajustes (descuentos, notas, condonaciones) se registran aparte, nunca como pagos.
          </p>
        </TabsContent>
      </Tabs>
    </>
  );
}
