import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/patrimonio/kpi-card";
import { DataStateBadge } from "@/components/patrimonio/data-state-badge";
import { TODAY, leases } from "@/lib/mock/data";
import { currentTerm, getEntity, getTenant, getUnit } from "@/lib/mock/queries";
import { daysUntil, fmtDate, fmtMXN } from "@/lib/format";

const STATUS: Record<string, { label: string; cls: string }> = {
  draft: { label: "Borrador", cls: "bg-muted" },
  active: { label: "Activo", cls: "bg-ok/15 text-ok" },
  expired: { label: "Vencido", cls: "bg-muted text-muted-foreground" },
  terminated: { label: "Terminado", cls: "bg-muted text-muted-foreground" },
};

export default function ContratosPage() {
  const sorted = [...leases].sort((a, b) => (a.status === "active" ? -1 : 1) - (b.status === "active" ? -1 : 1) || (a.endDate < b.endDate ? -1 : 1));
  return (
    <>
      <PageHeader
        eyebrow="Operación"
        title="Contratos"
        description="Arrendatarios, condiciones versionadas, vigencias e incrementos. «Por vencer» es una alerta derivada de la fecha, no un estado."
      />
      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Arrendatario</TableHead>
              <TableHead>Unidad(es)</TableHead>
              <TableHead>Arrendadora</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead className="text-right">Renta base vigente</TableHead>
              <TableHead className="text-right">Depósito</TableHead>
              <TableHead>Incremento</TableHead>
              <TableHead>Versiones</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Validación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((l) => {
              const t = currentTerm(l.id, TODAY) ?? l.terms[l.terms.length - 1];
              const days = daysUntil(l.endDate);
              const soon = l.status === "active" && days <= 60;
              return (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{getTenant(l.tenantId)?.name.replace("[DEMO] ", "")}</TableCell>
                  <TableCell className="space-x-1">
                    {l.unitIds.map((id) => (
                      <Link key={id} href={`/unidades/${id}`} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs hover:bg-accent">{getUnit(id)?.code}</Link>
                    ))}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{getEntity(l.lessorEntityId)?.name.replace("[DEMO] ", "")}</TableCell>
                  <TableCell className="text-xs">{fmtDate(l.startDate)}</TableCell>
                  <TableCell className={`text-xs ${soon ? "font-medium text-amber-700 dark:text-warn" : ""}`}>{fmtDate(l.endDate)}{soon && <div className="text-[10px]">por vencer · {days} d</div>}</TableCell>
                  <TableCell className="tnum text-right">{fmtMXN(t.baseRent)} <span className="text-xs text-muted-foreground">+ IVA</span></TableCell>
                  <TableCell className="tnum text-right">{fmtMXN(t.deposit)}</TableCell>
                  <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">{t.increaseRule ?? "Sin regla documentada"}</TableCell>
                  <TableCell className="tnum text-xs">{l.terms.length}</TableCell>
                  <TableCell><span className={`rounded px-1.5 py-0.5 text-xs ${STATUS[l.status].cls}`}>{STATUS[l.status].label}</span></TableCell>
                  <TableCell><DataStateBadge state={l.validation} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Los depósitos en garantía son pasivo, no renta. Las renovaciones conservan historia como nueva versión o contrato vinculado (por definir).
      </p>
    </>
  );
}
