# Stone Inmuebles — Plan de implementación

**Fuente de requisitos:** `Stone_Inmuebles_Product_Spec_v0.2.md` (sustituye a v0.1).
**Estado de este documento:** Iteración 0 — diseño técnico + prototipo con datos sintéticos. Nada aquí autoriza cargar datos reales.

---

## 1. Decisiones de arquitectura

| Tema | Decisión | Motivo |
|---|---|---|
| Framework | Next.js 16 (App Router, RSC) + TypeScript estricto | Un solo repo para UI y lógica de servidor; despliegue directo en Vercel. |
| UI | Tailwind v4 + shadcn/ui (radix) + lucide | Base sobria y accesible; tokens propios para la identidad "atlas patrimonial". |
| Gráficas | Recharts | Suficiente para barras/áreas/antigüedad; ligero. |
| Mapa | MapLibre GL JS + GeoJSON | Sin costo de licencia para la base; el proveedor satelital se decide antes de producción. Geoman se evalúa en Iteración 1 para edición de polígonos. |
| Datos | Supabase (Postgres 17 + PostGIS + Auth + Storage privado) | RLS a nivel fila, buckets privados con URLs firmadas. |
| Acceso a datos | Server Components / Server Actions con cliente Supabase de servidor; `anon`/`publishable` key en cliente solo para Auth y lecturas bajo RLS. **La service-role key nunca sale del servidor.** | Invariante de la spec §10. |
| Geometría | Almacenar en `EPSG:4326`; áreas y perímetros calculados por PostGIS con `geography` (geodésico), guardados como *estimado* con método y fecha. | Spec §4.3 y §12. |
| Datos sintéticos | Carpeta `src/lib/mock/` con prefijo `[DEMO]` en todo nombre; sin coordenadas de inmuebles reales. | Spec §13 Iteración 0 y §16. |

### Estructura del repo

```
src/
  app/
    (app)/                 # rutas autenticadas con AppShell
      dashboard/
      mapa/
      propiedades/         # inventario + ficha de desarrollo [id]
      unidades/[id]/       # ficha de unidad (6 pestañas)
      rentas/
      contratos/
      documentos/
      calendario/
      configuracion/
    layout.tsx, page.tsx (redirige a /dashboard)
  components/
    ui/                    # shadcn
    shell/                 # sidebar, topbar, buscador
    patrimonio/            # KPI, badges de estado de dato, tarjetas de unidad
    mapa/                  # MapLibre (client)
    charts/                # Recharts (client)
  lib/
    mock/                  # datos sintéticos + helpers de cálculo
    format.ts              # moneda MXN, m², fechas es-MX
    supabase/              # (Iteración 1) clientes server/browser, tipos generados
supabase/
  migrations/              # (Iteración 1) SQL versionado
```

---

## 2. Rutas y navegación

| Ruta | Contenido | Permisos mínimos |
|---|---|---|
| `/dashboard` | KPIs patrimoniales y financieros, gráficas, vencimientos, discrepancias de importación | viewer |
| `/mapa` | Mapa MapLibre, capas desarrollo/unidad, Stone vs referencia, panel lateral sincronizado | viewer |
| `/propiedades` | Inventario por desarrollo/activo/unidad con filtros | viewer |
| `/propiedades/[id]` | Ficha de desarrollo: cabecera, croquis, unidades Stone operables, terceros como contexto | viewer |
| `/unidades/[id]` | Ficha de unidad con pestañas Resumen / Terreno / Legal / Comercial / Finanzas / Documentos | viewer (Legal, Finanzas y Documentos restringidos por rol) |
| `/rentas` | Cargos, pagos, aplicaciones, saldos; vistas "por período de cargo" y "por fecha de cobro" | operator |
| `/contratos` | Arrendatarios, contratos, condiciones versionadas, vigencias | operator |
| `/documentos` | Expediente con buckets privados, versiones y enlaces temporales | según rol y tipo de documento |
| `/calendario` | Fechas críticas (contrato, predial, seguro, incrementos) | viewer |
| `/configuracion` | Usuarios, roles, catálogos, importaciones, fuente de verdad por alcance | admin |

