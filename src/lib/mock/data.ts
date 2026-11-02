/**
 * DATOS SINTÉTICOS — PROTOTIPO ITERACIÓN 0
 *
 * Nada aquí representa activos, personas, contratos, coordenadas ni cifras
 * reales de Stone Inmuebles. Todos los nombres llevan el prefijo [DEMO].
 * Las coordenadas son puntos genéricos en zona urbana y no corresponden a
 * ningún predio. Este archivo se elimina al conectar Supabase.
 */
import type {
  Allocation,
  Charge,
  CriticalDate,
  Development,
  Doc,
  Expense,
  ImportDiscrepancy,
  Lease,
  LegalEntity,
  Payment,
  Tenant,
  Unit,
} from "./types";

export const TODAY = "2026-11-01";
export const CURRENT_PERIOD = "2026-10-01";

export const entities: LegalEntity[] = [
  { id: "ent-stone", name: "[DEMO] Stone Inmuebles S.A. de C.V.", kind: "moral", rfcMasked: "SIN******XX1", role: "administradora" },
  { id: "ent-a", name: "[DEMO] Propietaria Alfa", kind: "fisica", rfcMasked: "PAL******XX2", role: "propietaria" },
  { id: "ent-b", name: "[DEMO] Inversiones Beta S.A.P.I.", kind: "moral", rfcMasked: "IBE******XX3", role: "arrendadora" },
  { id: "ent-3p", name: "[DEMO] Tercero Gamma (referencia)", kind: "moral", rfcMasked: "—", role: "propietaria" },
];

// Polígono rectangular genérico a partir de un centro (lon, lat) y tamaño en metros.
function rect(lon: number, lat: number, wM: number, hM: number): number[][] {
  const dLat = hM / 111_320 / 2;
  const dLon = wM / (111_320 * Math.cos((lat * Math.PI) / 180)) / 2;
  return [
    [lon - dLon, lat - dLat],
    [lon + dLon, lat - dLat],
    [lon + dLon, lat + dLat],
    [lon - dLon, lat + dLat],
    [lon - dLon, lat - dLat],
  ];
}

export const developments: Development[] = [
  {
    id: "dev-plaza",
    name: "[DEMO] Plaza Ejemplo Norte",
    city: "Ciudad Demo",
    address: "Av. Ficticia 1000, Col. Prototipo",
    totalUnits: 8,
    stoneUnits: 5,
    geometry: {
      type: "Polygon",
      coordinates: rect(-100.3161, 25.6866, 140, 90),
      source: "Trazo demo",
      precisionM: null,
      capturedAt: "2026-10-15",
      areaM2Est: 12_600,
      perimeterMEst: 460,
    },
    ownersNote: "Desarrollo compartido: 5 unidades Stone, 3 de terceros (solo contexto).",
    coverTone: "from-stone-700 via-stone-600 to-amber-900/70",
  },
  {
    id: "dev-torre",
    name: "[DEMO] Torre Prototipo",
    city: "Ciudad Demo",
    address: "Blvd. Inventado 220, Col. Maqueta",
    totalUnits: 3,
    stoneUnits: 3,
    geometry: {
      type: "Polygon",
      coordinates: rect(-100.3402, 25.6511, 60, 60),
      source: "Trazo demo",
      precisionM: null,
      capturedAt: "2026-10-15",
      areaM2Est: 3_600,
      perimeterMEst: 240,
    },
    ownersNote: "Edificio 100 % administrado por Stone en el prototipo.",
    coverTone: "from-zinc-800 via-stone-700 to-stone-500/70",
  },
];

const S = (kind: Unit["surfaces"][number]["kind"], valueM2: number | null, state: Unit["surfaces"][number]["state"], source: string) => ({ kind, valueM2, state, source });

