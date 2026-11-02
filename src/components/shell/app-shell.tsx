import Link from "next/link";
import { SidebarNav } from "./sidebar-nav";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3 px-5 h-16">
          <span className="grid size-8 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-semibold tracking-tight">
            S
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Stone Inmuebles</div>
            <div className="text-[11px] text-sidebar-foreground/60">Atlas patrimonial</div>
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
        <div className="border-b border-warn/40 bg-warn/15 px-6 py-1.5 text-xs text-foreground/80">
          <strong className="font-medium">Datos sintéticos.</strong> Este prototipo usa
          información ficticia etiquetada <code className="font-mono">[DEMO]</code>; no
          representa activos, personas ni cifras de Stone.
        </div>
        <main className="flex-1 px-6 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
