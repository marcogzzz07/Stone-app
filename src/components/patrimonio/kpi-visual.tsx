import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * Tarjeta KPI (stone-design-system/components/KpiCard.md): etiqueta 14px ink-2,
 * valor estilo `kpi` (28px, 600, tabular) y pie 13px ink-3. La definición
 * completa (periodo · moneda · IVA · origen) va en `info`, visible al pasar el
 * cursor por el icono; el visual es una línea o barras mínimas, nunca una gráfica.
 */
export function KpiVisual({
  label,
  value,
  info,
  visual,
  delta,
  foot,
}: {
  label: string;
  value: string;
  info: string;
  visual?: React.ReactNode;
  delta?: React.ReactNode;
  foot?: string;
}) {
  return (
    <Card className="gap-0 p-0">
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-sm text-ink-2">
            <span className="truncate">{label}</span>
            <span title={info} className="cursor-help text-ink-3"><Info className="size-3.5" /></span>
          </div>
          <div className="num mt-1.5 text-[28px] leading-8 text-ink">{value}</div>
        </div>
        {visual && <div className="mt-1 shrink-0">{visual}</div>}
      </div>
      {(delta || foot) && (
        <div className="flex items-center gap-2 border-t bg-surface-2/60 px-4 py-2 text-[13px] text-ink-3">
          {delta}
          {foot && <span className="truncate">{foot}</span>}
        </div>
      )}
    </Card>
  );
}

export function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-3">
      <div className="text-[13px] text-ink-3">{label}</div>
      <div className="num mt-0.5 text-lg text-ink">{value}</div>
    </div>
  );
}
