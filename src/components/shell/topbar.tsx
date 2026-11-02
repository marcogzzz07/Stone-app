"use client";

import Image from "next/image";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { useState } from "react";

// Períodos demo; en Iteración 1 se derivan de los cargos existentes.
const PERIODS = ["Octubre 2026", "Septiembre 2026", "Agosto 2026"];

export function Topbar() {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState(PERIODS[0]);
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur lg:px-8">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir navegación">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="flex items-center gap-3 px-5 pt-5">
            <Image src="/brand/stone-mark.svg" alt="" width={26} height={26} />
            <span className="leading-none">
              <span className="font-condensed block text-[15px] font-bold uppercase tracking-[0.28em] text-white">Stone</span>
              <span className="mt-1 block text-[10px] lowercase tracking-[0.22em] text-sidebar-foreground/70">inmuebles</span>
            </span>
          </SheetTitle>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <Image src="/brand/stone-mark.svg" alt="Stone Inmuebles" width={24} height={24} className="lg:hidden" />
      <label className="relative flex-1 max-w-xl">
        <span className="sr-only">Buscar</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar inmueble, unidad, arrendatario, contrato…"
          className="h-9 w-full rounded-md border bg-card pl-9 pr-3 text-sm caret-stone-accent outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
        />
      </label>
      <div className="ml-auto flex items-center gap-3">
        <label className="hidden md:flex flex-col items-end leading-tight">
          <span className="text-xs text-muted-foreground">Período</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="cursor-pointer appearance-none bg-transparent pr-4 text-right text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-sm [background:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22><path d=%22M1 1l4 4 4-4%22 fill=%22none%22 stroke=%22%234a5266%22 stroke-width=%221.5%22/></svg>')_right_center_no-repeat]"
          >
            {PERIODS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <div className="grid size-8 place-items-center rounded-full bg-navy text-xs font-semibold text-white">
          MA
        </div>
      </div>
    </header>
  );
}
