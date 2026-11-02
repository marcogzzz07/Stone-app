export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs">
      <span className="flex items-center gap-2">
        <span className="h-3 w-5 rounded-sm border-2 border-[#a8622a] bg-[#c9803f]/40" />
        Unidad Stone (operable)
      </span>
      <span className="flex items-center gap-2">
        <span className="h-3 w-5 rounded-sm border-2 border-dashed border-[#7d8794] bg-[#7d8794]/20" />
        Referencia de terceros
      </span>
      <span className="flex items-center gap-2">
        <span className="h-3 w-5 rounded-sm border border-dashed border-[#6b625a] bg-[#9a8f82]/10" />
        Perímetro del desarrollo
      </span>
      <span className="flex items-center gap-2">
        <span className="size-3 rounded-full border-2 border-warn bg-warn/30" />
        Pendiente de trazo
      </span>
      <span className="ml-auto text-muted-foreground">
        Trazos demo · EPSG:4326 · áreas estimadas por polígono, no legales
      </span>
    </div>
  );
}
