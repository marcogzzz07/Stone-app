"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtMXN, fmtMXNCompact, fmtPeriod } from "@/lib/format";

export function TrendChart({
  data,
}: {
  data: { period: string; cargos: number; cobrosAplicados: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: 4, right: 12, top: 12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="2 4" />
        <XAxis
          dataKey="period"
          tickFormatter={(p) => fmtPeriod(p).slice(0, 3).toUpperCase()}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => fmtMXNCompact(v)}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
          labelFormatter={(p) => fmtPeriod(String(p))}
          formatter={((v: unknown) => (typeof v === "number" ? fmtMXN(v) : String(v ?? ""))) as never}
        />
        <Line type="monotone" dataKey="cargos" name="Cargos" stroke="var(--navy)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="cobrosAplicados" name="Cobrado" stroke="var(--stone-accent)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
