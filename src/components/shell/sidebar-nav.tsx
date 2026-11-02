"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  FileText,
  FolderLock,
  LayoutDashboard,
  Map,
  Receipt,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mapa", label: "Mapa patrimonial", icon: Map },
  { href: "/propiedades", label: "Propiedades", icon: Building2 },
  { href: "/rentas", label: "Rentas y cobranza", icon: Receipt },
  { href: "/contratos", label: "Contratos", icon: FileText },
  { href: "/documentos", label: "Documentos", icon: FolderLock },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/configuracion", label: "Configuración", icon: Settings },
] as const;

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5 px-3 py-2">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href ||
          pathname.startsWith(href + "/") ||
          (href === "/propiedades" && pathname.startsWith("/unidades"));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className={cn("size-4", active && "text-sidebar-primary")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
