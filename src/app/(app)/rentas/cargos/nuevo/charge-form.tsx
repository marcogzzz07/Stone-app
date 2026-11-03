"use client";

import { useActionState, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";
import { Notice } from "@/components/forms/notice";
import { NativeSelect, Textarea } from "@/components/forms/native-select";
import { FormSection, SubmitBar } from "@/components/forms/form-shell";
import { fmtMXN } from "@/lib/format";
import { CONCEPT_LABEL, TAX_RATE, round2, thisMonth } from "@/lib/rentas/labels";
import type { LeaseTermRow } from "@/lib/data/rentas";
import { createCharge, type FormState } from "../../actions";

export interface LeaseChoice {
  id: string;
  label: string;
  developmentName: string | null;
  term: LeaseTermRow | null;
}

/** Vencimiento = día de pago del contrato dentro del mes del período (o el último día si no alcanza). */
function dueDateFor(period: string, dueDay: number | null) {
  if (!/^\d{4}-\d{2}$/.test(period)) return "";
  const [y, m] = period.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  const d = Math.min(dueDay ?? 1, last);
  return `${period}-${String(d).padStart(2, "0")}`;
}

function amountsFor(term: LeaseTermRow | null, concept: string) {
  if (!term) return { subtotal: "", tax: "" };
  if (concept === "rent") return { subtotal: term.rentSubtotal.toFixed(2), tax: term.rentTax.toFixed(2) };
  if (concept === "maintenance") {
    const total = term.maintenanceTotal;
    if (term.taxTreatment === "iva_incluido") {
      const sub = round2(total / (1 + term.taxRate));
      return { subtotal: sub.toFixed(2), tax: round2(total - sub).toFixed(2) };
    }
    if (term.taxTreatment === "mas_iva") return { subtotal: total.toFixed(2), tax: round2(total * term.taxRate).toFixed(2) };
    return { subtotal: total.toFixed(2), tax: "0.00" };
  }
  return { subtotal: "", tax: "" };
}

export function ChargeForm({ leases }: { leases: LeaseChoice[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createCharge, undefined);
  const [leaseId, setLeaseId] = useState(leases[0]?.id ?? "");
  const [concept, setConcept] = useState("rent");
  const [period, setPeriod] = useState(thisMonth());
  const lease = useMemo(() => leases.find((l) => l.id === leaseId) ?? null, [leases, leaseId]);
  const [subtotal, setSubtotal] = useState(() => amountsFor(lease?.term ?? null, "rent").subtotal);
  const [tax, setTax] = useState(() => amountsFor(lease?.term ?? null, "rent").tax);
  const [dueDate, setDueDate] = useState(() => dueDateFor(thisMonth(), lease?.term?.dueDay ?? null));

  function applyPrefill(nextLease: LeaseChoice | null, nextConcept: string, nextPeriod: string) {
    const a = amountsFor(nextLease?.term ?? null, nextConcept);
    setSubtotal(a.subtotal);
    setTax(a.tax);
    setDueDate(dueDateFor(nextPeriod, nextLease?.term?.dueDay ?? null));
  }

  const total = round2((Number(subtotal) || 0) + (Number(tax) || 0));
  const term = lease?.term ?? null;

  return (
    <form action={action} className="flex flex-col gap-6">
      {state?.error && <Notice tone="danger" title="No se pudo registrar el cargo">{state.error}</Notice>}

      <FormSection title="Contrato y período">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Contrato" htmlFor="lease_id" className="sm:col-span-2" help={lease?.developmentName ?? undefined}>
            <NativeSelect
              id="lease_id"
              name="lease_id"
              value={leaseId}
              onChange={(e) => {
                const next = leases.find((l) => l.id === e.target.value) ?? null;
                setLeaseId(e.target.value);
                applyPrefill(next, concept, period);
              }}
            >
              {leases.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Concepto" htmlFor="concept">
            <NativeSelect
              id="concept"
              name="concept"
              value={concept}
              onChange={(e) => {
                setConcept(e.target.value);
                applyPrefill(lease, e.target.value, period);
              }}
            >
              {Object.entries(CONCEPT_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Mes del cargo" htmlFor="period" help="Columna MES del reporte. Un cargo por mes y concepto.">
            <Input
              id="period"
              name="period"
              type="month"
              required
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setDueDate(dueDateFor(e.target.value, term?.dueDay ?? null));
              }}
            />
          </Field>
        </div>
        {term ? (
          <p className="text-[13px] text-ink-3">
            Condición vigente desde {term.effectiveFrom}: renta {fmtMXN(term.rentTotal)} {term.taxTreatment === "iva_incluido" ? "con IVA" : term.taxTreatment === "mas_iva" ? "más IVA" : "exenta"}
            {term.maintenanceTotal > 0 && ` · mantenimiento ${fmtMXN(term.maintenanceTotal)}`}
            {term.dueDay && ` · vence el día ${term.dueDay}`}.
          </p>
        ) : (
          <Notice tone="warning" title="El contrato no tiene condiciones registradas">Captura los montos a mano o registra la condición en Contratos.</Notice>
        )}
      </FormSection>

      <FormSection title="Factura" hint="Montos en MXN">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Folio de factura" htmlFor="invoice_folio" help="Opcional. No se repite dentro de Stone.">
            <Input id="invoice_folio" name="invoice_folio" autoComplete="off" placeholder="A-1234" />
          </Field>
          <Field label="Fecha de factura" htmlFor="invoice_date">
            <Input id="invoice_date" name="invoice_date" type="date" />
          </Field>
          <Field label="Subtotal (sin IVA)" htmlFor="subtotal">
            <Input id="subtotal" name="subtotal" type="number" inputMode="decimal" step="0.01" min="0" required className="tnum text-right" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} />
          </Field>
          <Field label="IVA" htmlFor="tax_amount" help="0 si el cargo está exento.">
            <div className="flex gap-2">
              <Input id="tax_amount" name="tax_amount" type="number" inputMode="decimal" step="0.01" min="0" required className="tnum text-right" value={tax} onChange={(e) => setTax(e.target.value)} />
              <button
                type="button"
                className="shrink-0 rounded-lg border border-input px-2 text-xs text-ink-2 hover:bg-surface-2"
                onClick={() => setTax(round2((Number(subtotal) || 0) * TAX_RATE).toFixed(2))}
              >
                16 %
              </button>
            </div>
          </Field>
          <Field label="Vence" htmlFor="due_date" help="Se propone con el día de pago del contrato.">
            <Input id="due_date" name="due_date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
          <div className="flex flex-col justify-end rounded-lg bg-surface-2 px-3 py-2">
            <div className="text-[13px] text-ink-3">Total con IVA</div>
            <div className="num text-xl text-ink">{fmtMXN(total)}</div>
          </div>
        </div>
        <Field label="Notas" htmlFor="notes" help="Opcional: aclaraciones para quien revise el período.">
          <Textarea id="notes" name="notes" rows={2} />
        </Field>
      </FormSection>

      <SubmitBar pending={pending} label="Registrar cargo" cancelHref="/rentas" />
    </form>
  );
}
