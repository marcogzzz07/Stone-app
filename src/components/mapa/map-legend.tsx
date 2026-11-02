export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs">
      <span className="flex items-center gap-2">
        <span className="h-3 w-5 rounded-sm border-2 border-navy bg-stone-accent/50" />
        Unidad Stone (operable)
      </span>
      <span className="flex items-center gap-2">
        <span className="h-3 w-5 rounded-sm border-2 border-dashed border-reference bg-reference/20" />
        Referencia de terceros
      </span>
      <span className="flex items-center gap-2">
        <span className="h-3 w-5 rounded-sm border border-dashed border-navy/60 bg-navy/5" />
        Perímetro del desarrollo
      </span>
      <span className="flex items-center gap-2">
        <span className="size-3 rounded-full border-2 border-dashed border-muted-foreground bg-muted" />
        Pendiente de trazo
      </span>
      <span className="ml-auto text-muted-foreground">
        Trazos demo · EPSG:4326 · áreas estimadas por polígono, no legales
      </span>
    </div>
  );
}
