"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Notice } from "@/components/forms/notice";

/**
 * Enlaces de invitación o acceso enviados con la plantilla por defecto de
 * Supabase llegan con la sesión en el fragmento de la URL
 * (`#access_token=…&refresh_token=…&type=invite`). El servidor no ve el
 * fragmento, así que este componente lo lee en el navegador, guarda la sesión
 * en cookies y lleva al usuario a definir su contraseña o al dashboard.
 */
export function HashSession({ next }: { next: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "working" | "error">("idle");

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("access_token=")) return;
    const params = new URLSearchParams(hash.slice(1));
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");
    const type = params.get("type");
    if (!access || !refresh) return;
    const supabase = createClient();
    Promise.resolve()
      .then(() => setState("working"))
      .then(() => supabase.auth.setSession({ access_token: access, refresh_token: refresh }))
      .then(({ error }) => {
        if (error) {
          setState("error");
          return;
        }
        window.history.replaceState(null, "", window.location.pathname);
        router.replace(type === "invite" || type === "recovery" ? "/cuenta/contrasena" : next);
        router.refresh();
      });
  }, [next, router]);

  if (state === "working") {
    return <Notice tone="info" title="Abriendo tu sesión" className="mb-4">Un momento…</Notice>;
  }
  if (state === "error") {
    return (
      <Notice tone="danger" title="El enlace ya no es válido" className="mb-4">
        Los enlaces de invitación caducan y se usan una sola vez. Pide que te reenvíen la invitación o solicita un enlace de acceso abajo.
      </Notice>
    );
  }
  return null;
}
