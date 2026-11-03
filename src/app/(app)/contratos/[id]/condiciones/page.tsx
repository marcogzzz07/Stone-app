import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Notice } from "@/components/forms/notice";
import { FormShell } from "@/components/forms/form-shell";
import { StatusPill } from "@/components/forms/status-pill";
import { hasRole, requireMember } from "@/lib/auth/session";
import { getLeaseWithTerms } from "@/lib/data/rentas";
import { fmtAmt, fmtDate, fmtMXN } from "@/lib/format";
import { LEASE_STATUS, SOURCE_LABEL } from "@/lib/rentas/labels";
import { LeaseTermForm } from "./term-form";
import { LeaseEditor, TermEditor } from "./edit-forms";

export const instant = false;

const TAX_LABEL: Record<string, string> = { iva_incluido: "IVA incluido", mas_iva: "más IVA", exento: "exento" };

export default async function CondicionesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const [me, { id }, sp] = await Promise.all([requireMember(), params, searchParams]);
  const data = await getLeaseWithTerms(id);
  if (!data) notFound();
  const { lease, history } = data;
  const canEdit = hasRole(me.membership.role, "operator");
  const current = lease.term;
  const st = LEASE_STATUS[lease.status] ?? LEASE_STATUS.active;

  return (
    <FormShell
      backHref="/contratos"
      backLabel="Contratos"
      title={`Condiciones · ${lease.tenantName}`}
      description={`${lease.units.map((u) => u.code).join(", ") || "Sin unidad"}${lease.developmentName ? ` · ${lease.developmentName}` : ""} · ${lease.startDate ? fmtDate(lease.startDate) : "—"} a ${lease.endDate ? fmtDate(lease.endDate) : "sin vencimiento registrado"}.`}
      aside={
        <Card className="gap-2 p-4 text-sm text-ink-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ink">Vigente hoy</span>
            <StatusPill label={st.label} cls={st.cls} />
          </div>
          {current ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt>Renta</dt><dd className="tnum text-right text-ink">{fmtMXN(current.rentTotal)} <span className="text-ink-3">{TAX_LABEL[current.taxTreatment]}</span></dd>
              <dt>Sin IVA</dt><dd className="tnum text-right">{fmtMXN(current.rentSubtotal)}</dd>
              <dt>Mantenimiento</dt><dd className="tnum text-right">{current.maintenanceTotal ? fmtMXN(current.maintenanceTotal) : "-"}</dd>
              <dt>Día de pago</dt><dd className="text-right">{current.dueDay ?? "-"}</dd>
              <dt>Depósito</dt><dd className="tnum text-right">{current.depositAmount != null ? fmtMXN(current.depositAmount) : "-"}</dd>
              <dt>Incremento</dt><dd className="text-right">{current.increaseRule ?? "Sin regla documentada"}</dd>
            </dl>
          ) : (
            <p>Este contrato no tiene condiciones registradas.</p>
          )}
          <p className="text-[12px] text-ink-3">Cada cambio de renta es una fila nueva; la anterior se cierra el día previo. Así los cargos de meses pasados no cambian.</p>
          {lease.notes && <p className="whitespace-pre-line text-[12px] text-ink-2">{lease.notes}</p>}
          {canEdit && <LeaseEditor lease={lease} rentedM2={lease.rentedM2} />}
        </Card>
      }
    >
      {sp.ok === "edit" && <Notice tone="success" title="Cambios guardados" className="mb-4">El contrato quedó actualizado; el cambio se registró en la bitácora.</Notice>}
      {sp.ok === "1" && <Notice tone="success" title="Condición registrada" className="mb-4">Los nuevos cargos se precargarán con esta renta.</Notice>}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">Historial</h2>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Desde</TableHead>
                <TableHead>Hasta</TableHead>
                <TableHead className="text-right">Renta</TableHead>
                <TableHead>IVA</TableHead>
                <TableHead className="text-right">Mantenimiento</TableHead>
                <TableHead className="text-right">Día</TableHead>
                <TableHead>Incremento</TableHead>
                <TableHead>Origen</TableHead>
                {canEdit && <TableHead className="w-0"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((t) => (
                <TableRow key={t.id} className={t.id === current?.id ? "bg-info-soft/40" : ""}>
                  <TableCell>{fmtDate(t.effectiveFrom)}</TableCell>
                  <TableCell>{t.effectiveTo ? fmtDate(t.effectiveTo) : <span className="text-ink-3">vigente</span>}</TableCell>
                  <TableCell className="tnum text-right font-medium">{fmtAmt(t.rentTotal)}</TableCell>
                  <TableCell className="text-xs">{TAX_LABEL[t.taxTreatment]}</TableCell>
                  <TableCell className="tnum text-right">{fmtAmt(t.maintenanceTotal)}</TableCell>
                  <TableCell className="tnum text-right">{t.dueDay ?? "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-ink-2">{t.increaseRule ?? "-"}</TableCell>
                  <TableCell className="text-xs text-ink-3">{SOURCE_LABEL[t.source] ?? t.source}</TableCell>
                  {canEdit && <TableCell className="text-right"><TermEditor leaseId={lease.id} term={t} /></TableCell>}
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow><TableCell colSpan={canEdit ? 9 : 8} className="py-6 text-center text-ink-3">Sin condiciones registradas.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {canEdit ? (
        <div className="mt-6 border-t pt-5">
          <LeaseTermForm leaseId={lease.id} latestFrom={history[0]?.effectiveFrom ?? null} current={current} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink-3">Solo Administración puede registrar condiciones nuevas.</p>
      )}

      <p className="mt-4 text-[12px] text-ink-3">
        ¿Cargos de este contrato? Ve a <Link href="/rentas" className="text-brand-cyan-ink hover:underline">Rentas y cobranza</Link>.
      </p>
    </FormShell>
  );
}