const legalOk = (n: number) => ({
  deed: `Escritura [DEMO] ${1000 + n}`,
  folio: `Folio real [DEMO] ${50_000 + n}`,
  notary: "Notaría [DEMO] 00",
  cadastralKey: `00-000-00${n}`,
  landUse: "Comercial",
  state: "confirmado" as const,
});
const legalPending = {
  deed: "—",
  folio: "—",
  notary: "—",
  cadastralKey: "—",
  landUse: "—",
  state: "por_verificar" as const,
};

export const units: Unit[] = [
  // Plaza Ejemplo Norte — Stone
  { id: "u-pl-101", code: "PL-101", name: "[DEMO] Local 101", developmentId: "dev-plaza", kind: "local", referenceOnly: false, managedBy: "stone", ownerEntityId: "ent-a", occupancy: "ocupada", listRent: 58_000,
    surfaces: [S("legal", 180, "confirmado", "Escritura"), S("rentable", 172, "por_verificar", "Plano arq."), S("gis_estimate", 184.2, "confirmado", "PostGIS/polígono")],
    geometry: { type: "Polygon", coordinates: rect(-100.3168, 25.6869, 15, 12), source: "Trazo demo", precisionM: 1.5, capturedAt: "2026-10-15", areaM2Est: 184.2, perimeterMEst: 54.6 },
    legal: legalOk(1), photosNote: "Sin fotografías cargadas" },
  { id: "u-pl-102", code: "PL-102", name: "[DEMO] Local 102", developmentId: "dev-plaza", kind: "local", referenceOnly: false, managedBy: "stone", ownerEntityId: "ent-a", occupancy: "ocupada", listRent: 42_000,
    surfaces: [S("legal", 120, "confirmado", "Escritura"), S("rentable", null, "no_disponible", "—"), S("gis_estimate", 121.8, "confirmado", "PostGIS/polígono")],
    geometry: { type: "Polygon", coordinates: rect(-100.3166, 25.6869, 12, 10), source: "Trazo demo", precisionM: 1.5, capturedAt: "2026-10-15", areaM2Est: 121.8, perimeterMEst: 44.1 },
    legal: legalOk(2), photosNote: "Sin fotografías cargadas" },
  { id: "u-pl-103", code: "PL-103", name: "[DEMO] Local 103", developmentId: "dev-plaza", kind: "local", referenceOnly: false, managedBy: "stone", ownerEntityId: "ent-b", occupancy: "disponible", listRent: 36_500,
    surfaces: [S("legal", 98, "por_verificar", "Copia simple"), S("gis_estimate", null, "no_disponible", "Pendiente de trazo")],
    geometry: { type: "pending", source: "—", precisionM: null, capturedAt: "—", areaM2Est: null, perimeterMEst: null },
    legal: legalPending, photosNote: "Sin fotografías cargadas" },
  { id: "u-pl-201", code: "PL-201", name: "[DEMO] Oficina 201", developmentId: "dev-plaza", kind: "oficina", referenceOnly: false, managedBy: "stone", ownerEntityId: "ent-b", occupancy: "ocupada", listRent: 29_000,
    surfaces: [S("legal", 86, "confirmado", "Escritura"), S("rentable", 80, "confirmado", "Plano validado"), S("gis_estimate", 87.1, "confirmado", "PostGIS/polígono")],
    geometry: { type: "Polygon", coordinates: rect(-100.3163, 25.6866, 10, 9), source: "Trazo demo", precisionM: 2, capturedAt: "2026-10-15", areaM2Est: 87.1, perimeterMEst: 37.9 },
    legal: legalOk(3), photosNote: "Sin fotografías cargadas" },
  { id: "u-pl-202", code: "PL-202", name: "[DEMO] Oficina 202", developmentId: "dev-plaza", kind: "oficina", referenceOnly: false, managedBy: "stone", ownerEntityId: "ent-b", occupancy: "desconocida", listRent: null,
    surfaces: [S("legal", 86, "confirmado", "Escritura"), S("gis_estimate", 86.4, "confirmado", "PostGIS/polígono")],
    geometry: { type: "Polygon", coordinates: rect(-100.3160, 25.6866, 10, 9), source: "Trazo demo", precisionM: 2, capturedAt: "2026-10-15", areaM2Est: 86.4, perimeterMEst: 37.8 },
    legal: legalOk(4), photosNote: "Sin fotografías cargadas" },
  // Plaza — terceros (referencia)
  { id: "u-pl-r1", code: "PL-104", name: "[DEMO] Local 104 (tercero)", developmentId: "dev-plaza", kind: "local", referenceOnly: true, managedBy: "tercero", ownerEntityId: "ent-3p", occupancy: "desconocida", listRent: null,
    surfaces: [S("gis_estimate", 140, "por_verificar", "Croquis del desarrollo")],
    geometry: { type: "Polygon", coordinates: rect(-100.3155, 25.6869, 14, 11), source: "Croquis", precisionM: 5, capturedAt: "2026-10-15", areaM2Est: 140, perimeterMEst: 50 },
    legal: legalPending, photosNote: "No aplica (referencia)" },
  { id: "u-pl-r2", code: "PL-105", name: "[DEMO] Local 105 (tercero)", developmentId: "dev-plaza", kind: "local", referenceOnly: true, managedBy: "tercero", ownerEntityId: "ent-3p", occupancy: "desconocida", listRent: null,
    surfaces: [S("gis_estimate", 140, "por_verificar", "Croquis del desarrollo")],
    geometry: { type: "Polygon", coordinates: rect(-100.3153, 25.6869, 14, 11), source: "Croquis", precisionM: 5, capturedAt: "2026-10-15", areaM2Est: 140, perimeterMEst: 50 },
    legal: legalPending, photosNote: "No aplica (referencia)" },
  { id: "u-pl-r3", code: "PL-203", name: "[DEMO] Oficina 203 (tercero)", developmentId: "dev-plaza", kind: "oficina", referenceOnly: true, managedBy: "tercero", ownerEntityId: "ent-3p", occupancy: "desconocida", listRent: null,
    surfaces: [S("gis_estimate", 86, "por_verificar", "Croquis del desarrollo")],
    geometry: { type: "Polygon", coordinates: rect(-100.3157, 25.6866, 10, 9), source: "Croquis", precisionM: 5, capturedAt: "2026-10-15", areaM2Est: 86, perimeterMEst: 38 },
    legal: legalPending, photosNote: "No aplica (referencia)" },
  // Torre Prototipo — Stone
  { id: "u-tp-01", code: "TP-01", name: "[DEMO] Piso 1", developmentId: "dev-torre", kind: "oficina", referenceOnly: false, managedBy: "stone", ownerEntityId: "ent-b", occupancy: "ocupada", listRent: 95_000,
    surfaces: [S("legal", 420, "confirmado", "Escritura"), S("built", 410, "confirmado", "Plano arq."), S("rentable", 395, "confirmado", "Plano arq."), S("gis_estimate", 3_600, "confirmado", "Polígono del predio")],
    geometry: { type: "Polygon", coordinates: rect(-100.3402, 25.6511, 60, 60), source: "Trazo demo", precisionM: 1, capturedAt: "2026-10-15", areaM2Est: 3_600, perimeterMEst: 240 },
    legal: legalOk(5), photosNote: "Sin fotografías cargadas" },
  { id: "u-tp-02", code: "TP-02", name: "[DEMO] Piso 2", developmentId: "dev-torre", kind: "oficina", referenceOnly: false, managedBy: "stone", ownerEntityId: "ent-b", occupancy: "ocupada", listRent: 95_000,
    surfaces: [S("legal", 420, "confirmado", "Escritura"), S("rentable", 395, "confirmado", "Plano arq.")],
    geometry: { type: "Polygon", coordinates: rect(-100.3402, 25.6511, 60, 60), source: "Trazo demo", precisionM: 1, capturedAt: "2026-10-15", areaM2Est: 3_600, perimeterMEst: 240 },
    legal: legalOk(6), photosNote: "Sin fotografías cargadas" },
  { id: "u-tp-03", code: "TP-03", name: "[DEMO] Piso 3", developmentId: "dev-torre", kind: "oficina", referenceOnly: false, managedBy: "stone", ownerEntityId: "ent-b", occupancy: "disponible", listRent: 90_000,
    surfaces: [S("legal", 420, "confirmado", "Escritura"), S("rentable", 395, "por_verificar", "Plano preliminar")],
    geometry: { type: "Polygon", coordinates: rect(-100.3402, 25.6511, 60, 60), source: "Trazo demo", precisionM: 1, capturedAt: "2026-10-15", areaM2Est: 3_600, perimeterMEst: 240 },
    legal: legalOk(7), photosNote: "Sin fotografías cargadas" },
  // Terreno independiente sin rentas
  { id: "u-terreno", code: "TR-01", name: "[DEMO] Terreno Baldío Sur", developmentId: null, kind: "terreno", referenceOnly: false, managedBy: "stone", ownerEntityId: "ent-a", occupancy: "no_disponible", listRent: null,
    surfaces: [S("legal", 2_450, "confirmado", "Escritura"), S("cadastral", 2_438, "por_verificar", "Boleta predial"), S("gis_estimate", 2_461.5, "confirmado", "PostGIS/polígono")],
    geometry: { type: "Polygon", coordinates: rect(-100.2988, 25.6302, 50, 49), source: "GeoJSON demo", precisionM: 0.8, capturedAt: "2026-10-20", areaM2Est: 2_461.5, perimeterMEst: 198.4 },
    legal: legalOk(8), photosNote: "Sin fotografías cargadas" },
];

