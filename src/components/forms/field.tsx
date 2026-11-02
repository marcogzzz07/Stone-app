import { cn } from "@/lib/utils";

/**
 * Campo de formulario (stone-design-system/components/FormField.md):
 * etiqueta 14px 600 ink-2 arriba, control, ayuda 13px ink-3 o error en danger.
 */
export function Field({
  label,
  htmlFor,
  help,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  help?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-2">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[13px] text-danger">{error}</p>
      ) : help ? (
        <p className="text-[13px] text-ink-3">{help}</p>
      ) : null}
    </div>
  );
}
