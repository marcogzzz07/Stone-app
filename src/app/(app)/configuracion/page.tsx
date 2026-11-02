import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, SectionTitle } from "@/components/patrimonio/kpi-card";

const ROLES = [
  { cap: "Ver dashboard, mapa, inventario, fichas", admin: true, op: true, viewer: true },
  { cap: "Ver Legal y fiscal / documentos restringidos", admin: true, op: "config", viewer: false },
  { cap: "Ver documentos sensibles", admin: true, op: false, viewer: false },
  { cap: "Editar inmuebles, unidades, geometrías", admin: true, op: true, viewer: false },
  { cap: "Contratos, cargos, pagos, gastos", admin: true, op: true, viewer: false },
  { cap: "Ajustes, anulaciones, cierre, fuente de verdad", admin: true, op: false, viewer: false },
  { cap: "Importaciones", admin: true, op: "subir/revisar", viewer: false },
  { cap: "Usuarios y roles", admin: true, op: false, viewer: false },
] as const;

const SOT = [
  { scope: "[DEMO] Plaza Ejemplo Norte", from: "2026-01", source: "excel", by: "—" },
  { scope: "[DEMO] Torre Prototipo", from: "2026-10", source: "stone (piloto)", by: "admin demo" },
  { scope: "[DEMO] Terreno Baldío Sur", from: "2026-01", source: "stone", by: "admin demo" },
];

function Mark({ v }: { v: boolean | string }) {
  if (v === true) return <span className="text-ok">✔</span>;
  if (v === false) return <span className="text-muted-foreground">✖</span>;
  return <span className="text-xs text-amber-700 dark:text-warn">{v}</span>;
}

export default function ConfiguracionPage() {
  return (
    <>
      <PageHeader
        eyebrow="Solo administradores"
        title="Configuración"
        description="Usuarios, roles, catálogos, importaciones y fuente de verdad por alcance y período."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-0">
          <div className="px-4 pt-4"><SectionTitle hint="Se hace cumplir en servidor y RLS">Matriz de roles</SectionTitle></div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Capacidad</TableHead>
                <TableHead className="text-center">Admin</TableHead>
                <TableHead className="text-center">Administración</TableHead>
                <TableHead className="text-center">Consulta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROLES.map((r) => (
                <TableRow key={r.cap}>
                  <TableCell className="text-sm">{r.cap}</TableCell>
                  <TableCell className="text-center"><Mark v={r.admin} /></TableCell>
                  <TableCell className="text-center"><Mark v={r.op} /></TableCell>
                  <TableCell className="text-center"><Mark v={r.viewer} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="space-y-4">
          <Card className="p-0">
            <div className="px-4 pt-4"><SectionTitle hint="Transición Excel → Stone (spec §9)">Fuente de verdad por alcance</SectionTitle></div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alcance</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Autorizó</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SOT.map((s) => (
                  <TableRow key={s.scope}>
                    <TableCell>{s.scope}</TableCell>
                    <TableCell className="tnum">{s.from}</TableCell>
                    <TableCell><span className={`rounded px-1.5 py-0.5 text-xs ${s.source.startsWith("stone") ? "bg-stone-accent/15 text-stone-accent" : "bg-muted"}`}>{s.source}</span></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.by}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="px-4 pb-4 text-[11px] text-muted-foreground">Regla: no pueden existir dos flujos generando cargos para el mismo contrato/período/concepto.</p>
          </Card>

          <Card className="gap-2 p-4">
            <SectionTitle>Usuarios (demo)</SectionTitle>
            <ul className="divide-y text-sm">
              <li className="flex justify-between py-2"><span>Administrador familiar (demo)</span><span className="text-xs text-muted-foreground">admin</span></li>
              <li className="flex justify-between py-2"><span>Administración inmobiliaria (demo)</span><span className="text-xs text-muted-foreground">operator</span></li>
              <li className="flex justify-between py-2"><span>Consulta familiar (demo)</span><span className="text-xs text-muted-foreground">viewer</span></li>
            </ul>
            <p className="text-[11px] text-muted-foreground">Acceso solo por invitación (Supabase Auth, Iteración 1). Sin registro público.</p>
          </Card>

          <Card className="gap-2 p-4">
            <SectionTitle>Importaciones</SectionTitle>
            <p className="text-sm text-muted-foreground">Wizard XLSX/CSV con archivo inmutable, mapeo, validación, clasificación de filas y aprobación por fila o lote. Se construye en Iteración 2, una vez recibido el Excel original.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
