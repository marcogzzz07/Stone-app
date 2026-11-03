import Link from "next/link";
import { Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, SectionTitle } from "@/components/patrimonio/kpi-card";
import { KpiVisual } from "@/components/patrimonio/kpi-visual";
import { Notice } from "@/components/forms/notice";
import { NativeSelect } from "@/components/forms/native-select";
import { CobradoPendienteChart, RealVsProyeccionChart, TendenciaChart } from "@/components/charts/report-charts";
import { hasRole, requireMember } from "@/lib/auth/session";
import { buildInforme, listReportMonths } from "@/lib/data/informe";
import { fmtAmt, fmtMXN, fmtNum, fmtPct, fmtPeriod } from "@/lib/format";

export const instant = false;

const n0 = (v: number) => fmtAmt(v);

export default async function InformesPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const [me, sp] = await Promise.all([requireMember(), searchParams]);
  if (!hasRole(me.membership.role, "operator")) {
    return (
      <>
        <PageHeader title="Informes" description="Informe mensual de rentas y mantenimientos." />
        <Notice tone="info" title="Tu rol de consulta no incluye el informe">Las cifras de cobranza solo las ven Administración y el Administrador.</Notice>
      </>
    );
  }
  const months = await listReportMonths();
  if (months.length === 0) {
    return (
      <>
        <PageHeader title="Informes" description="Informe mensual de rentas y mantenimientos." />
        <Notice tone="info" title="Aún no hay meses con cargos">El informe se arma con los cargos y pagos registrados. Captura o importa un mes para verlo aquí.</Notice>
      </>
    );
  }
  const period = months.includes(sp.mes ?? "") ? sp.mes! : months[months.length - 1];
  const r = await buildInforme(period);
  if (!r) return null;
  const sum = (arr: number[]) => arr.reduce((s, v) => s + v, 0);

  return (
    <>
      <PageHeader
        title="Informe mensual"
        description="Las mismas secciones del reporte que se entrega cada mes, calculadas desde la base. MXN con IVA."
        actions={
          <>
            <form method="get" className="flex items-center gap-2">
              <NativeSelect name="mes" defaultValue={period} aria-label="Mes del informe" className="w-44">
                {months.map((m) => (
                  <option key={m} value={m}>{fmtPeriod(m)}</option>
                ))}
              </NativeSelect>
              <Button type="submit" variant="outline" size="sm">Ver</Button>
            </form>
            <Button asChild>
              <Link href={`/informes/descargar?mes=${period}`} prefetch={false}><Download data-icon="inline-start" /> Descargar PowerPoint</Link>
            </Button>
          </>
        }
      />

      {/* 01 Resumen ejecutivo */}
      <section className="mb-8">
        <SectionTitle hint={r.monthLabel}>01 · Resumen ejecutivo</SectionTitle>
        <h2 className="mb-3 font-display text-xl font-semibold text-ink">{r.monthLabel.split(" ")[0]} cerró con {fmtPct(r.resumen.pct * 100)} de cobranza</h2>
        <div className="mb-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiVisual label="Renta facturada" value={fmtMXN(r.resumen.pactado)} info="Renta pactada de contratos activos en el mes, con IVA." foot={`${r.inmuebles.length} inmuebles, con IVA`} />
          <KpiVisual label={`Cobrado en ${r.monthLabel.split(" ")[0].toLowerCase()}`} value={fmtMXN(r.resumen.cobrado)} info="Pagos aplicados a cargos de renta del mes." foot={`${fmtPct(r.resumen.pct * 100)} de lo facturado`} />
          <KpiVisual label="Pendiente del mes" value={fmtMXN(r.resumen.pendienteMes)} info="Pactado − cobrado del mes." foot={`${r.resumen.inmueblesPendientes} inmueble(s)`} />
          <KpiVisual label={`Pendiente ${r.year}`} value={fmtMXN(r.resumen.pendienteAnio)} info="Saldo de facturas de renta de enero al mes del informe." foot={`Rentas, enero a ${r.monthLabel.split(" ")[0].toLowerCase()}`} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {r.insights.map((i) => (
            <Card key={i.title} className={`gap-1 border-l-4 p-4 ${i.tone === "warning" ? "border-l-warning" : "border-l-brand-cyan"}`}>
              <div className="text-sm font-semibold text-ink">{i.title}</div>
              <div className="text-sm text-ink-2">{i.body}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* 02 Rentas por inmueble */}
      <section className="mb-8">
        <SectionTitle hint="Facturación y cobranza del mes">02 · Rentas por inmueble</SectionTitle>
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inmueble</TableHead>
                <TableHead className="text-right">m²</TableHead>
                <TableHead className="text-right">Precio × m²</TableHead>
                <TableHead className="text-right">Importe</TableHead>
                <TableHead className="text-right">IVA</TableHead>
                <TableHead className="text-right">Total renta</TableHead>
                <TableHead className="text-right">Cobrado</TableHead>
                <TableHead className="text-right">Pendiente mes</TableHead>
                <TableHead className="text-right">Pendiente {r.year}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {r.inmuebles.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="tnum text-right">{fmtNum(d.m2)}</TableCell>
                  <TableCell className="tnum text-right">{d.m2 ? n0(d.importe / d.m2) : "-"}</TableCell>
                  <TableCell className="tnum text-right">{n0(d.importe)}</TableCell>
                  <TableCell className="tnum text-right">{n0(d.iva)}</TableCell>
                  <TableCell className="tnum text-right font-medium">{n0(d.total)}</TableCell>
                  <TableCell className="tnum text-right">{n0(d.cobrado)}</TableCell>
                  <TableCell className={`tnum text-right ${d.pendienteMes > 0.5 ? "font-semibold text-warning" : ""}`}>{n0(d.pendienteMes)}</TableCell>
                  <TableCell className={`tnum text-right ${d.pendienteAnio > 0.5 ? "font-semibold text-danger" : ""}`}>{n0(d.pendienteAnio)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-surface-2 font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="tnum text-right">{fmtNum(sum(r.inmuebles.map((d) => d.m2)))}</TableCell>
                <TableCell className="tnum text-right">-</TableCell>
                <TableCell className="tnum text-right">{n0(sum(r.inmuebles.map((d) => d.importe)))}</TableCell>
                <TableCell className="tnum text-right">{n0(sum(r.inmuebles.map((d) => d.iva)))}</TableCell>
                <TableCell className="tnum text-right">{n0(r.resumen.pactado)}</TableCell>
                <TableCell className="tnum text-right">{n0(r.resumen.cobrado)}</TableCell>
                <TableCell className="tnum text-right">{n0(r.resumen.pendienteMes)}</TableCell>
                <TableCell className="tnum text-right">{n0(r.resumen.pendienteAnio)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </section>

      {/* 03 Cobranza pendiente */}
      <section className="mb-8">
        <SectionTitle hint="Cobrado contra pendiente por inmueble">03 · Cobranza pendiente</SectionTitle>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
          <Card className="p-4">
            <CobradoPendienteChart data={r.inmuebles.map((d) => ({ name: d.name, cobrado: d.cobrado, pendiente: Math.max(0, d.pendienteMes) }))} />
            <p className="mt-2 text-[12px] text-ink-3">Total renta del mes por inmueble, con IVA.</p>
          </Card>
          <div className="space-y-3">
            {r.inmuebles.filter((d) => d.pendienteMes > 0.5 || d.pendienteAnio > 0.5).map((d) => (
              <Card key={d.id} className="gap-1 p-4">
                <div className="text-sm font-semibold text-ink">{d.name}</div>
                <div className="flex items-baseline justify-between text-sm"><span className="text-ink-2">Pendiente del mes</span><span className="num text-warning">{fmtMXN(Math.max(0, d.pendienteMes))}</span></div>
                <div className="flex items-baseline justify-between text-sm"><span className="text-ink-2">Pendiente {r.year}</span><span className="num text-danger">{fmtMXN(d.pendienteAnio)}</span></div>
                <div className="text-[12px] text-ink-3">Cobrado: {d.total ? Math.round((d.cobrado / d.total) * 100) : 0}% de la renta del mes</div>
              </Card>
            ))}
            {r.inmuebles.every((d) => d.pendienteMes <= 0.5 && d.pendienteAnio <= 0.5) && <Card className="p-4 text-sm text-ink-2">Sin pendientes de renta.</Card>}
          </div>
        </div>
      </section>

      {/* 04 Mantenimientos y servicios */}
      <section className="mb-8">
        <SectionTitle hint="Cuotas de mantenimiento y gasto en servicios">04 · Mantenimientos y servicios</SectionTitle>
        <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
          <Card className="p-0">
            <div className="px-4 pt-3 text-sm font-semibold text-ink">Cuotas de mantenimiento</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inmueble</TableHead>
                  <TableHead className="text-right">Facturado</TableHead>
                  <TableHead className="text-right">Pagado</TableHead>
                  <TableHead className="text-right">Pendiente mes</TableHead>
                  <TableHead className="text-right">Pendiente {r.year}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {r.mantenimiento.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="tnum text-right">{n0(m.facturado)}</TableCell>
                    <TableCell className="tnum text-right">{n0(m.pagado)}</TableCell>
                    <TableCell className={`tnum text-right ${m.pendienteMes > 0.5 ? "font-semibold text-warning" : ""}`}>{n0(m.pendienteMes)}</TableCell>
                    <TableCell className={`tnum text-right ${m.pendienteAnio > 0.5 ? "font-semibold text-danger" : ""}`}>{n0(m.pendienteAnio)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-surface-2 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="tnum text-right">{n0(sum(r.mantenimiento.map((m) => m.facturado)))}</TableCell>
                  <TableCell className="tnum text-right">{n0(sum(r.mantenimiento.map((m) => m.pagado)))}</TableCell>
                  <TableCell className="tnum text-right">{n0(sum(r.mantenimiento.map((m) => m.pendienteMes)))}</TableCell>
                  <TableCell className="tnum text-right">{n0(sum(r.mantenimiento.map((m) => m.pendienteAnio)))}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
          <Card className="p-0">
            <div className="px-4 pt-3 text-sm font-semibold text-ink">Servicios pagados en el mes</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inmueble</TableHead>
                  <TableHead className="text-right">Luz</TableHead>
                  <TableHead className="text-right">Teléfono</TableHead>
                  <TableHead className="text-right">Mantenimiento</TableHead>
                  <TableHead className="text-right">Agua</TableHead>
                  <TableHead className="text-right">Otros</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {r.servicios.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="tnum text-right">{n0(s.electricity)}</TableCell>
                    <TableCell className="tnum text-right">{n0(s.phone)}</TableCell>
                    <TableCell className="tnum text-right">{n0(s.maintenance)}</TableCell>
                    <TableCell className="tnum text-right">{n0(s.water)}</TableCell>
                    <TableCell className="tnum text-right">{n0(s.other)}</TableCell>
                    <TableCell className="tnum text-right font-medium">{n0(s.total)}</TableCell>
                  </TableRow>
                ))}
                {r.servicios.length === 0 && <TableRow><TableCell colSpan={7} className="py-6 text-center text-ink-3">Sin gastos de servicios registrados en el mes.</TableCell></TableRow>}
                {r.servicios.length > 0 && (
                  <TableRow className="bg-surface-2 font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="tnum text-right">{n0(sum(r.servicios.map((s) => s.electricity)))}</TableCell>
                    <TableCell className="tnum text-right">{n0(sum(r.servicios.map((s) => s.phone)))}</TableCell>
                    <TableCell className="tnum text-right">{n0(sum(r.servicios.map((s) => s.maintenance)))}</TableCell>
                    <TableCell className="tnum text-right">{n0(sum(r.servicios.map((s) => s.water)))}</TableCell>
                    <TableCell className="tnum text-right">{n0(sum(r.servicios.map((s) => s.other)))}</TableCell>
                    <TableCell className="tnum text-right">{n0(sum(r.servicios.map((s) => s.total)))}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </section>

      {/* 05 Real vs proyección */}
      <section className="mb-8">
        <SectionTitle hint="Miles de pesos · real = cobrado de renta y mantenimiento">05 · Real vs. proyección {r.year}</SectionTitle>
        <h2 className="mb-3 font-display text-xl font-semibold text-ink">
          El acumulado del año va al {r.resumen.proyAcum ? Math.round((r.resumen.realAcum / r.resumen.proyAcum) * 100) : 0}% de lo proyectado
        </h2>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
          <Card className="p-4">
            <RealVsProyeccionChart data={r.proyeccion} />
            <Table className="mt-3">
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  {r.proyeccion.map((p) => <TableHead key={p.month} className="text-right">{p.label}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell className="font-medium">Proyección</TableCell>{r.proyeccion.map((p) => <TableCell key={p.month} className="tnum text-right">{fmtNum(p.proyeccion / 1000)}</TableCell>)}</TableRow>
                <TableRow><TableCell className="font-medium">Real</TableCell>{r.proyeccion.map((p) => <TableCell key={p.month} className="tnum text-right">{fmtNum(p.real / 1000)}</TableCell>)}</TableRow>
                <TableRow><TableCell className="font-medium">Real / proyección</TableCell>{r.proyeccion.map((p) => <TableCell key={p.month} className={`tnum text-right ${p.real < p.proyeccion ? "text-warning" : "text-success"}`}>{p.proyeccion ? Math.round((p.real / p.proyeccion) * 100) : 0}%</TableCell>)}</TableRow>
              </TableBody>
            </Table>
          </Card>
          <div className="space-y-3">
            <KpiVisual label="Real acumulado" value={fmtMXN(r.resumen.realAcum)} info="Suma de cobrado de renta y mantenimiento de enero al mes del informe." />
            <KpiVisual label="Proyección acumulada" value={fmtMXN(r.resumen.proyAcum)} info="Suma de la renta pactada mensual (más facturado de renta variable)." />
            <Card className="p-4 text-sm text-ink-2">
              {r.proyeccion.filter((p) => p.real >= p.proyeccion).length} de {r.proyeccion.length} meses por arriba de lo proyectado.
              {r.proyeccion.some((p) => p.real < p.proyeccion) && <> Por debajo: {r.proyeccion.filter((p) => p.real < p.proyeccion).map((p) => p.label.toLowerCase()).join(", ")}.</>}
            </Card>
          </div>
        </div>
      </section>

      {/* 06 Tendencia */}
      <section className="mb-8">
        <SectionTitle hint="Cobrado por inmueble, mes a mes">06 · Tendencia enero a {r.monthLabel.split(" ")[0].toLowerCase()}</SectionTitle>
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold text-ink">Rentas</div>
            <TendenciaChart months={r.tendencia.months} series={r.tendencia.rentas} />
          </Card>
          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold text-ink">Mantenimientos</div>
            {r.tendencia.mtto.length ? <TendenciaChart months={r.tendencia.months} series={r.tendencia.mtto} /> : <p className="py-10 text-center text-sm text-ink-3">Sin cuotas de mantenimiento cobradas.</p>}
          </Card>
        </div>
      </section>

      {/* 07 Playa del Carmen */}
      <section className="mb-8">
        <SectionTitle hint={`${r.playa.length} espacios en inventario, ${r.playa.filter((p) => p.client).length} con cliente registrado`}>07 · Propiedades Playa del Carmen</SectionTitle>
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propietario</TableHead>
                <TableHead className="text-right">m²</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Renta con IVA</TableHead>
                <TableHead>Cliente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {r.playa.map((p) => (
                <TableRow key={p.desc} className={p.isStone ? "" : "text-ink-2"}>
                  <TableCell>{p.owner}</TableCell>
                  <TableCell className="tnum text-right">{fmtNum(p.m2)}</TableCell>
                  <TableCell>{p.desc}</TableCell>
                  <TableCell className="tnum text-right">{p.listRent != null ? n0(p.listRent) : "-"}</TableCell>
                  <TableCell className="text-xs">{p.client ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <p className="text-[11px] text-ink-3">Pendiente del año = facturado − pagado de las facturas de renta; el Excel lo calcula como pactado × meses − pagado con ajustes manuales, por eso puede diferir.</p>
    </>
  );
}
