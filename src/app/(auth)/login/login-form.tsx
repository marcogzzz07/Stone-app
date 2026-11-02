"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";
import { Notice } from "@/components/forms/notice";
import { sendMagicLink, signInWithPassword, type AuthState } from "./actions";

export function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const [mode, setMode] = useState<"password" | "link">("password");
  const [pwState, pwAction, pwPending] = useActionState<AuthState, FormData>(signInWithPassword, undefined);
  const [lkState, lkAction, lkPending] = useActionState<AuthState, FormData>(sendMagicLink, undefined);

  if (lkState?.sent) {
    return (
      <Notice tone="success" title="Te enviamos un enlace de acceso">
        Revisa tu correo y abre el enlace desde este mismo dispositivo. Caduca en una hora.
      </Notice>
    );
  }

  const isLink = mode === "link";
  const state = isLink ? lkState : pwState;
  const pending = isLink ? lkPending : pwPending;

  return (
    <form action={isLink ? lkAction : pwAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      {initialError === "enlace" && !state?.error && (
        <Notice tone="danger" title="El enlace ya no es válido">
          Puede haber caducado o ya se usó. Pide uno nuevo con tu correo.
        </Notice>
      )}
      {state?.error && <Notice tone="danger" title="No pudimos iniciar sesión">{state.error}</Notice>}

      <Field label="Correo" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
      </Field>

      {!isLink && (
        <Field label="Contraseña" htmlFor="password">
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
      )}

      <Button type="submit" disabled={pending} className="mt-1 w-full">
        {pending ? "Un momento…" : isLink ? "Enviar enlace de acceso" : "Entrar"}
      </Button>

      <button
        type="button"
        onClick={() => setMode(isLink ? "password" : "link")}
        className="text-sm text-brand-cyan-ink hover:underline"
      >
        {isLink ? "Entrar con contraseña" : "Recibir un enlace por correo"}
      </button>
    </form>
  );
}
