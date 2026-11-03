import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/patrimonio/kpi-card";
import { DataStateBadge } from "@/components/patrimonio/data-state-badge";
import { Notice } from "@/components/forms/notice";
import { StatusPill } from "@/components/forms/status-pill";
import { requireMember } from "@/lib/auth/session";
import { listLeases } from "@/lib/data/rentas";
import { daysUntil, fmtDate, fmtMXN } from "@/lib/format";
import { LEASE_STATUS } from "@/lib/rentas/labels";
import { today as todayFn } from "@/lib/data/now";

export const instant = false;

export default async function ContratosPage() {
  await requireMember();
  const leases = await listLeases();
  const today = await todayFn();
  const order = (s: string) => (s === "active" ? 0 : s === "draft" ? 1 : 2);
  const sorted = [...leases].sort((a, b) => order(a.status) - order(b.status) || ((a.endDate ?? "9999") < (b.endDate ?? "9999") ? -1 : 1));
  const expiringSoon = sorted.filter((l) => l.status === "active" && l.endDate && daysUntil(l.endDate, today) <= 60);

  return (
    <>
      <PageHeader title="Contratos" description="Arrendatarios, condiciones vigentes y vencimientos. Renta en MXN con IVA." />

      {expiringSoon.length > 0 && (
        <Notice tone="warning" title={`${expiringSoon.length} contrato(s) vencen en los próximos 60 días`} className="mb-4">
          {expiringSoon.map((l) => `${l.tenantName} (${l.endDate ? fmtDate(l.endDate) : ""})`).join(" · ")}. Registra la renovación como una nueva condición.
        </Notice>
      )}

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Arrendatario</TableHead>
              <TableHead>Unidad(es)</TableHead>
              <TableHead>Inmueble</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead className="text-right">Renta vigente</TableHead>
              <TableHead className="text-right">Mantenimiento</TableHead>
              <TableHead className="text-right">Día</TableHead>
              <TableHead>Incremento</TableHead>
              <TableHead className="text-right">Versiones</TableHead>
              <TableHead>Validación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-0"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((l) => {
              const t = l.term;
              const days = l.endDate ? daysUntil(l.endDate, today) : null;
              const soon = l.status === "active" && days != null && days <= 60;
              const st = LEASE_STATUS[l.status] ?? LEASE_STATUS.active;
              return (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.tenantName}</TableCell>
                  <TableCell className="space-x-1 whitespace-nowrap">
                    {l.units.length ? l.units.map((u) => (
                      <span key={u.id} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs">{u.code}</span>
                    )) : <span className="text-ink-3">-</span>}
                  </TableCell>
                  <TableCell className="text-xs text-ink-2">{l.developmentName ?? "-"}</TableCell>
                  <TableCell className="text-xs">{l.startDate ? fmtDate(l.startDate) : "-"}</TableCell>
                  <TableCell className={`text-xs ${soon ? "font-semibold text-warning" : ""}`}>
                    {l.endDate ? fmtDate(l.endDate) : <span className="text-ink-3">sin registrar</span>}
                    {soon && <div className="text-[11px]">por vencer · {days} d</div>}
                  </TableCell>
                  <TableCell className="tnum text-right">{t ? fmtMXN(t.rentTotal) : "-"}</TableCell>
                  <TableCell className="tnum text-right">{t && t.maintenanceTotal ? fmtMXN(t.maintenanceTotal) : "-"}</TableCell>
                  <TableCell className="tnum text-right">{t?.dueDay ?? "-"}</TableCell>
                  <TableCell className="max-w-[180px] truncate text-xs text-ink-2">{t?.increaseRule ?? "Sin regla documentada"}</TableCell>
                  <TableCell className="tnum text-right text-xs">{l.termsCount}</TableCell>
                  <TableCell><DataStateBadge state={l.verification} /></TableCell>
                  <TableCell><StatusPill label={st.label} cls={st.cls} /></TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/contratos/${l.id}/condiciones`}>Condiciones</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && (
              <TableRow><TableCell colSpan={13} className="py-8 text-center text-ink-3">Sin contratos registrados.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
