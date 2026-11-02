import { cn } from "@/lib/utils";

/**
 * Cabecera facetada: el lenguaje del cubo isométrico de Stone aplicado como
 * plano abstracto. Sustituye a fotografías hasta que existan imágenes reales.
 */
export function FacetCover({
  tone = "navy",
  className,
  children,
}: {
  tone?: "navy" | "cyan";
  className?: string;
  children?: React.ReactNode;
}) {
  const bg = tone === "navy" ? "#101752" : "#0f6f9b";
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ background: bg }}>
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 300"
        preserveAspectRatio="xMidYMid slice"
      >
        <g fill="none">
          <polygon points="560,0 800,0 800,140" fill="#1593c6" opacity="0.55" />
          <polygon points="640,300 800,140 800,300" fill="#0f6f9b" opacity="0.7" />
          <polygon points="420,300 640,300 560,160" fill="#111644" opacity="0.8" />
          <polygon points="560,160 640,300 800,140 700,60" fill="#1c2233" opacity="0.5" />
          <polygon points="0,220 140,300 0,300" fill="#1593c6" opacity="0.25" />
          <polygon points="0,220 140,300 260,220 120,150" fill="#0f6f9b" opacity="0.35" />
          <polyline points="0,220 120,150 260,220" stroke="#7fc6e6" strokeOpacity="0.5" strokeWidth="1" />
          <polyline points="560,160 700,60 800,140" stroke="#7fc6e6" strokeOpacity="0.6" strokeWidth="1" />
        </g>
      </svg>
      {children}
    </div>
  );
}
