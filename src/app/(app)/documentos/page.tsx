import { FileText, Lock, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/patrimonio/kpi-card";
import { Notice } from "@/components/forms/notice";
import { StatusPill } from "@/components/forms/status-pill";
import { requireMember } from "@/lib/auth/session";
import { listDocuments } from "@/lib/data/patrimonio";
import { DOC_KIND, SENSITIVITY } from "@/lib/patrimonio/labels";
import { fmtDate } from "@/lib/format";

export const instant = false;

export default async function DocumentosPage() {
  await requireMember();
  const docs = await listDocuments();
  return (
    <>
      <PageHeader title="Documentos" description="Expediente privado, versionado y con acceso por rol." />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {(["public_internal", "restricted", "sensitive"] as const).map((s) => (
          <Card key={s} className="flex-row items-center gap-3 p-4">
            {s === "sensitive" ? <ShieldAlert className="size-5 text-danger" strokeWidth={1.5} /> : s === "restricted" ? <Lock className="size-5 text-warning" strokeWidth={1.5} /> : <FileText className="size-5 text-ink-3" strokeWidth={1.5} />}
            <div>
              <div className="text-xs text-ink-3">{SENSITIVITY[s].label}</div>
              <div className="tnum text-xl font-semibold">{docs.filter((d) => d.sensitivity === s).length}</div>
            </div>
            <div className="ml-auto text-[11px] text-ink-3">{SENSITIVITY[s].who}</div>
          </Card>
        ))}
      </div>
      {docs.length === 0 && (
        <Notice tone="info" title="Aún no hay documentos cargados" className="mb-4">
          Los contratos en PDF, escrituras y pólizas se suben a los buckets privados y aquí aparecen ligados a su unidad o contrato. La carga desde la plataforma es el siguiente paso.
        </Notice>
      )}
      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Sensibilidad</TableHead>
              <TableHead className="text-right">Versión</TableHead>
              <TableHead>Actualizado</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.map((d) => {
              const s = SENSITIVITY[d.sensitivity] ?? SENSITIVITY.restricted;
              return (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.title}</TableCell>
                  <TableCell>{DOC_KIND[d.kind] ?? d.kind}</TableCell>
                  <TableCell><StatusPill label={s.label} cls={s.cls} /></TableCell>
                  <TableCell className="tnum text-right">{d.version ? `v${d.version}` : "-"}</TableCell>
                  <TableCell>{fmtDate(d.updatedAt.slice(0, 10))}</TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm" disabled>Abrir</Button></TableCell>
                </TableRow>
              );
            })}
            {docs.length === 0 && (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-ink-3">Sin documentos.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
