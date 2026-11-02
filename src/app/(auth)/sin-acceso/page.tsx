import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { signOut } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/forms/notice";

export const instant = false;

/** Autenticado pero sin membresía: la invitación no existe, caducó o se revocó. */
export default async function SinAccesoPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.membership) redirect("/dashboard");

  return (
    <>
      <h1 className="text-[22px] leading-7">Tu cuenta no tiene acceso todavía</h1>
      <p className="mb-5 mt-1 text-sm text-ink-2">
        Entraste como <span className="font-semibold text-ink">{user.email}</span>, pero no hay una invitación
        activa para ese correo.
      </p>
      <Notice tone="warning" title="Pide al administrador que te invite">
        Debe hacerlo desde Configuración con este mismo correo. En cuanto lo haga, vuelve a entrar.
      </Notice>
      <form action={signOut} className="mt-5">
        <Button type="submit" variant="outline" className="w-full">Cerrar sesión</Button>
      </form>
    </>
  );
}
