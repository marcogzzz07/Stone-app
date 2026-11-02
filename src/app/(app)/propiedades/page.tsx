import Link from "next/link";
import { ArrowUpRight, Building2, LandPlot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FacetCover } from "@/components/patrimonio/facet-cover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, SectionTitle } from "@/components/patrimonio/kpi-card";
import { DataStateBadge, OccupancyDot, ScopeBadge } from "@/components/patrimonio/data-state-badge";
import { developments, units } from "@/lib/mock/data";
import { getDevelopment, surface, unitsOfDevelopment } from "@/lib/mock/queries";
import { fmtM2, fmtMXN } from "@/lib/format";

export default function PropiedadesPage() {
  const independientes = units.filter((u) => !u.developmentId);
  return (
    <>
      <PageHeader
        title="Propiedades"
        description="Desarrollos, activos y unidades. Titular legal y administrador se muestran por separado."
      />

      <SectionTitle>Desarrollos</SectionTitle>
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        {developments.map((d) => {
          const us = unitsOfDevelopment(d.id);
          const stone = us.filter((u) => !u.referenceOnly);
          return (
            <Link key={d.id} href={`/propiedades/${d.id}`} className="group">
              <Card className="overflow-hidden p-0 transition-shadow group-hover:shadow-md">
                <FacetCover tone={d.coverTone} className="h-36">
                  <Building2 className="absolute bottom-3 right-3 size-8 text-white/40" />
                  <div className="absolute bottom-3 left-4 text-white">
                    <div className="text-xs opacity-80">{d.city}</div>
                    <div className="text-lg font-semibold tracking-tight">{d.name.replace("[DEMO] ", "")}</div>
                  </div>
                </FacetCover>
                <div className="grid grid-cols-3 divide-x p-0 text-sm">
                  <div className="p-3">
                    <div className="text-xs text-muted-foreground">Unidades Stone</div>
                    <div className="tnum font-semibold">{stone.length} <span className="text-xs font-normal text-muted-foreground">de {us.length}</span></div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-muted-foreground">Superficie legal Stone</div>
                    <div className="tnum font-semibold">{fmtM2(stone.reduce((s, u) => s + (surface(u, "legal")?.valueM2 ?? 0), 0))}</div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-muted-foreground">Ocupadas</div>
                    <div className="tnum font-semibold">{stone.filter((u) => u.occupancy === "ocupada").length}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
                  <span>{d.ownersNote}</span>
                  <ArrowUpRight className="size-3.5" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <SectionTitle hint="Incluye unidades de referencia (no operables)">Todas las unidades</SectionTitle>
      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Desarrollo</TableHead>
              <TableHead>Alcance</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Sup. legal</TableHead>
              <TableHead className="text-right">Renta de lista</TableHead>
              <TableHead>Legal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...units.filter((u) => u.developmentId), ...independientes].map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-mono text-xs">{u.code}</TableCell>
                <TableCell>
                  {u.referenceOnly ? (
                    <span className="text-muted-foreground">{u.name}</span>
                  ) : (
                    <Link href={`/unidades/${u.id}`} className="font-medium hover:underline">
                      {u.kind === "terreno" && <LandPlot className="mr-1 inline size-3.5 text-muted-foreground" />}
                      {u.name}
                    </Link>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {u.developmentId ? getDevelopment(u.developmentId)?.name.replace("[DEMO] ", "") : "—"}
                </TableCell>
                <TableCell><ScopeBadge referenceOnly={u.referenceOnly} /></TableCell>
                <TableCell><OccupancyDot occupancy={u.occupancy} /></TableCell>
                <TableCell className="tnum text-right">{fmtM2(surface(u, "legal")?.valueM2)}</TableCell>
                <TableCell className="tnum text-right">{u.listRent != null ? fmtMXN(u.listRent) : "—"}</TableCell>
                <TableCell>{u.referenceOnly ? <span className="text-xs text-muted-foreground">n/a</span> : <DataStateBadge state={u.legal.state} />}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
