#!/usr/bin/env node
// Sube un archivo al expediente privado (Supabase Storage) y lo registra en
// `documents` + `document_links`. Se corre en la máquina local con la clave de
// servidor de .env.local; nunca desde el navegador.
//
//   node scripts/subir_documento.mjs <archivo> --bucket commercial --kind foto \
//     --sensibilidad public_internal --titulo "Torre Evalor · fachada" \
//     --liga development:<uuid> [--carpeta fotos/TE]
//
// Buckets: legal (solo admin) · fiscal · technical · commercial · imports.
// Sensibilidad: public_internal (todos) · restricted (admin y operación) · sensitive (admin).
import { readFile } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
if (!file) {
  console.error("Falta el archivo.");
  process.exit(1);
}

const env = Object.fromEntries(
  (await readFile(resolve(".env.local"), "utf8"))
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
const orgId = opt("org", orgs?.[0]?.id);
const bucket = opt("bucket", "commercial");
const kind = opt("kind", "otro");
const sensitivity = opt("sensibilidad", "restricted");
const title = opt("titulo", basename(file, extname(file)));
const folder = opt("carpeta", kind === "foto" ? "fotos" : kind);
const link = opt("liga", null); // target_type:uuid
const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".pdf": "application/pdf" };
const ext = extname(file).toLowerCase();
const mime = MIME[ext] ?? "application/octet-stream";
const slug = basename(file, extname(file)).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const path = `${orgId}/${folder}/${slug}${ext}`;

const body = await readFile(file);
const up = await supabase.storage.from(bucket).upload(path, body, { contentType: mime, upsert: true });
if (up.error) {
  console.error("Storage:", up.error.message);
  process.exit(1);
}
const doc = await supabase
  .from("documents")
  .upsert({ org_id: orgId, bucket, path, title, kind, sensitivity, mime_type: mime, size_bytes: body.length }, { onConflict: "bucket,path" })
  .select("id")
  .single();
if (doc.error) {
  console.error("documents:", doc.error.message);
  process.exit(1);
}
if (link) {
  const [target_type, target_id] = link.split(":");
  const l = await supabase.from("document_links").upsert({ org_id: orgId, document_id: doc.data.id, target_type, target_id }, { onConflict: "document_id,target_type,target_id" });
  if (l.error) {
    console.error("document_links:", l.error.message);
    process.exit(1);
  }
}
console.log(`OK ${bucket}/${path} → documento ${doc.data.id}${link ? ` ligado a ${link}` : ""}`);
