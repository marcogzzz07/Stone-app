// Etiquetas de patrimonio compartidas entre servidor y cliente.

export const UNIT_KIND: Record<string, string> = {
  bodega: "Bodega",
  local: "Local",
  oficina: "Oficina",
  terreno: "Terreno",
  lote: "Lote",
  departamento: "Departamento",
  edificio: "Edificio",
  otro: "Otro",
};

/** Ocupación de la base (inglés) → etiqueta del prototipo que usa OccupancyDot/UnitDots. */
export const OCCUPANCY_KEY: Record<string, "ocupada" | "disponible" | "desconocida" | "no_disponible"> = {
  occupied: "ocupada",
  vacant: "disponible",
  unknown: "desconocida",
  unavailable: "no_disponible",
};

export const SURFACE_LABEL: Record<string, string> = {
  legal: "Superficie legal / escritura",
  cadastral: "Superficie catastral",
  built: "Superficie construida",
  rentable: "Superficie rentable",
  gis_estimate: "Área aproximada (polígono)",
};

export const DATE_KIND: Record<string, { label: string; cls: string }> = {
  lease_end: { label: "Contrato", cls: "bg-chart-2" },
  property_tax: { label: "Predial", cls: "bg-chart-1" },
  insurance: { label: "Seguro", cls: "bg-chart-3" },
  rent_increase: { label: "Incremento", cls: "bg-chart-4" },
  other: { label: "Otro", cls: "bg-ink-3" },
};

export const DOC_KIND: Record<string, string> = {
  contrato: "Contrato",
  escritura: "Escritura",
  plano: "Plano",
  factura: "Factura",
  comprobante_pago: "Comprobante de pago",
  poliza: "Póliza",
  predial: "Predial",
  reporte: "Reporte",
  foto: "Foto",
  otro: "Otro",
};

export const SENSITIVITY: Record<string, { label: string; cls: string; who: string }> = {
  public_internal: { label: "Interno", cls: "bg-surface-2 text-ink-2", who: "todos los roles" },
  restricted: { label: "Restringido", cls: "bg-warning-soft text-warning", who: "admin y administración" },
  sensitive: { label: "Sensible", cls: "bg-danger-soft text-danger", who: "solo admin" },
};

export const SEVERITY: Record<string, { label: string; cls: string }> = {
  danger: { label: "Crítica", cls: "bg-danger-soft text-danger" },
  warning: { label: "Revisar", cls: "bg-warning-soft text-warning" },
  info: { label: "Informativa", cls: "bg-info-soft text-info" },
};

export const DISCREPANCY_STATUS: Record<string, { label: string; cls: string }> = {
  open: { label: "Abierta", cls: "bg-warning-soft text-warning" },
  acknowledged: { label: "Vista", cls: "bg-info-soft text-info" },
  resolved: { label: "Resuelta", cls: "bg-success-soft text-success" },
};

export const DISCREPANCY_KIND: Record<string, string> = {
  contrato_solo_portafolio: "Contrato solo en Portafolio",
  renta_portafolio_vs_ubicacion: "Renta distinta entre hojas",
  m2_portafolio_vs_ubicacion: "m² distintos entre hojas",
  contrato_sin_vencimiento: "Contrato sin vencimiento",
  contrato_vencido_facturando: "Contrato vencido que factura",
  contrato_sin_unidad: "Contrato sin unidad",
  comentario_desactualizado: "Comentario desactualizado",
  fecha_factura_anio: "Fecha de factura de otro año",
  mes_vs_fecha_factura: "Mes distinto a fecha de factura",
  sin_folio: "Factura sin folio",
  cargo_sin_contrato: "Cargo sin contrato",
  pago_sin_fecha: "Pago sin fecha",
  pago_mayor_que_factura: "Pago mayor que factura",
  estado_vs_pago: "Estado no coincide con pago",
  pagado_mes_no_cuadra: "Pagado del mes no cuadra",
  pendiente_mes_no_cuadra: "Pendiente del mes no cuadra",
  pendiente_anio_vs_facturas: "Pendiente anual no cuadra",
  cobro_efectivo_sin_fecha: "Cobros en efectivo sin fecha",
  prorrateo_factor_sin_regla: "Prorrateo sin regla",
  gasto_sin_cargo_vinculado: "Gasto sin cargo vinculado",
  ajuste_manual_formula: "Ajuste manual en fórmula",
  resumen_capturado_a_mano: "Resumen capturado a mano",
  referencia_rota: "Referencia rota",
  renta_pactada_es_lo_cobrado: "Renta pactada = lo cobrado",
  proyeccion_incompleta: "Proyección incompleta",
  total_portafolio_vs_ubicacion: "Totales distintos entre archivos",
};