export const tenants: Tenant[] = [
  { id: "t-1", name: "[DEMO] Arrendatario Uno S.A.", kind: "moral" },
  { id: "t-2", name: "[DEMO] Arrendataria Dos", kind: "fisica" },
  { id: "t-3", name: "[DEMO] Corporativo Tres", kind: "moral" },
  { id: "t-4", name: "[DEMO] Servicios Cuatro", kind: "moral" },
];

export const leases: Lease[] = [
  { id: "l-1", tenantId: "t-1", lessorEntityId: "ent-a", unitIds: ["u-pl-101"], status: "active", startDate: "2025-03-01", endDate: "2027-02-28", validation: "confirmado",
    terms: [
      { effectiveFrom: "2025-03-01", baseRent: 48_000, currency: "MXN", periodicity: "mensual", dueDay: 5, deposit: 96_000, increaseRule: null },
      { effectiveFrom: "2026-03-01", baseRent: 50_000, currency: "MXN", periodicity: "mensual", dueDay: 5, deposit: 96_000, increaseRule: "INPC anual (documentado en anexo 1)" },
    ] },
  { id: "l-2", tenantId: "t-2", lessorEntityId: "ent-a", unitIds: ["u-pl-102"], status: "active", startDate: "2026-01-15", endDate: "2026-12-31", validation: "por_verificar",
    terms: [{ effectiveFrom: "2026-01-15", baseRent: 36_000, currency: "MXN", periodicity: "mensual", dueDay: 1, deposit: 36_000, increaseRule: null }] },
  { id: "l-3", tenantId: "t-3", lessorEntityId: "ent-b", unitIds: ["u-tp-01", "u-tp-02"], status: "active", startDate: "2024-09-01", endDate: "2029-08-31", validation: "confirmado",
    terms: [{ effectiveFrom: "2024-09-01", baseRent: 160_000, currency: "MXN", periodicity: "mensual", dueDay: 10, deposit: 320_000, increaseRule: "4 % fijo anual (cláusula 7)" }] },
  { id: "l-4", tenantId: "t-4", lessorEntityId: "ent-b", unitIds: ["u-pl-201"], status: "active", startDate: "2025-11-15", endDate: "2026-11-14", validation: "confirmado",
    terms: [{ effectiveFrom: "2025-11-15", baseRent: 25_000, currency: "MXN", periodicity: "mensual", dueDay: 15, deposit: 50_000, increaseRule: null }] },
  { id: "l-5", tenantId: "t-2", lessorEntityId: "ent-b", unitIds: ["u-pl-202"], status: "expired", startDate: "2024-01-01", endDate: "2025-12-31", validation: "confirmado",
    terms: [{ effectiveFrom: "2024-01-01", baseRent: 22_000, currency: "MXN", periodicity: "mensual", dueDay: 1, deposit: 22_000, increaseRule: null }] },
];

