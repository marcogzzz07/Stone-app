import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/forms/notice";
import { FormShell } from "@/components/forms/form-shell";
import { requireRole } from "@/lib/auth/session";
import { getPayment, listOpenChargesByTenant } from "@/lib/data/rentas";
import { fmtDate, fmtMXN } from "@/lib/format";
import { METHOD_LABEL } from "@/lib/rentas/labels";
import { ApplyForm } from "./apply-form";

export const instant = false;

export default async function AplicarPagoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole("operator");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [payment, openMap] = await Promise.all([getPayment(id), listOpenChargesByTenant()]);
  if (!payment) notFound();
  const charges = (openMap.get(payment.tenantId) ?? []).map((c) => ({
    id: c.id,
    period: c.period,
    concept: c.concept,
    unitCode: c.unitCode,
    folio: c.folio,
    dueDate: c.dueDate,
    balance: c.balance,
    status: c.status,
  }));

  return (
    <FormShell
      backHref="/rentas?tab=cobro"
      backLabel="Por fecha de cobro"
      title={`Aplicar ${fmtMXN(payment.unapplied)} sin aplicar`}
      description={`Pago de ${payment.tenantName} del ${fmtDate(payment.effectiveDate)} por ${fmtMXN(payment.amount)} (${METHOD_LABEL[payment.method]}${payment.bankRef ? `, ref. ${payment.bankRef}` : ""}).`}
      aside={
        <Card className="gap-2 p-4 text-sm text-ink-2">
          <div className="font-semibold text-ink">Este pago</div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt>Monto</dt><dd className="tnum text-right text-ink">{fmtMXN(payment.amount)}</dd>
            <dt>Aplicado</dt><dd className="tnum text-right text-ink">{fmtMXN(payment.applied)}</dd>
            <dt>Sin aplicar</dt><dd className="tnum text-right font-semibold text-info">{fmtMXN(payment.unapplied)}</dd>
          </dl>
        </Card>
      }
    >
      {sp.error && <Notice tone="danger" title="El pago se registró, pero la aplicación no" className="mb-4">{sp.error}</Notice>}
      {payment.unapplied <= 0.005 ? (
        <Notice tone="info" title="Este pago ya está aplicado por completo">No queda saldo por aplicar.</Notice>
      ) : (
        <ApplyForm paymentId={payment.id} available={payment.unapplied} charges={charges} />
      )}
    </FormShell>
  );
}
