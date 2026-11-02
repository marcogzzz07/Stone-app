// Visuales mínimos para KPIs: sin ejes, sin leyenda, solo forma.
// SVG puro para evitar cargar Recharts en cada tarjeta.

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const w = 80, h = 32, pad = 2;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [
    pad + (i * (w - pad * 2)) / (values.length - 1),
    h - pad - ((v - min) / span) * (h - pad * 2),
  ]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className={className} aria-hidden>
      <path d={d} fill="none" stroke="var(--stone-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill="var(--stone-accent)" />
    </svg>
  );
}

export function MiniBars({ values, highlightLast = true }: { values: number[]; highlightLast?: boolean }) {
  const max = Math.max(...values) || 1;
  return (
    <div className="flex h-8 items-end gap-1" aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          className="w-2 rounded-sm"
          style={{
            height: `${Math.max(12, (v / max) * 100)}%`,
            background: highlightLast && i === values.length - 1 ? "var(--stone-accent)" : "var(--chart-5)",
          }}
        />
      ))}
    </div>
  );
}

export function Ring({ ratio, label }: { ratio: number; label?: string }) {
  const r = 14, c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-2" aria-hidden>
      {label && <span className="text-right text-[11px] leading-tight text-muted-foreground">{label}</span>}
      <svg viewBox="0 0 36 36" width={36} height={36}>
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle
          cx="18" cy="18" r={r} fill="none" stroke="var(--stone-accent)" strokeWidth="4"
          strokeDasharray={`${c * Math.min(1, ratio)} ${c}`} strokeLinecap="round" transform="rotate(-90 18 18)"
        />
      </svg>
    </div>
  );
}

export function UnitDots({ states }: { states: ("ocupada" | "disponible" | "desconocida" | "no_disponible")[] }) {
  const color: Record<string, string> = {
    ocupada: "var(--ok)",
    disponible: "var(--stone-accent)",
    desconocida: "var(--chart-5)",
    no_disponible: "var(--border)",
  };
  return (
    <div className="grid grid-cols-5 gap-1" aria-hidden>
      {states.map((s, i) => (
        <span key={i} className="size-2.5 rounded-sm" style={{ background: color[s] }} />
      ))}
    </div>
  );
}

export function StackedBar({ parts }: { parts: { color: string; value: number }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div className="flex h-2.5 w-full gap-1 overflow-hidden" aria-hidden>
      {parts.map((p, i) => (
        <span key={i} className="h-full rounded-sm" style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />
      ))}
    </div>
  );
}

export function DeltaChip({ value, invert = false }: { value: number; invert?: boolean }) {
  const good = invert ? value <= 0 : value >= 0;
  const sign = value > 0 ? "+" : "";
  return (
    <span
      className={`num inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
        good ? "bg-ok/12 text-ok" : "bg-warn/15 text-warn-foreground"
      }`}
    >
      {value >= 0 ? "↗" : "↘"} {sign}
      {value.toFixed(1)} %
    </span>
  );
}
