import Link from "next/link";
import { Plus, Receipt, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, SectionTitle } from "@/components/patrimonio/kpi-card";
import { KpiVisual } from "@/components/patrimonio/kpi-visual";
import { Notice } from "@/components/forms/notice";
import { StatusPill } from "@/components/forms/status-pill";
import { CobradoPendienteChart } from "@/components/charts/report-charts";
import { buildInforme } from "@/lib/data/informe";
import { hasRole, requireMember } from "@/lib/auth/session";
import { listAllocations, listCharges, listExpenses, listPayments, type ChargeRow } from "@/lib/data/rentas";
import { CHARGE_STATUS, CONCEPT_LABEL, EXPENSE_CATEGORY, EXPENSE_CLASS, METHOD_LABEL, SOURCE_LABEL, thisMonth } from "@/lib/rentas/labels";
import { fmtAmt, fmtDate, fmtMXN, fmtPct, fmtPeriod } from "@/lib/format";

export const instant = false;

const OK_MESSAGES: Record<string, { title: string; body: string }> = {
  cargo: { title: "Cargo registrado", body: "Ya aparece en la lista del período con saldo pendiente." },
  pago: { title: "Pago registrado y aplicado", body: "Los cargos elegidos ya muestran el abono." },
  "pago-sin-aplicar": { title: "Pago registrado sin aplicar", body: "Quedó como saldo a favor. Puedes aplicarlo desde la pestaña Por fecha de cobro." },
  aplicacion: { title: "Pago aplicado", body: "Los cargos elegidos ya muestran el abono." },
  gasto: { title: "Gasto registrado", body: "Aparece en la pestaña Gastos con su prorrateo." },
};

function periodMetrics(charges: ChargeRow[], period: string) {
  const cs = charges.filter((c) => c.period === period && c.status !== "void");
  const exigible = cs.reduce((s, c) => s + c.netTotal, 0);
  const applied = cs.reduce((s, c) => s + c.paid, 0);
  return { exigible, applied, pending: exigible - applied, ratio: exigible ? applied / exigible : 0, count: cs.length };
}

