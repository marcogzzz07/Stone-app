import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Lock, MapPin, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionTitle } from "@/components/patrimonio/kpi-card";
import { DataStateBadge, OccupancyDot, ScopeBadge } from "@/components/patrimonio/data-state-badge";
import { TODAY, units } from "@/lib/mock/data";
import {
  chargeBalance,
  chargesOfUnit,
  currentTerm,
  docsOf,
  expensesOfUnit,
  getDevelopment,
  getEntity,
  getTenant,
  getUnit,
  isOverdue,
  leasesOfUnit,
} from "@/lib/mock/queries";
import { fmtDate, fmtM2, fmtMXN, fmtPeriod } from "@/lib/format";
import { UnitMap } from "./unit-map";

export const instant = false;

export function generateStaticParams() {
  return units.filter((u) => !u.referenceOnly).map((u) => ({ id: u.id }));
}

const SURFACE_LABEL: Record<string, string> = {
  legal: "Superficie legal / escritura",
  cadastral: "Superficie catastral",
  built: "Superficie construida",
  rentable: "Superficie rentable",
  gis_estimate: "Área aproximada (polígono)",
};

const CHARGE_STATUS: Record<string, string> = {
  draft: "Propuesta",
  open: "Exigible",
  partially_paid: "Pago parcial",
  paid: "Pagado",
  void: "Anulado",
};

