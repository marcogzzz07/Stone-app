import { FileText, Lock, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/patrimonio/kpi-card";
import { docs } from "@/lib/mock/data";
import { getDevelopment, getLease, getTenant, getUnit } from "@/lib/mock/queries";
import { fmtDate } from "@/lib/format";

function targetLabel(d: (typeof docs)[number]) {
  if (d.targetType === "unit") return getUnit(d.targetId)?.name ?? d.targetId;
  if (d.targetType === "development") return getDevelopment(d.targetId)?.name ?? d.targetId;
  const l = getLease(d.targetId);
  return l ? `Contrato · ${getTenant(l.tenantId)?.name}` : d.targetId;
}

export default function DocumentosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Expediente"
        title="Documentos"
        description="Archivo privado, versionado y con control de acceso por rol y sensibilidad. Nunca URLs permanentes."
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {(["interno", "restringido", "sensible"] as const).map((s) => (
          <Card key={s} className="flex-row items-center gap-3 p-4">
            {s === "sensible" ? <ShieldAlert className="size-5 text-destructive" /> : s === "restringido" ? <Lock className="size-5 text-warn" /> : <FileText className="size-5 text-muted-foreground" />}
            <div>
              <div className="text-xs capitalize text-muted-foreground">{s}</div>
              <div className="tnum text-xl font-semibold">{docs.filter((d) => d.sensitivity === s).length}</div>
            </div>
            <div className="ml-auto text-[11px] text-muted-foreground">
              {s === "sensible" ? "solo admin" : s === "restringido" ? "admin + administración" : "todos los roles"}
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Vinculado a</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Sensibilidad</TableHead>
              <TableHead>Versión</TableHead>
              <TableHead>Actualizado</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="text-muted-foreground">{targetLabel(d)}</TableCell>
                <TableCell className="capitalize">{d.kind}</TableCell>
                <TableCell><span className={`rounded px-1.5 py-0.5 text-xs ${d.sensitivity === "sensible" ? "bg-destructive/10 text-destructive" : d.sensitivity === "restringido" ? "bg-warn/20" : "bg-muted"}`}>{d.sensitivity}</span></TableCell>
                <TableCell className="tnum">v{d.version}</TableCell>
                <TableCell>{fmtDate(d.updatedAt)}</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm" disabled>Abrir</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <p className="mt-2 text-[11px] text-muted-foreground">
        En Iteración 1: buckets privados de Supabase Storage (legal, fiscal, técnico, comercial, importaciones), enlaces firmados de corta duración y bitácora de acceso.
      </p>
    </>
  );
}