---

## 3. Modelo de datos (esquema propuesto para Iteración 1)

Convenciones: `uuid` PK, `org_id` en toda tabla expuesta, `created_at/updated_at/created_by`, montos `numeric(14,2)` + `currency char(3)`, soft-delete solo donde la spec lo permite (nunca en movimientos financieros: se usan `void` + ajustes).

### 3.1 Identidad y acceso
- `organizations` (Stone inicial)
- `profiles` (1:1 `auth.users`), `memberships` (`profile_id`, `org_id`, `role`), `roles` enum: `admin`, `operator`, `viewer`, futuro `external`.
- `invitations` (email, rol, token, expira) — login **solo por invitación**.
- `audit_logs` (`actor`, `action`, `entity`, `entity_id`, `before`, `after`, `at`).

### 3.2 Patrimonio
- `legal_entities` (personas físicas/morales; RFC cifrado o enmascarado en vistas).
- `developments` (nombre, dirección, ciudad, `geometry_id` perímetro).
- `assets` (terreno/edificio/predio; `development_id` opcional, `parent_asset_id` opcional).
- `units` (`asset_id`, `development_id`, `code`, `reference_only bool`, `managed_by_org_id`, `occupancy_status` enum `unknown|occupied|vacant|unavailable`, `list_rent`, `list_rent_currency`).
- `ownership_interests` (`entity_id`, `asset_id|unit_id`, `share`, `valid_from/to`, `source_document_id`).
- `surfaces` (`target_type/target_id`, `kind` enum `legal|cadastral|built|rentable|gis_estimate`, `value_m2`, `source`, `verified_status`).
- `geometries` (`target_type/target_id`, `geom geography`, `geom_type`, `srid_source`, `source`, `precision_m`, `captured_at`, `version`, `is_current`, `area_m2_est`, `perimeter_m_est`, `method`).

**Invariantes DB:** trigger que rechaza `leases`/`charges`/`expenses` sobre `units.reference_only = true`.

### 3.3 Contratos
- `tenants` (datos protegidos; vistas enmascaradas para viewer).
- `leases` (`lessor_entity_id`, `tenant_id`, `status` enum `draft|active|expired|terminated|void`, `start_date`, `end_date`, `source`, `validation_status`).
- `lease_units` (`lease_id`, `unit_id`, `share_pct`/`amount_split`).
- `lease_terms` (versionadas: `effective_from`, `base_rent`, `currency`, `periodicity`, `due_day`, `tax_treatment`, `deposit_amount`, `increase_rule jsonb` solo si documentada).

### 3.4 Rentas y cobranza
- `charges` (`lease_id`, `unit_id`, `period` date, `concept` enum `rent|maintenance_passthrough|service|other`, `status` enum `draft|open|partially_paid|paid|void`, `due_date`, `source`, `import_row_id`).
- `charge_lines` (`subtotal`, `tax_rate`, `tax_amount`, `total`).
- `charge_adjustments` (`kind` enum `discount|credit_note|waiver|correction`, `amount`, `reason`, `approved_by`).
- `payments` (`tenant_id`, `effective_date`, `recorded_at`, `amount`, `currency`, `method`, `bank_ref`, `receiving_account_id`, `evidence_document_id`, `source`).
- `payment_allocations` (`payment_id`, `charge_id`, `amount`) — **constraint**: `sum(allocations) <= payment.amount` (trigger) y `sum(allocations) <= charge total − adjustments`.
- `overdue` es **derivado** (vista): `due_date < today AND saldo > 0`.

### 3.5 Gastos
- `expenses` (`asset_id|unit_id`, `category`, `vendor_id`, `consumption_period`, `charged_at`, `subtotal/tax/total`, `payer_entity_id`, `recoverable bool`, `classification_status` enum `pending|stone_expense|tenant_passthrough|both`).
- `expense_payments`, `expense_recoveries` (`expense_id` ↔ `charge_id`, opcional; nunca compensación automática).

