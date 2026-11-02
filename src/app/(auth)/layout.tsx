import Image from "next/image";

/** Pantallas de acceso: tarjeta centrada sobre fondo neutro, con el logo a color. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-10">
      <Image src="/brand/stone-logo.png" alt="Stone Inmuebles" width={168} height={75} priority className="mb-8 h-auto w-[168px]" />
      <main className="w-full max-w-[400px] rounded-lg border bg-surface p-6 shadow-sm">{children}</main>
      <p className="mt-6 text-xs text-ink-3">Plataforma privada. Acceso solo por invitación.</p>
    </div>
  );
}
