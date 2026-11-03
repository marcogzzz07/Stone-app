"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type DiscrepancyState = { error?: string } | undefined;

const STATUSES = ["open", "acknowledged", "resolved"] as const;

export async function setDiscrepancyStatus(_prev: DiscrepancyState, fd: FormData): Promise<DiscrepancyState> {
  const me = await requireRole("operator");
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "") as (typeof STATUSES)[number];
  const resolution = String(fd.get("resolution") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Discrepancia no válida." };
  if (!STATUSES.includes(status)) return { error: "Estado no válido." };
  if (status === "resolved" && !resolution) return { error: "Escribe qué se decidió." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("import_discrepancies")
    .update(
      status === "resolved"
        ? { status, resolution, resolved_by: me.id, resolved_at: new Date().toISOString() }
        : { status, resolution: null, resolved_by: null, resolved_at: null },
    )
    .eq("id", id);
  if (error) return { error: "No se pudo actualizar. Revisa tu rol." };
  revalidatePath("/configuracion/importaciones");
  revalidatePath("/dashboard");
  return undefined;
}
