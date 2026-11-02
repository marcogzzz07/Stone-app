const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
});

const mxnCompact = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  notation: "compact",
  maximumFractionDigits: 1,
});

const num = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 });

export const fmtMXN = (v: number) => mxn.format(v);
export const fmtMXNCompact = (v: number) => mxnCompact.format(v);
export const fmtM2 = (v: number | null | undefined) =>
  v == null ? "—" : `${num.format(v)} m²`;
export const fmtNum = (v: number) => num.format(v);
export const fmtPct = (v: number) => `${num.format(Math.round(v * 10) / 10)} %`;

export const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso + (iso.length === 10 ? "T12:00:00" : "")));

export const fmtPeriod = (iso: string) => {
  const s = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(
    new Date(iso + "T12:00:00"),
  );
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const daysUntil = (iso: string, from = "2026-11-01") =>
  Math.round(
    (new Date(iso + "T12:00:00").getTime() -
      new Date(from + "T12:00:00").getTime()) /
      86_400_000,
  );
