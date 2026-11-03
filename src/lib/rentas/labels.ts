// Etiquetas en español para los enums de cobranza y gastos. Compartidas entre
// servidor y cliente (sin dependencias de Supabase).

export const CONCEPT_LABEL: Record<string, string> = {
  rent: "Renta",
  maintenance: "Mantenimiento",
  service: "Servicio",
  other: "Otro",
};

export const CHARGE_STATUS: Record<string, { label: string; cls: string }> = {
  open: { label: "Pendiente", cls: "bg-warning-soft text-warning" },
  partially_paid: { label: "Pago parcial", cls: "bg-warning-soft text-warning" },
  overdue: { label: "Vencido", cls: "bg-danger-soft text-danger" },
  paid: { label: "Pagado", cls: "bg-success-soft text-success" },
  void: { label: "Anulado", cls: "bg-surface-2 text-ink-2" },
};

export const METHOD_LABEL: Record<string, string> = {
  transfer: "Transferencia",
  cash: "Efectivo",
  check: "Cheque",
  card: "Tarjeta",
  other: "Otro",
};

export const EXPENSE_CATEGORY: Record<string, string> = {
  electricity: "Luz",
  water: "Agua",
  phone: "Teléfono",
  maintenance: "Mantenimiento",
  property_tax: "Predial",
  insurance: "Seguros",
  repairs: "Reparaciones",
  admin_fee: "Honorarios",
  other: "Otros",
};

export const EXPENSE_CLASS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Por clasificar", cls: "bg-warning-soft text-warning" },
  stone_expense: { label: "Gasto Stone", cls: "bg-surface-2 text-ink-2" },
  tenant_passthrough: { label: "Repercutible", cls: "bg-info-soft text-info" },
  both: { label: "Ambos", cls: "bg-info-soft text-info" },
};

export const LEASE_STATUS: Record<string, { label: string; cls: string }> = {
  draft: { label: "Borrador", cls: "bg-surface-2 text-ink-2" },
  active: { label: "Activo", cls: "bg-success-soft text-success" },
  expired: { label: "Vencido", cls: "bg-surface-2 text-ink-2" },
  terminated: { label: "Terminado", cls: "bg-surface-2 text-ink-2" },
  void: { label: "Anulado", cls: "bg-surface-2 text-ink-2" },
};

export const SOURCE_LABEL: Record<string, string> = {
  demo: "demo",
  excel: "Excel",
  captura: "captura",
  contrato_pdf: "contrato",
};

export const TAX_RATE = 0.16;

export const round2 = (v: number) => Math.round(v * 100) / 100;

/** "2026-10" → "2026-10-01" (columna MES: primer día del mes). */
export const monthToPeriod = (ym: string) => (/^\d{4}-\d{2}$/.test(ym) ? `${ym}-01` : "");

export const todayIso = () => new Date().toISOString().slice(0, 10);
export const thisMonth = () => todayIso().slice(0, 7);
