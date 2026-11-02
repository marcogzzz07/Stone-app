# Modelo de datos a partir del reporte mensual en Excel

Fuente: `Reporte Stone_Arrendamientos 2026.xlsx` (corte a septiembre de 2026), el
archivo que la administración actualiza cada mes. Este documento describe la
**estructura** del archivo y cómo alimenta a la plataforma. No contiene cifras
ni nombres de arrendatarios; el análisis detallado con datos reales vive fuera
del repositorio (`docs/privado/`, ignorado por git).

## 1. Hojas y qué son

| Hoja | Tipo | Qué contiene | Rol en la plataforma |
|---|---|---|---|
| `Facturacion` | **Hechos (fuente primaria)** | Una fila por factura: estado, folio, renta/mtto, mes, fecha factura, ubicación, cliente, facturado, fecha de pago, pagado, pendiente, nota. ~270 filas en 9 meses. | Tabla `charges` + `payments`. Es la única hoja capturada a mano con hechos; todo lo demás son fórmulas sobre ella. |
| `Ubicacion de rentas` | Catálogo | Una fila por contrato vigente: propietario (arrendatario), ubicación, m², renta mensual con IVA, mtto, vencimiento, comentario. Columnas J–L: suma por ubicación. | `leases` (+ `units` y `tenants`). Define la renta pactada. |
| `2026 Renta` | Derivada | Matriz arrendatario × mes con lo **pagado** (referencias a `Facturacion!L`), total pagado y pendiente del año; a la derecha, resumen por ubicación y trimestre. | Cálculo en la app: `pagado por período`. No se importa. |
| `2026 Mtto` | Derivada | Igual que la anterior para cuotas de mantenimiento. | Cálculo en la app. No se importa. |
| `CXC Mensual` | Derivada + captura | Cuentas por cobrar del mes en curso por ubicación y cliente (folio, fecha de pago, pagado, pendiente), para renta y mtto. A la derecha: gastos por servicios (luz, teléfono, mtto, agua) por ubicación y un prorrateo entre copropietarios. | Vista `Rentas y cobranza` del mes. La parte de servicios → `expenses` (nueva captura). |
| `Resumen` | Derivada | Por ubicación: m², precio/m², importe, IVA, total renta, pagado del mes, pendiente del mes y del año; lo mismo para mtto; proyección vs. real por mes. | Es el **dashboard**. Define los KPIs oficiales. |
| `Propiedades Playa` | Catálogo | Inventario de bodegas y locales en Playa del Carmen por propietario (Stone, CIB, GIK): m², descripción, precio de renta de lista con IVA, cliente. | `units` con `scope` Stone / referencia de terceros, y `list_rent`. |
| `Prox propiedades a compra` | Catálogo | Lotes por adquirir: etapa, lote, manzana, m², fecha, empresa, valor/m². | `units` en estado `prospecto` (nuevo). |

## 2. Entidades que aparecen

- **Ubicación (desarrollo):** 7 en operación + Playa del Carmen como inventario. En la app es `developments`.
- **Arrendatario:** ~28 razones sociales. `tenants`. El Excel los escribe con variantes (mayúsculas, con/sin "S.A. de C.V.", espacios dobles), así que el importador necesita una tabla de alias.
- **Contrato:** una fila de `Ubicacion de rentas`. `leases` con `monthly_rent_total` (con IVA), `maintenance_fee` (puede variar mes a mes), `end_date`.
- **Factura (cargo):** fila de `Facturacion`. `charges` con `concept` ∈ {renta, mantenimiento}, `period` (columna MES, no la fecha de factura), `invoice_folio`, `total`.
- **Pago:** fecha de pago + monto pagado en la misma fila. `payments` + `allocations` 1:1 por ahora (el Excel no modela pagos parciales ni un pago para varias facturas, pero sí hay filas de "renta anticipada" y "se refacturó").
- **Gasto de servicios:** bloque P–U de `CXC Mensual`. `expenses` por ubicación y categoría, con prorrateo entre copropietarios.
- **Propietario de la unidad:** `Propiedades Playa` separa Stone, CIB y GIK → `ownership`.

