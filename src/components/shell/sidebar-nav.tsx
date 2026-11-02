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
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Patrimonio",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/mapa", label: "Mapa patrimonial", icon: Map },
      { href: "/propiedades", label: "Propiedades", icon: Building2 },
    ],
  },
  {
    title: "Operación",
    items: [
      { href: "/rentas", label: "Rentas y cobranza", icon: Receipt },
      { href: "/contratos", label: "Contratos", icon: FileText },
      { href: "/documentos", label: "Documentos", icon: FolderLock },
      { href: "/calendario", label: "Calendario", icon: CalendarDays },
    ],
  },
  {
    title: "Administración",
    items: [{ href: "/configuracion", label: "Configuración", icon: Settings }],
  },
];

export const NAV = NAV_GROUPS.flatMap((g) => g.items);

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-4 px-3 py-2">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <div
            className={cn(
              "mb-1 px-3 text-[11px] font-medium text-sidebar-foreground/50 transition-opacity",
              collapsed && "h-0 overflow-hidden opacity-0",
            )}
          >
            {group.title}
          </div>
          <ul className="flex flex-col gap-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href ||
                pathname.startsWith(href + "/") ||
                (href === "/propiedades" && pathname.startsWith("/unidades"));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    title={collapsed ? label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                      collapsed && "justify-center px-0",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", active && "text-sidebar-primary")} />
                    <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
