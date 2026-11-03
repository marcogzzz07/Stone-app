"use client";

import { useActionState, useState } from "react";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/forms/field";
import { Notice } from "@/components/forms/notice";
import { NativeSelect, Textarea } from "@/components/forms/native-select";
import type { LeaseOption, LeaseTermRow } from "@/lib/data/rentas";
import { updateLease, updateLeaseTerm, type FormState } from "@/app/(app)/rentas/actions";

/** Lápiz del contrato: abre un formulario en la misma tarjeta para corregir datos generales. */
export function LeaseEditor({ lease, rentedM2 }: { lease: LeaseOption; rentedM2: number | null }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(updateLease, undefined);
  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil strokeWidth={1.5} /> Editar contrato
      </Button>
    );
  }
  return (
    <Card className="gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-ink">Editar contrato</div>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Cerrar" onClick={() => setOpen(false)}><X /></Button>
      </div>
      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="lease_id" value={lease.id} />
        {state?.error && <Notice tone="danger" title="No se pudo guardar">{state.error}</Notice>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Inicio" htmlFor="e-start" help="Vacío si no se conoce.">
            <Input id="e-start" name="start_date" type="date" defaultValue={lease.startDate ?? ""} />
          </Field>
          <Field label="Fin" htmlFor="e-end" help="Vacío si no está capturado.">
            <Input id="e-end" name="end_date" type="date" defaultValue={lease.endDate ?? ""} />
          </Field>
          <Field label="Firma" htmlFor="e-signed">
            <Input id="e-signed" name="signed_at" type="date" defaultValue={lease.signedAt ?? ""} />
          </Field>
          <Field label="m² rentados" htmlFor="e-m2">
            <Input id="e-m2" name="rented_m2" type="number" step="0.01" min="0" className="tnum text-right" defaultValue={rentedM2 ?? ""} />
          </Field>
          <Field label="Estado" htmlFor="e-status">
            <NativeSelect id="e-status" name="status" defaultValue={lease.status}>
              <option value="draft">Borrador (por confirmar)</option>
              <option value="active">Activo</option>
              <option value="expired">Vencido</option>
              <option value="terminated">Terminado</option>
              <option value="void">Anulado</option>
            </NativeSelect>
          </Field>
          <Field label="Validación" htmlFor="e-ver">
            <NativeSelect id="e-ver" name="verification" defaultValue={lease.verification}>
              <option value="confirmado">Confirmado</option>
              <option value="por_verificar">Por verificar</option>
              <option value="no_disponible">No disponible</option>
            </NativeSelect>
          </Field>
          <Field label="Código interno" htmlFor="e-code" className="sm:col-span-2">
            <Input id="e-code" name="code" defaultValue={lease.code ?? ""} />
          </Field>
          <Field label="Notas" htmlFor="e-notes" className="sm:col-span-2" help="Cláusulas clave, acuerdos verbales, pendientes con el arrendatario.">
            <Textarea id="e-notes" name="notes" rows={4} defaultValue={lease.notes ?? ""} />
          </Field>
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar cambios"}</Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
        </div>
      </form>
    </Card>
  );
}

/** Lápiz de una condición existente: corrige montos y fechas sin crear versión nueva. */
export function TermEditor({ leaseId, term }: { leaseId: string; term: LeaseTermRow }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(updateLeaseTerm, undefined);
  if (!open) {
    return (
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Editar condición" onClick={() => setOpen(true)}>
        <Pencil strokeWidth={1.5} />
      </Button>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-3 rounded-lg border bg-surface-2/40 p-3">
      <input type="hidden" name="lease_id" value={leaseId} />
      <input type="hidden" name="term_id" value={term.id} />
      {state?.error && <Notice tone="danger" title="No se pudo guardar">{state.error}</Notice>}
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Desde" htmlFor={`t-from-${term.id}`}>
          <Input id={`t-from-${term.id}`} name="effective_from" type="date" required defaultValue={term.effectiveFrom} />
        </Field>
        <Field label="Hasta" htmlFor={`t-to-${term.id}`} help="Vacío = vigente.">
          <Input id={`t-to-${term.id}`} name="effective_to" type="date" defaultValue={term.effectiveTo ?? ""} />
        </Field>
        <Field label="IVA" htmlFor={`t-tax-${term.id}`}>
          <NativeSelect id={`t-tax-${term.id}`} name="tax_treatment" defaultValue={term.taxTreatment}>
            <option value="iva_incluido">Renta con IVA incluido</option>
            <option value="mas_iva">Renta más IVA</option>
            <option value="exento">Exenta</option>
          </NativeSelect>
        </Field>
        <Field label="Renta mensual" htmlFor={`t-rent-${term.id}`}>
          <Input id={`t-rent-${term.id}`} name="rent_total" type="number" step="0.01" min="0" required className="tnum text-right" defaultValue={term.rentTotal.toFixed(2)} />
        </Field>
        <Field label="Mantenimiento" htmlFor={`t-mtto-${term.id}`}>
          <Input id={`t-mtto-${term.id}`} name="maintenance_total" type="number" step="0.01" min="0" className="tnum text-right" defaultValue={term.maintenanceTotal.toFixed(2)} />
        </Field>
        <Field label="Día de pago" htmlFor={`t-due-${term.id}`}>
          <Input id={`t-due-${term.id}`} name="due_day" type="number" min="1" max="31" className="tnum text-right" defaultValue={term.dueDay ?? ""} />
        </Field>
        <Field label="Depósito" htmlFor={`t-dep-${term.id}`}>
          <Input id={`t-dep-${term.id}`} name="deposit_amount" type="number" step="0.01" min="0" className="tnum text-right" defaultValue={term.depositAmount ?? ""} />
        </Field>
        <Field label="Regla de incremento" htmlFor={`t-rule-${term.id}`} className="sm:col-span-2">
          <Input id={`t-rule-${term.id}`} name="increase_rule" defaultValue={term.increaseRule ?? ""} />
        </Field>
        <Field label="Notas" htmlFor={`t-notes-${term.id}`} className="sm:col-span-3">
          <Textarea id={`t-notes-${term.id}`} name="notes" rows={2} defaultValue={term.notes ?? ""} />
        </Field>
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>{pending ? "Guardando…" : "Guardar"}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
      </div>
    </form>
  );
}