### 3.6 Documentos
- `documents` (`bucket`, `path`, `kind`, `sensitivity` enum `public_internal|restricted|sensitive`), `document_versions`, `document_links` (`target_type/target_id`).
- Storage: buckets `legal`, `fiscal`, `technical`, `commercial`, `imports` — **todos privados**, acceso por política de Storage + URL firmada de corta duración.

### 3.7 Transición e importación
- `import_batches` (`file_document_id`, `sheet`, `mapping jsonb`, `status`, `summary jsonb`), `import_rows` (`raw jsonb`, `normalized jsonb`, `classification` enum `new|duplicate|possible_duplicate|conflict|incomplete`, `decision`, `decided_by`), `source_records` (clave de idempotencia).
- `source_of_truth_rules` (`scope_type` `asset|lease`, `scope_id`, `period_from`, `source` enum `excel|stone`, `authorized_by`).
- `period_locks` (`period`, `scope`, `status` enum `open|under_review|closed`).
- `critical_dates`, `reminders`.

---

## 4. Matriz de roles (MVP)

| Capacidad | admin | operator | viewer |
|---|:-:|:-:|:-:|
| Ver dashboard, mapa, inventario, fichas (Resumen/Terreno/Comercial) | ✔ | ✔ | ✔ |
| Ver pestaña Legal y fiscal, documentos `restricted` | ✔ | ✔ (configurable) | ✖ |
| Ver documentos `sensitive` (escrituras, RFC completos) | ✔ | ✖ | ✖ |
| Alta/edición de desarrollos, activos, unidades, geometrías | ✔ | ✔ | ✖ |
| Contratos, cargos, pagos, aplicaciones, gastos | ✔ | ✔ | ✖ |
| Ajustes, anulaciones, cierre de período, cambiar fuente de verdad | ✔ | ✖ | ✖ |
| Importaciones (subir, revisar, aprobar) | ✔ | subir/revisar | ✖ |
| Usuarios, roles, invitaciones | ✔ | ✖ | ✖ |

Se aplica en tres capas: UI (ocultar), Server Actions (verificar), **RLS (hacer cumplir)**.

---

## 5. Estrategia RLS

- Función `auth_org_ids()` → orgs del usuario; `auth_role(org_id)` → rol.
- Política base en toda tabla: `org_id IN (SELECT auth_org_ids())`.
- Escritura: `auth_role(org_id) IN ('admin','operator')`; tablas de ajustes/cierres/reglas: solo `admin`.
- `tenants`, `legal_entities`: vista `*_masked` para `viewer` (RFC parcial, sin contacto).
- `documents`: política por `sensitivity` × rol; Storage con la misma función.
- **Pruebas negativas obligatorias** (pgTAP o script): viewer no puede leer `payments`; operator no puede insertar en `charge_adjustments`; nadie puede insertar `leases` en unidad `reference_only`.

---

## 6. Etapas y entregables

| Etapa | Entregable | Criterio de salida |
|---|---|---|
| **0 (ahora)** | Este plan, sistema de diseño, prototipo navegable con `[DEMO]` | Revisión visual del usuario; ajustes de UX |
| 1 | Proyecto Supabase, migraciones §3.1–3.2, Auth por invitación, RLS + pruebas negativas, fichas conectadas, Storage privado, mapa con geometrías importadas | Criterios de aceptación 1–6 |
| 2 | §3.3–3.7: contratos versionados, cargos/pagos/aplicaciones, gastos, wizard de importación, dashboards desde datos operativos | Criterios 7–12; **sin datos reales** hasta cumplir §15 de la spec |
| 3 | Casos límite, inmueble piloto, fuente de verdad por alcance, cierre mensual | Criterios 13–14 |

### Pruebas
- Unitarias: cálculo de saldos, aplicación de pagos, idempotencia de importación, estados derivados.
- Integración: RLS negativa; transacción de importación que falla a mitad no deja huérfanos.
- E2E (Playwright, Iteración 2): flujo contrato → cargo → pago parcial → aplicación → saldo.

