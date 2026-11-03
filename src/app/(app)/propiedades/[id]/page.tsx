import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FacetCover } from "@/components/patrimonio/facet-cover";
import { SectionTitle } from "@/components/patrimonio/kpi-card";
import { DataStateBadge, OccupancyDot, ScopeBadge } from "@/components/patrimonio/data-state-badge";
import { requireMember } from "@/lib/auth/session";
import { getDevelopment } from "@/lib/data/patrimonio";
import { buildInforme, listReportMonths } from "@/lib/data/informe";
import { hasRole } from "@/lib/auth/session";
import { TendenciaChart } from "@/components/charts/report-charts";
import { OCCUPANCY_KEY, UNIT_KIND } from "@/lib/patrimonio/labels";
import { fmtM2, fmtMXN } from "@/lib/format";

export const instant = false;

export default async function DevelopmentPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireMember();
  const { id } = await params;
  const data = await getDevelopment(id);
  const months = hasRole(me.membership.role, "operator") ? await listReportMonths() : [];
  const informe = months.length ? await buildInforme(months[months.length - 1]) : null;
  const trendRentas = informe?.tendencia.rentas.find((t) => t.id === id);
  const trendMtto = informe?.tendencia.mtto.find((t) => t.id === id);
  if (!data) notFound();
  const { dev: d, units: us } = data;
  const stone = us.filter((u) => !u.referenceOnly);
  const refs = us.filter((u) => u.referenceOnly);
  const tone = (d.chartOrder ?? 1) % 2 ? "navy" : "cyan";

  return (
    <>
      <FacetCover tone={tone} className="-mx-6 -mt-6 mb-6 h-56 lg:-mx-8">
        <div className="absolute bottom-5 left-6 text-white lg:left-8">
          <h1 className="font-display text-[30px] leading-9 font-semibold">{d.name}</h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm opacity-90">
            <MapPin className="size-3.5" /> {d.address ?? "Dirección por capturar"}{d.city ? `, ${d.city}` : ""}
          </div>
        </div>
        <div className="absolute bottom-5 right-6 grid grid-cols-2 gap-3 text-white lg:right-8">
          <div className="rounded-md bg-black/25 px-3 py-2 backdrop-blur">
            <div className="text-[11px] opacity-80">Unidades totales</div>
            <div className="num text-2xl font-semibold">{us.length}</div>
          </div>
          <div className="rounded-md bg-black/25 px-3 py-2 backdrop-blur">
            <div className="text-[11px] opacity-80">Unidades Stone</div>
            <div className="num text-2xl font-semibold">{stone.length}</div>
          </div>
        </div>
      </FacetCover>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {!d.hasGeometry && (
            <Card className="grid h-40 place-items-center p-4 text-center text-sm text-ink-3">
              <div>
                <div className="mx-auto mb-2 size-8 rounded-full border-2 border-dashed border-ink-3 bg-surface-2" />
                Sin ubicación capturada. No se dibujan croquis ni límites aproximados.
              </div>
            </Card>
          )}

          {informe && trendRentas && (
            <Card className="p-4">
              <SectionTitle hint={`Cobrado por mes · ${informe.year}`}>Tendencia de rentas y mantenimiento</SectionTitle>
              <TendenciaChart months={informe.tendencia.months} series={[{ ...trendRentas, name: "Rentas" }, ...(trendMtto ? [{ ...trendMtto, name: "Mantenimiento", chart: "chart-2" }] : [])]} />
            </Card>
          )}

          <section>
            <SectionTitle hint="Operables: contratos, cobros, gastos y documentos">Unidades administradas por Stone</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {stone.map((u) => (
                <Link key={u.id} href={`/unidades/${u.id}`} className="group">
                  <Card className="h-full gap-2 p-4 transition-shadow group-hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-ink-3">{u.code}</span>
                      <OccupancyDot occupancy={OCCUPANCY_KEY[u.occupancy] ?? "desconocida"} />
                    </div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-ink-3">{UNIT_KIND[u.kind] ?? u.kind}{u.tenantName ? ` · ${u.tenantName}` : ""}</div>
                    <div className="mt-1 flex items-end justify-between text-sm">
                      <div>
                        <div className="text-[11px] text-ink-3">Sup. rentable</div>
                        <div className="tnum">{fmtM2(u.rentableM2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-ink-3">{u.currentRent != null ? "Renta vigente" : "Renta de lista"}</div>
                        <div className="tnum">{u.currentRent != null ? fmtMXN(u.currentRent) : u.listRent != null ? fmtMXN(u.listRent) : "-"}</div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
              {stone.length === 0 && <p className="text-sm text-ink-3">Sin unidades Stone registradas.</p>}
            </div>
          </section>

          {refs.length > 0 && (
            <section>
              <SectionTitle hint="Sin contratos, movimientos ni documentos privados">Contexto: unidades de terceros</SectionTitle>
              <Card className="p-0">
                <ul className="divide-y text-sm">
                  {refs.map((u) => (
                    <li key={u.id} className="flex items-center gap-3 px-4 py-2.5 text-ink-2">
                      <span className="font-mono text-xs">{u.code}</span>
                      <span className="flex-1">{u.name}{u.ownerName ? <span className="text-ink-3"> · {u.ownerName}</span> : null}</span>
                      <ScopeBadge referenceOnly />
                      <span className="tnum text-xs">{fmtM2(u.rentableM2)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <Card className="gap-3 p-4">
            <SectionTitle>Resumen Stone</SectionTitle>
            <dl className="space-y-2 text-sm">
              <Row k="Superficie rentable Stone" v={fmtM2(d.rentableM2 || null)} hint="Del reporte; por verificar contra planos" />
              <Row k="Ocupadas / con estado" v={`${d.unitsOccupied} / ${stone.filter((u) => u.occupancy !== "unknown").length}`} />
              <Row k="Renta pactada vigente" v={d.pactadoRent ? fmtMXN(d.pactadoRent) : "-"} hint="Contratos activos · con IVA · no es ingreso" />
              <Row k="Total físico" v={`${us.length} unidades`} />
            </dl>
            {d.description && <p className="text-[11px] text-ink-3">{d.description}</p>}
          </Card>

          <Card className="gap-3 p-4">
            <SectionTitle>Datos legales</SectionTitle>
            <p className="text-sm text-ink-2">Escrituras, folio real y clave catastral no vienen en el reporte mensual; se capturan desde los documentos del expediente.</p>
            <DataStateBadge state="no_disponible" className="w-fit" />
          </Card>
        </aside>
      </div>
    </>
  );
}

function Row({ k, v, hint }: { k: string; v: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-2">{k}</dt>
      <dd className="tnum text-right font-medium">
        {v}
        {hint && <div className="text-[11px] font-normal text-ink-3">{hint}</div>}
      </dd>
    </div>
  );
}