const IVA = 0.16;
const ch = (id: string, leaseId: string, unitId: string, period: string, subtotal: number, dueDate: string, status: Charge["status"], source: Charge["source"] = "demo", concept: Charge["concept"] = "renta"): Charge => ({
  id, leaseId, unitId, period, concept, subtotal, tax: Math.round(subtotal * IVA * 100) / 100, total: Math.round(subtotal * (1 + IVA) * 100) / 100, dueDate, status, source,
});

export const charges: Charge[] = [
  // Agosto
  ch("c-l1-08", "l-1", "u-pl-101", "2026-08-01", 50_000, "2026-08-05", "paid", "excel"),
  ch("c-l2-08", "l-2", "u-pl-102", "2026-08-01", 36_000, "2026-08-01", "paid", "excel"),
  ch("c-l3-08", "l-3", "u-tp-01", "2026-08-01", 160_000, "2026-08-10", "paid", "excel"),
  ch("c-l4-08", "l-4", "u-pl-201", "2026-08-01", 25_000, "2026-08-15", "paid", "excel"),
  // Septiembre
  ch("c-l1-09", "l-1", "u-pl-101", "2026-09-01", 50_000, "2026-09-05", "paid", "excel"),
  ch("c-l2-09", "l-2", "u-pl-102", "2026-09-01", 36_000, "2026-09-01", "partially_paid", "excel"),
  ch("c-l3-09", "l-3", "u-tp-01", "2026-09-01", 160_000, "2026-09-10", "paid", "excel"),
  ch("c-l4-09", "l-4", "u-pl-201", "2026-09-01", 25_000, "2026-09-15", "open", "excel"),
  ch("c-l3-09m", "l-3", "u-tp-01", "2026-09-01", 8_500, "2026-09-10", "paid", "excel", "mantenimiento_repercutido"),
  // Octubre
  ch("c-l1-10", "l-1", "u-pl-101", "2026-10-01", 50_000, "2026-10-05", "paid", "manual"),
  ch("c-l2-10", "l-2", "u-pl-102", "2026-10-01", 36_000, "2026-10-01", "open", "manual"),
  ch("c-l3-10", "l-3", "u-tp-01", "2026-10-01", 160_000, "2026-10-10", "partially_paid", "manual"),
  ch("c-l4-10", "l-4", "u-pl-201", "2026-10-01", 25_000, "2026-10-15", "open", "manual"),
  ch("c-l3-10m", "l-3", "u-tp-01", "2026-10-01", 8_500, "2026-10-10", "open", "manual", "mantenimiento_repercutido"),
  // Noviembre (propuesta)
  ch("c-l1-11", "l-1", "u-pl-101", "2026-11-01", 50_000, "2026-11-05", "draft", "manual"),
  ch("c-l3-11", "l-3", "u-tp-01", "2026-11-01", 160_000, "2026-11-10", "draft", "manual"),
];

