import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Sirve un archivo del expediente privado. La fila de `documents` pasa por RLS
 * (sensibilidad × rol); si el usuario puede verla, el servidor la baja del
 * bucket privado y la entrega. `?descargar=1` fuerza descarga.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user?.membership) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: doc } = await supabase.from("documents").select("bucket, path, title, mime_type").eq("id", id).maybeSingle();
  if (!doc) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  // Con clave de servidor cualquier miembro autorizado por RLS recibe el archivo
  // (incluido viewer); sin ella, Storage aplica su propia política (admin/operación).
  const storage = createAdminClient() ?? supabase;
  const { data: file, error } = await storage.storage.from(doc.bucket).download(doc.path);
  if (error || !file) return NextResponse.json({ error: "Archivo no disponible" }, { status: 404 });
  const url = new URL(request.url);
  const descargar = url.searchParams.get("descargar") === "1";
  const ext = doc.path.slice(doc.path.lastIndexOf("."));
  const name = `${doc.title}${ext}`;
  const ascii = name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\x20-\x7e]/g, "_");
  return new NextResponse(file.stream(), {
    headers: {
      "Content-Type": doc.mime_type ?? file.type ?? "application/octet-stream",
      "Content-Disposition": `${descargar ? "attachment" : "inline"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
