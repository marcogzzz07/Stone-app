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
| `0008_invitacion_reaceptable.sql` | El trigger de alta también honra invitaciones ya aceptadas (usuario borrado y reinvitado) y repara membresías faltantes |

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

## Histórico real (importador)

El 2 de noviembre de 2026, con autorización de Marco, se cargó el histórico de
enero a septiembre de 2026 desde `Reporte Stone_Arrendamientos 2026.xlsx` y
`Stone_Inmuebles_Propiedades.xlsx` (archivos fuera del repositorio). Resultado:
7 inmuebles, 54 unidades, 28 arrendatarios con alias, 31 contratos con 39
condiciones de renta, 292 cargos, 272 pagos aplicados, 7 gastos de servicios con
prorrateo y 64 discrepancias registradas en `import_discrepancies`. Todo con
`source = 'excel'` y lote en `import_batches`.

Cómo se repite (o se carga un corte nuevo):

1. `scripts/import_excel.py <config.json> <reporte.xlsx> <propiedades.xlsx> <salida.sql>`
   lee las hojas, recalcula, coteja contra `Resumen` y genera un `do $$ … $$` con el
   JSON de datos más el cargador `supabase/import/loader.plpgsql`.
2. El JSON de configuración (`docs/privado/importacion-<corte>.json`, ignorado por git)
   contiene lo que depende de datos reales: historial de rentas por arrendatario
   reconstruido de las fórmulas, alias, fechas de inicio conocidas, reglas de prorrateo
   y hallazgos puntuales.
3. El SQL generado se ejecuta en el proyecto (SQL editor o MCP). No es idempotente:
   para recargar, borrar antes lo que tenga `source = 'excel'`.

Reglas del importador: el período es la columna MES (no la fecha de factura); subtotal
= total ÷ 1.16; un pago por factura aplicado al cargo; cobros en efectivo sin factura
se toman de las matrices mensuales con fecha = día 1; nada se corrige en silencio.

La semilla `[DEMO]` (`seed/demo.sql` / `seed/demo_down.sql`) queda solo para entornos
de prueba.

## Pruebas

`tests/rls_negative.sql` crea usuarios y datos `[DEMO]` dentro de una transacción que se revierte y verifica 36 casos (invariantes, cada rol, sin membresía, anon). Última corrida: 36/36 el 2 de noviembre de 2026.

## Configurar en el dashboard de Supabase (no se hace por SQL)

1. **Authentication → Sign In / Providers → Email:** desactivar "Allow new users to sign up". El ingreso es solo por invitación.
2. **Authentication → URL Configuration:** Site URL `http://localhost:3000` mientras no haya despliegue; agregar `http://localhost:3000/auth/callback` (y después la URL de Vercel) en Redirect URLs.
3. **Plantillas de correo:** no hace falta tocarlas. Supabase solo permite editarlas con SMTP propio; con la plantilla por defecto el enlace llega con la sesión en el fragmento de la URL (`#access_token=…`) y `login/hash-session.tsx` la abre en el navegador. Si algún día se configura SMTP, el enlace puede cambiarse a `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=invite` para que lo procese el servidor.
4. **Authentication → Users → Invite user:** invitar a `ma.gonzalez@gs.com.mx` y `p.cabada@gs.com.mx`. Sus invitaciones ya existen en `public.invitations` (admin y operator); al crearse el usuario, el trigger les da la membresía.
5. Opcional: copiar la **service-role key** a `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` (nunca al repo). Con ella, las invitaciones se envían desde Configuración en la plataforma; sin ella, se registran ahí y el correo se manda desde el dashboard.

## Flujo de acceso en la app

- `src/proxy.ts` refresca la sesión y manda a `/login` a quien no la tenga.
- `(app)/layout.tsx` exige membresía activa (`requireMember`); sin ella, `/sin-acceso`.
- `/auth/callback` recibe los enlaces de correo (invitación, enlace mágico) y, tras una invitación, pide definir contraseña en `/cuenta/contrasena`.
- `/configuracion` (solo admin): miembros con cambio de rol, invitaciones pendientes con revocación y formulario de invitación.

## Tipos

`src/lib/supabase/database.types.ts` se genera con `generate_typescript_types` (o `supabase gen types`). Regenerar tras cada migración.
