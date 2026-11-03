// Envía la invitación de Supabase Auth (correo) apuntando al sitio publicado.
// Uso: node scripts/invitar_usuario.mjs correo "Nombre" [url-del-sitio]
// La fila de `invitations` (org, correo, rol) debe existir antes; el trigger handle_new_user la convierte en membresía.
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const [email, fullName] = process.argv.slice(2);
const env = Object.fromEntries(
  (await readFile(".env.local", "utf8"))
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
  redirectTo: `${process.argv[4] ?? "https://stone-inmuebles.vercel.app"}/auth/callback?flow=invite`,
  data: fullName ? { full_name: fullName } : undefined,
});
if (error) {
  console.error("ERROR:", error.message);
  process.exit(1);
}
console.log("Invitación enviada a", data.user?.email, "· id", data.user?.id);
