"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";
import { Notice } from "@/components/forms/notice";
import { NativeSelect, Textarea } from "@/components/forms/native-select";
import { FormSection, SubmitBar } from "@/components/forms/form-shell";
import { METHOD_LABEL, todayIso } from "@/lib/rentas/labels";
import { createPayment, type FormState } from "../../actions";
import { AllocationTable, type OpenCharge } from "../allocation-table";

export function PaymentForm({
  tenants,
  openByTenant,
}: {
  tenants: { id: string; name: string }[];
  openByTenant: Record<string, OpenCharge[]>;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(createPayment, undefined);
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const charges = openByTenant[tenantId] ?? [];
  const available = Number(amount) || 0;

  return (
    <form action={action} className="flex flex-col gap-6">
      {state?.error && <Notice tone="danger" title="No se pudo registrar el pago">{state.error}</Notice>}

      <FormSection title="Pago recibido" hint="MXN">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Arrendatario" htmlFor="tenant_id" className="sm:col-span-2">
            <NativeSelect
              id="tenant_id"
              name="tenant_id"
              value={tenantId}
              onChange={(e) => {
                setTenantId(e.target.value);
                setValues({});
              }}
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Fecha de pago" htmlFor="effective_date" help="Fecha del depósito o cobro.">
            <Input id="effective_date" name="effective_date" type="date" required defaultValue={todayIso()} max={todayIso()} />
          </Field>
          <Field label="Monto" htmlFor="amount">
            <Input id="amount" name="amount" type="number" inputMode="decimal" step="0.01" min="0.01" required className="tnum text-right" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </Field>
          <Field label="Medio" htmlFor="method">
            <NativeSelect id="method" name="method" defaultValue="transfer">
              {Object.entries(METHOD_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Referencia bancaria" htmlFor="bank_ref" help="Opcional: clave de rastreo o número de cheque.">
            <Input id="bank_ref" name="bank_ref" autoComplete="off" />
          </Field>
        </div>
        <Field label="Notas" htmlFor="notes">
          <Textarea id="notes" name="notes" rows={2} />
        </Field>
      </FormSection>

      <FormSection title="Aplicar a cargos" hint={charges.length ? `${charges.length} cargo(s) con saldo` : undefined}>
        <AllocationTable charges={charges} values={values} onChange={setValues} available={available} />
      </FormSection>

      <SubmitBar pending={pending} label="Registrar pago" cancelHref="/rentas" />
    </form>
  );
}
