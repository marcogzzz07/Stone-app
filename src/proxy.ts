import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Todo menos estáticos, imágenes y la marca.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|maplibre-gl-csp-worker.js|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map)$).*)"],
};