## 3. Reglas de cálculo que la app debe replicar

1. **Renta pactada** = suma de la renta mensual con IVA de los contratos vigentes (`Ubicacion de rentas`).
2. **Importe sin IVA** = total / 1.16; **IVA** = importe × 0.16. El Excel guarda el total y deriva lo demás.
3. **Pagado del mes** = suma de `PAGADO` en `Facturacion` para las filas con `MES` = mes del reporte y concepto renta (hoja `2026 Renta`, columna del mes).
4. **Pendiente del mes** = renta pactada − pagado del mes (en `Resumen`). Ojo: no es la suma de `PTE DE PAGO` de las facturas del mes; ver §4.
5. **Pendiente del año** = renta pactada × meses transcurridos − pagado del año, con ajustes manuales por contrato cuando la renta cambió durante el año (fórmulas como `(renta_anterior × n) + (renta_nueva × m) − pagado`). En la app esto se resuelve con **historial de renta por contrato** (`lease_rent_history`), no con ajustes a mano.
6. **Proyección mensual** = renta pactada total + lo facturado del arrendatario con renta variable (San Jerónimo); **Real** = pagado de renta + pagado de mtto del mes. Cumplimiento = real / proyección.
7. **Precio por m²** = importe sin IVA / m².
8. Renta de lista en Playa = tarifa/m² × m² × 1.16 (tarifas 144, 160 y 575 según tipo).

## 4. Hallazgos a resolver con administración (no se corrigen en silencio)

Detalle con cifras en `docs/privado/hallazgos-excel-2026-09.md`. Resumen de tipos:

- **Dos definiciones de "pendiente"** que no cuadran entre sí: la de `Resumen`/`2026 Renta` (pactado − pagado) y la de `Facturacion` (facturado − pagado). Difieren porque hay facturas pendientes de meses anteriores que ya no se cuentan en el pactado, y renta pactada que no se facturó. La app mostrará ambas con nombre distinto: *saldo facturado por cobrar* y *renta pactada no cobrada*.
- **Ajustes manuales en fórmulas** (restas fijas, multiplicadores por meses) que encierran reglas de negocio: cambios de renta a mitad de año, descuentos, una refacturación. Hay que convertirlas en datos.
- **Referencias de celda incorrectas** en al menos una fila de `2026 Renta` (toma m² y renta de otro arrendatario) y `#REF!` en los totales de octubre–diciembre de `2026 Mtto`.
- **Fechas de factura con año 2025** en facturas de enero y mayo de 2026 (probable error de captura al copiar el año anterior).
- **Columna MES distinta al mes de la fecha de factura** en ~21 filas: rentas anticipadas y facturas emitidas en el mes siguiente. Confirma que el período contable es la columna MES.
- **Conceptos con variantes** ("RENTA", "Renta ", "MTTO", "Mtto") y nombres de cliente con variantes → normalizar con alias.
- **Un arrendatario paga en efectivo** y otro tiene renta variable mes a mes; el mantenimiento de dos ubicaciones "varía según el mes". El modelo debe admitir cargos sin contrato fijo.
- **Mantenimiento de Torre Evalor:** lo pagado en el mes supera por mucho la cuota mensual (pagos acumulados de varios meses); el "pendiente del mes" sale negativo. Requiere períodos por cargo, no por mes de pago.

## 5. Impacto en el plan de la Iteración 1

- Tablas confirmadas: `developments`, `units`, `tenants`, `leases`, `charges`, `payments`, `allocations`, `expenses`, `ownership`.
- Tablas nuevas: `lease_rent_history`, `tenant_aliases`, `import_batches` + `import_discrepancies` (ya previstas en el spec).
- Estado nuevo de unidad: `prospecto` (lotes por comprar).
- Importador: lee `Facturacion` (hechos) y `Ubicacion de rentas` (contratos); recalcula todo lo derivado y compara contra `Resumen` del mismo archivo para reportar diferencias como discrepancias.
- KPIs del dashboard que se alinean con `Resumen`: renta pactada, pagado del mes, pendiente del mes, pendiente del año, cumplimiento proyección/real, y lo mismo para mantenimiento.
