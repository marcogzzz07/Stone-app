import { Card } from "@/components/ui/card";
import { PageHeader, SectionTitle } from "@/components/patrimonio/kpi-card";
import { TODAY, criticalDates } from "@/lib/mock/data";
import { daysUntil, fmtDate } from "@/lib/format";

const KIND: Record<string, string> = {
  contrato: "bg-stone-accent",
  predial: "bg-chart-2",
  seguro: "bg-reference",
  incremento: "bg-chart-3",
  otro: "bg-muted-foreground",
};

export default function CalendarioPage() {
  const sorted = [...criticalDates].sort((a, b) => (a.date < b.date ? -1 : 1));
  const byMonth = new Map<string, typeof sorted>();
  for (const d of sorted) {
    const k = d.date.slice(0, 7);
    byMonth.set(k, [...(byMonth.get(k) ?? []), d]);
  }
  return (
    <>
      <PageHeader
        title="Calendario"
        description="Contratos, predial, seguros e incrementos próximos."
      />
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        {Object.entries(KIND).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1.5 capitalize"><span className={`size-2.5 rounded-full ${c}`} />{k}</span>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[...byMonth.entries()].map(([ym, items]) => (
          <Card key={ym} className="gap-2 p-4">
            <SectionTitle>{new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(new Date(ym + "-15T12:00:00"))}</SectionTitle>
            <ul className="divide-y">
              {items.map((d) => {
                const days = daysUntil(d.date, TODAY);
                return (
                  <li key={d.id} className="flex items-start gap-3 py-2 text-sm">
                    <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${KIND[d.kind]}`} />
                    <div className="min-w-0 flex-1">
                      <div>{d.title}</div>
                      <div className="text-xs text-muted-foreground">{fmtDate(d.date)}</div>
                    </div>
                    <span className={`tnum shrink-0 text-xs ${days < 0 ? "text-muted-foreground" : days <= 30 ? "font-medium text-warn-foreground dark:text-warn" : "text-muted-foreground"}`}>
                      {days < 0 ? "pasado" : `${days} d`}
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
