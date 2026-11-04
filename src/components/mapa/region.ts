export interface MapCardPoint {
  id: string;
  name: string;
  city: string | null;
  lon: number;
  lat: number;
}

/**
 * Se queda con la ciudad que concentra más inmuebles y con los que están a
 * menos de ~1° de ella; los demás (otra región) se cuentan aparte.
 */
export function splitByRegion<T extends MapCardPoint>(points: T[]): { focus: T[]; others: T[]; city: string | null } {
  if (!points.length) return { focus: [], others: [], city: null };
  const count = new Map<string, number>();
  for (const p of points) count.set(p.city ?? "", (count.get(p.city ?? "") ?? 0) + 1);
  const city = [...count.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const anchor = points.find((p) => (p.city ?? "") === city)!;
  const focus = points.filter((p) => Math.abs(p.lon - anchor.lon) < 1 && Math.abs(p.lat - anchor.lat) < 1);
  const others = points.filter((p) => !focus.includes(p));
  return { focus, others, city: city || null };
}
