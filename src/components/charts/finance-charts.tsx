"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtMXN, fmtMXNCompact, fmtPeriod } from "@/lib/format";

const C = {
  cargos: "var(--chart-2)",
  aplicados: "var(--chart-1)",
  caja: "var(--chart-3)",
  gastos: "var(--chart-4)",
};

const tooltipStyle = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--popover-foreground)",
  },
  formatter: ((v: unknown) => (typeof v === "number" ? fmtMXN(v) : String(v ?? ""))) as never,
};

export function ChargesVsCollections({
  data,
}: {
  data: { period: string; cargos: number; cobrosAplicados: number; cobrosCaja: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barGap={4} margin={{ left: 8, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="period"
          tickFormatter={(p) => fmtPeriod(p).split(" ")[0]}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => fmtMXNCompact(v)}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={64}
        />
        <Tooltip {...tooltipStyle} cursor={{ fill: "var(--accent)" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="cargos" name="Cargos del período" fill={C.cargos} radius={[4, 4, 0, 0]} />
        <Bar dataKey="cobrosAplicados" name="Aplicado a esos cargos" fill={C.aplicados} radius={[4, 4, 0, 0]} />
        <Bar dataKey="cobrosCaja" name="Cobros recibidos en el mes" fill={C.caja} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AgingChart({ data }: { data: { label: string; amount: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={84}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip {...tooltipStyle} cursor={{ fill: "var(--accent)" }} />
        <Bar dataKey="amount" name="Saldo" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => (
            <Cell key={d.label} fill={i === 0 ? "var(--chart-5)" : i < 3 ? "var(--chart-1)" : "var(--warn)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ExpensesByCategory({ data }: { data: { category: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="category"
          width={96}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)", textTransform: "capitalize" } as object}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip {...tooltipStyle} cursor={{ fill: "var(--accent)" }} />
        <Bar dataKey="total" name="Gasto" fill="var(--chart-4)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
