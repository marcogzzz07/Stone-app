"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MLMap, MapLayerMouseEvent } from "maplibre-gl";
import type { FeatureCollection } from "geojson";

export interface MapFeatureProps {
  id: string;
  name: string;
  scope: "stone" | "referencia" | "desarrollo";
  href: string;
  subtitle: string;
}

interface Props {
  features: FeatureCollection;
  center: [number, number];
  zoom?: number;
  className?: string;
  onSelect?: (p: MapFeatureProps | null) => void;
  selectedId?: string | null;
}

// Base cartográfica libre (teselas OSM, solo para desarrollo/prototipo). El
// proveedor de mapas y satélite con licencia se elige antes de producción
// (spec §12); aquí solo se muestra el toggle deshabilitado.
const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    { id: "osm", type: "raster", source: "osm", paint: { "raster-saturation": -0.6, "raster-opacity": 0.9 } },
  ],
};

// Turbopack no resuelve bien el worker como módulo; se sirve desde /public
// (copiado de node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs).
if (typeof window !== "undefined") {
  maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");
}

export function PatrimonyMap({ features, center, zoom = 15, className, onSelect, selectedId }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: STYLE,
      center,
      zoom,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    map.on("load", () => {
      map.addSource("patrimonio", { data: features, type: "geojson", promoteId: "id" });
      map.addLayer({
        id: "dev-fill",
        type: "fill",
        source: "patrimonio",
        filter: ["==", ["get", "scope"], "desarrollo"],
        paint: { "fill-color": "#9a8f82", "fill-opacity": 0.08 },
      });
      map.addLayer({
        id: "dev-line",
        type: "line",
        source: "patrimonio",
        filter: ["==", ["get", "scope"], "desarrollo"],
        paint: { "line-color": "#6b625a", "line-width": 1.5, "line-dasharray": [3, 2] },
      });
      map.addLayer({
        id: "unit-fill",
        type: "fill",
        source: "patrimonio",
        filter: ["!=", ["get", "scope"], "desarrollo"],
        paint: {
          "fill-color": ["case", ["==", ["get", "scope"], "stone"], "#c9803f", "#7d8794"],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            0.65,
            ["==", ["get", "scope"], "stone"],
            0.35,
            0.15,
          ],
        },
      });
      map.addLayer({
        id: "unit-line",
        type: "line",
        source: "patrimonio",
        filter: ["!=", ["get", "scope"], "desarrollo"],
        paint: {
          "line-color": ["case", ["==", ["get", "scope"], "stone"], "#a8622a", "#7d8794"],
          "line-width": 2,
          "line-dasharray": ["case", ["==", ["get", "scope"], "stone"], ["literal", [1, 0]], ["literal", [2, 2]]],
        },
      });
      map.addLayer({
        id: "unit-label",
        type: "symbol",
        source: "patrimonio",
        filter: ["!=", ["get", "scope"], "desarrollo"],
        layout: {
          "text-field": ["get", "code"],
          "text-size": 11,
          "text-font": ["Open Sans Regular", "Noto Sans Regular"],
        },
        paint: { "text-color": "#2a2521", "text-halo-color": "#fff", "text-halo-width": 1 },
        minzoom: 16,
      });

      map.on("click", "unit-fill", (e: MapLayerMouseEvent) => {
        const f = e.features?.[0];
        if (!f) return;
        onSelect?.(f.properties as unknown as MapFeatureProps);
      });
      map.on("mouseenter", "unit-fill", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "unit-fill", () => (map.getCanvas().style.cursor = ""));
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    for (const f of features.features) {
      const id = (f.properties as MapFeatureProps).id;
      map.setFeatureState({ source: "patrimonio", id }, { selected: id === selectedId });
    }
  }, [selectedId, features]);

  return <div ref={ref} className={className} />;
}
