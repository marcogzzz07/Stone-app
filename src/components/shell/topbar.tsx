"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV, SidebarFooter, SidebarHeader, SidebarNav, SidebarSearch } from "./sidebar-nav";
import { useState } from "react";

// Barra superior: menú móvil, ruta y (en móvil) el isotipo. Búsqueda,
// notificaciones y cuenta viven en el menú lateral.
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
        <SheetContent side="left" className="flex w-[232px] flex-col bg-sidebar p-0 text-sidebar-foreground [&>button]:text-sidebar-foreground">
          <SheetTitle className="sr-only">Navegación</SheetTitle>
          <SidebarHeader />
          <SidebarSearch />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
          <SidebarFooter onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <Image src="/brand/stone-mark.png" alt="Stone Inmuebles" width={22} height={25} className="lg:hidden" />

      <nav aria-label="Ruta" className="hidden items-center gap-1.5 text-sm md:flex">
        <Link href="/dashboard" className="text-ink-3 hover:text-ink">Stone</Link>
        <ChevronRight className="size-3.5 text-ink-3/60" />
        <span className="font-medium">{current?.label ?? "Ficha"}</span>
      </nav>
    </header>
  );
}
