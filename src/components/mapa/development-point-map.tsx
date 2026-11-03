"use client";

import type { FeatureCollection } from "geojson";
import { PatrimonyMap } from "@/components/mapa/patrimony-map";

/** Mapa pequeño con el punto de un inmueble (ficha de inmueble y de unidad). */
export function DevelopmentPointMap({ id, name, lon, lat, address, className = "h-[320px] w-full" }: { id: string; name: string; lon: number; lat: number; address: string | null; className?: string }) {
  const features: FeatureCollection = {
    type: "FeatureCollection",
    features: [{ type: "Feature", id, properties: { id, code: "", name, scope: "desarrollo", href: "", subtitle: address ?? "" }, geometry: { type: "Point", coordinates: [lon, lat] } }],
  };
  return <PatrimonyMap features={features} center={[lon, lat]} zoom={15.5} className={className} />;
}
