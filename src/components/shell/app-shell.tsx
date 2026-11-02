import Link from "next/link";
import Image from "next/image";
import { SidebarNav } from "./sidebar-nav";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3 px-5 h-16">
          <Image src="/brand/stone-mark.svg" alt="" width={30} height={30} priority />
          <div className="leading-none">
            <div className="font-condensed text-[17px] font-bold uppercase tracking-[0.28em] text-white">
              Stone
            </div>
            <div className="mt-1 text-[11px] lowercase tracking-[0.22em] text-sidebar-foreground/70">
              inmuebles
            </div>
          </div>
        </Link>
        <SidebarNav />
        <div className="mt-auto px-5 py-4 text-[11px] text-sidebar-foreground/60 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <span>Rol actual</span>
            <span className="rounded bg-sidebar-accent px-1.5 py-0.5 text-sidebar-accent-foreground">
              admin · demo
            </span>
          </div>
          <div className="mt-1">Organización: Stone (demo)</div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <div className="border-b border-border bg-muted px-6 py-1.5 text-xs text-muted-foreground">
          <strong className="font-semibold">Datos sintéticos.</strong> Este prototipo usa
          información ficticia etiquetada <code className="font-mono">[DEMO]</code>; no
          representa activos, personas ni cifras de Stone.
        </div>
        <main className="flex-1 px-6 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
