import { cn } from "@/lib/utils";
import type { DataState } from "@/lib/mock/types";

// Estados de dato (spec §5.5). El naranja se reserva para dinero en alerta;
// "por verificar" usa el azul medio de la marca.
const MAP: Record<DataState, { label: string; cls: string }> = {
  confirmado: { label: "Confirmado", cls: "bg-ok/12 text-ok border-ok/30" },
  por_verificar: { label: "Por verificar", cls: "bg-accent text-accent-foreground border-stone-accent/30" },
  no_disponible: { label: "No disponible", cls: "bg-muted text-muted-foreground border-border" },
};

export function DataStateBadge({ state, className }: { state: DataState; className?: string }) {
  const m = MAP[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        m.cls,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  );
}

export function ScopeBadge({ referenceOnly }: { referenceOnly: boolean }) {
  return referenceOnly ? (
    <span className="inline-flex items-center rounded-full border border-dashed border-reference/60 bg-reference/10 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      Referencia de terceros
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-stone-accent/40 bg-stone-accent/12 px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
      Stone
    </span>
  );
}

const OCC: Record<string, { label: string; cls: string }> = {
  ocupada: { label: "Ocupada", cls: "text-ok" },
  disponible: { label: "Disponible", cls: "text-accent-foreground" },
  desconocida: { label: "Estado desconocido", cls: "text-muted-foreground" },
  no_disponible: { label: "No aplica", cls: "text-muted-foreground" },
};

export function OccupancyDot({ occupancy }: { occupancy: string }) {
  const o = OCC[occupancy] ?? OCC.desconocida;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", o.cls)}>
      <span className="size-2 rounded-full bg-current" />
      {o.label}
    </span>
  );
}
