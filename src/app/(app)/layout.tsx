import { connection } from "next/server";
import { AppShell } from "@/components/shell/app-shell";
import { requireMember, ROLE_LABEL } from "@/lib/auth/session";
import { countOpenDiscrepancies } from "@/lib/data/patrimonio";

export const instant = false;

/** Toda la app exige sesión y membresía activa; el rol llega al shell. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await connection(); // todo lo que cuelga de aquí es por petición (sesión en cookies)
  const user = await requireMember();
  const pending = await countOpenDiscrepancies();
  return (
    <AppShell
      user={{
        name: user.fullName || user.email,
        email: user.email,
        initials: user.initials,
        role: user.membership.role,
        roleLabel: ROLE_LABEL[user.membership.role],
        pending,
      }}
    >
      {children}
    </AppShell>
  );
}
