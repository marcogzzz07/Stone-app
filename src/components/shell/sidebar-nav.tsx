"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  LogOut,
  Building2,
  CalendarDays,
  CircleHelp,
  FileText,
  FolderLock,
  LayoutDashboard,
  Map,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/(auth)/login/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Usuario autenticado tal como lo muestra el shell. */
export interface ShellUser {
  name: string;
  email: string;
  initials: string;
  role: "admin" | "operator" | "viewer";
  roleLabel: string;
  /** Discrepancias de importación abiertas (badge de Notificaciones). */
  pending?: number;
}

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
];

// Bloque inferior del menú: utilidades y cuenta, separadas de la navegación.
const BOTTOM: NavItem[] = [
  { href: "/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/soporte", label: "Soporte", icon: CircleHelp },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export const NAV = [...NAV_GROUPS.flatMap((g) => g.items), ...BOTTOM];

const itemClass = (active: boolean, collapsed: boolean) =>
  cn(
    "relative flex h-9 items-center gap-3 rounded-md px-3 text-[15px] transition-colors",
    collapsed && "justify-center px-0",
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-brand-cyan"
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  );

function useActive() {
  const pathname = usePathname();
  return (href: string) =>
    pathname === href ||
    pathname.startsWith(href + "/") ||
    (href === "/propiedades" && pathname.startsWith("/unidades"));
}

/** Cabecera: isotipo en tile pequeño, nombre y botón de colapsar arriba. */
export function SidebarHeader({
  collapsed = false,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className={cn("flex flex-col gap-2 px-3 pb-3 pt-4", collapsed && "items-center")}>
      <div className={cn("flex h-10 items-center gap-2.5", collapsed && "justify-center")}>
        <Link
          href="/dashboard"
          aria-label="Stone Inmuebles · Dashboard"
          className="grid size-10 shrink-0 place-items-center rounded-lg border border-sidebar-border bg-sidebar-accent"
        >
          <Image src="/brand/stone-mark.png" alt="" width={20} height={23} priority />
        </Link>
        {!collapsed && (
          <>
            <span className="font-display flex-1 whitespace-nowrap text-sm font-semibold text-sidebar-ink-active">
              Stone Inmuebles
            </span>
            {onToggle && <ToggleButton collapsed={collapsed} onToggle={onToggle} />}
          </>
        )}
      </div>
      {collapsed && onToggle && <ToggleButton collapsed={collapsed} onToggle={onToggle} />}
    </div>
  );
}

function ToggleButton({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
      className="grid size-8 shrink-0 place-items-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      {collapsed ? <PanelLeftOpen className="size-4" strokeWidth={1.5} /> : <PanelLeftClose className="size-4" strokeWidth={1.5} />}
    </button>
  );
}

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const isActive = useActive();
  return (
    <nav className="flex flex-col gap-4 px-3 py-2">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <div
            className={cn(
              "mb-1.5 px-3 text-xs font-semibold tracking-[0.06em] uppercase text-sidebar-foreground/60 transition-opacity",
              collapsed && "h-0 overflow-hidden opacity-0",
            )}
          >
            {group.title}
          </div>
          <ul className="flex flex-col gap-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    title={collapsed ? label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={itemClass(active, collapsed)}
                  >
                    <Icon className="size-4 shrink-0" strokeWidth={1.5} />
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

/** Pie: notificaciones con conteo, soporte, configuración y tarjeta de usuario. */
export function SidebarFooter({
  collapsed = false,
  onNavigate,
  user,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
  user: ShellUser;
}) {
  const isActive = useActive();
  return (
    <div className="mt-auto border-t border-sidebar-border px-3 pb-3 pt-2">
      <ul className="flex flex-col gap-0.5">
        {BOTTOM.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          const count = href === "/notificaciones" ? (user.pending ?? 0) : 0;
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                title={collapsed ? label : undefined}
                aria-current={active ? "page" : undefined}
                className={itemClass(active, collapsed)}
              >
                <span className="relative shrink-0">
                  <Icon className="size-4" strokeWidth={1.5} />
                  {collapsed && count > 0 && (
                    <span className="absolute -right-1 -top-1 size-2 rounded-full bg-brand-cyan" aria-hidden />
                  )}
                </span>
                <span className={cn("flex-1 truncate", collapsed && "sr-only")}>{label}</span>
                {!collapsed && count > 0 && (
                  <span className="num rounded-full bg-sidebar-accent px-2 py-0.5 text-xs text-sidebar-ink-active">
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <div
        className={cn(
          "mt-3 flex items-center gap-3 rounded-lg border border-sidebar-border p-3",
          collapsed && "justify-center border-0 p-0",
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-cyan text-xs font-semibold text-brand-navy">
          {user.initials}
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-semibold text-sidebar-ink-active">{user.name}</span>
            <span className="block truncate text-xs text-sidebar-foreground">{user.roleLabel}</span>
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Opciones de cuenta"
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "hidden",
              )}
            >
              <MoreVertical className="size-4" strokeWidth={1.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <span className="block truncate text-sm font-semibold">{user.name}</span>
              <span className="block truncate text-xs text-ink-3">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/configuracion" onClick={onNavigate}>
                <Settings className="size-4" strokeWidth={1.5} /> Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void signOut()}>
              <LogOut className="size-4" strokeWidth={1.5} /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
