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
  delta,
  foot,
  compact,
}: {
  label: string;
  value: string;
  info: string;
  /** Se conserva por compatibilidad; las tarjetas ya no llevan gráfica. */
  visual?: React.ReactNode;
  delta?: React.ReactNode;
  foot?: string;
  /** Una sola línea: cifra a la izquierda y pie a la derecha (dashboard). */
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Card className="h-full gap-0 p-0">
        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 text-[13px] text-ink-2">
            <span className="truncate">{label}</span>
            <span title={info} className="cursor-help text-ink-3"><Info className="size-3.5" /></span>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <span className="num text-2xl leading-7 text-ink">{value}</span>
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-ink-3">
              {delta}
              <span className="truncate">{foot}</span>
            </span>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <Card className="h-full gap-0 p-0">
      <div className="p-4 pb-3">
        <div className="flex items-center gap-1.5 text-sm text-ink-2">
          <span className="truncate">{label}</span>
          <span title={info} className="cursor-help text-ink-3"><Info className="size-3.5" /></span>
        </div>
        <div className="num mt-1.5 text-[28px] leading-8 text-ink">{value}</div>
      </div>
      <div className="mt-auto flex min-h-9 items-center gap-2 border-t bg-surface-2/60 px-4 py-2 text-[13px] text-ink-3">
        {delta}
        <span className="truncate">{foot ?? "\u00a0"}</span>
      </div>
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
