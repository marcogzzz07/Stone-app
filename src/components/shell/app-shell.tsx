"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronsUpDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);
  const toggle = () => writeCollapsed(!collapsed);

  return (
    <div className="flex min-h-screen w-full">
      <aside
        className={cn(
          "hidden lg:flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <OrgSwitcher collapsed={collapsed} />
        <SidebarNav collapsed={collapsed} />
        <div className="mt-auto border-t border-sidebar-border p-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            className={cn(
              "flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            <span className={cn(collapsed && "sr-only")}>Colapsar</span>
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-6 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function OrgSwitcher({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="p-3">
      <Link
        href="/dashboard"
        className={cn(
          "flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-2 transition-colors hover:bg-sidebar-accent",
          collapsed && "justify-center p-1.5",
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white">
          <Image src="/brand/stone-mark.png" alt="Stone Inmuebles" width={24} height={27} priority />
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-[11px] text-sidebar-foreground/60">Organización</span>
              <span className="font-condensed block truncate text-[13px] font-semibold uppercase tracking-[0.12em] text-white">
                Stone Inmuebles
              </span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-sidebar-foreground/50" />
          </>
        )}
      </Link>
    </div>
  );
}
