import { cn } from "@/lib/utils";

/** Etiqueta de estado (Badge.md): píldora con punto y palabra; nunca solo color. */
export function StatusPill({ label, cls, className }: { label: string; cls: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold", cls, className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
