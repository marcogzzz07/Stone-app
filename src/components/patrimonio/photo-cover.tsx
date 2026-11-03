import { cn } from "@/lib/utils";
import { FacetCover } from "./facet-cover";

/**
 * Portada de un inmueble: la foto del expediente cuando existe (servida por
 * /documentos/[id]/archivo, con sesión) y el plano facetado cuando no.
 * El degradado inferior garantiza contraste para el texto superpuesto.
 */
export function PhotoCover({
  documentId,
  alt,
  tone = "navy",
  className,
  children,
}: {
  documentId: string | null | undefined;
  alt: string;
  tone?: "navy" | "cyan";
  className?: string;
  children?: React.ReactNode;
}) {
  if (!documentId) {
    return <FacetCover tone={tone} className={className}>{children}</FacetCover>;
  }
  return (
    <div className={cn("relative overflow-hidden bg-brand-navy", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- archivo privado servido con sesión; no pasa por el optimizador */}
      <img src={`/documentos/${documentId}/archivo`} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
      {children}
    </div>
  );
}
