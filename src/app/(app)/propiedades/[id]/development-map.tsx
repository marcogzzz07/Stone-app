"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PatrimonyMap } from "@/components/mapa/patrimony-map";
import { MapLegend } from "@/components/mapa/map-legend";
import { centroid, developmentFeatures } from "@/lib/mock/geo";
import { getDevelopment } from "@/lib/mock/queries";

export function DevelopmentMap({ devId }: { devId: string }) {
  const router = useRouter();
  const features = useMemo(() => developmentFeatures(devId), [devId]);
  const d = getDevelopment(devId)!;
  const center = centroid(d.geometry.coordinates as number[][]);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      <PatrimonyMap
        features={features}
        center={center}
        zoom={17}
        className="h-[360px] w-full"
        selectedId={selected}
        onSelect={(p) => {
          setSelected(p?.id ?? null);
          if (p?.href) router.push(p.href);
        }}
      />
      <div className="border-t px-3 py-2">
        <MapLegend />
      </div>
    </div>
  );
}
