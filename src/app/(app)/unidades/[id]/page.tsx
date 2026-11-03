import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Lock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionTitle } from "@/components/patrimonio/kpi-card";
import { DataStateBadge, OccupancyDot, ScopeBadge } from "@/components/patrimonio/data-state-badge";
import { PhotoCover } from "@/components/patrimonio/photo-cover";
import { StatusPill } from "@/components/forms/status-pill";
import { hasRole, requireMember } from "@/lib/auth/session";
import { getUnitDetail, listDevelopmentCovers, listDevelopmentPoints } from "@/lib/data/patrimonio";
import { DevelopmentPointMap } from "@/components/mapa/development-point-map";
import { DOC_KIND, OCCUPANCY_KEY, SENSITIVITY, SURFACE_LABEL, UNIT_KIND } from "@/lib/patrimonio/labels";
import { CHARGE_STATUS, CONCEPT_LABEL, EXPENSE_CATEGORY, EXPENSE_CLASS, LEASE_STATUS } from "@/lib/rentas/labels";
import { today as todayFn } from "@/lib/data/now";
import { daysUntil, fmtAmt, fmtDate, fmtM2, fmtMXN, fmtPeriod } from "@/lib/format";

export const instant = false;

export default async function UnitPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireMember();
  const canOperate = hasRole(me.membership.role, "operator");
  const { id } = await params;
  const data = await getUnitDetail(id);
  if (!data || data.unit.referenceOnly) notFound();
  const { unit: u, surfaces, leases, charges, expenses, documents } = data;
  const point = u.developmentId ? ((await listDevelopmentPoints()).find((p) => p.id === u.developmentId) ?? null) : null;
  const cover = u.developmentId ? ((await listDevelopmentCovers()).get(u.developmentId) ?? null) : null;
  const today = await todayFn();
  const rentable = surfaces.find((s) => s.kind === "rentable");
  const activeLease = leases.find((l) => l.status === "active");
  const alerts = [
    !point && { text: "Sin ubicación capturada: no aparece en el mapa.", cls: "bg-info-soft text-info" },
    { text: "Datos legales no disponibles en el reporte mensual.", cls: "bg-info-soft text-info" },
    charges.some((c) => c.status === "overdue") && { text: "Cargos vencidos con saldo.", cls: "bg-danger-soft text-danger" },
    activeLease?.endDate && daysUntil(activeLease.endDate, today) <= 60 && { text: `Contrato por vencer: ${fmtDate(activeLease.endDate)}.`, cls: "bg-warning-soft text-warning" },
    activeLease && !activeLease.endDate && { text: "Contrato activo sin fecha de vencimiento capturada.", cls: "bg-warning-soft text-warning" },
    u.occupancy === "unknown" && { text: "Sin contrato vigente registrado; no se asume disponible hasta validar.", cls: "bg-surface-2 text-ink-2" },
  ].filter((a): a is { text: string; cls: string } => Boolean(a));

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <PhotoCover documentId={cover} alt={u.developmentName ?? u.name} tone="navy" className="hidden size-24 shrink-0 rounded-lg sm:block">
            {!cover && <span className="absolute inset-0 grid place-items-center text-xs text-white/85">Sin foto</span>}
          </PhotoCover>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-ink-3">{u.code}</span>
              <ScopeBadge referenceOnly={false} />
              <OccupancyDot occupancy={OCCUPANCY_KEY[u.occupancy] ?? "desconocida"} />
            </div>
            <h1 className="font-display mt-1 text-[30px] leading-9 font-semibold text-ink">{u.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-2">
              <span className="flex items-center gap-1"><MapPin className="size-3.5" />{u.developmentId ? <Link href={`/propiedades/${u.developmentId}`} className="hover:underline">{u.developmentName}</Link> : "Propiedad independiente"}</span>
              <span>{UNIT_KIND[u.kind] ?? u.kind}</span>
              {u.ownerName && <span>Titular: <span className="text-ink">{u.ownerName}</span></span>}
              {u.tenantName && <span>Arrendatario: <span className="text-ink">{u.tenantName}</span></span>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-ink-3">Superficie rentable</div>
          <div className="tnum text-lg font-semibold">{fmtM2(rentable?.valueM2)}</div>
        </div>
      </div>

      <Tabs defaultValue="resumen">
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="terreno">Terreno y ubicación</TabsTrigger>
          <TabsTrigger value="legal"><Lock className="size-3" /> Legal y fiscal</TabsTrigger>
          <TabsTrigger value="comercial">Contratos</TabsTrigger>
          <TabsTrigger value="finanzas">Finanzas</TabsTrigger>
          <TabsTrigger value="docs">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card className="gap-3 p-4 lg:col-span-2">
            <SectionTitle>Descripción</SectionTitle>
            <p className="text-sm text-ink-2">
              {UNIT_KIND[u.kind] ?? u.kind}{u.developmentName ? ` en ${u.developmentName}` : ""}. {u.notes ?? "Sin descripción adicional."}
            </p>
            <dl className="grid grid-cols-2 gap-4 text-sm xl:grid-cols-4">
              <Field k="Propietario legal" v={u.ownerName ?? "—"} state={u.ownerName ? "por_verificar" : "no_disponible"} />
              <Field k="Administra" v="Stone Inmuebles" state="confirmado" />
              <Field k="Disponibilidad" v={u.occupancy === "occupied" ? "Ocupada" : u.occupancy === "vacant" ? "Disponible" : u.occupancy === "unknown" ? "Sin validar" : "No aplica"} state={u.occupancy === "unknown" ? "por_verificar" : "confirmado"} />
              <Field k={u.currentRent != null ? "Renta vigente" : "Renta de lista"} v={u.currentRent != null ? fmtMXN(u.currentRent) : u.listRent != null ? fmtMXN(u.listRent) : "—"} state={u.currentRent != null ? "confirmado" : u.listRent != null ? "por_verificar" : "no_disponible"} hint="Con IVA · mensual" />
            </dl>
          </Card>
          <Card className="gap-3 p-4">
            <SectionTitle>Alertas</SectionTitle>
            <ul className="space-y-2 text-sm">
              {alerts.map((a) => (
                <li key={a.text} className={`rounded-md p-2 ${a.cls}`}>{a.text}</li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="terreno" className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
          <Card className="overflow-hidden p-0">
            {point ? (
              <>
                <div className="border-b px-4 py-2 text-xs text-ink-3">Ubicación del inmueble ({point.name}) · ± {point.precisionM ?? "?"} m · la unidad no tiene polígono propio</div>
                <DevelopmentPointMap id={point.id} name={point.name} lon={point.lon} lat={point.lat} address={point.address} className="h-[360px] w-full" />
              </>
            ) : (
              <div className="grid h-[360px] place-items-center text-center text-sm text-ink-3">
                <div>
                  <div className="mx-auto mb-2 size-8 rounded-full border-2 border-dashed border-ink-3 bg-surface-2" />
                  Pendiente de ubicación. No se dibujan límites ficticios.
                </div>
              </div>
            )}
          </Card>
          <div className="space-y-4">
            <Card className="gap-3 p-4">
              <SectionTitle hint="Guardadas por separado">Superficies</SectionTitle>
              <dl className="space-y-2.5 text-sm">
                {(["legal", "cadastral", "built", "rentable", "gis_estimate"] as const).map((k) => {
                  const s = surfaces.find((x) => x.kind === k);
                  return (
                    <div key={k} className="flex items-center justify-between gap-3">
                      <dt className="text-ink-2">{SURFACE_LABEL[k]}</dt>
                      <dd className="flex items-center gap-2">
                        <span className="tnum font-medium">{fmtM2(s?.valueM2)}</span>
                        <DataStateBadge state={s?.verification ?? "no_disponible"} />
                      </dd>
                    </div>
                  );
                })}
              </dl>
              <p className="text-[11px] text-ink-3">La superficie rentable viene del reporte mensual (Portafolio). Legal y catastral se capturan desde escritura y boleta predial.</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="legal" className="mt-4">
          <Card className="gap-3 p-4">
            <div className="flex items-center justify-between">
              <SectionTitle>Expediente legal y fiscal</SectionTitle>
              <DataStateBadge state="no_disponible" />
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <Field k="Escritura" v="—" state="no_disponible" />
              <Field k="Folio real" v="—" state="no_disponible" />
              <Field k="Notaría" v="—" state="no_disponible" />
              <Field k="Clave catastral" v="—" state="no_disponible" />
              <Field k="Uso de suelo" v="—" state="no_disponible" />
              <Field k="Titular" v={u.ownerName ?? "—"} state={u.ownerName ? "por_verificar" : "no_disponible"} />
            </dl>
            <p className="text-[11px] text-ink-3">Estos datos no están en el reporte mensual. Se llenan al cargar las escrituras y boletas al expediente; documentos sensibles solo para Administrador.</p>
          </Card>
        </TabsContent>

        <TabsContent value="comercial" className="mt-4 space-y-4">
          <Card className="p-0">
            <div className="flex items-center justify-between px-4 pt-4">
              <SectionTitle hint={`${leases.length} contrato(s)`}>Contratos</SectionTitle>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arrendatario</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead className="text-right">Renta vigente</TableHead>
                  <TableHead className="text-right">Versiones</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Validación</TableHead>
                  <TableHead className="w-0"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leases.map((l) => {
                  const st = LEASE_STATUS[l.status] ?? LEASE_STATUS.active;
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.tenantName}</TableCell>
                      <TableCell className="text-xs">{l.startDate ? fmtDate(l.startDate) : "sin inicio"} → {l.endDate ? fmtDate(l.endDate) : "sin vencimiento"}</TableCell>
                      <TableCell className="tnum text-right">{l.rentTotal != null ? fmtMXN(l.rentTotal) : "-"}</TableCell>
                      <TableCell className="tnum text-right text-xs">{l.termsCount}</TableCell>
                      <TableCell><StatusPill label={st.label} cls={st.cls} /></TableCell>
                      <TableCell><DataStateBadge state={l.verification} /></TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm"><Link href={`/contratos/${l.id}/condiciones`}>Condiciones</Link></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {leases.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="py-6 text-center text-ink-3">Sin contratos registrados. No implica disponibilidad.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="finanzas" className="mt-4 space-y-4">
          {!canOperate ? (
            <Card className="p-4 text-sm text-ink-2">Los cargos y gastos de la unidad solo los ven Administración y el Administrador.</Card>
          ) : (
            <>
              <Card className="p-0">
                <div className="px-4 pt-4"><SectionTitle hint="MXN con IVA">Cargos de la unidad</SectionTitle></div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Folio</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Pagado</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {charges.map((c) => {
                      const st = CHARGE_STATUS[c.status] ?? CHARGE_STATUS.open;
                      return (
                        <TableRow key={c.id}>
                          <TableCell>{fmtPeriod(c.period)}</TableCell>
                          <TableCell className="text-xs">{CONCEPT_LABEL[c.concept] ?? c.concept}</TableCell>
                          <TableCell className="font-mono text-xs text-ink-3">{c.folio ?? "-"}</TableCell>
                          <TableCell className="tnum text-right font-medium">{fmtAmt(c.netTotal)}</TableCell>
                          <TableCell className="tnum text-right">{fmtAmt(c.paid)}</TableCell>
                          <TableCell className={`tnum text-right ${c.status === "overdue" ? "font-semibold text-danger" : c.balance > 0.005 ? "font-semibold text-warning" : ""}`}>{fmtAmt(c.balance)}</TableCell>
                          <TableCell><StatusPill label={st.label} cls={st.cls} /></TableCell>
                        </TableRow>
                      );
                    })}
                    {charges.length === 0 && <TableRow><TableCell colSpan={7} className="py-6 text-center text-ink-3">Sin cargos registrados para esta unidad.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </Card>
              <Card className="p-0">
                <div className="px-4 pt-4"><SectionTitle hint="Independientes de los cargos al arrendatario">Gastos atribuibles</SectionTitle></div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mes</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Clasificación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((e) => {
                      const cl = EXPENSE_CLASS[e.classification] ?? EXPENSE_CLASS.pending;
                      return (
                        <TableRow key={e.id}>
                          <TableCell>{e.period ? fmtPeriod(e.period) : "-"}</TableCell>
                          <TableCell className="text-xs">{EXPENSE_CATEGORY[e.category] ?? e.category}</TableCell>
                          <TableCell className="text-ink-2">{e.vendor ?? "-"}</TableCell>
                          <TableCell className="tnum text-right">{fmtAmt(e.total)}</TableCell>
                          <TableCell><StatusPill label={cl.label} cls={cl.cls} /></TableCell>
                        </TableRow>
                      );
                    })}
                    {expenses.length === 0 && <TableRow><TableCell colSpan={5} className="py-6 text-center text-ink-3">Sin gastos directos; los del inmueble se consultan en Rentas → Gastos.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Sensibilidad</TableHead>
                  <TableHead>Actualizado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((d) => {
                  const s = SENSITIVITY[d.sensitivity] ?? SENSITIVITY.restricted;
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium"><FileText className="mr-1.5 inline size-4 text-ink-3" strokeWidth={1.5} />{d.title}</TableCell>
                      <TableCell>{DOC_KIND[d.kind] ?? d.kind}</TableCell>
                      <TableCell><StatusPill label={s.label} cls={s.cls} /></TableCell>
                      <TableCell>{fmtDate(d.updatedAt.slice(0, 10))}</TableCell>
                    </TableRow>
                  );
                })}
                {documents.length === 0 && <TableRow><TableCell colSpan={4} className="py-6 text-center text-ink-3">Sin documentos ligados a esta unidad.</TableCell></TableRow>}
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
      <dt className="text-xs text-ink-3">{k}</dt>
      <dd className="font-medium">{v}</dd>
      <div className="mt-1"><DataStateBadge state={state} />{hint && <div className="mt-1 text-[11px] text-ink-3">{hint}</div>}</div>
    </div>
  );
}
