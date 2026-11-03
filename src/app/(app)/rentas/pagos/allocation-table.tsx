"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/forms/status-pill";
import { fmtAmt, fmtDate, fmtMXN, fmtPeriod } from "@/lib/format";
import { CHARGE_STATUS, CONCEPT_LABEL, round2 } from "@/lib/rentas/labels";

export interface OpenCharge {
  id: string;
  period: string;
  concept: string;
  unitCode: string | null;
  folio: string | null;
  dueDate: string | null;
  balance: number;
  status: string;
}

/**
 * Tabla de aplicación: un renglón por cargo con saldo del arrendatario y un
 * campo de monto. `values` lo controla el formulario padre para poder
 * repartir automáticamente ("aplicar en orden") y mostrar lo que sobra.
 */
export function AllocationTable({
  charges,
  values,
  onChange,
  available,
}: {
  charges: OpenCharge[];
  values: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  available: number;
}) {
  const applied = round2(charges.reduce((s, c) => s + (Number(values[c.id]) || 0), 0));
  const remaining = round2(available - applied);
  const over = remaining < -0.005;

  function autoFill() {
    let left = available;
    const next: Record<string, string> = {};
    for (const c of charges) {
      const a = Math.min(left, c.balance);
      if (a > 0.005) {
        next[c.id] = round2(a).toFixed(2);
        left = round2(left - a);
      }
    }
    onChange(next);
  }

  if (charges.length === 0) {
    return <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-ink-2">Este arrendatario no tiene cargos con saldo. El pago quedará como saldo a favor hasta que exista un cargo.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-ink-2">Más antiguos primero. Deja en blanco lo que no se aplique.</span>
        <button type="button" onClick={autoFill} className="text-sm font-medium text-brand-cyan-ink hover:underline">
          Aplicar en orden
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Período</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Vence</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-36 text-right">Aplicar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charges.map((c) => {
              const st = CHARGE_STATUS[c.status] ?? CHARGE_STATUS.open;
              const v = Number(values[c.id]) || 0;
              const exceeds = v > c.balance + 0.005;
              return (
                <TableRow key={c.id}>
                  <TableCell>{fmtPeriod(c.period)}</TableCell>
                  <TableCell className="text-xs">{CONCEPT_LABEL[c.concept] ?? c.concept}</TableCell>
                  <TableCell className="font-mono text-xs">{c.unitCode ?? "-"}</TableCell>
                  <TableCell className="text-xs">{c.dueDate ? fmtDate(c.dueDate) : "-"}</TableCell>
                  <TableCell className={`tnum text-right ${c.status === "overdue" ? "font-semibold text-danger" : "font-semibold text-warning"}`}>{fmtAmt(c.balance)}</TableCell>
                  <TableCell><StatusPill label={st.label} cls={st.cls} /></TableCell>
                  <TableCell className="text-right">
                    <Input
                      name={`alloc:${c.id}`}
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      max={c.balance}
                      aria-label={`Monto a aplicar al cargo de ${fmtPeriod(c.period)}`}
                      aria-invalid={exceeds || undefined}
                      className="tnum h-7 text-right"
                      value={values[c.id] ?? ""}
                      onChange={(e) => onChange({ ...values, [c.id]: e.target.value })}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-1 text-sm">
        <span className="text-ink-2">Aplicado <span className="tnum font-medium text-ink">{fmtMXN(applied)}</span></span>
        <span className={over ? "font-semibold text-danger" : "text-ink-2"}>
          {over ? "Excede el pago por " : "Sin aplicar "}
          <span className="tnum font-medium">{fmtMXN(Math.abs(remaining))}</span>
        </span>
      </div>
      {over && <p className="text-[13px] text-danger">Las aplicaciones suman más que el pago. Reduce algún monto.</p>}
    </div>
  );
}
