// Tipos del prototipo. Reflejan el modelo lógico de IMPLEMENTATION_PLAN.md §3
// de forma simplificada; se sustituirán por tipos generados desde Supabase.

export type DataState = "confirmado" | "por_verificar" | "no_disponible";
export type Source = "manual" | "excel" | "other" | "demo";

export type SurfaceKind =
  | "legal"
  | "cadastral"
  | "built"
  | "rentable"
  | "gis_estimate";

export interface Surface {
  kind: SurfaceKind;
  valueM2: number | null;
  state: DataState;
  source: string;
}

export interface Geometry {
  type: "Polygon" | "Point" | "pending";
  coordinates?: number[][] | number[]; // lon,lat (EPSG:4326)
  source: string;
  precisionM: number | null;
  capturedAt: string;
  areaM2Est: number | null;
  perimeterMEst: number | null;
}

export interface LegalEntity {
  id: string;
  name: string;
  kind: "fisica" | "moral";
  rfcMasked: string;
  role: "propietaria" | "arrendadora" | "administradora";
}

export interface Development {
  id: string;
  name: string;
  city: string;
  address: string;
  totalUnits: number;
  stoneUnits: number;
  geometry: Geometry;
  ownersNote: string;
  coverTone: string; // clase tailwind para la cabecera
}

export interface Unit {
  id: string;
  code: string;
  name: string;
  developmentId: string | null;
  kind: "local" | "oficina" | "terreno" | "bodega" | "departamento";
  referenceOnly: boolean;
  managedBy: "stone" | "tercero";
  ownerEntityId: string | null;
  occupancy: "ocupada" | "disponible" | "desconocida" | "no_disponible";
  listRent: number | null; // MXN con IVA, renta de lista
  surfaces: Surface[];
  geometry: Geometry;
  legal: {
    deed: string;
    folio: string;
    notary: string;
    cadastralKey: string;
    landUse: string;
    state: DataState;
  };
  photosNote: string;
}

export type LeaseStatus = "draft" | "active" | "expired" | "terminated";

export interface LeaseTerm {
  effectiveFrom: string;
  baseRent: number; // subtotal sin IVA
  currency: "MXN" | "USD";
  periodicity: "mensual";
  dueDay: number;
  deposit: number;
  increaseRule: string | null;
}

export interface Lease {
  id: string;
  tenantId: string;
  lessorEntityId: string;
  unitIds: string[];
  status: LeaseStatus;
  startDate: string;
  endDate: string;
  terms: LeaseTerm[];
  validation: DataState;
}

export interface Tenant {
  id: string;
  name: string;
  kind: "fisica" | "moral";
}

export type ChargeStatus =
  | "draft"
  | "open"
  | "partially_paid"
  | "paid"
  | "void";

export interface Charge {
  id: string;
  leaseId: string;
  unitId: string;
  period: string; // YYYY-MM-01
  concept: "renta" | "mantenimiento_repercutido" | "servicio" | "otro";
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
  status: ChargeStatus;
  source: Source;
}

export interface Payment {
  id: string;
  tenantId: string;
  effectiveDate: string;
  amount: number;
  method: "transferencia" | "efectivo" | "cheque";
  bankRef: string | null;
  source: Source;
}

export interface Allocation {
  paymentId: string;
  chargeId: string;
  amount: number;
}

export interface Expense {
  id: string;
  unitId: string | null;
  developmentId: string | null;
  category:
    | "mantenimiento"
    | "luz"
    | "agua"
    | "telefono"
    | "predial"
    | "seguros"
    | "reparaciones"
    | "honorarios"
    | "otros";
  vendor: string;
  period: string;
  total: number;
  paid: boolean;
  classification: "pendiente" | "gasto_stone" | "repercutible" | "ambos";
}

export interface Doc {
  id: string;
  name: string;
  kind: "legal" | "fiscal" | "tecnico" | "comercial";
  sensitivity: "interno" | "restringido" | "sensible";
  targetType: "development" | "unit" | "lease";
  targetId: string;
  version: number;
  updatedAt: string;
}

export interface CriticalDate {
  id: string;
  date: string;
  kind: "contrato" | "predial" | "seguro" | "incremento" | "otro";
  title: string;
  targetType: "unit" | "lease" | "development";
  targetId: string;
}

export interface ImportDiscrepancy {
  id: string;
  title: string;
  detail: string;
  amount: number | null;
  severity: "alta" | "media";
}
