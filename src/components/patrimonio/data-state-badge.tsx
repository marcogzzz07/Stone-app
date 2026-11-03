import { cn } from "@/lib/utils";
export type DataState = "confirmado" | "por_verificar" | "no_disponible";

// Etiquetas de estado del design system (stone-design-system/components/Badge.md):
// píldora con punto y texto; success / info / neutro. Ámbar y rojo quedan
// reservados a dinero pendiente y vencido.
const MAP: Record<DataState, { label: string; cls: string }> = {
  confirmado: { label: "Confirmado", cls: "bg-success-soft text-success" },
  por_verificar: { label: "Por verificar", cls: "bg-info-soft text-info" },
  no_disponible: { label: "No disponible", cls: "bg-surface-2 text-ink-2" },
};

export function DataStateBadge({ state, className }: { state: DataState; className?: string }) {
  const m = MAP[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
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
    <span className="inline-flex items-center rounded-full border border-dashed border-chart-3/60 bg-surface-2 px-2 py-0.5 text-xs font-semibold text-ink-2">
      Referencia de terceros
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-info-soft px-2 py-0.5 text-xs font-semibold text-info">
      Stone
    </span>
  );
}

const OCC: Record<string, { label: string; cls: string }> = {
  ocupada: { label: "Ocupada", cls: "text-success" },
  disponible: { label: "Disponible", cls: "text-info" },
  desconocida: { label: "Estado desconocido", cls: "text-ink-3" },
  no_disponible: { label: "No aplica", cls: "text-ink-3" },
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
