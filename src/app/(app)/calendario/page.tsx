import { Card } from "@/components/ui/card";
import { PageHeader, SectionTitle } from "@/components/patrimonio/kpi-card";
import { Notice } from "@/components/forms/notice";
import { requireMember } from "@/lib/auth/session";
import { listCriticalDates } from "@/lib/data/patrimonio";
import { DATE_KIND } from "@/lib/patrimonio/labels";
import { daysUntil, fmtDate } from "@/lib/format";
import { todayIso } from "@/lib/rentas/labels";

export const instant = false;

export default async function CalendarioPage() {
  await requireMember();
  const today = todayIso();
  const dates = (await listCriticalDates()).filter((d) => !d.done);
  const byMonth = new Map<string, typeof dates>();
  for (const d of dates) {
    const k = d.dueOn.slice(0, 7);
    byMonth.set(k, [...(byMonth.get(k) ?? []), d]);
  }
  const soon = dates.filter((d) => {
    const n = daysUntil(d.dueOn, today);
    return n >= 0 && n <= 60;
  });

  return (
    <>
      <PageHeader title="Calendario" description="Vencimientos de contratos, predial, seguros e incrementos." />
      {soon.length > 0 && (
        <Notice tone="warning" title={`${soon.length} vencimiento(s) en los próximos 60 días`} className="mb-4">
          {soon.map((d) => `${d.title} (${fmtDate(d.dueOn)})`).join(" · ")}
        </Notice>
      )}
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        {Object.values(DATE_KIND).map((k) => (
          <span key={k.label} className="flex items-center gap-1.5"><span className={`size-2.5 rounded-full ${k.cls}`} />{k.label}</span>
        ))}
      </div>
      {dates.length === 0 && <Notice tone="info" title="Sin fechas registradas">Los vencimientos de contrato se crean al registrar la fecha de fin; predial y seguros se capturan a mano.</Notice>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[...byMonth.entries()].map(([ym, items]) => (
          <Card key={ym} className="gap-2 p-4">
            <SectionTitle>{new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(new Date(ym + "-15T12:00:00"))}</SectionTitle>
            <ul className="divide-y">
              {items.map((d) => {
                const days = daysUntil(d.dueOn, today);
                const k = DATE_KIND[d.kind] ?? DATE_KIND.other;
                return (
                  <li key={d.id} className="flex items-start gap-3 py-2 text-sm">
                    <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${k.cls}`} />
                    <div className="min-w-0 flex-1">
                      <div>{d.title}</div>
                      <div className="text-xs text-ink-3">{fmtDate(d.dueOn)}</div>
                    </div>
                    <span className={`tnum shrink-0 text-xs ${days < 0 ? "font-medium text-danger" : days <= 30 ? "font-medium text-warning" : "text-ink-3"}`}>
                      {days < 0 ? "vencido" : `${days} d`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
