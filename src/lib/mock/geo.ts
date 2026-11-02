import type { FeatureCollection, Feature } from "geojson";
import { developments, units } from "./data";
import type { Development, Unit } from "./types";

export function developmentFeature(d: Development): Feature | null {
  if (d.geometry.type !== "Polygon" || !d.geometry.coordinates) return null;
  return {
    type: "Feature",
    id: d.id,
    properties: { id: d.id, code: "", name: d.name, scope: "desarrollo", href: `/propiedades/${d.id}`, subtitle: d.address },
    geometry: { type: "Polygon", coordinates: [d.geometry.coordinates as number[][]] },
  };
}

export function unitFeature(u: Unit): Feature | null {
  if (u.geometry.type !== "Polygon" || !u.geometry.coordinates) return null;
  return {
    type: "Feature",
    id: u.id,
    properties: {
      id: u.id,
      code: u.code,
      name: u.name,
      scope: u.referenceOnly ? "referencia" : "stone",
      href: u.referenceOnly ? "" : `/unidades/${u.id}`,
      subtitle: u.kind,
    },
    geometry: { type: "Polygon", coordinates: [u.geometry.coordinates as number[][]] },
  };
}

export function allFeatures(): FeatureCollection {
  const fs: Feature[] = [];
  for (const d of developments) {
    const f = developmentFeature(d);
    if (f) fs.push(f);
  }
  for (const u of units) {
    const f = unitFeature(u);
    if (f) fs.push(f);
  }
  return { type: "FeatureCollection", features: fs };
}

export function developmentFeatures(devId: string): FeatureCollection {
  const d = developments.find((x) => x.id === devId);
  const fs: Feature[] = [];
  if (d) {
    const f = developmentFeature(d);
    if (f) fs.push(f);
  }
  for (const u of units.filter((u) => u.developmentId === devId)) {
    const f = unitFeature(u);
    if (f) fs.push(f);
  }
  return { type: "FeatureCollection", features: fs };
}

export function centroid(coords: number[][]): [number, number] {
  const n = coords.length - 1 || 1;
  let x = 0, y = 0;
  for (let i = 0; i < n; i++) { x += coords[i][0]; y += coords[i][1]; }
  return [x / n, y / n];
}
