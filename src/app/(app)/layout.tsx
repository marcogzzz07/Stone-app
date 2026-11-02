import { AppShell } from "@/components/shell/app-shell";
import { requireMember, ROLE_LABEL } from "@/lib/auth/session";

export const instant = false;

/** Toda la app exige sesión y membresía activa; el rol llega al shell. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireMember();
  return (
    <AppShell
      user={{
        name: user.fullName || user.email,
        email: user.email,
        initials: user.initials,
        role: user.membership.role,
        roleLabel: ROLE_LABEL[user.membership.role],
      }}
    >
      {children}
    </AppShell>
  );
}
