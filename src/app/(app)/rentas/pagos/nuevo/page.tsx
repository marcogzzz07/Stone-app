import { Card } from "@/components/ui/card";
import { Notice } from "@/components/forms/notice";
import { FormShell } from "@/components/forms/form-shell";
import { requireRole } from "@/lib/auth/session";
import { listOpenChargesByTenant, listTenants } from "@/lib/data/rentas";
import { PaymentForm } from "./payment-form";
import type { OpenCharge } from "../allocation-table";

export const instant = false;

export default async function NuevoPagoPage() {
  await requireRole("operator");
  const [tenants, openMap] = await Promise.all([listTenants(), listOpenChargesByTenant()]);
  const openByTenant: Record<string, OpenCharge[]> = {};
  for (const [tenantId, rows] of openMap) {
    openByTenant[tenantId] = rows.map((c) => ({
      id: c.id,
      period: c.period,
      concept: c.concept,
      unitCode: c.unitCode,
      folio: c.folio,
      dueDate: c.dueDate,
      balance: c.balance,
      status: c.status,
    }));
  }

  return (
    <FormShell
      backHref="/rentas"
      backLabel="Rentas y cobranza"
      title="Registrar pago"
      description="Un depósito o pago recibido. Aplícalo a los cargos que cubre; lo que sobre queda como saldo a favor."
      aside={
        <Card className="gap-2 p-4 text-sm text-ink-2">
          <div className="font-semibold text-ink">Reglas</div>
          <p>La fecha de pago es la del depósito en banco (FECHA DE PAGO), no la de captura.</p>
          <p>Un pago puede cubrir varios cargos y un cargo recibir varios pagos. La suma aplicada nunca excede el pago ni el saldo del cargo.</p>
          <p>Un pago sin aplicar se puede aplicar después desde la pestaña Por fecha de cobro.</p>
        </Card>
      }
    >
      {tenants.length === 0 ? (
        <Notice tone="warning" title="No hay arrendatarios registrados">Registra el contrato y su arrendatario antes de capturar pagos.</Notice>
      ) : (
        <PaymentForm tenants={tenants} openByTenant={openByTenant} />
      )}
    </FormShell>
  );
}
