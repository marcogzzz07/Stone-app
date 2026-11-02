"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireRole, type AppRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type InviteState = { error?: string; ok?: string; warning?: string } | undefined;

const ROLES: AppRole[] = ["admin", "operator", "viewer"];

/**
 * Invita a un usuario: registra la invitación (RLS exige admin) y, si hay
 * clave de servidor, pide a Supabase Auth que envíe el correo. El trigger
 * `handle_new_user` convierte la invitación en membresía al crearse la cuenta.
 */
export async function inviteUser(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const me = await requireRole("admin");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "") as AppRole;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Escribe un correo válido, por ejemplo nombre@empresa.mx." };
  if (!ROLES.includes(role)) return { error: "Elige un rol de la lista." };

  const supabase = await createClient();
  const orgId = me.membership.orgId;

  // Reutiliza la invitación pendiente si existe; si no, crea una nueva.
  const { data: existing } = await supabase
    .from("invitations")
    .select("id")
    .eq("org_id", orgId)
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();

  const expires = new Date(Date.now() + 30 * 86400_000).toISOString();
  const { error: dbError } = existing
    ? await supabase.from("invitations").update({ role, expires_at: expires, invited_by: me.id }).eq("id", existing.id)
    : await supabase.from("invitations").insert({ org_id: orgId, email, role, expires_at: expires, invited_by: me.id });
  if (dbError) return { error: "No se pudo registrar la invitación. Revisa que tengas rol de administrador." };

  const admin = createAdminClient();
  if (!admin) {
    revalidatePath("/configuracion");
    return {
      warning:
        "Invitación registrada, pero el correo no se envió: falta SUPABASE_SERVICE_ROLE_KEY en el servidor. Envíala desde el dashboard de Supabase (Authentication → Users → Invite) con este mismo correo.",
    };
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { error: authError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/callback?flow=invite`,
    data: fullName ? { full_name: fullName } : undefined,
  });
  revalidatePath("/configuracion");
  if (authError) {
    // Caso típico: el usuario ya existe en Auth. La membresía se crea igual
    // porque la invitación está pendiente; le basta con iniciar sesión.
    if (/already/i.test(authError.message)) {
      await supabase.from("invitations").update({ status: "accepted", accepted_at: new Date().toISOString() }).eq("org_id", orgId).eq("email", email).eq("status", "pending");
      return { warning: `${email} ya tenía cuenta. Se registró su acceso; puede entrar con su contraseña o pedir un enlace.` };
    }
    return { error: `La invitación quedó registrada pero el correo no salió: ${authError.message}` };
  }
  return { ok: `Invitación enviada a ${email} como ${role}.` };
}

export async function revokeInvitation(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("invitations").update({ status: "revoked" }).eq("id", id).eq("status", "pending");
  revalidatePath("/configuracion");
}

export async function setMemberRole(formData: FormData) {
  const me = await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "") as AppRole;
  if (!ROLES.includes(role)) return;
  const supabase = await createClient();
  // Un admin no puede quitarse su propio rol: evita quedarse sin administradores.
  const { data: target } = await supabase.from("memberships").select("profile_id").eq("id", id).maybeSingle();
  if (!target || target.profile_id === me.id) return;
  await supabase.from("memberships").update({ role }).eq("id", id);
  revalidatePath("/configuracion");
}
