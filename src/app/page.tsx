import { redirect } from "next/navigation";

// La raíz solo redirige al dashboard; sin prerender para evitar el aviso de `instant`.
export const instant = false;

export default function Home() {
  redirect("/dashboard");
}
