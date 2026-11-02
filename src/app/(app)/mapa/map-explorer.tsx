"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Layers, Satellite } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PatrimonyMap, type MapFeatureProps } from "@/components/mapa/patrimony-map";
import { MapLegend } from "@/components/mapa/map-legend";
import { DataStateBadge, OccupancyDot, ScopeBadge } from "@/components/patrimonio/data-state-badge";
import { allFeatures } from "@/lib/mock/geo";
import { developments, units } from "@/lib/mock/data";
import { getDevelopment, surface } from "@/lib/mock/queries";
import { fmtM2, fmtMXN } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MapExplorer() {
  const features = useMemo(() => allFeatures(), []);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "stone" | "pending">("all");

  const list = units.filter((u) =>
    filter === "all" ? true : filter === "stone" ? !u.referenceOnly : u.geometry.type === "pending",
  );
  const sel = units.find((u) => u.id === selected);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="space-y-3">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b px-3 py-2 text-xs">
            <Layers className="size-4 text-muted-foreground" />
            <span className="font-medium">Capas:</span>
            <span>Desarrollos</span>·<span>Unidades Stone</span>·<span>Referencia</span>
            <Button variant="outline" size="sm" className="ml-auto h-7 gap-1 text-xs" disabled>
              <Satellite className="size-3.5" /> Satélite (proveedor por definir)
            </Button>
          </div>
          <PatrimonyMap
            features={features}
            center={[-100.318, 25.668]}
            zoom={12.6}
            className="h-[520px] w-full"
            selectedId={selected}
            onSelect={(p: MapFeatureProps | null) => setSelected(p?.id ?? null)}
          />
          <div className="border-t px-3 py-2">
            <MapLegend />
          </div>
        </Card>

        {sel && (
          <Card className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{sel.code}</span>
                  <ScopeBadge referenceOnly={sel.referenceOnly} />
                </div>
                <h3 className="mt-1 text-lg font-semibold tracking-tight">{sel.name}</h3>
                <div className="text-sm text-muted-foreground">
                  {sel.developmentId ? getDevelopment(sel.developmentId)?.name : "Propiedad independiente"} · {sel.kind}
                </div>
              </div>
              {!sel.referenceOnly && (
                <Button asChild size="sm">
                  <Link href={`/unidades/${sel.id}`}>
                    Ver expediente <ArrowUpRight className="size-3.5" />
                  </Link>
                </Button>
              )}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {(["legal", "rentable", "gis_estimate"] as const).map((k) => {
                const s = surface(sel, k);
                return (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">
                      {k === "legal" ? "Superficie legal" : k === "rentable" ? "Rentable" : "Área GIS estimada"}
                    </dt>
                    <dd className="tnum font-medium">{fmtM2(s?.valueM2)}</dd>
                    {s && <DataStateBadge state={s.state} className="mt-1" />}
                  </div>
                );
              })}
              <div>
                <dt className="text-xs text-muted-foreground">Estado</dt>
                <dd><OccupancyDot occupancy={sel.occupancy} /></dd>
                {!sel.referenceOnly && sel.listRent != null && (
                  <dd className="tnum mt-1 text-xs text-muted-foreground">Renta de lista {fmtMXN(sel.listRent)}</dd>
                )}
              </div>
            </dl>
            {sel.referenceOnly && (
              <p className="mt-3 rounded-md bg-reference/10 p-2 text-xs text-muted-foreground">
                Unidad de terceros: solo contexto del desarrollo. Sin contratos, movimientos ni documentos.
              </p>
            )}
          </Card>
        )}
      </div>

      <Card className="flex max-h-[720px] flex-col p-0">
        <div className="flex items-center gap-1 border-b p-2">
          {(
            [
              ["all", "Todo"],
              ["stone", "Stone"],
              ["pending", "Pendiente de trazo"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs",
                filter === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <ul className="flex-1 divide-y overflow-auto">
          {developments.map((d) => (
            <li key={d.id} className="bg-muted/40 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {d.name}
              <ul className="mt-1 -mx-3 divide-y normal-case tracking-normal">
                {list.filter((u) => u.developmentId === d.id).map((u) => (
                  <UnitRow key={u.id} u={u} selected={selected === u.id} onSelect={() => setSelected(u.id)} />
                ))}
              </ul>
            </li>
          ))}
          <li className="bg-muted/40 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Independientes
            <ul className="mt-1 -mx-3 divide-y normal-case tracking-normal">
              {list.filter((u) => !u.developmentId).map((u) => (
                <UnitRow key={u.id} u={u} selected={selected === u.id} onSelect={() => setSelected(u.id)} />
              ))}
            </ul>
          </li>
        </ul>
      </Card>
    </div>
  );
}

function UnitRow({ u, selected, onSelect }: { u: (typeof units)[number]; selected: boolean; onSelect: () => void }) {
  return (
    <li>
      <button
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-3 bg-card px-3 py-2 text-left text-sm hover:bg-accent",
          selected && "bg-accent",
        )}
      >
        <span
          className={cn(
            "size-2.5 shrink-0 rounded-sm",
            u.geometry.type === "pending"
              ? "border-2 border-warn bg-warn/30"
              : u.referenceOnly
                ? "border border-dashed border-reference bg-reference/20"
                : "bg-stone-accent/60 border border-stone-accent",
          )}
        />
        <span className="font-mono text-xs text-muted-foreground">{u.code}</span>
        <span className="min-w-0 flex-1 truncate">{u.name.replace("[DEMO] ", "")}</span>
        <span className="tnum text-xs text-muted-foreground">{fmtM2(surface(u, "legal")?.valueM2 ?? surface(u, "gis_estimate")?.valueM2)}</span>
      </button>
    </li>
  );
}
