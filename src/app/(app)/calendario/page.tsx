import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionTitle } from "@/components/patrimonio/kpi-card";
import { Notice } from "@/components/forms/notice";
import { requireMember } from "@/lib/auth/session";
import { listCriticalDates, type CriticalDateRow } from "@/lib/data/patrimonio";
import { today as todayFn } from "@/lib/data/now";
import { DATE_KIND } from "@/lib/patrimonio/labels";
import { daysUntil, fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const instant = false;

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function monthLabel(ym: string) {
  const s = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(new Date(ym + "-15T12:00:00"));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Celdas del mes: empieza en lunes, rellena con días del mes anterior/siguiente. */
function monthCells(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const lead = (first.getDay() + 6) % 7;
  const start = new Date(y, m - 1, 1 - lead);
  const cells: { iso: string; day: number; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    cells.push({ iso, day: d.getDate(), inMonth: d.getMonth() === m - 1 });
  }
  // Quita la última semana si cae entera fuera del mes.
  return cells.slice(35).every((c) => !c.inMonth) ? cells.slice(0, 35) : cells;
}

export default async function CalendarioPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const [, sp, today] = await Promise.all([requireMember(), searchParams, todayFn()]);
  const ym = /^\d{4}-\d{2}$/.test(sp.mes ?? "") ? sp.mes! : today.slice(0, 7);
  const dates = (await listCriticalDates()).filter((d) => !d.done);
  const byDay = new Map<string, CriticalDateRow[]>();
  for (const d of dates) byDay.set(d.dueOn, [...(byDay.get(d.dueOn) ?? []), d]);
  const cells = monthCells(ym);
  const inMonth = dates.filter((d) => d.dueOn.startsWith(ym));
  const upcoming = dates.filter((d) => d.dueOn >= today).slice(0, 8);
  const soon = upcoming.filter((d) => daysUntil(d.dueOn, today) <= 60);

  return (
    <>
      <PageHeader
        title="Calendario"
        description="Vencimientos de contratos, predial, seguros e incrementos."
        actions={
          <>
            <Button asChild variant="outline" size="icon-sm" aria-label="Mes anterior">
              <Link href={`/calendario?mes=${shiftMonth(ym, -1)}`}><ChevronLeft /></Link>
            </Button>
            <span className="min-w-40 text-center text-sm font-semibold text-ink">{monthLabel(ym)}</span>
            <Button asChild variant="outline" size="icon-sm" aria-label="Mes siguiente">
              <Link href={`/calendario?mes=${shiftMonth(ym, 1)}`}><ChevronRight /></Link>
            </Button>
            {ym !== today.slice(0, 7) && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/calendario">Hoy</Link>
              </Button>
            )}
          </>
        }
      />

      {soon.length > 0 && (
        <Notice tone="warning" title={`${soon.length} vencimiento(s) en los próximos 60 días`} className="mb-4">
          {soon.map((d) => `${d.title} (${fmtDate(d.dueOn)})`).join(" · ")}
        </Notice>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-7 border-b bg-surface-2 text-[12px] font-semibold uppercase tracking-wide text-ink-3">
            {WEEKDAYS.map((w) => (
              <div key={w} className="px-2 py-2 text-center">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((c, i) => {
              const items = byDay.get(c.iso) ?? [];
              const isToday = c.iso === today;
              return (
                <div
                  key={c.iso}
                  className={cn(
                    "min-h-24 border-b border-r p-1.5 text-sm",
                    i % 7 === 6 && "border-r-0",
                    i >= cells.length - 7 && "border-b-0",
                    !c.inMonth && "bg-surface-2/40 text-ink-3",
                  )}
                >
                  <div className={cn("mb-1 flex size-6 items-center justify-center rounded-full text-xs", isToday ? "bg-primary font-semibold text-primary-foreground" : "text-ink-2")}>
                    {c.day}
                  </div>
                  <ul className="space-y-1">
                    {items.slice(0, 3).map((d) => {
                      const k = DATE_KIND[d.kind] ?? DATE_KIND.other;
                      const past = d.dueOn < today;
                      return (
                        <li key={d.id} title={d.title}>
                          <Link
                            href={d.targetType === "lease" && d.targetId ? `/contratos/${d.targetId}/condiciones` : "#"}
                            className={cn("flex items-center gap-1.5 truncate rounded px-1.5 py-0.5 text-[12px] leading-4 hover:bg-info-soft", past ? "bg-danger-soft text-danger" : "bg-surface-2 text-ink")}
                          >
                            <span className={cn("size-1.5 shrink-0 rounded-full", k.cls)} />
                            <span className="truncate">{d.title.replace(/^Vence contrato /, "")}</span>
                          </Link>
                        </li>
                      );
                    })}
                    {items.length > 3 && <li className="px-1.5 text-[11px] text-ink-3">+{items.length - 3} más</li>}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 border-t px-3 py-2 text-xs text-ink-2">
            {Object.values(DATE_KIND).map((k) => (
              <span key={k.label} className="flex items-center gap-1.5"><span className={`size-2.5 rounded-full ${k.cls}`} />{k.label}</span>
            ))}
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-danger-soft ring-1 ring-danger/40" />Vencido</span>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="gap-2 p-4">
            <SectionTitle hint={`${inMonth.length}`}>Este mes</SectionTitle>
            <ul className="divide-y">
              {inMonth.map((d) => (
                <DateItem key={d.id} d={d} today={today} />
              ))}
              {inMonth.length === 0 && <li className="py-2 text-sm text-ink-3">Sin vencimientos en {monthLabel(ym).toLowerCase()}.</li>}
            </ul>
          </Card>
          <Card className="gap-2 p-4">
            <SectionTitle>Próximos</SectionTitle>
            <ul className="divide-y">
              {upcoming.map((d) => (
                <DateItem key={d.id} d={d} today={today} />
              ))}
              {upcoming.length === 0 && <li className="py-2 text-sm text-ink-3">Nada próximo registrado.</li>}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}

function DateItem({ d, today }: { d: CriticalDateRow; today: string }) {
  const days = daysUntil(d.dueOn, today);
  const k = DATE_KIND[d.kind] ?? DATE_KIND.other;
  return (
    <li className="flex items-start gap-3 py-2 text-sm">
      <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${k.cls}`} />
      <div className="min-w-0 flex-1">
        <div className="truncate">{d.title}</div>
        <div className="text-xs text-ink-3">{fmtDate(d.dueOn)}</div>
      </div>
      <span className={cn("tnum shrink-0 text-xs", days < 0 ? "font-medium text-danger" : days <= 30 ? "font-medium text-warning" : "text-ink-3")}>
        {days < 0 ? "vencido" : days === 0 ? "hoy" : `${days} d`}
      </span>
    </li>
  );
}
