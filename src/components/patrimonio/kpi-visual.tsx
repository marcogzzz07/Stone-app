import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * KPI con visual (sparkline, anillo, barras…) en lugar de texto explicativo.
 * La definición completa (periodo · moneda · IVA · origen) va en `info`, visible
 * al pasar el cursor por el icono ⓘ; el pie solo lleva la comparación o el matiz.
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
          <div className="flex items-center gap-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            <span className="truncate">{label}</span>
            <span title={info} className="cursor-help text-muted-foreground/70"><Info className="size-3.5" /></span>
          </div>
          <div className="num mt-2 text-[30px] leading-none">{value}</div>
        </div>
        {visual && <div className="mt-1 shrink-0">{visual}</div>}
      </div>
      {(delta || foot) && (
        <div className="flex items-center gap-2 border-t bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
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
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="num mt-0.5 text-lg">{value}</div>
    </div>
  );
}
