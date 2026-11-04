"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtMXN, fmtMXNCompact } from "@/lib/format";

// Gráficas del informe mensual (brand book: cobrado en chart-2, pendiente en
// warning, proyección en línea punteada chart-reference, inmuebles en su color fijo).

const tooltip = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--popover-foreground)" },
  formatter: ((v: unknown) => (typeof v === "number" ? fmtMXN(v) : String(v ?? ""))) as never,
};
const axis = { fontSize: 11, fill: "var(--ink-3)" };

/** Cobrado contra pendiente por inmueble (barras horizontales apiladas). */
export function CobradoPendienteChart({ data }: { data: { name: string; cobrado: number; pendiente: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 38 + 40)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }} barCategoryGap={10}>
        <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
        <XAxis type="number" tick={axis} tickFormatter={(v) => fmtMXNCompact(v)} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12, fill: "var(--ink-2)" }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltip} cursor={{ fill: "var(--surface-2)" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="cobrado" name="Cobrado" stackId="a" fill="var(--chart-2)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="pendiente" name="Pendiente" stackId="a" fill="var(--warning)" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Real contra proyección por mes (columnas) con línea de proyección. */
export function RealVsProyeccionChart({ data, fill = false }: { data: { label: string; proyeccion: number; real: number }[]; fill?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={fill ? "100%" : 260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} barCategoryGap={18}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
        <YAxis tick={axis} tickFormatter={(v) => fmtMXNCompact(v)} axisLine={false} tickLine={false} width={56} />
        <Tooltip {...tooltip} cursor={{ fill: "var(--surface-2)" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="proyeccion" name="Proyección" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="real" name="Real" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Tendencia mensual: columnas apiladas por inmueble en su color fijo. */
export function TendenciaChart({ months, series }: { months: string[]; series: { name: string; chart: string; values: number[] }[] }) {
  const data = months.map((m, i) => Object.fromEntries([["label", m], ...series.map((s) => [s.name, s.values[i]])]));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} barCategoryGap={14}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
        <YAxis tick={axis} tickFormatter={(v) => fmtMXNCompact(v)} axisLine={false} tickLine={false} width={56} />
        <Tooltip {...tooltip} cursor={{ fill: "var(--surface-2)" }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {series.map((s, i) => (
          <Bar key={s.name} dataKey={s.name} stackId="a" fill={`var(--${s.chart})`} radius={i === series.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
