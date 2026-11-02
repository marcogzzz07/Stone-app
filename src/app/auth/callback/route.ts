import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino de los enlaces de correo de Supabase (invitación, enlace mágico,
 * recuperación). Acepta el flujo PKCE (`code`) y el de token (`token_hash`+`type`).
 * Tras una invitación o recuperación manda a definir contraseña.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/dashboard";

  const supabase = await createClient();
  let error: string | null = null;

  if (code) {
    const res = await supabase.auth.exchangeCodeForSession(code);
    error = res.error?.message ?? null;
  } else if (tokenHash && type) {
    const res = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    error = res.error?.message ?? null;
  } else {
    error = "El enlace no trae credenciales.";
  }

  if (error) {
    const url = new URL("/login", origin);
    url.searchParams.set("error", "enlace");
    return NextResponse.redirect(url);
  }

  const needsPassword = type === "invite" || type === "recovery" || searchParams.get("flow") === "invite";
  return NextResponse.redirect(new URL(needsPassword ? "/cuenta/contrasena" : next, origin));
}
