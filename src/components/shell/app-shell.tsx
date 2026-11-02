"use client";

import { useSyncExternalStore } from "react";
import { SidebarFooter, SidebarHeader, SidebarNav, type ShellUser } from "./sidebar-nav";
import { Topbar } from "./topbar";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "stone.sidebar.collapsed";
const EVENT = "stone:sidebar";

// Preferencia por navegador (conveniencia, no estado de negocio). SSR-safe.
function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
function writeCollapsed(v: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);
  const toggle = () => writeCollapsed(!collapsed);

  return (
    <div className="flex min-h-screen w-full">
      <aside
        className={cn(
          "hidden lg:flex sticky top-0 h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
          collapsed ? "w-16" : "w-[248px]",
        )}
      >
        <SidebarHeader collapsed={collapsed} onToggle={toggle} />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarNav collapsed={collapsed} />
        </div>
        <SidebarFooter collapsed={collapsed} user={user} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 px-6 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
