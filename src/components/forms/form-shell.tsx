import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Marco de los formularios de captura: enlace de regreso, título con el hecho
 * que se registra, tarjeta con el formulario. Un solo botón primario por
 * pantalla (Button.md): el de guardar; cancelar es enlace.
 */
export function FormShell({
  backHref,
  backLabel,
  title,
  description,
  children,
  aside,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <>
      <Link href={backHref} className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" strokeWidth={1.5} /> {backLabel}
      </Link>
      <div className="mb-5">
        <h1 className="font-display text-[30px] leading-9 font-semibold tracking-tight text-navy dark:text-foreground">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink-2">{description}</p>}
      </div>
      <div className={aside ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]" : "max-w-3xl"}>
        <Card className="p-5">{children}</Card>
        {aside && <div className="flex flex-col gap-4">{aside}</div>}
      </div>
    </>
  );
}

export function SubmitBar({ pending, label, cancelHref }: { pending: boolean; label: string; cancelHref: string }) {
  return (
    <div className="mt-2 flex items-center gap-3 border-t pt-4">
      <Button type="submit" disabled={pending}>{pending ? "Guardando…" : label}</Button>
      <Button asChild variant="ghost">
        <Link href={cancelHref}>Cancelar</Link>
      </Button>
    </div>
  );
}

export function FormSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {hint && <span className="text-[12px] text-ink-3">{hint}</span>}
      </div>
      {children}
    </section>
  );
}
