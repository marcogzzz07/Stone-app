"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import { BASE_STYLE } from "./patrimony-map";

import type { MapCardPoint } from "./region";

export type { MapCardPoint };

/**
 * Mapa estático para el dashboard: la misma base del módulo, sin controles ni
 * interacción, encuadrado en la zona con más inmuebles. El clic lo recibe el
 * enlace que envuelve la tarjeta.
 */
export function MapCard({ points, className }: { points: MapCardPoint[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !points.length) return;
    const b = new maplibregl.LngLatBounds();
    for (const p of points) b.extend([p.lon, p.lat]);
    const fit = { padding: { top: 36, bottom: 36, left: 36, right: 130 }, maxZoom: 13, duration: 0 };
    const map = new maplibregl.Map({
      container: ref.current,
      style: BASE_STYLE,
      bounds: b,
      fitBoundsOptions: fit,
      interactive: false,
      attributionControl: false,
    });
    // La tarjeta toma su alto final después del primer render: se reencuadra
    // al cargar y cada vez que cambia el tamaño.
    map.on("load", () => map.fitBounds(b, fit));
    points.forEach((p, i) => {
      const el = document.createElement("div");
      el.className = "map-card-pin";
      // Dos inmuebles a menos de ~1 km se encimarían: solo el primero lleva etiqueta.
      const crowded = points.slice(0, i).some((q) => Math.abs(q.lon - p.lon) < 0.012 && Math.abs(q.lat - p.lat) < 0.012);
      if (!crowded) {
        const label = document.createElement("span");
        label.className = "map-card-pin-label";
        label.textContent = p.name;
        el.appendChild(label);
      }
      new maplibregl.Marker({ element: el }).setLngLat([p.lon, p.lat]).addTo(map);
    });
    const ro = new ResizeObserver(() => {
      map.resize();
      map.fitBounds(b, fit);
    });
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} className={className} aria-hidden />;
}
