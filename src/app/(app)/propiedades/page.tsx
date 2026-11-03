import Link from "next/link";
import { ArrowUpRight, Building2, LandPlot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FacetCover } from "@/components/patrimonio/facet-cover";
import { TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PagedTable } from "@/components/forms/paged-rows";
import { PageHeader, SectionTitle } from "@/components/patrimonio/kpi-card";
import { DataStateBadge, OccupancyDot, ScopeBadge } from "@/components/patrimonio/data-state-badge";
import { requireMember } from "@/lib/auth/session";
import { listDevelopmentRows, listUnitRows } from "@/lib/data/patrimonio";
import { OCCUPANCY_KEY, UNIT_KIND } from "@/lib/patrimonio/labels";
import { fmtM2, fmtMXN } from "@/lib/format";

export const instant = false;

export default async function PropiedadesPage() {
  await requireMember();
  const [devs, units] = await Promise.all([listDevelopmentRows(), listUnitRows()]);
  const independientes = units.filter((u) => !u.developmentId);

  return (
    <>
      <PageHeader title="Propiedades" description="Inmuebles, unidades y ocupación administrados por Stone. Datos del reporte mensual; superficies por verificar." />

      <SectionTitle>Inmuebles</SectionTitle>
      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {devs.map((d, i) => (
          <Link key={d.id} href={`/propiedades/${d.id}`} className="group">
            <Card className="overflow-hidden p-0 transition-shadow group-hover:shadow-md">
              <FacetCover tone={i % 2 ? "cyan" : "navy"} className="h-32">
                <Building2 className="absolute bottom-3 right-3 size-8 text-white/40" />
                <div className="absolute bottom-3 left-4 text-white">
                  <div className="text-xs opacity-80">{d.city ?? "Ubicación por capturar"}</div>
                  <div className="text-lg font-semibold tracking-tight">{d.name}</div>
                </div>
              </FacetCover>
              <div className="grid grid-cols-3 divide-x p-0 text-sm">
                <div className="p-3">
                  <div className="text-xs text-ink-3">Unidades Stone</div>
                  <div className="tnum font-semibold">{d.unitsStone} <span className="text-xs font-normal text-ink-3">de {d.unitsTotal}</span></div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-ink-3">Sup. rentable</div>
                  <div className="tnum font-semibold">{fmtM2(d.rentableM2 || null)}</div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-ink-3">Renta pactada</div>
                  <div className="tnum font-semibold">{d.pactadoRent ? fmtMXN(d.pactadoRent) : "-"}</div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-ink-3">
                <span>{d.unitsOccupied} ocupadas{d.isShared ? " · con unidades de terceros" : ""}{d.hasGeometry ? "" : " · sin ubicación en mapa"}</span>
                <ArrowUpRight className="size-3.5" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <SectionTitle hint="Incluye unidades de referencia (terceros, no operables)">Todas las unidades</SectionTitle>
      <Card className="p-0">
        <PagedTable
              header={<TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Inmueble</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Alcance</TableHead>
              <TableHead>Arrendatario</TableHead>
              <TableHead className="text-right">Sup. rentable</TableHead>
              <TableHead className="text-right">Renta vigente</TableHead>
              <TableHead className="text-right">Renta de lista</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Datos</TableHead>
            </TableRow>
          </TableHeader>}
              rows={[...units.filter((u) => u.developmentId), ...independientes].map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-mono text-xs">{u.code}</TableCell>
                <TableCell>
                  {u.referenceOnly ? (
                    <span className="text-ink-3">{u.name}</span>
                  ) : (
                    <Link href={`/unidades/${u.id}`} className="font-medium hover:underline">
                      {u.kind === "terreno" && <LandPlot className="mr-1 inline size-3.5 text-ink-3" />}
                      {u.name}
                    </Link>
                  )}
                </TableCell>
                <TableCell className="text-ink-2">{u.developmentName ?? "-"}</TableCell>
                <TableCell className="text-xs">{UNIT_KIND[u.kind] ?? u.kind}</TableCell>
                <TableCell><ScopeBadge referenceOnly={u.referenceOnly} /></TableCell>
                <TableCell className="text-xs">{u.tenantName ?? "-"}</TableCell>
                <TableCell className="tnum text-right">{fmtM2(u.rentableM2)}</TableCell>
                <TableCell className="tnum text-right">{u.currentRent != null ? fmtMXN(u.currentRent) : "-"}</TableCell>
                <TableCell className="tnum text-right">{u.listRent != null ? fmtMXN(u.listRent) : "-"}</TableCell>
                <TableCell><OccupancyDot occupancy={OCCUPANCY_KEY[u.occupancy] ?? "desconocida"} /></TableCell>
                <TableCell>{u.referenceOnly ? <span className="text-xs text-ink-3">n/a</span> : <DataStateBadge state="por_verificar" />}</TableCell>
              </TableRow>
            ))}
              columns={11}
              empty="Sin unidades registradas."
            />
      </Card>
    </>
  );
}
