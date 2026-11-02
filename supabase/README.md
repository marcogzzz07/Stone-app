# Base de datos (Supabase)

Proyecto `stone-inmuebles` (ref `sxuvwhttpvflvothemcd`, org Kauppa). Postgres 17 con PostGIS.
Migraciones aplicadas el 2 de noviembre de 2026 con la MCP de Supabase; los
archivos de `migrations/` son la copia versionada, en el mismo orden.

| Archivo | Contenido |
|---|---|
| `0001_identity.sql` | Extensiones, `organizations`, `profiles`, `memberships`, `invitations`, `audit_logs`, trigger de alta de usuario por invitación |
| `0002_patrimonio.sql` | `legal_entities` (+`_details`), `developments`, `assets`, `units`, `ownership_interests`, `surfaces`, `geometries` (PostGIS 4326, área/perímetro estimados) |
| `0003_contratos.sql` | `tenants` (+`_details`, `tenant_aliases`), `leases`, `lease_units`, `lease_terms` (historial de renta sin traslapes), vista `lease_terms_breakdown`, `lease_term_at()` |
| `0004_rentas_gastos.sql` | `charges`, `charge_adjustments`, `payments`, `payment_allocations` (trigger de límites), vista `charge_balances`, `expenses`, `expense_shares` (prorrateo), `expense_payments`, `expense_recoveries` |
| `0005_documentos_importacion.sql` | `documents` (+versiones, vínculos), `import_batches`, `import_rows`, `source_records`, `import_discrepancies`, `source_of_truth_rules`, `period_locks`, `critical_dates` |
| `0006_rls.sql` | Primera versión de RLS y buckets privados (sustituida por 0007, se conserva por historial) |
| `0007_hardening.sql` | Funciones de autorización en esquema `app` (no expuesto por PostgREST), políticas definitivas, `search_path` fijo, índices de FK |

## Reglas que hace cumplir la base

- Toda tabla expuesta tiene `org_id` y RLS forzado; `anon` no tiene privilegios en `public`.
- Roles: `viewer` lee patrimonio, contratos y documentos `public_internal`; `operator` además lee y escribe cargos, pagos, gastos, datos protegidos e importaciones; `admin` además ajustes, cierres, fuente de verdad, invitaciones y borrado.
- Un usuario sin membresía activa no ve nada aunque esté autenticado. La membresía se crea automáticamente al aceptar una invitación (`invitations` → trigger en `auth.users`).
- `units.reference_only = true` (terceros) rechaza contratos, cargos y gastos por trigger.
- `payment_allocations`: la suma por pago no excede el pago, la suma por cargo no excede el cargo neto de ajustes, y no se aplica a cargos anulados.
- `lease_terms` no admite períodos traslapados para un mismo contrato.
- `charges.period` es siempre el día 1 del mes (columna MES del Excel).
- Saldos y estado (`open`, `partially_paid`, `paid`, `overdue`, `void`) se derivan en `charge_balances`; nunca se almacenan.
- Montos financieros no se borran: se anulan (`voided_at`) o se ajustan (`charge_adjustments`), con auditoría en `audit_logs`.
- Storage: buckets `legal` (solo admin), `fiscal`, `technical`, `commercial`, `imports` (admin y operator), todos privados. Rutas `<org_id>/...`.

## Pruebas

`tests/rls_negative.sql` crea usuarios y datos `[DEMO]` dentro de una transacción que se revierte y verifica 36 casos (invariantes, cada rol, sin membresía, anon). Última corrida: 36/36 el 2 de noviembre de 2026.

## Pendiente de configurar en el dashboard (no se hace por SQL)

- Auth → desactivar "Enable sign ups" para que el ingreso sea solo por invitación (`inviteUserByEmail` desde el servidor).
- Auth → URL del sitio y redirects cuando exista el despliegue en Vercel.
- `SUPABASE_SERVICE_ROLE_KEY` solo en variables de entorno del servidor; nunca en el repo ni en el navegador.

## Tipos

`src/lib/supabase/database.types.ts` se genera con `generate_typescript_types` (o `supabase gen types`). Regenerar tras cada migración.
