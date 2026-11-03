"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/forms/field";
import { Notice } from "@/components/forms/notice";
import { NativeSelect, Textarea } from "@/components/forms/native-select";
import { FormSection, SubmitBar } from "@/components/forms/form-shell";
import { fmtMXN } from "@/lib/format";
import { EXPENSE_CATEGORY, EXPENSE_CLASS, TAX_RATE, round2, thisMonth } from "@/lib/rentas/labels";
import { createExpense, type FormState } from "../../actions";

interface Opt { id: string; name: string }
interface UnitOpt { id: string; code: string; name: string; developmentId: string | null }
interface ShareRow { key: number; party: string; pct: string; factor: string; note: string }

let seq = 0;
const newRow = (): ShareRow => ({ key: ++seq, party: "", pct: "", factor: "1", note: "" });

export function ExpenseForm({
  developments,
  units,
  entities,
  tenants,
}: {
  developments: Opt[];
  units: UnitOpt[];
  entities: { id: string; name: string; isStone: boolean }[];
  tenants: Opt[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(createExpense, undefined);
  const [developmentId, setDevelopmentId] = useState(developments[0]?.id ?? "");
  const [unitId, setUnitId] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [tax, setTax] = useState("");
  const [rows, setRows] = useState<ShareRow[]>([]);

  const total = round2((Number(subtotal) || 0) + (Number(tax) || 0));
  const unitChoices = units.filter((u) => !developmentId || u.developmentId === developmentId || u.developmentId == null);
  const sharesTotal = round2(rows.reduce((s, r) => s + (total * (Number(r.pct) || 0)) / 100 * (Number(r.factor) || 1), 0));
  const pctTotal = round2(rows.reduce((s, r) => s + (Number(r.pct) || 0), 0));

  const update = (key: number, patch: Partial<ShareRow>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  return (
    <form action={action} className="flex flex-col gap-6">
      {state?.error && <Notice tone="danger" title="No se pudo registrar el gasto">{state.error}</Notice>}
      {state?.warning && <Notice tone="warning" title="Falta un paso">{state.warning}</Notice>}

      <FormSection title="Gasto" hint="MXN">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Inmueble" htmlFor="development_id" help="Deja vacío si el gasto es de una unidad suelta.">
            <NativeSelect
              id="development_id"
              name="development_id"
              value={developmentId}
              onChange={(e) => {
                setDevelopmentId(e.target.value);
                setUnitId("");
              }}
            >
              <option value="">Sin inmueble</option>
              {developments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Unidad" htmlFor="unit_id" help="Opcional. Solo unidades Stone.">
            <NativeSelect id="unit_id" name="unit_id" value={unitId} onChange={(e) => setUnitId(e.target.value)}>
              <option value="">Todo el inmueble</option>
              {unitChoices.map((u) => (
                <option key={u.id} value={u.id}>{u.code} · {u.name}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Categoría" htmlFor="category">
            <NativeSelect id="category" name="category" defaultValue="maintenance">
              {Object.entries(EXPENSE_CATEGORY).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Proveedor" htmlFor="vendor">
            <Input id="vendor" name="vendor" autoComplete="off" placeholder="CFE, administración, despacho…" />
          </Field>
          <Field label="Mes de consumo" htmlFor="period">
            <Input id="period" name="period" type="month" defaultValue={thisMonth()} />
          </Field>
          <Field label="Fecha de cobro del proveedor" htmlFor="charged_at" help="Opcional.">
            <Input id="charged_at" name="charged_at" type="date" />
          </Field>
          <Field label="Subtotal (sin IVA)" htmlFor="subtotal">
            <Input id="subtotal" name="subtotal" type="number" inputMode="decimal" step="0.01" min="0" required className="tnum text-right" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} placeholder="0.00" />
          </Field>
          <Field label="IVA" htmlFor="tax_amount" help="0 si no causa IVA (predial, agua).">
            <div className="flex gap-2">
              <Input id="tax_amount" name="tax_amount" type="number" inputMode="decimal" step="0.01" min="0" required className="tnum text-right" value={tax} onChange={(e) => setTax(e.target.value)} placeholder="0.00" />
              <button type="button" className="shrink-0 rounded-lg border border-input px-2 text-xs text-ink-2 hover:bg-surface-2" onClick={() => setTax(round2((Number(subtotal) || 0) * TAX_RATE).toFixed(2))}>
                16 %
              </button>
            </div>
          </Field>
          <Field label="Clasificación" htmlFor="classification" help="Por clasificar si aún no se decide quién lo absorbe.">
            <NativeSelect id="classification" name="classification" defaultValue="pending">
              {Object.entries(EXPENSE_CLASS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </NativeSelect>
          </Field>
          <div className="flex flex-col justify-end gap-2">
            <label className="flex items-center gap-2 text-sm text-ink-2">
              <input type="checkbox" name="recoverable" className="size-4 accent-primary" /> Se recupera del arrendatario
            </label>
            <div className="rounded-lg bg-surface-2 px-3 py-2">
              <div className="text-[13px] text-ink-3">Total con IVA</div>
              <div className="num text-xl text-ink">{fmtMXN(total)}</div>
            </div>
          </div>
        </div>
        <Field label="Notas" htmlFor="notes">
          <Textarea id="notes" name="notes" rows={2} />
        </Field>
      </FormSection>

      <FormSection title="Prorrateo" hint={rows.length ? `${pctTotal} % repartido · ${fmtMXN(sharesTotal)}` : "Opcional"}>
        {rows.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="hidden grid-cols-[minmax(0,1fr)_88px_80px_minmax(0,1fr)_96px_32px] gap-2 text-[12px] font-semibold uppercase tracking-wide text-ink-3 sm:grid">
              <span>Parte</span><span className="text-right">%</span><span className="text-right">Factor</span><span>Nota</span><span className="text-right">Importe</span><span />
            </div>
            {rows.map((r, i) => {
              const amount = round2((total * (Number(r.pct) || 0)) / 100 * (Number(r.factor) || 1));
              return (
                <div key={r.key} className="grid gap-2 rounded-lg border p-2 sm:grid-cols-[minmax(0,1fr)_88px_80px_minmax(0,1fr)_96px_32px] sm:items-center sm:border-0 sm:p-0">
                  <NativeSelect name={`share:${i}:party`} aria-label="Parte" value={r.party} onChange={(e) => update(r.key, { party: e.target.value })} required>
                    <option value="">Elige a quién…</option>
                    <optgroup label="Entidades">
                      {entities.map((e) => (
                        <option key={e.id} value={`entity:${e.id}`}>{e.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Arrendatarios">
                      {tenants.map((t) => (
                        <option key={t.id} value={`tenant:${t.id}`}>{t.name}</option>
                      ))}
                    </optgroup>
                  </NativeSelect>
                  <Input name={`share:${i}:pct`} type="number" inputMode="decimal" step="0.01" min="0" max="100" required aria-label="Porcentaje" className="tnum text-right" value={r.pct} onChange={(e) => update(r.key, { pct: e.target.value })} placeholder="%" />
                  <Input name={`share:${i}:factor`} type="number" inputMode="decimal" step="0.0001" min="0.0001" aria-label="Factor" className="tnum text-right" value={r.factor} onChange={(e) => update(r.key, { factor: e.target.value })} />
                  <Input name={`share:${i}:note`} aria-label="Nota de la regla" value={r.note} onChange={(e) => update(r.key, { note: e.target.value })} placeholder="Regla o motivo del factor" />
                  <div className="tnum text-right text-sm font-medium text-ink">{fmtMXN(amount)}</div>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Quitar fila" onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}>
                    <Trash2 strokeWidth={1.5} />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        <div>
          <Button type="button" variant="outline" size="sm" onClick={() => setRows((rs) => [...rs, newRow()])} disabled={rows.length >= 12}>
            Agregar parte
          </Button>
        </div>
      </FormSection>

      <SubmitBar pending={pending} label="Registrar gasto" cancelHref="/rentas?tab=gastos" />
    </form>
  );
}