---

## 7. Sistema de diseño

**Concepto:** atlas patrimonial privado. Sobrio, cartográfico, cálido. No ERP.

- **Color base:** neutros piedra cálidos (`--background` arena muy clara / modo oscuro grafito). Primario grafito profundo. **Acento Stone** ocre-terracota para todo lo operable; **referencia de terceros** gris azulado desaturado, siempre con leyenda.
- **Tipografía:** `Geist` para UI; cifras en `Geist Mono` con tabular-nums. Títulos de ficha en tamaño grande, tracking ajustado.
- **Estados de dato** (componente `DataStateBadge`): `confirmado` (verde apagado), `por verificar` (ámbar), `no disponible` (gris). Toda cifra legal/fiscal lleva uno.
- **KPI** (`KpiCard`): valor, variación opcional, y **siempre** pie con periodo · moneda · IVA · origen · conciliación.
- **Mapa:** relleno Stone ocre 35 %, borde 2 px; referencia gris 15 %, borde discontinuo; «Pendiente de trazo» como punto con anillo.
- **Banner permanente** en el prototipo: «Datos sintéticos — no representan a Stone».

### Árbol de componentes

```
AppShell
├─ Sidebar (nav 8 secciones, rol actual, org)
├─ Topbar (buscador transversal ⌘K, filtros de periodo, usuario)
└─ Page
   ├─ dashboard: KpiGrid(KpiCard×8) · ChargesVsCollectionsChart · AgingChart · ExpensesByCategory · UpcomingDates · ImportDiscrepancies
   ├─ mapa: PatrimonyMap(client) · LayerLegend · SyncedSidebarList · FeatureCard
   ├─ propiedades: InventoryFilters · DevelopmentCard[] · UnitTable
   ├─ propiedades/[id]: DevelopmentHeader · SitePlan(Map) · UnitGrid(Stone) · ReferenceContext · DevelopmentDocs
   ├─ unidades/[id]: UnitHeader · Tabs{Resumen, Terreno, Legal, Comercial, Finanzas, Documentos}
   ├─ rentas: ViewToggle(por período | por cobro) · ChargesTable · PaymentsTable · AllocationDrawer · BalanceSummary
   ├─ contratos: LeaseTable · LeaseTermsTimeline
   ├─ documentos: DocTree · VersionList · AccessBadge
   ├─ calendario: MonthGrid · CriticalDateList
   └─ configuracion: Users · Roles · Catalogs · Imports · SourceOfTruthRules
```

---

## 8. Pendiente para pasar a datos reales (bloqueantes por etapa)

Antes de **Iteración 1**:
- Proyecto Supabase creado en la organización correcta y conector con acceso.
- Confirmar formatos de planos/coordenadas disponibles (GeoJSON/KML/DWG/PDF) y su carácter legal vs. preliminar.
- Lista inicial de usuarios y rol de cada uno.

Antes de **Iteración 2 con datos reales**:
- Excel original (pestañas, fórmulas), no el PPTX.
- Clasificación de "cuotas de mantenimiento": egreso de Stone, cargo a inquilino o ambos.
- Mapeo de las 7 líneas de renta del informe a unidades/contratos/arrendatarios reales.
- Campos definitivos de contrato, reglas de incremento y tratamiento fiscal.
- Conciliar las diferencias del informe de septiembre ($2,900; Torre Evalor; Central de Playa) — el sistema las mostrará como alertas, no las corregirá.
- Decidir proveedor de imágenes satelitales y licencia.

---

## 9. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Exponer datos sensibles en preview de Vercel | Previews con Deployment Protection; nunca datos reales en preview. |
| Doble generación de cargos Excel/Stone | `source_of_truth_rules` + constraint único `(lease_id, period, concept)` por fuente activa. |
| Polígonos ficticios | Estado «Pendiente de trazo» obligatorio sin geometría validada; nunca autogenerar. |
| Confusión de KPIs | Pie obligatorio en cada KPI con definición, periodo, moneda, IVA, origen. |
