import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  warning: { bg: "bg-warning-soft", icon: "text-warning", Icon: AlertTriangle },
  info: { bg: "bg-info-soft", icon: "text-info", Icon: Info },
  danger: { bg: "bg-danger-soft", icon: "text-danger", Icon: XCircle },
  success: { bg: "bg-success-soft", icon: "text-success", Icon: CheckCircle2 },
} as const;

/** Aviso (stone-design-system/components/Alert.md): título 600 + siguiente paso. */
export function Notice({
  tone,
  title,
  children,
  className,
}: {
  tone: keyof typeof TONES;
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("flex gap-3 rounded-md p-3 text-ink", t.bg, className)}>
      <t.Icon className={cn("mt-0.5 size-4 shrink-0", t.icon)} strokeWidth={1.5} />
      <div className="min-w-0 text-sm leading-5">
        <div className="font-semibold">{title}</div>
        {children && <div className="mt-0.5 text-ink-2">{children}</div>}
      </div>
    </div>
  );
}
