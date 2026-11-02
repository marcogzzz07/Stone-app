"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV, SidebarNav } from "./sidebar-nav";
import { useState } from "react";

export function Topbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const current =
    NAV.find((n) => pathname === n.href || pathname.startsWith(n.href + "/")) ??
    (pathname.startsWith("/unidades") ? NAV.find((n) => n.href === "/propiedades") : undefined);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur lg:px-8">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir navegación">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="px-5 pt-5">
            <Image src="/brand/stone-logo-dark.png" alt="Stone Inmuebles" width={150} height={67} priority />
          </SheetTitle>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <Image src="/brand/stone-mark.png" alt="Stone Inmuebles" width={22} height={25} className="lg:hidden" />

      <nav aria-label="Ruta" className="hidden items-center gap-1.5 text-sm md:flex">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Stone</Link>
        <ChevronRight className="size-3.5 text-muted-foreground/60" />
        <span className="font-medium">{current?.label ?? "Ficha"}</span>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <label className="relative hidden sm:block">
          <span className="sr-only">Buscar</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar unidad, arrendatario, contrato…"
            className="h-9 w-64 rounded-md border bg-card pl-9 pr-12 text-sm caret-brand-cyan-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40 lg:w-80"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">⌘K</kbd>
        </label>
        <Button variant="outline" size="icon" aria-label="Notificaciones" className="relative">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-warn" />
        </Button>
        <div className="grid size-9 place-items-center rounded-full bg-primary text-xs font-semibold text-on-primary">MA</div>
      </div>
    </header>
  );
}
