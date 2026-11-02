"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";
import { Notice } from "@/components/forms/notice";
import { setPassword, type AuthState } from "@/app/(auth)/login/actions";

export function PasswordForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(setPassword, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && <Notice tone="danger" title="Revisa los datos">{state.error}</Notice>}
      <Field label="Nombre" htmlFor="full_name" help="Como quieres aparecer en la plataforma.">
        <Input id="full_name" name="full_name" defaultValue={defaultName} autoComplete="name" />
      </Field>
      <Field label="Contraseña" htmlFor="password" help="Mínimo 10 caracteres.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} />
      </Field>
      <Field label="Repite la contraseña" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={10} />
      </Field>
      <Button type="submit" disabled={pending} className="mt-1 w-full">
        {pending ? "Guardando…" : "Guardar y entrar"}
      </Button>
    </form>
  );
}
