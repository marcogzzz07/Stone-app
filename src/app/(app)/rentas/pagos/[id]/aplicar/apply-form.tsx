"use client";

import { useActionState, useState } from "react";
import { Notice } from "@/components/forms/notice";
import { SubmitBar } from "@/components/forms/form-shell";
import { allocatePayment, type FormState } from "../../../actions";
import { AllocationTable, type OpenCharge } from "../../allocation-table";

export function ApplyForm({ paymentId, available, charges }: { paymentId: string; available: number; charges: OpenCharge[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(allocatePayment, undefined);
  const [values, setValues] = useState<Record<string, string>>({});
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="payment_id" value={paymentId} />
      {state?.error && <Notice tone="danger" title="No se pudo aplicar el pago">{state.error}</Notice>}
      <AllocationTable charges={charges} values={values} onChange={setValues} available={available} />
      <SubmitBar pending={pending} label="Aplicar pago" cancelHref="/rentas?tab=cobro" />
    </form>
  );
}
