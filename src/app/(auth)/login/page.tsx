import { LoginForm } from "./login-form";

export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next && sp.next.startsWith("/") ? sp.next : "/dashboard";
  return (
    <>
      <h1 className="text-[22px] leading-7">Iniciar sesión</h1>
      <p className="mb-5 mt-1 text-sm text-ink-2">Usa el correo con el que te invitaron.</p>
      <LoginForm next={next} initialError={sp.error} />
    </>
  );
}
