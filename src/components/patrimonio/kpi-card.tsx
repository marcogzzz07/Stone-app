import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  sub?: string;
  meta: string; // periodo · moneda · IVA · origen · conciliación (obligatorio, spec §5.2)
  tone?: "default" | "accent" | "warn";
  className?: string;
}

export function KpiCard({ label, value, sub, meta, tone = "default", className }: Props) {
  return (
    <Card className={cn("gap-1 p-4", className)}>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div
        className={cn(
          "num text-[28px] leading-none font-semibold",
          tone === "accent" && "text-stone-accent",
          tone === "warn" && "text-warn",
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-foreground/80">{sub}</div>}
      <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{meta}</div>
    </Card>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-condensed text-3xl font-semibold tracking-tight text-navy lg:text-[34px] dark:text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-sm font-semibold tracking-tight">{children}</h2>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  );
}
