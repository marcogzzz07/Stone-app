"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";
import { Notice } from "@/components/forms/notice";
import { NativeSelect, Textarea } from "@/components/forms/native-select";
import { FormSection, SubmitBar } from "@/components/forms/form-shell";
import { fmtMXN } from "@/lib/format";
import { TAX_RATE, round2 } from "@/lib/rentas/labels";
import type { LeaseTermRow } from "@/lib/data/rentas";
import { createLeaseTerm, type FormState } from "@/app/(app)/rentas/actions";

export function LeaseTermForm({ leaseId, latestFrom, current }: { leaseId: string; latestFrom: string | null; current: LeaseTermRow | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createLeaseTerm, undefined);
  const [rent, setRent] = useState(current ? current.rentTotal.toFixed(2) : "");
  const [treatment, setTreatment] = useState(current?.taxTreatment ?? "iva_incluido");
  const r = Number(rent) || 0;
  const breakdown =
    treatment === "iva_incluido"
      ? { sub: round2(r / (1 + TAX_RATE)), tax: round2(r - round2(r / (1 + TAX_RATE))), total: r }
      : treatment === "mas_iva"
        ? { sub: r, tax: round2(r * TAX_RATE), total: round2(r * (1 + TAX_RATE)) }
        : { sub: r, tax: 0, total: r };

  const minFrom = latestFrom
    ? (() => {
        const d = new Date(latestFrom + "T12:00:00");
        d.setDate(d.getDate() + 1);
        return d.toISOString().slice(0, 10);
      })()
    : undefined;

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="lease_id" value={leaseId} />
      {state?.error && <Notice tone="danger" title="No se pudo registrar la condición">{state.error}</Notice>}

      <FormSection title="Nueva condición" hint={latestFrom ? `La vigente inicia el ${latestFrom}` : undefined}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Aplica desde" htmlFor="effective_from" help="La condición anterior se cierra el día previo.">
            <Input id="effective_from" name="effective_from" type="date" required min={minFrom} />
          </Field>
          <Field label="Tratamiento de IVA" htmlFor="tax_treatment">
            <NativeSelect id="tax_treatment" name="tax_treatment" value={treatment} onChange={(e) => setTreatment(e.target.value as typeof treatment)}>
              <option value="iva_incluido">Renta con IVA incluido</option>
              <option value="mas_iva">Renta más IVA</option>
              <option value="exento">Exenta de IVA</option>
            </NativeSelect>
          </Field>
          <Field label="Renta mensual" htmlFor="rent_total" help={treatment === "iva_incluido" ? "Como aparece en el contrato, con IVA." : "Monto antes de IVA."}>
            <Input id="rent_total" name="rent_total" type="number" inputMode="decimal" step="0.01" min="0" required className="tnum text-right" value={rent} onChange={(e) => setRent(e.target.value)} />
          </Field>
          <Field label="Mantenimiento mensual" htmlFor="maintenance_total" help="0 si no se cobra.">
            <Input id="maintenance_total" name="maintenance_total" type="number" inputMode="decimal" step="0.01" min="0" className="tnum text-right" defaultValue={current ? current.maintenanceTotal.toFixed(2) : "0"} />
          </Field>
          <Field label="Día de pago" htmlFor="due_day" help="Día del mes en que vence la renta.">
            <Input id="due_day" name="due_day" type="number" min="1" max="31" step="1" className="tnum text-right" defaultValue={current?.dueDay ?? ""} />
          </Field>
          <Field label="Depósito en garantía" htmlFor="deposit_amount" help="Opcional.">
            <Input id="deposit_amount" name="deposit_amount" type="number" inputMode="decimal" step="0.01" min="0" className="tnum text-right" defaultValue={current?.depositAmount ?? ""} />
          </Field>
          <Field label="Regla de incremento" htmlFor="increase_rule" className="sm:col-span-2" help="Solo si está documentada en el contrato: “INPC anual”, “4 % fijo (cláusula 7)”.">
            <Input id="increase_rule" name="increase_rule" autoComplete="off" defaultValue={current?.increaseRule ?? ""} />
          </Field>
          <Field label="Notas" htmlFor="notes" className="sm:col-span-2">
            <Textarea id="notes" name="notes" rows={2} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-surface-2 px-3 py-2 text-sm">
          <div><div className="text-[12px] text-ink-3">Sin IVA</div><div className="tnum text-ink">{fmtMXN(breakdown.sub)}</div></div>
          <div><div className="text-[12px] text-ink-3">IVA</div><div className="tnum text-ink">{fmtMXN(breakdown.tax)}</div></div>
          <div><div className="text-[12px] text-ink-3">Total mensual</div><div className="num text-ink">{fmtMXN(breakdown.total)}</div></div>
        </div>
      </FormSection>

      <SubmitBar pending={pending} label="Registrar condición" cancelHref="/contratos" />
    </form>
  );
}
