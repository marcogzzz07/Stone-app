import Link from "next/link";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, SectionTitle } from "@/components/patrimonio/kpi-card";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/forms/notice";
import { requireRole, ROLE_LABEL, type AppRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/format";
import { InviteForm } from "./invite-form";
import { revokeInvitation, setMemberRole } from "./actions";

export const instant = false;

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
  { scope: "Todos los inmuebles · enero a septiembre 2026", from: "2026-01", source: "excel", by: "Marco (carga histórica, 2 nov 2026)" },
  { scope: "Todos los inmuebles · octubre 2026 en adelante", from: "2026-10", source: "stone", by: "Marco" },
];

function Mark({ v }: { v: boolean | string }) {
  if (v === true) return <Check className="mx-auto size-4 text-ok" aria-label="Sí" />;
  if (v === false) return <X className="mx-auto size-4 text-muted-foreground/60" aria-label="No" />;
  return <span className="text-xs text-warning dark:text-warn">{v}</span>;
}

export default async function ConfiguracionPage() {
  const me = await requireRole("admin");
  const supabase = await createClient();
  const [{ data: members }, { data: invitations }] = await Promise.all([
    supabase
      .from("memberships")
      .select("id, role, status, profile_id, created_at, profiles(full_name, email)")
      .eq("org_id", me.membership.orgId)
      .order("created_at"),
    supabase
      .from("invitations")
      .select("id, email, role, status, expires_at, created_at")
      .eq("org_id", me.membership.orgId)
      .eq("status", "pending")
      .order("created_at"),
  ]);
  const serviceKeyMissing = !process.env.SUPABASE_SERVICE_ROLE_KEY;

  return (
    <>
      <PageHeader
        title="Configuración"
        description="Usuarios, roles, importaciones y fuente de verdad."
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
                    <TableCell><span className={`rounded px-1.5 py-0.5 text-xs ${s.source.startsWith("stone") ? "bg-info-soft text-info" : "bg-muted"}`}>{s.source}</span></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.by}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="px-4 pb-4 text-[11px] text-muted-foreground">Regla: no pueden existir dos flujos generando cargos para el mismo contrato/período/concepto.</p>
          </Card>

          <Card className="gap-3 p-4">
            <SectionTitle hint="Acceso solo por invitación">Usuarios</SectionTitle>
            {serviceKeyMissing && (
              <Notice tone="info" title="Los correos de invitación se envían desde el dashboard de Supabase">
                Aquí se registra el acceso y el rol; el correo lo manda Supabase (Authentication → Users → Invite user) hasta que se configure la clave de servidor.
              </Notice>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Desde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(members ?? []).map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="font-medium">{m.profiles?.full_name || m.profiles?.email}</div>
                      {m.profiles?.full_name && <div className="text-xs text-ink-3">{m.profiles.email}</div>}
                    </TableCell>
                    <TableCell>
                      {m.profile_id === me.id ? (
                        <span className="text-sm">{ROLE_LABEL[m.role]} <span className="text-xs text-ink-3">(tú)</span></span>
                      ) : (
                        <form action={setMemberRole} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={m.id} />
                          <select
                            name="role"
                            defaultValue={m.role}
                            className="h-7 rounded-md border border-input bg-transparent px-2 text-sm"
                          >
                            {(["admin", "operator", "viewer"] as AppRole[]).map((r) => (
                              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                            ))}
                          </select>
                          <Button type="submit" variant="ghost" size="sm">Guardar</Button>
                        </form>
                      )}
                    </TableCell>
                    <TableCell className="tnum text-right text-xs text-ink-3">{fmtDate(m.created_at)}</TableCell>
                  </TableRow>
                ))}
                {(invitations ?? []).map((i) => (
                  <TableRow key={i.id} className="text-ink-2">
                    <TableCell>
                      <div>{i.email}</div>
                      <div className="text-xs text-warning">Invitación pendiente · vence {fmtDate(i.expires_at)}</div>
                    </TableCell>
                    <TableCell className="text-sm">{ROLE_LABEL[i.role]}</TableCell>
                    <TableCell className="text-right">
                      <form action={revokeInvitation}>
                        <input type="hidden" name="id" value={i.id} />
                        <Button type="submit" variant="ghost" size="sm">Revocar</Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
                {!members?.length && !invitations?.length && (
                  <TableRow><TableCell colSpan={3} className="text-center text-sm text-ink-3">Sin usuarios todavía.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
            <div className="border-t pt-4">
              <div className="mb-3 text-sm font-semibold text-ink-2">Invitar a alguien</div>
              <InviteForm />
            </div>
          </Card>

          <Card className="gap-2 p-4">
            <SectionTitle>Importaciones</SectionTitle>
            <p className="text-sm text-muted-foreground">El histórico del reporte mensual ya está cargado. Las diferencias que no cuadraron entre hojas se revisan y se marcan una por una.</p>
            <Button asChild variant="outline" className="w-fit"><Link href="/configuracion/importaciones">Ver cargas y discrepancias</Link></Button>
          </Card>
        </div>
      </div>
    </>
  );
}
