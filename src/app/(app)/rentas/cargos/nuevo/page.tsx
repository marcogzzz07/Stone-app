import { Card } from "@/components/ui/card";
import { Notice } from "@/components/forms/notice";
import { FormShell } from "@/components/forms/form-shell";
import { requireRole } from "@/lib/auth/session";
import { listLeases } from "@/lib/data/rentas";
import { ChargeForm } from "./charge-form";

export const instant = false;

export default async function NuevoCargoPage() {
  await requireRole("operator");
  const leases = (await listLeases({ activeOnly: true })).map((l) => ({
    id: l.id,
    label: `${l.tenantName} · ${l.units.map((u) => u.code).join(", ") || "sin unidad"}`,
    developmentName: l.developmentName,
    term: l.term,
  }));

  return (
    <FormShell
      backHref="/rentas"
      backLabel="Rentas y cobranza"
      title="Nuevo cargo"
      description="Una factura de renta o mantenimiento de un mes. Los montos se precargan con la condición vigente del contrato; ajústalos si la factura dice otra cosa."
      aside={
        <Card className="gap-2 p-4 text-sm text-ink-2">
          <div className="font-semibold text-ink">Cómo se calcula</div>
          <p>El período es el mes al que corresponde la renta (columna MES del reporte), no la fecha de la factura.</p>
          <p>Subtotal e IVA se guardan por separado; el total es la suma. Si la renta pactada incluye IVA, el subtotal es total ÷ 1.16.</p>
          <p>El saldo y el estado (pendiente, vencido, pagado) se derivan de las aplicaciones de pago; no se capturan.</p>
        </Card>
      }
    >
      {leases.length === 0 ? (
        <Notice tone="warning" title="No hay contratos activos">
          Registra primero el contrato en Contratos; los cargos siempre se ligan a uno.
        </Notice>
      ) : (
        <ChargeForm leases={leases} />
      )}
    </FormShell>
  );
}