export default async function RentasPage({ searchParams }: { searchParams: Promise<{ ok?: string; tab?: string }> }) {
  const [me, sp] = await Promise.all([requireMember(), searchParams]);
  const canOperate = hasRole(me.membership.role, "operator");

  if (!canOperate) {
    return (
      <>
        <PageHeader title="Rentas y cobranza" description="Cargos, pagos, aplicaciones y saldos del período." />
        <Notice tone="info" title="Tu rol de consulta no incluye cobranza">
          Los cargos, pagos y gastos solo los ven Administración y el Administrador. Pide a un administrador que amplíe tu rol si lo necesitas.
        </Notice>
      </>
    );
  }

  const [charges, payments, allocations, expenses] = await Promise.all([listCharges(), listPayments(), listAllocations(), listExpenses()]);

  const periods = [...new Set(charges.map((c) => c.period))].sort();
  const currentPeriod = periods.length ? periods[periods.length - 1] : `${thisMonth()}-01`;
  const pc = periodMetrics(charges, currentPeriod);
  const outstanding = charges.filter((c) => c.status !== "void").reduce((s, c) => s + Math.max(0, c.balance), 0);
  const overdue = charges.filter((c) => c.status === "overdue").reduce((s, c) => s + c.balance, 0);
  const unapplied = payments.filter((p) => p.unapplied > 0.005);
  const unappliedTotal = unapplied.reduce((s, p) => s + p.unapplied, 0);
  const ym = currentPeriod.slice(0, 7);
  const cashInMonth = payments.filter((p) => p.effectiveDate.startsWith(ym)).reduce((s, p) => s + p.amount, 0);
  const informe = charges.length ? await buildInforme(currentPeriod) : null;
  const ok = sp.ok ? OK_MESSAGES[sp.ok] : null;
  const tab = ["periodo", "cobro", "aplicaciones", "gastos"].includes(sp.tab ?? "") ? sp.tab! : "periodo";

  return (
    <>
      <PageHeader
        title="Rentas y cobranza"
        description="Cargos, pagos, aplicaciones y saldos del período. Montos en MXN con IVA."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/rentas/gastos/nuevo"><Receipt data-icon="inline-start" strokeWidth={1.5} /> Nuevo gasto</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/rentas/pagos/nuevo"><Wallet data-icon="inline-start" strokeWidth={1.5} /> Registrar pago</Link>
            </Button>
            <Button asChild>
              <Link href="/rentas/cargos/nuevo"><Plus data-icon="inline-start" /> Nuevo cargo</Link>
            </Button>
          </>
        }
      />

      {ok && <Notice tone="success" title={ok.title} className="mb-4">{ok.body}</Notice>}

      {charges.length === 0 ? (
        <Notice tone="info" title="Aún no hay cargos registrados" className="mb-6">
          Registra el primer cargo del mes con “Nuevo cargo”, o carga el histórico desde Configuración → Importaciones cuando esté autorizado.
        </Notice>
      ) : (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiVisual
            label="Exigible del período"
            value={fmtMXN(pc.exigible)}
            info={`${fmtPeriod(currentPeriod)} · MXN con IVA · ${pc.count} cargos netos de ajustes`}
            foot={`${pc.count} cargos · ${fmtPeriod(currentPeriod)}`}
          />
          <KpiVisual
            label="Cobranza del período"
            value={fmtPct(pc.ratio * 100)}
            info="Pagos aplicados a cargos del período ÷ exigible del período (métrica A, por período de cargo)."
            foot={`${fmtMXN(pc.applied)} aplicado · ${fmtMXN(pc.pending)} pendiente`}
          />
          <KpiVisual
            label="Saldo por cobrar"
            value={fmtMXN(outstanding)}
            info="Todos los períodos · exigible − aplicaciones − ajustes · al día de hoy."
            delta={overdue > 0 ? <span className="num rounded-md bg-danger-soft px-1.5 py-0.5 text-[11px] font-semibold text-danger">{fmtMXN(overdue)} vencido</span> : undefined}
            foot={overdue > 0 ? "incluye cargos vencidos" : "sin cargos vencidos"}
          />
          <KpiVisual
            label="Pagos sin aplicar"
            value={fmtMXN(unappliedTotal)}
            info="Pagos recibidos aún no asignados a un cargo; saldo a favor del arrendatario."
            foot={unapplied.length ? `${unapplied.length} pago(s) por aplicar` : "todo aplicado"}
          />
        </div>
      )}

      {informe && (
        <Card className="mb-6 p-4">
          <SectionTitle hint={`${fmtPeriod(currentPeriod)} · renta pactada con IVA`}>Cobrado contra pendiente por inmueble</SectionTitle>
          <CobradoPendienteChart data={informe.inmuebles.map((d) => ({ name: d.name, cobrado: d.cobrado, pendiente: Math.max(0, d.pendienteMes) }))} />
        </Card>
      )}

      <Tabs defaultValue={tab}>
        <TabsList>
          <TabsTrigger value="periodo">Por período de cargo</TabsTrigger>
          <TabsTrigger value="cobro">Por fecha de cobro</TabsTrigger>
          <TabsTrigger value="aplicaciones">Aplicaciones</TabsTrigger>
          <TabsTrigger value="gastos">Gastos</TabsTrigger>
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
                  <TableHead>Folio</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Aplicado</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((c) => {
                  const st = CHARGE_STATUS[c.status] ?? CHARGE_STATUS.open;
                  const pendingCls = c.status === "overdue" ? "font-semibold text-danger" : c.balance > 0.005 ? "font-semibold text-warning" : "";
                  return (
                    <TableRow key={c.id} className={c.status === "void" ? "text-ink-3" : ""}>
                      <TableCell>{fmtPeriod(c.period)}</TableCell>
                      <TableCell className="font-mono text-xs">{c.unitCode ?? "-"}</TableCell>
                      <TableCell>{c.tenantName}</TableCell>
                      <TableCell className="text-xs">{CONCEPT_LABEL[c.concept]}</TableCell>
                      <TableCell className="font-mono text-xs text-ink-3">{c.folio ?? "-"}</TableCell>
                      <TableCell className="text-xs">{c.dueDate ? fmtDate(c.dueDate) : "-"}</TableCell>
                      <TableCell className="tnum text-right font-medium">{fmtAmt(c.netTotal)}</TableCell>
                      <TableCell className="tnum text-right">{fmtAmt(c.paid)}</TableCell>
                      <TableCell className={`tnum text-right ${pendingCls}`}>{fmtAmt(c.balance)}</TableCell>
                      <TableCell className="text-xs text-ink-3">{SOURCE_LABEL[c.source] ?? c.source}</TableCell>
                      <TableCell><StatusPill label={st.label} cls={st.cls} /></TableCell>
                    </TableRow>
                  );
                })}
                {charges.length === 0 && (
                  <TableRow><TableCell colSpan={11} className="py-8 text-center text-ink-3">Sin cargos registrados.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="cobro" className="mt-4">
          <div className="mb-3 text-sm text-ink-2">
            Cobros recibidos en {fmtPeriod(currentPeriod)}: <span className="tnum font-medium text-ink">{fmtMXN(cashInMonth)}</span>. Métrica de caja; incluye pagos a meses anteriores y anticipos.
          </div>
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha de pago</TableHead>
                  <TableHead>Arrendatario</TableHead>
                  <TableHead>Medio</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Aplicado</TableHead>
                  <TableHead className="text-right">Sin aplicar</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead className="w-0"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{fmtDate(p.effectiveDate)}</TableCell>
                    <TableCell>{p.tenantName}</TableCell>
                    <TableCell className="text-xs">{METHOD_LABEL[p.method]}</TableCell>
                    <TableCell className="font-mono text-xs text-ink-3">{p.bankRef ?? "-"}</TableCell>
                    <TableCell className="tnum text-right font-medium">{fmtAmt(p.amount)}</TableCell>
                    <TableCell className="tnum text-right">{fmtAmt(p.applied)}</TableCell>
                    <TableCell className={`tnum text-right ${p.unapplied > 0.005 ? "font-semibold text-info" : "text-ink-3"}`}>{fmtAmt(p.unapplied)}</TableCell>
                    <TableCell className="text-xs text-ink-3">{SOURCE_LABEL[p.source] ?? p.source}</TableCell>
                    <TableCell className="text-right">
                      {p.unapplied > 0.005 && (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/rentas/pagos/${p.id}/aplicar`}>Aplicar</Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {payments.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="py-8 text-center text-ink-3">Sin pagos registrados.</TableCell></TableRow>
                )}
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
                  <TableHead>Fecha de pago</TableHead>
                  <TableHead>Arrendatario</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Período del cargo</TableHead>
                  <TableHead className="text-right">Monto aplicado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.paymentDate ? fmtDate(a.paymentDate) : "-"}</TableCell>
                    <TableCell>{a.tenantName}</TableCell>
                    <TableCell className="font-mono text-xs">{a.chargeFolio ?? a.chargeId.slice(0, 8)} <span className="font-sans text-ink-3">· {a.unitCode ?? "-"}</span></TableCell>
                    <TableCell>{a.chargePeriod ? fmtPeriod(a.chargePeriod) : "-"}</TableCell>
                    <TableCell className="tnum text-right font-medium">{fmtAmt(a.amount)}</TableCell>
                  </TableRow>
                ))}
                {allocations.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-ink-3">Sin aplicaciones registradas.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="gastos" className="mt-4">
          <SectionTitle hint="Prorrateo: porcentaje × factor → importe por parte">Gastos y mantenimientos</SectionTitle>
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead>Inmueble</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Prorrateado</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Clasificación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => {
                  const cl = EXPENSE_CLASS[e.classification] ?? EXPENSE_CLASS.pending;
                  return (
                    <TableRow key={e.id}>
                      <TableCell>{e.period ? fmtPeriod(e.period) : "-"}</TableCell>
                      <TableCell className="text-xs">{e.developmentName ?? "-"}</TableCell>
                      <TableCell className="font-mono text-xs">{e.unitCode ?? "-"}</TableCell>
                      <TableCell className="text-xs">{EXPENSE_CATEGORY[e.category]}</TableCell>
                      <TableCell>{e.vendor ?? "-"}</TableCell>
                      <TableCell className="tnum text-right font-medium">{fmtAmt(e.total)}</TableCell>
                      <TableCell className="tnum text-right">{e.sharesCount ? `${fmtAmt(e.sharesTotal)} · ${e.sharesCount}` : "-"}</TableCell>
                      <TableCell className="text-xs text-ink-3">{SOURCE_LABEL[e.source] ?? e.source}</TableCell>
                      <TableCell><StatusPill label={cl.label} cls={cl.cls} /></TableCell>
                    </TableRow>
                  );
                })}
                {expenses.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="py-8 text-center text-ink-3">Sin gastos registrados.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
