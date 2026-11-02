import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PasswordForm } from "./password-form";

export const instant = false;

/** Tras aceptar la invitación (o recuperar acceso): nombre y contraseña. */
export default async function PasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", data.user.id).maybeSingle();

  return (
    <>
      <h1 className="text-[22px] leading-7">Bienvenido a Stone</h1>
      <p className="mb-5 mt-1 text-sm text-ink-2">
        Entraste como <span className="font-semibold text-ink">{data.user.email}</span>. Define tu contraseña para las próximas veces.
      </p>
      <PasswordForm defaultName={profile?.full_name ?? ""} />
    </>
  );
}
