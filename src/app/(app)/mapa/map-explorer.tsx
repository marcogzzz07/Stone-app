"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Layers, Satellite } from "lucide-react";
import type { FeatureCollection } from "geojson";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PatrimonyMap } from "@/components/mapa/patrimony-map";
import { MapLegend } from "@/components/mapa/map-legend";
import { ScopeBadge } from "@/components/patrimonio/data-state-badge";
import { fmtM2 } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface MapDevelopment { id: string; name: string; city: string | null; hasGeometry: boolean }
export interface MapUnit { id: string; code: string; name: string; developmentId: string | null; referenceOnly: boolean; rentableM2: number | null; hasGeometry: boolean }

// Centro provisional (Monterrey) mientras no haya geometrías capturadas.
const DEFAULT_CENTER: [number, number] = [-100.3161, 25.6866];
const EMPTY: FeatureCollection = { type: "FeatureCollection", features: [] };

export function MapExplorer({ developments, units }: { developments: MapDevelopment[]; units: MapUnit[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "stone" | "pending">("all");
  const list = units.filter((u) => (filter === "all" ? true : filter === "stone" ? !u.referenceOnly : !u.hasGeometry));
  const sel = units.find((u) => u.id === selected);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="space-y-3">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b px-3 py-2 text-xs">
            <Layers className="size-4 text-ink-3" strokeWidth={1.5} />
            <span className="font-medium">Capas:</span>
            <span>Inmuebles</span>·<span>Unidades Stone</span>·<span>Referencia</span>
            <Button variant="outline" size="sm" className="ml-auto h-7 gap-1 text-xs" disabled>
              <Satellite className="size-3.5" /> Satélite (proveedor por definir)
            </Button>
          </div>
          <PatrimonyMap features={EMPTY} center={DEFAULT_CENTER} zoom={11} className="h-[520px] w-full" selectedId={selected} onSelect={(p) => setSelected(p?.id ?? null)} />
          <div className="border-t px-3 py-2">
            <MapLegend />
          </div>
        </Card>

        {sel && (
          <Card className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-ink-3">{sel.code}</span>
                  <ScopeBadge referenceOnly={sel.referenceOnly} />
                </div>
                <h3 className="mt-1 text-lg font-semibold tracking-tight">{sel.name}</h3>
                <div className="text-sm text-ink-2">
                  {developments.find((d) => d.id === sel.developmentId)?.name ?? "Propiedad independiente"} · {fmtM2(sel.rentableM2)} rentables
                </div>
                <p className="mt-2 text-xs text-ink-3">{sel.hasGeometry ? "Con polígono verificado." : "Sin polígono: pendiente de capturar la ubicación."}</p>
              </div>
              {!sel.referenceOnly && (
                <Button asChild size="sm">
                  <Link href={`/unidades/${sel.id}`}>Ver expediente <ArrowUpRight className="size-3.5" /></Link>
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      <Card className="flex max-h-[720px] flex-col p-0">
        <div className="flex items-center gap-1 border-b p-2">
          {([["all", "Todo"], ["stone", "Stone"], ["pending", "Sin ubicación"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={cn("rounded-md px-2.5 py-1 text-xs", filter === k ? "bg-primary text-primary-foreground" : "text-ink-2 hover:bg-surface-2")}>
              {l}
            </button>
          ))}
        </div>
        <ul className="flex-1 divide-y overflow-auto">
          {developments.map((d) => (
            <li key={d.id} className="bg-surface-2/60 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-3">
              {d.name}{d.hasGeometry ? "" : " · sin ubicación"}
              <ul className="mt-1 -mx-3 divide-y normal-case tracking-normal">
                {list.filter((u) => u.developmentId === d.id).map((u) => (
                  <UnitRow key={u.id} u={u} selected={selected === u.id} onSelect={() => setSelected(u.id)} />
                ))}
              </ul>
            </li>
          ))}
          {list.some((u) => !u.developmentId) && (
            <li className="bg-surface-2/60 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-3">
              Independientes
              <ul className="mt-1 -mx-3 divide-y normal-case tracking-normal">
                {list.filter((u) => !u.developmentId).map((u) => (
                  <UnitRow key={u.id} u={u} selected={selected === u.id} onSelect={() => setSelected(u.id)} />
                ))}
              </ul>
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}

function UnitRow({ u, selected, onSelect }: { u: MapUnit; selected: boolean; onSelect: () => void }) {
  return (
    <li>
      <button onClick={onSelect} className={cn("flex w-full items-center gap-3 bg-card px-3 py-2 text-left text-sm hover:bg-info-soft/70", selected && "bg-info-soft")}>
        <span className={cn("size-2.5 shrink-0 rounded-sm", !u.hasGeometry ? "border-2 border-dashed border-ink-3 bg-surface-2" : u.referenceOnly ? "border border-dashed border-chart-3 bg-chart-3/20" : "border border-brand-cyan bg-brand-cyan/60")} />
        <span className="font-mono text-xs text-ink-3">{u.code}</span>
        <span className="min-w-0 flex-1 truncate">{u.name}</span>
        <span className="tnum text-xs text-ink-3">{fmtM2(u.rentableM2)}</span>
      </button>
    </li>
  );
}
