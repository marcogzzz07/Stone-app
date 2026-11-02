"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; sent?: boolean } | undefined;

function safeNext(v: FormDataEntryValue | null) {
  return typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard";
}

export async function signInWithPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Escribe tu correo y tu contraseña." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Correo o contraseña incorrectos. Si aún no tienes contraseña, pide un enlace de acceso." };
  }
  redirect(safeNext(formData.get("next")));
}

export async function sendMagicLink(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Escribe tu correo para enviarte el enlace." };

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Solo usuarios ya invitados: no crea cuentas nuevas.
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext(formData.get("next")))}`,
    },
  });
  if (error) {
    return { error: "No pudimos enviar el enlace. Verifica que el correo sea el de tu invitación." };
  }
  return { sent: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function setPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (password.length < 10) return { error: "La contraseña necesita al menos 10 caracteres." };
  if (password !== confirm) return { error: "Las dos contraseñas no coinciden. Escríbelas de nuevo." };

  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) redirect("/login");

  const { error } = await supabase.auth.updateUser({
    password,
    data: fullName ? { full_name: fullName } : undefined,
  });
  if (error) return { error: "No se pudo guardar la contraseña. Intenta de nuevo o pide otro enlace." };
  if (fullName) {
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", userRes.user.id);
  }
  redirect("/dashboard");
}
