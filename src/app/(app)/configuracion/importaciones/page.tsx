import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, SectionTitle } from "@/components/patrimonio/kpi-card";
import { Notice } from "@/components/forms/notice";
import { StatusPill } from "@/components/forms/status-pill";
import { hasRole, requireMember } from "@/lib/auth/session";
import { listDiscrepancies, listImportBatches } from "@/lib/data/patrimonio";
import { DISCREPANCY_KIND, DISCREPANCY_STATUS, SEVERITY } from "@/lib/patrimonio/labels";
import { fmtAmt, fmtDate, fmtPeriod } from "@/lib/format";
import { DiscrepancyActions } from "./discrepancy-actions";

export const instant = false;

export default async function ImportacionesPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const [me, sp] = await Promise.all([requireMember(), searchParams]);
  const canEdit = hasRole(me.membership.role, "operator");
  const [batches, all] = await Promise.all([listImportBatches(), listDiscrepancies()]);
  const filter = sp.estado === "todas" ? "todas" : "abiertas";
  const rows = filter === "todas" ? all : all.filter((d) => d.status === "open");
  const open = all.filter((d) => d.status === "open");
  const bySeverity = { danger: open.filter((d) => d.severity === "danger").length, warning: open.filter((d) => d.severity === "warning").length, info: open.filter((d) => d.severity === "info").length };

  return (
    <>
      <Link href="/configuracion" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" strokeWidth={1.5} /> Configuración
      </Link>
      <PageHeader title="Importaciones" description="Cargas del reporte mensual y lo que no cuadró. Nada se corrige en silencio: cada diferencia se revisa y se marca." />

      <SectionTitle>Cargas</SectionTitle>
      <Card className="mb-6 p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Archivo</TableHead>
              <TableHead>Corte</TableHead>
              <TableHead className="text-right">Cargos</TableHead>
              <TableHead className="text-right">Pagos</TableHead>
              <TableHead className="text-right">Contratos</TableHead>
              <TableHead className="text-right">Discrepancias</TableHead>
              <TableHead>Aplicada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.fileName}</TableCell>
                <TableCell>{b.reportPeriod ? fmtPeriod(b.reportPeriod) : "-"}</TableCell>
                <TableCell className="tnum text-right">{String(b.summary.cargos ?? "-")}</TableCell>
                <TableCell className="tnum text-right">{String(b.summary.pagos ?? "-")}</TableCell>
                <TableCell className="tnum text-right">{String(b.summary.contratos ?? "-")}</TableCell>
                <TableCell className="tnum text-right">{String(b.summary.discrepancias ?? "-")}</TableCell>
                <TableCell className="text-xs">{b.appliedAt ? fmtDate(b.appliedAt.slice(0, 10)) : b.status}</TableCell>
              </TableRow>
            ))}
            {batches.length === 0 && <TableRow><TableCell colSpan={7} className="py-6 text-center text-ink-3">Sin cargas registradas.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <SectionTitle hint={`${bySeverity.danger} críticas · ${bySeverity.warning} por revisar · ${bySeverity.info} informativas`}>Discrepancias</SectionTitle>
        <div className="flex rounded-md border bg-card p-0.5 text-sm">
          <Link href="/configuracion/importaciones" className={`rounded-[5px] px-3 py-1 ${filter === "abiertas" ? "bg-primary text-primary-foreground" : "text-ink-2 hover:bg-surface-2"}`}>Abiertas ({open.length})</Link>
          <Link href="/configuracion/importaciones?estado=todas" className={`rounded-[5px] px-3 py-1 ${filter === "todas" ? "bg-primary text-primary-foreground" : "text-ink-2 hover:bg-surface-2"}`}>Todas ({all.length})</Link>
        </div>
      </div>
      {open.length === 0 && filter === "abiertas" && <Notice tone="success" title="Sin discrepancias abiertas">Todo lo que no cuadraba ya fue revisado.</Notice>}
      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gravedad</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Qué pasa</TableHead>
              <TableHead>Hoja · celda</TableHead>
              <TableHead className="text-right">Esperado</TableHead>
              <TableHead className="text-right">Encontrado</TableHead>
              <TableHead>Estado</TableHead>
              {canEdit && <TableHead className="w-0"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((d) => {
              const sev = SEVERITY[d.severity] ?? SEVERITY.info;
              const st = DISCREPANCY_STATUS[d.status] ?? DISCREPANCY_STATUS.open;
              return (
                <TableRow key={d.id} className={d.status === "resolved" ? "text-ink-3" : ""}>
                  <TableCell><StatusPill label={sev.label} cls={sev.cls} /></TableCell>
                  <TableCell className="text-xs">{DISCREPANCY_KIND[d.kind] ?? d.kind}</TableCell>
                  <TableCell className="max-w-[460px] text-sm leading-5">
                    {d.description}
                    {d.resolution && <div className="mt-1 text-xs text-ink-3">Resolución: {d.resolution}</div>}
                    {d.targetType === "lease" && d.targetId && <Link href={`/contratos/${d.targetId}/condiciones`} className="ml-1 text-xs text-brand-cyan-ink hover:underline">ver contrato</Link>}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-ink-3">{d.sheet ?? "-"}{d.cell ? ` · ${d.cell}` : ""}</TableCell>
                  <TableCell className="tnum text-right">{fmtAmt(d.expected)}</TableCell>
                  <TableCell className="tnum text-right">{fmtAmt(d.actual)}</TableCell>
                  <TableCell><StatusPill label={st.label} cls={st.cls} /></TableCell>
                  {canEdit && <TableCell className="text-right"><DiscrepancyActions id={d.id} status={d.status} /></TableCell>}
                </TableRow>
              );
            })}
            {rows.length === 0 && <TableRow><TableCell colSpan={canEdit ? 8 : 7} className="py-6 text-center text-ink-3">Nada que mostrar.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
