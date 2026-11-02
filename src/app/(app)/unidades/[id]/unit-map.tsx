"use client";

import { useMemo } from "react";
import { PatrimonyMap } from "@/components/mapa/patrimony-map";
import { MapLegend } from "@/components/mapa/map-legend";
import { centroid, developmentFeatures, unitFeature } from "@/lib/mock/geo";
import { getUnit } from "@/lib/mock/queries";
import type { FeatureCollection } from "geojson";

export function UnitMap({ unitId }: { unitId: string }) {
  const u = getUnit(unitId)!;
  const features = useMemo<FeatureCollection>(() => {
    if (u.developmentId) return developmentFeatures(u.developmentId);
    const f = unitFeature(u);
    return { type: "FeatureCollection", features: f ? [f] : [] };
  }, [u]);
  const center = centroid(u.geometry.coordinates as number[][]);
  return (
    <div>
      <PatrimonyMap features={features} center={center} zoom={17.5} className="h-[360px] w-full" selectedId={u.id} />
      <div className="border-t px-3 py-2"><MapLegend /></div>
    </div>
  );
}
