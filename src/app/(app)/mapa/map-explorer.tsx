"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Layers, MapPin, Satellite } from "lucide-react";
import type { FeatureCollection } from "geojson";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PatrimonyMap } from "@/components/mapa/patrimony-map";
import { MapLegend } from "@/components/mapa/map-legend";
import { fmtM2 } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface MapDevelopment { id: string; name: string; city: string | null; address: string | null; lon: number | null; lat: number | null; precisionM: number | null; unitsStone: number }
export interface MapUnit { id: string; code: string; name: string; developmentId: string | null; referenceOnly: boolean; rentableM2: number | null; tenantName: string | null }

const DEFAULT_CENTER: [number, number] = [-100.3161, 25.6866];

export function MapExplorer({ developments, units }: { developments: MapDevelopment[]; units: MapUnit[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const features = useMemo<FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: developments
        .filter((d) => d.lon != null && d.lat != null)
        .map((d) => ({
          type: "Feature" as const,
          id: d.id,
          properties: { id: d.id, code: "", name: d.name, scope: "desarrollo", href: `/propiedades/${d.id}`, subtitle: d.address ?? "" },
          geometry: { type: "Point" as const, coordinates: [d.lon!, d.lat!] },
        })),
    }),
    [developments],
  );
  const sel = developments.find((d) => d.id === selected);
  const selUnits = units.filter((u) => u.developmentId === selected);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px] lg:items-start">
      <div className="space-y-3">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b px-3 py-2 text-xs">
            <Layers className="size-4 text-ink-3" strokeWidth={1.5} />
            <span className="font-medium">Capas:</span>
            <span>Inmuebles</span>·<span className="text-ink-3">Unidades (polígonos pendientes)</span>
            <Button variant="outline" size="sm" className="ml-auto h-7 gap-1 text-xs" disabled>
              <Satellite className="size-3.5" /> Satélite (proveedor por definir)
            </Button>
          </div>
          <PatrimonyMap features={features} center={DEFAULT_CENTER} zoom={10} fitToFeatures className="h-[520px] w-full" selectedId={selected} onSelect={(p) => setSelected(p?.id ?? null)} />
          <div className="border-t px-3 py-2">
            <MapLegend />
          </div>
        </Card>

        {sel && (
          <Card className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">{sel.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-ink-2"><MapPin className="size-3.5" strokeWidth={1.5} />{sel.address ?? "Dirección por capturar"}{sel.city ? `, ${sel.city}` : ""}</div>
                <p className="mt-1 text-xs text-ink-3">{sel.precisionM != null ? `Punto de dirección, precisión aproximada ± ${sel.precisionM} m. Sin polígono del predio.` : "Sin ubicación."}</p>
              </div>
              <Button asChild size="sm">
                <Link href={`/propiedades/${sel.id}`}>Ver inmueble <ArrowUpRight className="size-3.5" /></Link>
              </Button>
            </div>
            <ul className="mt-3 divide-y text-sm">
              {selUnits.map((u) => (
                <li key={u.id} className="flex items-center gap-3 py-1.5">
                  <span className="font-mono text-xs text-ink-3">{u.code}</span>
                  {u.referenceOnly ? <span className="flex-1 text-ink-3">{u.name}</span> : <Link href={`/unidades/${u.id}`} className="flex-1 hover:underline">{u.name}</Link>}
                  <span className="text-xs text-ink-3">{u.tenantName ?? ""}</span>
                  <span className="tnum text-xs text-ink-3">{fmtM2(u.rentableM2)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <Card className="flex max-h-[720px] flex-col p-0">
        <div className="border-b px-3 py-2 text-xs font-semibold text-ink-2">Inmuebles</div>
        <ul className="flex-1 divide-y overflow-auto">
          {developments.map((d) => (
            <li key={d.id}>
              <button onClick={() => setSelected(d.id)} className={cn("flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm hover:bg-info-soft/70", selected === d.id && "bg-info-soft")}>
                <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", d.lon != null ? "border-2 border-brand-navy bg-brand-cyan" : "border-2 border-dashed border-ink-3 bg-surface-2")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{d.name}</span>
                  <span className="block truncate text-xs text-ink-3">{d.city ?? "Sin ubicación"} · {d.unitsStone} unidades Stone</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