export const payments: Payment[] = [
  { id: "p-1", tenantId: "t-1", effectiveDate: "2026-08-04", amount: 58_000, method: "transferencia", bankRef: "REF-DEMO-0001", source: "excel" },
  { id: "p-2", tenantId: "t-2", effectiveDate: "2026-08-02", amount: 41_760, method: "transferencia", bankRef: "REF-DEMO-0002", source: "excel" },
  { id: "p-3", tenantId: "t-3", effectiveDate: "2026-08-09", amount: 185_600, method: "transferencia", bankRef: "REF-DEMO-0003", source: "excel" },
  { id: "p-4", tenantId: "t-4", effectiveDate: "2026-08-14", amount: 29_000, method: "transferencia", bankRef: "REF-DEMO-0004", source: "excel" },
  { id: "p-5", tenantId: "t-1", effectiveDate: "2026-09-03", amount: 58_000, method: "transferencia", bankRef: "REF-DEMO-0005", source: "excel" },
  { id: "p-6", tenantId: "t-2", effectiveDate: "2026-09-10", amount: 20_000, method: "efectivo", bankRef: null, source: "excel" },
  { id: "p-7", tenantId: "t-3", effectiveDate: "2026-09-09", amount: 195_460, method: "transferencia", bankRef: "REF-DEMO-0007", source: "excel" },
  { id: "p-8", tenantId: "t-1", effectiveDate: "2026-10-05", amount: 58_000, method: "transferencia", bankRef: "REF-DEMO-0008", source: "manual" },
  { id: "p-9", tenantId: "t-3", effectiveDate: "2026-10-12", amount: 100_000, method: "transferencia", bankRef: "REF-DEMO-0009", source: "manual" },
  // Anticipo sin aplicar
  { id: "p-10", tenantId: "t-4", effectiveDate: "2026-10-28", amount: 15_000, method: "transferencia", bankRef: "REF-DEMO-0010", source: "manual" },
];

