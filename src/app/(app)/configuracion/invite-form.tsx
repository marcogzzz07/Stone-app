"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";
import { Notice } from "@/components/forms/notice";
import { inviteUser, type InviteState } from "./actions";

export function InviteForm() {
  const [state, action, pending] = useActionState<InviteState, FormData>(inviteUser, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      {state?.error && <Notice tone="danger" title="No se pudo invitar">{state.error}</Notice>}
      {state?.warning && <Notice tone="warning" title="Falta un paso">{state.warning}</Notice>}
      {state?.ok && <Notice tone="success" title="Listo">{state.ok}</Notice>}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="inv-name" className="sm:col-span-2">
          <Input id="inv-name" name="full_name" autoComplete="off" placeholder="Nombre y apellido" />
        </Field>
        <Field label="Correo" htmlFor="inv-email">
          <Input id="inv-email" name="email" type="email" required autoComplete="off" />
        </Field>
        <Field label="Rol" htmlFor="inv-role" help="Administración: captura y cobranza. Consulta: solo lectura.">
          <select
            id="inv-role"
            name="role"
            defaultValue="operator"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="admin">Administrador</option>
            <option value="operator">Administración</option>
            <option value="viewer">Consulta</option>
          </select>
        </Field>
      </div>
      <div>
        <Button type="submit" disabled={pending}>{pending ? "Enviando…" : "Enviar invitación"}</Button>
      </div>
    </form>
  );
}
