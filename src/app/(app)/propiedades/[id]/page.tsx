import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, FileText, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FacetCover } from "@/components/patrimonio/facet-cover";
import { SectionTitle } from "@/components/patrimonio/kpi-card";
import { DataStateBadge, OccupancyDot, ScopeBadge } from "@/components/patrimonio/data-state-badge";
import { developments } from "@/lib/mock/data";
import { docsOf, getDevelopment, surface, unitsOfDevelopment } from "@/lib/mock/queries";
import { fmtM2, fmtMXN, fmtDate } from "@/lib/format";
import { DevelopmentMap } from "./development-map";

export const instant = false;

export function generateStaticParams() {
  return developments.map((d) => ({ id: d.id }));
}

export default async function DevelopmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = getDevelopment(id);
  if (!d) notFound();
  const us = unitsOfDevelopment(d.id);
  const stone = us.filter((u) => !u.referenceOnly);
  const refs = us.filter((u) => u.referenceOnly);
  const docs = docsOf("development", d.id);

  return (
    <>
      <FacetCover tone={d.coverTone} className="-mx-6 -mt-6 mb-6 h-56 lg:-mx-8">
        <div className="absolute bottom-5 left-6 text-white lg:left-8">
          <h1 className="font-condensed text-4xl font-semibold tracking-tight">{d.name}</h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm opacity-90">
            <MapPin className="size-3.5" /> {d.address}, {d.city}
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
          <Card className="overflow-hidden p-0">
            <div className="border-b px-4 py-2 text-xs text-muted-foreground">
              Croquis / distribución · Stone seleccionable, terceros solo contexto · perímetro {fmtM2(d.geometry.areaM2Est)} estimado
            </div>
            <DevelopmentMap devId={d.id} />
          </Card>

          <section>
            <SectionTitle hint="Operables: contratos, cobros, gastos y documentos">Unidades administradas por Stone</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {stone.map((u) => (
                <Link key={u.id} href={`/unidades/${u.id}`} className="group">
                  <Card className="h-full gap-2 p-4 transition-shadow group-hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">{u.code}</span>
                      <OccupancyDot occupancy={u.occupancy} />
                    </div>
                    <div className="font-medium">{u.name.replace("[DEMO] ", "")}</div>
                    <div className="text-xs capitalize text-muted-foreground">{u.kind}</div>
                    <div className="mt-1 flex items-end justify-between text-sm">
                      <div>
                        <div className="text-[11px] text-muted-foreground">Sup. legal</div>
                        <div className="tnum">{fmtM2(surface(u, "legal")?.valueM2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-muted-foreground">Renta de lista</div>
                        <div className="tnum">{u.listRent != null ? fmtMXN(u.listRent) : "—"}</div>
                      </div>
                    </div>
                    {u.geometry.type === "pending" && (
                      <DataStateBadge state="no_disponible" className="w-fit" />
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {refs.length > 0 && (
            <section>
              <SectionTitle hint="Sin contratos, movimientos ni documentos privados">Contexto: unidades de terceros</SectionTitle>
              <Card className="p-0">
                <ul className="divide-y text-sm">
                  {refs.map((u) => (
                    <li key={u.id} className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground">
                      <span className="font-mono text-xs">{u.code}</span>
                      <span className="flex-1">{u.name}</span>
                      <ScopeBadge referenceOnly />
                      <span className="tnum text-xs">{fmtM2(surface(u, "gis_estimate")?.valueM2)} aprox.</span>
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
              <Row k="Superficie legal Stone" v={fmtM2(stone.reduce((s, u) => s + (surface(u, "legal")?.valueM2 ?? 0), 0))} />
              <Row k="Ocupadas / estado conocido" v={`${stone.filter((u) => u.occupancy === "ocupada").length} / ${stone.filter((u) => u.occupancy !== "desconocida").length}`} />
              <Row k="Renta de lista agregada" v={fmtMXN(stone.reduce((s, u) => s + (u.listRent ?? 0), 0))} hint="No es ingreso" />
              <Row k="Total físico del desarrollo" v={`${us.length} unidades`} hint="Reportado aparte" />
            </dl>
            <p className="text-[11px] text-muted-foreground">{d.ownersNote}</p>
          </Card>

          <Card className="gap-3 p-4">
            <SectionTitle>Propietarios documentados</SectionTitle>
            <p className="text-sm text-muted-foreground">
              Se muestran solo titulares con fuente documental. En el prototipo: Propietaria Alfa e Inversiones Beta (demo). Terceros no se identifican.
            </p>
            <DataStateBadge state="por_verificar" className="w-fit" />
          </Card>

          <Card className="gap-3 p-4">
            <SectionTitle hint={`${docs.length}`}>Documentos del desarrollo</SectionTitle>
            <ul className="space-y-2 text-sm">
              {docs.map((doc) => (
                <li key={doc.id} className="flex items-start gap-2">
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{doc.name}</div>
                    <div className="text-xs text-muted-foreground">v{doc.version} · {fmtDate(doc.updatedAt)} · {doc.sensitivity}</div>
                  </div>
                </li>
              ))}
              {docs.length === 0 && <li className="text-muted-foreground">Sin documentos cargados.</li>}
            </ul>
            <Link href="/documentos" className="inline-flex items-center gap-1 text-xs text-accent-foreground hover:underline">
              Ir a documentos <ArrowUpRight className="size-3" />
            </Link>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Row({ k, v, hint }: { k: string; v: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="tnum text-right font-medium">
        {v}
        {hint && <div className="text-[11px] font-normal text-muted-foreground">{hint}</div>}
      </dd>
    </div>
  );
}