export const allocations: Allocation[] = [
  { paymentId: "p-1", chargeId: "c-l1-08", amount: 58_000 },
  { paymentId: "p-2", chargeId: "c-l2-08", amount: 41_760 },
  { paymentId: "p-3", chargeId: "c-l3-08", amount: 185_600 },
  { paymentId: "p-4", chargeId: "c-l4-08", amount: 29_000 },
  { paymentId: "p-5", chargeId: "c-l1-09", amount: 58_000 },
  { paymentId: "p-6", chargeId: "c-l2-09", amount: 20_000 },
  { paymentId: "p-7", chargeId: "c-l3-09", amount: 185_600 },
  { paymentId: "p-7", chargeId: "c-l3-09m", amount: 9_860 },
  { paymentId: "p-8", chargeId: "c-l1-10", amount: 58_000 },
  { paymentId: "p-9", chargeId: "c-l3-10", amount: 100_000 },
];

export const expenses: Expense[] = [
  { id: "e-1", unitId: null, developmentId: "dev-plaza", category: "mantenimiento", vendor: "[DEMO] Administración Plaza", period: "2026-10-01", total: 18_400, paid: true, classification: "pendiente" },
  { id: "e-2", unitId: "u-tp-01", developmentId: "dev-torre", category: "luz", vendor: "[DEMO] CFE", period: "2026-10-01", total: 6_120, paid: true, classification: "repercutible" },
  { id: "e-3", unitId: null, developmentId: "dev-torre", category: "agua", vendor: "[DEMO] Agua y Drenaje", period: "2026-10-01", total: 2_340, paid: false, classification: "gasto_stone" },
  { id: "e-4", unitId: "u-terreno", developmentId: null, category: "predial", vendor: "[DEMO] Tesorería Municipal", period: "2026-01-01", total: 14_900, paid: true, classification: "gasto_stone" },
  { id: "e-5", unitId: "u-pl-103", developmentId: "dev-plaza", category: "reparaciones", vendor: "[DEMO] Mantenimiento Delta", period: "2026-10-01", total: 7_800, paid: false, classification: "gasto_stone" },
  { id: "e-6", unitId: null, developmentId: "dev-plaza", category: "seguros", vendor: "[DEMO] Aseguradora Épsilon", period: "2026-10-01", total: 9_300, paid: true, classification: "gasto_stone" },
  { id: "e-7", unitId: null, developmentId: "dev-torre", category: "honorarios", vendor: "[DEMO] Despacho Zeta", period: "2026-10-01", total: 11_600, paid: true, classification: "gasto_stone" },
];

