import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  initials: string;
  /** null = autenticado pero sin membresía activa en ninguna organización */
  membership: { orgId: string; orgName: string; orgSlug: string; role: AppRole } | null;
}

const ROLE_RANK: Record<AppRole, number> = { viewer: 0, operator: 1, admin: 2 };

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrador",
  operator: "Administración",
  viewer: "Consulta",
};

function initialsOf(name: string, email: string) {
  const src = name.trim() || email.split("@")[0];
  const parts = src.split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

/** Usuario de la petición con perfil y membresía (RLS). Memoizado por render. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const sub = claims?.claims.sub;
  if (!sub) return null;

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("email, full_name").eq("id", sub).maybeSingle(),
    supabase
      .from("memberships")
      .select("org_id, role, status, organizations(name, slug)")
      .eq("profile_id", sub)
      .eq("status", "active")
      .limit(1)
      .maybeSingle(),
  ]);

  const email = profile?.email ?? (claims?.claims.email as string | undefined) ?? "";
  const fullName = profile?.full_name ?? "";
  return {
    id: sub,
    email,
    fullName,
    initials: initialsOf(fullName, email),
    membership: membership
      ? {
          orgId: membership.org_id,
          role: membership.role,
          orgName: membership.organizations?.name ?? "",
          orgSlug: membership.organizations?.slug ?? "",
        }
      : null,
  };
});

/** Exige sesión y membresía activa; redirige si falta alguna. */
export async function requireMember() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.membership) redirect("/sin-acceso");
  return user as SessionUser & { membership: NonNullable<SessionUser["membership"]> };
}

/** Exige un rol mínimo (viewer < operator < admin). */
export async function requireRole(min: AppRole) {
  const user = await requireMember();
  if (ROLE_RANK[user.membership.role] < ROLE_RANK[min]) redirect("/dashboard?denegado=1");
  return user;
}

export function hasRole(role: AppRole, min: AppRole) {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}