export default async function UnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = getUnit(id);
  if (!u || u.referenceOnly) notFound();
  const dev = u.developmentId ? getDevelopment(u.developmentId) : undefined;
  const owner = u.ownerEntityId ? getEntity(u.ownerEntityId) : undefined;
  const ls = leasesOfUnit(u.id);
  const cs = chargesOfUnit(u.id);
  const es = expensesOfUnit(u.id);
  const ds = docsOf("unit", u.id);
  const legal = u.surfaces.find((s) => s.kind === "legal");

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="hidden size-24 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-stone-300 to-stone-500 text-xs text-white/80 sm:grid">
            Sin foto
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{u.code}</span>
              <ScopeBadge referenceOnly={false} />
              <OccupancyDot occupancy={u.occupancy} />
            </div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{u.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="size-3.5" />{dev ? <Link href={`/propiedades/${dev.id}`} className="hover:underline">{dev.name}</Link> : "Propiedad independiente"}</span>
              <span className="capitalize">{u.kind}</span>
              <span>Titular: <span className="text-foreground">{owner?.name ?? "—"}</span></span>
              <span>Administra: <span className="text-foreground">Stone (demo)</span></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[11px] text-muted-foreground">Superficie legal</div>
            <div className="tnum text-lg font-semibold">{fmtM2(legal?.valueM2)}</div>
          </div>
          <Button variant="outline" size="sm" disabled><Pencil className="size-3.5" /> Editar (admin)</Button>
        </div>
      </div>

      <Tabs defaultValue="resumen">
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="terreno">Terreno y ubicación</TabsTrigger>
          <TabsTrigger value="legal"><Lock className="size-3" /> Legal y fiscal</TabsTrigger>
          <TabsTrigger value="comercial">Comercial y contratos</TabsTrigger>
          <TabsTrigger value="finanzas">Finanzas</TabsTrigger>
          <TabsTrigger value="docs">Documentos e historial</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card className="gap-3 p-4 lg:col-span-2">
            <SectionTitle>Descripción</SectionTitle>
            <p className="text-sm text-muted-foreground">
              Unidad sintética para validar la experiencia de la ficha. Tipo <span className="capitalize text-foreground">{u.kind}</span>
              {dev && <> dentro de <span className="text-foreground">{dev.name}</span></>}. {u.photosNote}.
            </p>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Field k="Propietario legal" v={owner?.name ?? "—"} state={owner ? "confirmado" : "no_disponible"} />
              <Field k="Administrador" v="Stone Inmuebles (demo)" state="confirmado" />
              <Field k="Disponibilidad" v={u.occupancy === "ocupada" ? "Ocupada" : u.occupancy === "disponible" ? "Disponible" : u.occupancy === "desconocida" ? "Sin validar" : "No aplica"} state={u.occupancy === "desconocida" ? "por_verificar" : "confirmado"} />
              <Field k="Renta de lista" v={u.listRent != null ? fmtMXN(u.listRent) : "—"} state={u.listRent != null ? "por_verificar" : "no_disponible"} hint="Con IVA · no es ingreso" />
            </dl>
          </Card>
          <Card className="gap-3 p-4">
            <SectionTitle>Alertas</SectionTitle>
            <ul className="space-y-2 text-sm">
              {u.geometry.type === "pending" && <li className="rounded-md bg-warn/15 p-2">Geometría pendiente de trazo: sin límites en mapa.</li>}
              {u.legal.state !== "confirmado" && <li className="rounded-md bg-warn/15 p-2">Datos legales por verificar.</li>}
              {cs.some((c) => isOverdue(c, TODAY)) && <li className="rounded-md bg-destructive/10 p-2">Cargos vencidos con saldo.</li>}
              {ls.some((l) => l.status === "active" && l.endDate <= "2026-12-31") && <li className="rounded-md bg-warn/15 p-2">Contrato por vencer en ≤ 60 días.</li>}
              {u.occupancy === "desconocida" && <li className="rounded-md bg-muted p-2">Sin contrato vigente registrado; no se asume disponible hasta validar.</li>}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="terreno" className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
          <Card className="overflow-hidden p-0">
            {u.geometry.type === "Polygon" ? (
              <UnitMap unitId={u.id} />
            ) : (
              <div className="grid h-[360px] place-items-center text-center text-sm text-muted-foreground">
                <div>
                  <div className="mx-auto mb-2 size-8 rounded-full border-2 border-warn bg-warn/30" />
                  Pendiente de trazo. No se dibujan límites ficticios.
                </div>
              </div>
            )}
          </Card>
          <div className="space-y-4">
            <Card className="gap-3 p-4">
              <SectionTitle hint="Guardadas por separado">Superficies</SectionTitle>
              <dl className="space-y-2.5 text-sm">
                {(["legal", "cadastral", "built", "rentable", "gis_estimate"] as const).map((k) => {
                  const s = u.surfaces.find((x) => x.kind === k);
                  return (
                    <div key={k} className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">{SURFACE_LABEL[k]}</dt>
                      <dd className="flex items-center gap-2">
                        <span className="tnum font-medium">{fmtM2(s?.valueM2)}</span>
                        <DataStateBadge state={s?.state ?? "no_disponible"} />
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </Card>
            <Card className="gap-3 p-4">
              <SectionTitle>Geometría</SectionTitle>
              <dl className="space-y-1.5 text-sm">
                <Row k="Tipo" v={u.geometry.type === "pending" ? "Pendiente de trazo" : u.geometry.type} />
                <Row k="Fuente" v={u.geometry.source} />
                <Row k="SRID" v="EPSG:4326" />
                <Row k="Precisión" v={u.geometry.precisionM != null ? `± ${u.geometry.precisionM} m` : "—"} />
                <Row k="Captura" v={u.geometry.capturedAt} />
                <Row k="Perímetro calculado" v={u.geometry.perimeterMEst != null ? `${u.geometry.perimeterMEst} m` : "—"} />
              </dl>
              <p className="text-[11px] text-muted-foreground">Medidas y colindancias por lindero solo se muestran si provienen de plano o captura validada. En esta unidad: no disponibles.</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="legal" className="mt-4">
          <Card className="gap-3 p-4">
            <div className="flex items-center justify-between">
              <SectionTitle>Expediente legal y fiscal</SectionTitle>
              <DataStateBadge state={u.legal.state} />
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <Field k="Escritura" v={u.legal.deed} state={u.legal.state} />
              <Field k="Folio real" v={u.legal.folio} state={u.legal.state} />
              <Field k="Notaría" v={u.legal.notary} state={u.legal.state} />
              <Field k="Clave catastral" v={u.legal.cadastralKey} state={u.legal.state} />
              <Field k="Uso de suelo" v={u.legal.landUse} state={u.legal.state} />
              <Field k="RFC titular" v={owner?.rfcMasked ?? "—"} state="confirmado" hint="Enmascarado para este rol" />
            </dl>
            <p className="text-[11px] text-muted-foreground">
              Esta pestaña se restringe por rol (admin y, configurable, administración). Los documentos sensibles se abren con enlace temporal.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="comercial" className="mt-4 space-y-4">
          <Card className="p-0">
            <div className="flex items-center justify-between px-4 pt-4">
              <SectionTitle hint={`${ls.length} contrato(s)`}>Contratos</SectionTitle>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arrendatario</TableHead>
                  <TableHead>Arrendadora</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead className="text-right">Renta base vigente</TableHead>
                  <TableHead className="text-right">Depósito</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Validación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ls.map((l) => {
                  const t = currentTerm(l.id, TODAY) ?? l.terms[l.terms.length - 1];
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{getTenant(l.tenantId)?.name}</TableCell>
                      <TableCell className="text-muted-foreground">{getEntity(l.lessorEntityId)?.name}</TableCell>
                      <TableCell className="text-xs">{fmtDate(l.startDate)} → {fmtDate(l.endDate)}</TableCell>
                      <TableCell className="tnum text-right">{fmtMXN(t.baseRent)} <span className="text-xs text-muted-foreground">+ IVA</span></TableCell>
                      <TableCell className="tnum text-right">{fmtMXN(t.deposit)}</TableCell>
                      <TableCell><span className="rounded bg-muted px-1.5 py-0.5 text-xs capitalize">{l.status}</span></TableCell>
                      <TableCell><DataStateBadge state={l.validation} /></TableCell>
                    </TableRow>
                  );
                })}
                {ls.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Sin contratos registrados. No implica disponibilidad.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
          {ls.filter((l) => l.terms.length > 1).map((l) => (
            <Card key={l.id} className="gap-2 p-4">
              <SectionTitle hint="lease_terms versionadas">Condiciones económicas — {getTenant(l.tenantId)?.name}</SectionTitle>
              <ol className="relative ml-2 border-l pl-4 text-sm">
                {l.terms.map((t) => (
                  <li key={t.effectiveFrom} className="mb-3">
                    <span className="absolute -left-[5px] mt-1.5 size-2 rounded-full bg-stone-accent" />
                    <div className="text-xs text-muted-foreground">Desde {fmtDate(t.effectiveFrom)}</div>
                    <div className="tnum">{fmtMXN(t.baseRent)} {t.currency} / {t.periodicity} · vence día {t.dueDay}</div>
                    {t.increaseRule && <div className="text-xs text-muted-foreground">Incremento: {t.increaseRule}</div>}
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="finanzas" className="mt-4 space-y-4">
          <Card className="p-0">
            <div className="px-4 pt-4"><SectionTitle hint="MXN · subtotal / IVA / total">Cargos de la unidad</SectionTitle></div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">IVA</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Origen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cs.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell >{fmtPeriod(c.period)}</TableCell>
                    <TableCell className="text-muted-foreground">{c.concept.replace("_", " ")}</TableCell>
                    <TableCell className="tnum text-right">{fmtMXN(c.subtotal)}</TableCell>
                    <TableCell className="tnum text-right text-muted-foreground">{fmtMXN(c.tax)}</TableCell>
                    <TableCell className="tnum text-right font-medium">{fmtMXN(c.total)}</TableCell>
                    <TableCell className={`tnum text-right ${isOverdue(c, TODAY) ? "font-medium text-destructive" : ""}`}>{fmtMXN(chargeBalance(c))}</TableCell>
                    <TableCell><span className="rounded bg-muted px-1.5 py-0.5 text-xs">{CHARGE_STATUS[c.status]}{isOverdue(c, TODAY) && " · vencido"}</span></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.source}</TableCell>
                  </TableRow>
                ))}
                {cs.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Sin cargos. Terreno sin renta.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
          <Card className="p-0">
            <div className="px-4 pt-4"><SectionTitle hint="Independientes de los cargos al arrendatario">Gastos atribuibles</SectionTitle></div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Clasificación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {es.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell >{fmtPeriod(e.period)}</TableCell>
                    <TableCell className="capitalize">{e.category}</TableCell>
                    <TableCell className="text-muted-foreground">{e.vendor}</TableCell>
                    <TableCell className="tnum text-right">{fmtMXN(e.total)}</TableCell>
                    <TableCell className="text-xs">{e.paid ? "Pagado" : "Por pagar"}</TableCell>
                    <TableCell><span className="rounded bg-muted px-1.5 py-0.5 text-xs">{e.classification.replace("_", " ")}</span></TableCell>
                  </TableRow>
                ))}
                {es.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Sin gastos directos; los gastos del desarrollo se consultan en su ficha.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
          <p className="text-[11px] text-muted-foreground">
            El resultado operativo neto (NOI estimado) se mostrará solo cuando cargos, cobros y gastos de la unidad estén clasificados y conciliados.
          </p>
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Sensibilidad</TableHead>
                  <TableHead>Versión</TableHead>
                  <TableHead>Actualizado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ds.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium"><FileText className="mr-1.5 inline size-4 text-muted-foreground" />{d.name}</TableCell>
                    <TableCell className="capitalize">{d.kind}</TableCell>
                    <TableCell><span className={`rounded px-1.5 py-0.5 text-xs ${d.sensitivity === "sensible" ? "bg-destructive/10 text-destructive" : d.sensitivity === "restringido" ? "bg-warn/20" : "bg-muted"}`}>{d.sensitivity}</span></TableCell>
                    <TableCell className="tnum">v{d.version}</TableCell>
                    <TableCell>{fmtDate(d.updatedAt)}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm" disabled>Abrir (enlace temporal)</Button></TableCell>
                  </TableRow>
                ))}
                {ds.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Sin documentos cargados.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function Field({ k, v, state, hint }: { k: string; v: string; state: "confirmado" | "por_verificar" | "no_disponible"; hint?: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="font-medium">{v}</dd>
      <div className="mt-1 flex items-center gap-2"><DataStateBadge state={state} />{hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="tnum text-right">{v}</dd>
    </div>
  );
}