export const docs: Doc[] = [
  { id: "d-1", name: "Escritura constitutiva [DEMO]", kind: "legal", sensitivity: "sensible", targetType: "unit", targetId: "u-pl-101", version: 1, updatedAt: "2026-09-12" },
  { id: "d-2", name: "Boleta predial 2026 [DEMO]", kind: "fiscal", sensitivity: "restringido", targetType: "unit", targetId: "u-pl-101", version: 2, updatedAt: "2026-10-02" },
  { id: "d-3", name: "Plano arquitectónico [DEMO]", kind: "tecnico", sensitivity: "interno", targetType: "unit", targetId: "u-pl-101", version: 1, updatedAt: "2026-08-20" },
  { id: "d-4", name: "Contrato de arrendamiento [DEMO]", kind: "comercial", sensitivity: "restringido", targetType: "lease", targetId: "l-1", version: 3, updatedAt: "2026-03-01" },
  { id: "d-5", name: "Reglamento del desarrollo [DEMO]", kind: "legal", sensitivity: "interno", targetType: "development", targetId: "dev-plaza", version: 1, updatedAt: "2026-07-15" },
  { id: "d-6", name: "Póliza de seguro [DEMO]", kind: "legal", sensitivity: "restringido", targetType: "development", targetId: "dev-torre", version: 1, updatedAt: "2026-06-01" },
  { id: "d-7", name: "Escritura terreno [DEMO]", kind: "legal", sensitivity: "sensible", targetType: "unit", targetId: "u-terreno", version: 1, updatedAt: "2026-05-11" },
];

export const criticalDates: CriticalDate[] = [
  { id: "cd-1", date: "2026-11-14", kind: "contrato", title: "Vence contrato [DEMO] Servicios Cuatro — PL-201", targetType: "lease", targetId: "l-4" },
  { id: "cd-2", date: "2026-12-31", kind: "contrato", title: "Vence contrato [DEMO] Arrendataria Dos — PL-102", targetType: "lease", targetId: "l-2" },
  { id: "cd-3", date: "2027-01-31", kind: "predial", title: "Predial 2027 con descuento — Terreno Baldío Sur", targetType: "unit", targetId: "u-terreno" },
  { id: "cd-4", date: "2026-11-20", kind: "seguro", title: "Renovación póliza — Torre Prototipo", targetType: "development", targetId: "dev-torre" },
  { id: "cd-5", date: "2027-03-01", kind: "incremento", title: "Incremento INPC — contrato Arrendatario Uno", targetType: "lease", targetId: "l-1" },
  { id: "cd-6", date: "2026-12-05", kind: "otro", title: "Entrega de estados de cuenta a familia", targetType: "development", targetId: "dev-plaza" },
];

// Discrepancias tomadas del informe de referencia (spec §11.1). Se muestran
// como alertas hasta conciliación con el Excel fuente; no se corrigen.
export const importDiscrepancies: ImportDiscrepancy[] = [
  { id: "disc-1", title: "Pendiente de septiembre no cuadra", detail: "Total con IVA − cobrado = $48,894.00, pero el informe declara $45,994.00 pendientes.", amount: 2_900, severity: "alta" },
  { id: "disc-2", title: "Torre Evalor: diferencia de $2,900", detail: "$145,580.00 − $110,780.00 = $34,800.00 vs. $31,900.00 declarado.", amount: 2_900, severity: "alta" },
  { id: "disc-3", title: "Central de Playa: total no explicado", detail: "$2,500.00 + $400.00 IVA no explican total de $80,798.64.", amount: null, severity: "alta" },
  { id: "disc-4", title: "Cuotas de mantenimiento sin clasificar", detail: "No se ha confirmado si son egreso de Stone, cargo al inquilino o ambos. 1 gasto demo en estado pendiente.", amount: null, severity: "media" },
];
