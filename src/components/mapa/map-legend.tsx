export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs">
      <span className="flex items-center gap-2">
        <span className="h-3 w-5 rounded-sm border-2 border-brand-navy bg-brand-cyan/50" />
        Unidad Stone (operable)
      </span>
      <span className="flex items-center gap-2">
        <span className="h-3 w-5 rounded-sm border-2 border-dashed border-chart-3 bg-chart-3/20" />
        Referencia de terceros
      </span>
      <span className="flex items-center gap-2">
        <span className="h-3 w-5 rounded-sm border border-dashed border-brand-navy/60 bg-brand-navy/5" />
        Perímetro del desarrollo
      </span>
      <span className="flex items-center gap-2">
        <span className="size-3 rounded-full border-2 border-dashed border-ink-3 bg-surface-2" />
        Pendiente de trazo
      </span>
      <span className="ml-auto text-ink-3">
        Trazos demo · EPSG:4326 · áreas estimadas por polígono, no legales
      </span>
    </div>
  );
}
