# STONE INMUEBLES — Product Specification

**Versión:** 0.2 — especificación consolidada para iniciar desarrollo por etapas  
**Fecha:** 1 de noviembre de 2026  
**Estado:** Aprobado para *scaffolding*, prototipo visual y esquema de datos; no para cargar información real sin validación  
**Producto:** plataforma web privada de inventario, administración de rentas y exploración patrimonial geográfica  
**Desarrollo:** Claude Code · **Despliegue propuesto:** Vercel · **Datos y autenticación propuestos:** Supabase

> **Visión:** Stone Inmuebles será un atlas patrimonial privado que conecta propiedades, unidades, planos, coordenadas, documentos legales/fiscales, contratos, rentas, pagos y gastos. No será solamente un reporte de Excel, ni un ERP contable completo. Debe permitir migrar gradualmente la operación desde Excel hacia la aplicación.

> **Instrucción de precedencia:** esta versión **sustituye a la v0.1**. Las decisiones en «Decisiones confirmadas» son requisitos. Los temas en «Pendientes no bloqueantes» **no deben resolverse mediante supuestos de negocio**; construir modelos configurables y datos de ejemplo, o aislar la funcionalidad hasta su validación.

---

## 1. Decisiones confirmadas con el usuario

| ID | Decisión | Implementación requerida |
|---|---|---|
| D01 | **Stone primero, expandir después** | El alcance operativo inicial es Stone Inmuebles. El modelo admite múltiples personas o entidades propietarias y administradoras en el futuro. |
| D02 | **MVP = inventario + administración de rentas** | Ambas capacidades son prioritarias, junto con una base de mapa, documentación y seguridad. |
| D03 | **Ya existen planos y coordenadas** | Soportar importación/registro de geometrías verificadas, no inventar polígonos. Los formatos disponibles exactos se confirmarán al trabajar con archivos reales. |
| D04 | **Actualización híbrida: Excel + captura manual** | Misma base de datos, con procedencia clara y revisión/conciliación al importar. |
| D05 | **Acceso de familia y personal administrativo** | Acceso por invitación y roles diferenciados; sin portal público en MVP. |
| D06 | **Desarrollos compartidos: opción B** | Mostrar el desarrollo completo como **contexto**, pero gestionar solo unidades de Stone. Los espacios de terceros quedan como referencia, sin contratos, movimientos ni documentos privados. |
| D07 | **Transición financiera gradual: opción C** | Fase inicial Excel como fuente operativa, fase híbrida y Stone como fuente principal posteriormente. El cambio de fuente se controla por propiedad/contrato y período. |

**Decisiones todavía no tomadas:** tratamiento real de las cuotas de mantenimiento, fuente y formato exacto del Excel, campos definitivos del contrato, manejo de entidades fiscales, flujos de aprobación y reportes a priorizar. Estas incógnitas no bloquean la primera iteración si se modelan correctamente.

## 2. Problema, usuarios y objetivos

### 2.1 Problema

La información patrimonial, geográfica y financiera está dispersa en reportes de Excel/PowerPoint, planos, documentos legales, contratos y archivos. El reporte mensual contiene ingresos y gastos, pero carece de un expediente maestro unificado por inmueble, unidad y contrato; además, existen diferencias de conciliación en los importes reportados.

### 2.2 Objetivos de negocio

1. Saber **qué activos administra Stone**, qué unidades integran cada desarrollo, quién es el titular legal y dónde se ubican.
2. Consultar mapas, polígonos, áreas, dimensiones y planos, diferenciando fuentes legales de mediciones digitales aproximadas.
3. Consultar expedientes legales, fiscales, técnicos y comerciales con permisos.
4. Gestionar arrendatarios, contratos, cargos, cobros parciales, anticipos, saldos históricos y gastos.
5. Reproducir reportes mensuales auditables y disminuir la dependencia de Excel sin romper el proceso existente.
6. Dar visibilidad ejecutiva a familiares y herramientas operativas al personal administrativo.

### 2.3 Usuarios y permisos

- **Administrador familiar:** acceso a todo el portafolio Stone; configura usuarios, aprueba cambios relevantes, accede a documentos sensibles.
- **Administración inmobiliaria:** altas/ediciones de inmuebles, contratos, cargos, pagos, importaciones y gastos, con restricciones configurables.
- **Consulta familiar:** visualización de activos, mapa y cifras autorizadas, sin edición.
- **Accesos externos (futuro):** asesores legales, fiscales y contables, acotados por entidad, inmueble o tipo de documento.

Los permisos no deben depender exclusivamente de ocultar botones en UI; se hacen cumplir en servidor y políticas RLS.

## 3. Alcance del MVP y exclusiones

### 3.1 Imprescindible en MVP

- Login privado por invitación; tres perfiles iniciales y bitácora de acciones relevantes.
- Catálogo de desarrollos, activos, propiedades y unidades; vínculo de propietario legal versus administrador.
- Registro de espacios de terceros solo a nivel de **contexto visual mínimo** en desarrollos compartidos.
- Fichas visuales de propiedad y unidad, con fotos, mapas, medidas, documentos y campos legales/fiscales.
- Mapa interactivo, vista satelital disponible mediante proveedor licenciado, puntos y polígonos reales.
- Arrendatarios, contratos, vencimientos, cargos de renta y cobro, pagos parciales, anticipos y saldo por cargo.
- Registro de gastos y mantenimiento; distinguir pago de Stone de cargo o recuperación al inquilino.
- Captura manual, importación de Excel/CSV con validación, conciliación y fuente rastreable.
- Dashboard ejecutivo por mes, propiedad y unidad, con notas de calidad y definición de los KPI.
- Exportación de datos y documentación de uso básico.

### 3.2 Fuera del MVP

Emisión/timbrado de CFDI, integración SAT, banca en línea, domiciliaciones, conciliación bancaria automática, valuación automatizada, OCR/IA legal, portal de inquilinos, pagos online, ERP contable completo, GIS/catastro certificado, flujos complejos de aprobación.

## 4. Modelo patrimonial y geográfico

### 4.1 Jerarquía conceptual

```text
STONE INMUEBLES (organización administradora inicialmente activa)
└── Desarrollo / complejo (puede contener propietarios distintos)
    ├── Terreno / edificio / propiedad física
    │   ├── Unidad A — administrada por Stone → contrato(s), cargos, pagos
    │   ├── Unidad B — administrada por Stone → contrato(s), cargos, pagos
    │   └── Unidad C — tercero → solo datos de referencia visibles
    └── Áreas comunes / vialidades / contexto físico (solo referencia)
```

Una propiedad individual sin unidades también es válida, al igual que un terreno sin contrato ni renta. **El desarrollo no debe confundirse con la suma de contratos o la entidad propietaria.**

### 4.2 Reglas para desarrollos compartidos

1. Visualizar perímetro y distribución general del desarrollo cuando los archivos permitan hacerlo.
2. Solo unidades bajo administración Stone serán **operables**: contratos, cobros, gastos y archivos privados.
3. Unidades de terceros se registran como `reference_only = true`, con identificador y geometría/posición si está permitido y respaldado. Sin documentación, información personal o financiera de terceros.
4. Mostrar colores/simbología diferenciados para «Stone» y «Referencia de terceros».
5. La agregación de rentas, ocupación, metros administrados y rentabilidad **excluye unidades de terceros** por defecto; el total físico del desarrollo se reporta por separado.
6. Preparar infraestructura para habilitar administración de otras entidades posteriormente, sin promover datos de referencia automáticamente a registros operativos.

### 4.3 Geometrías, planos y superficies

- Coordenadas y polígonos se almacenan con procedencia, fecha, sistema de referencia, precisión y responsable.
- Entrada preferida: GeoJSON/KML/KMZ convertido y validado; también captura manual de vértices, según calidad de archivo disponible.
- Superponer planos como documentación. Georreferenciar raster/PDF únicamente si existen puntos de control válidos.
- **Guardar por separado:** superficie legal/escritura; superficie catastral; superficie construida; superficie rentable; área aproximada calculada del polígono.
- Mostrar perímetro calculado con precisión/limitaciones; medidas y colindancias por lindero solo si provienen de plano o captura validada.
- Una geometría sin coordenadas completas tendrá estado «Pendiente de trazo», sin límites ficticios.
- Conservar versiones de geometría; cambios de límite sensibles requieren rastro de auditoría.

## 5. Navegación y experiencia visual

La aplicación debe transmitir una experiencia de **atlas patrimonial privado**, moderna, muy visual y sobria; evitar interfaz de ERP genérico. Desktop-first, responsive para móvil/tablet, estados vacíos claros y buscador transversal.

### 5.1 Navegación principal

1. **Dashboard** — KPIs y alertas.
2. **Mapa patrimonial** — desarrollo/propiedades/unidades y polígonos.
3. **Propiedades** — inventario, desarrollos, fichas y fotografías.
4. **Rentas y cobranza** — cargos, pagos, saldos, comparativos y conciliación.
5. **Contratos** — arrendatarios, condiciones, vigencias, incrementos y archivos.
6. **Documentos** — expediente legal, fiscal y técnico.
7. **Calendario** — fechas de contrato, actualización, predial, seguro y obligaciones.
8. **Configuración** — usuarios, catálogos, importaciones y permisos (solo autorizados).

### 5.2 Dashboard

- Filtros por mes/año, desarrollo, inmueble, unidad, tipo, entidad y estado.
- **Patrimonio:** número de activos y unidades de Stone, superficies, ocupación calculada solo sobre las unidades con estado conocido.
- **Finanzas:** renta contractual programada, cargos del periodo, cobros aplicados, saldos por cobrar, vencidos y gastos operativos.
- Gráficos: facturación/cargos versus cobros por mes, deuda por antigüedad, por propiedad, gastos por categoría.
- Lista de vencimientos próximos y discrepancias de importación.
- KPIs con descripción visible de periodo, moneda, IVA, origen y grado de conciliación.

### 5.3 Mapa patrimonial

- Vista cartográfica / satélite (según licencia contratada); zoom, filtros por inmueble y tipo.
- Capa de polígonos de desarrollos y de unidades con geometría confiable.
- Colores de Stone versus referencia, leyenda explícita y listado lateral sincronizado.
- Clic en geometría: tarjeta con foto, nombre, superficie **identificada por tipo**, estado, renta de lista/contractual según corresponda y botón «Ver expediente».
- Modo administrador: agregar/editar polígonos e importar geometría con vista previa y validaciones.
- No mezclar perímetros ilustrativos, legales y calculados sin leyenda de procedencia.

### 5.4 Ficha del desarrollo

- Cabecera fotográfica, dirección, ciudad, mapa, propietario(s) si está documentado, total de unidades y unidades Stone.
- Croquis o mapa de distribución; Stone seleccionable, terceros solo como contexto.
- Vista de unidades administrables y resumen agregado **exclusivo Stone**.
- Documentos del desarrollo autorizados, sin exponer expedientes de terceros.

### 5.5 Ficha individual de propiedad/unidad

**Cabecera:** imagen, nombre interno, código, ubicación, clasificación, titular, administrador, estado, medidas clave y acciones según permiso.

**Pestañas de ficha:**

| Pestaña | Campos principales |
|---|---|
| Resumen | Descripción, tipo, desarrollo, propietario legal, administrador, estado de disponibilidad/ocupación, fotos, notas |
| Terreno y ubicación | Dirección, coordenadas, polígono, superficie legal/catastral/construida/rentable, perímetro cartográfico, planos, medidas y colindancias validadas |
| Legal y fiscal | Escritura, folio real, notaría, clave catastral, predial, titular/es, RFC donde corresponda, uso de suelo y obligaciones, siempre con fuente y estado de verificación |
| Comercial y contratos | Renta de lista, arrendatarios, contratos vigentes e históricos, vigencias, depósitos, incrementos, fechas relevantes |
| Finanzas | Cargos, cobranza, saldos, históricos, mantenimiento, servicios, gastos; ingreso operativo neto solo cuando la información sea suficiente |
| Documentos e historial | Archivos versionados, fechas, origen, responsable, actividad, permisos de acceso |

**Estados de dato:** confirmado / por verificar / no disponible. Nunca asumir que ausencia de contrato significa unidad disponible si no se ha validado.

## 6. Flujo de contratos

### 6.1 Relaciones

- Un contrato se asocia a una entidad arrendadora legal y un arrendatario.
- Puede incluir **una o varias unidades**, cada una con su participación o desglose económico, si aplica.
- Guardar monto, moneda, periodicidad, tratamiento fiscal aplicable, vigencia, fecha de pago, depósitos, mantenimiento, incrementos, responsables y documentación.
- Guardar condiciones económicas versionadas (`lease_terms`) en vez de modificar importes históricos silenciosamente.

### 6.2 Estados y eventos

- Estados base: `draft`, `active`, `expired`, `terminated` (y anulado cuando aplique con auditoría).
- «Por vencer» es **alerta derivada de la fecha**, no necesariamente estado persistente alternativo.
- Renovación y modificaciones contractuales conservan historia: nuevo documento/versión/condición; definir después si renovación crea contrato vinculado nuevo.
- Contratos pueden registrar anexos, actualizaciones de rentas y reglas de incremento fijo o indexado **solo cuando se documente la fórmula real**.
- No iniciar generación real de cargos sin revisar periodicidad, prorrateos, descuentos y parámetros fiscales de cada contrato.

### 6.3 Datos mínimos

Arrendatario, entidad arrendadora, unidad(es), fecha de inicio, fecha de fin, renta base, moneda, periodicidad, día de vencimiento, componentes adicionales aplicables, depósito en garantía, contrato adjunto y origen/estado de validación.

## 7. Flujo de rentas, cargos, cobros y saldos

### 7.1 Conceptos que jamás se deben confundir

- **Renta de lista:** precio comercial publicado o estimado por una unidad, incluso vacía; no es ingreso.
- **Renta contractual:** monto pactado según versión de contrato aplicable.
- **Cargo programado:** monto esperado según contrato, aún no emitido/validado como cuenta por cobrar.
- **Cargo registrado:** obligación del arrendatario por periodo y concepto (renta, mantenimiento repercutido, servicio, etc.). No significa CFDI timbrado.
- **Factura/CFDI:** documento fiscal, ajeno al MVP; si se carga, solo conservar referencia, número y comprobante.
- **Pago recibido:** efectivo/cobro registrado, que puede estar sin asignar.
- **Aplicación del pago:** porción de un pago que se asigna a cargo(s) concreto(s).
- **Saldo por cobrar:** importe exigible menos aplicaciones y ajustes autorizados; incluye saldo vencido y no vencido.
- **Depósito en garantía:** pasivo/garantía, **no renta ni ingreso operativo**.

### 7.2 Flujo operativo

```text
Contrato y condiciones vigentes
  → Propuesta de cargos del período
  → Revisión/confirmación (o importación desde Excel)
  → Cuenta por cobrar por contrato/unidad/período/concepto
  → Registro de pago recibido (parcial, total, anticipo)
  → Aplicación explícita a uno o varios cargos
  → Saldos, antigüedad, conciliación y cierre mensual
```

Un pago puede cubrir varios cargos; un cargo puede liquidarse con varios pagos. Los anticipos deben quedar disponibles como saldo a favor hasta su aplicación. Los ajustes (descuentos, notas, condonaciones o correcciones) no se disfrazan de pagos; deben tener razón, usuario, fecha y permiso.

### 7.3 Datos de pagos

Fecha efectiva, fecha de registro, monto, moneda, medio, referencia bancaria/transferencia si existe, arrendatario, cuenta receptora cuando proceda, comprobante, fuente (`manual`/`excel`/`other`) y usuario. No almacenar credenciales bancarias.

### 7.4 Estados de cargo

`draft` (propuesta), `open` (exigible), `partially_paid`, `paid`, `overdue` (derivado de vencimiento/saldo), `void` (con motivo). Evitar sobrescribir pagos: utilizar ajustes reversibles y bitácora.

### 7.5 Cálculos y reportes

- **Cobranza de cargos del período** = pagos aplicados a cargos de ese período / total exigible de esos cargos, con denominador y manejo de ajustes declarados.
- **Cobros recibidos durante el mes** es otra métrica: puede incluir adeudos de meses anteriores y anticipos.
- **Saldo total pendiente** no equivale a «facturado del mes − cobrado en el mes» si existen pagos aplicados fuera de periodo, anticipos, descuentos o cargos extraordinarios.
- Años anteriores, saldo de apertura y ajustes deben conservarse con su origen.
- Se requiere reporte **por período de cargo** y reporte **por fecha de cobro** como vistas separadas.
- En todos los importes distinguir subtotal, IVA, otros impuestos/cargos, total y moneda; evitar mezclar bases con/sin IVA.

## 8. Flujo de gastos, mantenimientos y servicios

### 8.1 Dos operaciones distintas

**A. Stone paga un gasto** a un proveedor o a la administración de un desarrollo: egreso del inmueble, con su pago y evidencia.

**B. Stone cobra o recupera un concepto** de un arrendatario: cargo por cobrar al inquilino, a veces relacionado con un gasto pero no idéntico a éste.

**No está confirmado** si las «cuotas de mantenimiento» del reporte representan A, B o ambos. Por eso el esquema deberá soportar **ambos**, y el importador deberá mostrar clasificación pendiente hasta que se valide el Excel de origen.

### 8.2 Datos de gasto

Propiedad/unidad, categoría (mantenimiento, luz, agua, teléfono, predial, seguros, reparaciones, honorarios, otros), proveedor, periodo de consumo, fecha de cargo, fecha de pago, subtotal, impuestos, total, moneda, pagador, comprobante, estado de pago y recuperabilidad.

### 8.3 Recuperaciones y asignaciones

Si un gasto es repercutible, permitir asociarlo opcionalmente con cargo(s) al arrendatario; mantener dos movimientos separados, no contabilizar un egreso como ingreso negativo ni compensar automáticamente.

### 8.4 KPI financiero de propiedad

- Renta contractual programada y cargos emitidos por separado.
- Ingresos operativos bajo criterio explícito (devengo) y cobros de caja bajo criterio de flujo.
- Gastos operativos atribuibles, indicando si están pagados o devengados.
- **Resultado operativo neto (NOI estimado)** solo cuando los datos estén suficientemente clasificados/conciliados; sin financiamiento, impuestos sobre utilidad o depreciación, y claramente etiquetado.
- Comparación real versus presupuesto solo si se aclara definición de «real» del Excel de origen.

## 9. Estrategia de transición Excel → Stone

### 9.1 Etapas

| Etapa | Fuente operativa | Función de Stone |
|---|---|---|
| 1. Inicio | Excel validado | Importar, revisar, consultar, añadir datos manuales, generar fichas y paneles |
| 2. Híbrida | Excel + Stone | Contratos generan cargos para inmuebles piloto; se comparan con Excel y se concilian diferencias |
| 3. Destino | Stone | Contratos, cargos, pagos y gastos son registros principales; Excel queda para importar/exportar/conciliar |

El origen principal debe definirse a nivel de **propiedad o contrato y período**, con `source_of_truth`, `effective_from` y usuario que autorizó la transición. No deben existir dos flujos generando cargos duplicados para el mismo contrato/período/concepto.

### 9.2 Flujo de importación

1. Subir archivo XLSX/CSV; almacenarlo como fuente privada inmutable y generar identificador de lote.
2. Mostrar mapeo y previsualización de columnas; confirmar hoja, moneda, período, propiedad y tipo de movimiento.
3. Validar formatos, importes, IVA, unicidad, referencias de unidad/contrato y estado del período.
4. Clasificar filas: **nueva**, **duplicada**, **potencial duplicado**, **conflicto**, **dato incompleto**.
5. Presentar comparación con Stone y cifras del reporte original, sin cambiar automáticamente ninguno.
6. Aprobar/rechazar/justificar por fila o lote; guardar usuario, momento, archivo, fila y valores antes/después.
7. Confirmación transaccional: si falla parcialmente, nunca dejar un cargo/pago duplicado o una aplicación huérfana.
8. Generar resumen de conciliación y exportar incidencias.

**Clave de idempotencia:** identificador externo si existe; si no, combinación controlada de organización, origen, inmueble/unidad, arrendatario/contrato, período, tipo de movimiento, fecha, importe y referencia, **sujeta a revisión**, no deduplicación ciega solo por nombre o cantidad.

### 9.3 Cierre mensual

- Resumen de cargos, cobros aplicados, cobros sin aplicar, saldos y gastos del período.
- Alertas de sumas que no concilian y filas sin clasificación.
- Estado `open` / `under_review` / `closed`, con usuario y timestamp.
- Correcciones posteriores se registran como ajustes trazables o reapertura autorizada, no eliminación silenciosa.

## 10. Modelo relacional lógico recomendado

Los nombres son orientativos; Claude Code debe proponer migraciones normalizadas y llaves/índices antes de codificar CRUD.

| Tabla / recurso | Función y relaciones críticas |
|---|---|
| `organizations` | Organización administradora, Stone inicialmente; preparada para expansión |
| `profiles`, `memberships`, `roles` | Usuarios, organización y niveles de acceso; eventualmente restricciones por activo/módulo |
| `legal_entities` | Personas físicas/morales propietarias/arrendadoras/administradoras, no equivalentes a organización de login |
| `developments` | Complejos o desarrollos con ubicación y límites generales |
| `assets` | Terrenos, edificios, locales o predios; vínculo opcional a desarrollo y activo padre |
| `units` | Unidades físicas; `reference_only`, `managed_by_org_id`, condición ocupacional y relación a activo/desarrollo |
| `ownership_interests` | Titulares, participación y vigencia, con fuente documental |
| `geometries` | Geometría PostGIS, tipo, SRID, fuente, fecha, precisión, versión, calculados estimados |
| `tenants` | Personas físicas/morales arrendatarias, datos protegidos |
| `leases`, `lease_units`, `lease_terms` | Contratos multiunidad, condiciones versionadas, plazo, anexos e incrementos |
| `charges`, `charge_lines`, `charge_adjustments` | Cargos, desglose fiscal/conceptual, descuentos, anulaciones y correcciones |
| `payments`, `payment_allocations` | Cobros y asignación muchos-a-muchos a cargos |
| `expenses`, `expense_payments` | Gastos devengados/pagados y vínculo opcional a recuperaciones |
| `documents`, `document_links`, `document_versions` | Archivo privado y asociaciones múltiples con controles de acceso |
| `critical_dates`, `reminders` | Vencimientos y recordatorios en UI (notificaciones posteriores) |
| `import_batches`, `import_rows`, `source_records` | Origen inmutable, mapeos, conflictos, auditoría de importaciones |
| `period_locks`, `source_of_truth_rules` | Fuente financiera por alcance y periodo; bloqueo/cierre de períodos |
| `audit_logs` | Creación, edición, reversión, accesos sensibles y cambios críticos |

**Invariantes:**

- Prohibido crear arrendamientos/cargos/gastos en unidades `reference_only`.
- Exigir que cada monto tenga moneda, tipo, fuente y periodo cuando aplique.
- Restricciones de integridad en montos aplicados (`sum(allocations) <= payment`) y saldo/importe del cargo con ajustes validados.
- Importaciones idempotentes por lote/fila/identificador de fuente.
- Historial de contratos, geometrías y datos críticos preservado.
- Separación física y lógica de documentos; buckets privados, permisos por rol y enlaces temporales.
- Todos los accesos multi-entidad deben validarse en backend + RLS; no exponer claves privilegiadas al cliente.

## 11. Datos de referencia: informe septiembre de 2026

**Documento recibido:** `Stone Inmuebles - Informe Septiembre 2026.pptx` (10 diapositivas). Es referencia de campos e indicadores, **no sustituto del Excel fuente ni evidencia jurídica de los activos**.

### 11.1 Reporte de rentas

Se presentan siete registros: Héroes de Lincoln, Loma Blanca, Lomas del Valle, Santa Isabel, Central de Playa, Torre Evalor y Torre San Jerónimo.

| Métrica publicada en el informe | Valor |
|---|---:|
| Total de renta septiembre, con IVA | $852,928.03 MXN |
| Cobrado septiembre | $804,034.03 MXN |
| Pendiente septiembre **reportado** | $45,994.00 MXN |
| Pendiente acumulado 2026 **reportado** | $178,814.00 MXN |
| Superficie sumada de la tabla de rentas | 18,085.20 m² |

**No corregir silenciosamente:** $852,928.03 − $804,034.03 = **$48,894.00**, versus **$45,994.00** declarados pendientes: diferencia de **$2,900.00**. En Torre Evalor, $145,580.00 − $110,780.00 = $34,800.00, contra pendiente declarado de $31,900.00. En Central de Playa, $2,500.00 + $400.00 de IVA no explican total de $80,798.64. Todas requieren conciliación con el Excel fuente.

### 11.2 Inventario Playa del Carmen

- El reporte contiene **23 espacios** de varios titulares (CIB Inmuebles, GIK Capital, Stone Inmuebles).
- **15 unidades** están atribuidas a Stone; las otras **8** deben tratarse exclusivamente como **referencia del desarrollo**, salvo validación y eventual habilitación administrativa futura.
- La renta **de lista** mensual agregada declarada para las 15 unidades Stone es **$713,181 MXN con IVA**. No inferir que se haya facturado/cobrado.
- Tres espacios del inventario muestran cliente registrado, bajo GIK Capital; no extrapolar ocupación a Stone.

### 11.3 Reportes y gastos existentes

- Cuotas de mantenimiento y servicios por inmueble (luz, teléfono, mantenimiento, saneamiento, agua/drenaje).
- Comparativo de real versus proyección 2026 y cifras mensuales de enero a septiembre.
- El documento no permite fijar sin ambigüedad si todas las cuotas representan egresos, recuperaciones o cobros a inquilinos. Mantener la opción como pendiente.
- La sección de tendencia contiene una instrucción de subir gráficas manualmente; el MVP debe generar tendencias desde movimientos conciliados, no depender de imágenes pegadas.

## 12. Tecnología propuesta

| Componente | Elección inicial |
|---|---|
| Desarrollo | Claude Code; repositorio Git |
| Frontend/backend | Next.js App Router + TypeScript |
| Diseño | Tailwind CSS + shadcn/ui; Recharts o ECharts |
| Hosting | Vercel (desarrollo, preview y producción separados) |
| Auth y datos | Supabase Auth + PostgreSQL + RLS |
| Archivos | Supabase Storage con buckets privados |
| GIS | PostGIS y MapLibre GL JS con editor de polígonos compatible (evaluar Geoman) |
| Cálculos geográficos | PostGIS con método y unidades explícitos; Turf.js solo para previsualización si conviene |
| Excel | Lector XLSX/CSV en servidor con validación de esquema y revisión humana |

El proveedor de mapas satelitales y sus licencias/costos deben seleccionarse antes de producción; MapLibre no suministra por sí solo imágenes satelitales. Almacenar geometrías inicialmente en WGS84 (`EPSG:4326`) y calcular áreas/perímetros con método métrico/geodésico apropiado, documentando precisión.

### Seguridad y operaciones mínimas

- Supabase RLS habilitado en tablas expuestas y pruebas negativas de permisos.
- Archivos sensibles nunca públicos ni visibles por URL permanente.
- Nunca registrar credenciales, RFC completos, escrituras o datos personales reales en logs de depuración o demos.
- No almacenar archivos sensibles en repositorio público o ambiente preview de acceso abierto.
- Migraciones versionadas, backups, variables de entorno separadas y transacciones para cambios financieros.
- Auditoría de corrección/reversión de importaciones, pagos, contratos y documentos.

## 13. Implementación incremental para Claude Code

**Puede iniciar ya.** Evitar construir toda la aplicación y conectar datos financieros reales en una sola iteración.

### Iteración 0 — Diseño técnico y UX (iniciar ahora)

1. Leer este documento y generar `IMPLEMENTATION_PLAN.md` con decisiones, arquitectura, migraciones propuestas y pruebas.
2. Proponer diseño de navegación, modelo relacional y matriz de permisos.
3. Construir prototipo navegable **solo con datos sintéticos etiquetados**: dashboard, mapa, ficha de desarrollo, ficha de inmueble/unidad, rentas y contratos.
4. Validar visualmente y ajustar experiencia antes de construir workflows complejos.

### Iteración 1 — Base patrimonial

5. Crear proyecto Supabase y migraciones con RLS, usuarios, desarrollos, activos, unidades y titulares.
6. Implementar fichas, fotos, documentos privados y buscador.
7. Implementar mapa con puntos y polígonos; diferenciación Stone versus referencia; importación de geometrías.

### Iteración 2 — Finanzas e importación

8. Implementar contratos y condiciones versionadas; cargos manuales, pagos, asignaciones, saldos y ajustes.
9. Implementar gastos y clasificación separada de cobros recuperables, **sin suponer aún qué son las cuotas del reporte**.
10. Crear wizard de importación con archivo original, preview, conciliación, idempotencia y bitácora.
11. Construir dashboards financieros desde datos operativos, no cifras mock.

### Iteración 3 — Estabilización y migración

12. Probar casos de pagos parciales, anticipo, periodos cruzados, reversos, cierre, duplicados y diferencias del informe.
13. Cargar un inmueble piloto y un mes verificado desde Excel; comparar saldos y aprobar corte.
14. Establecer fuente principal por inmueble/período y operar transición gradual.

**No iniciar fase 2 de finanzas con datos reales sin Excel original, validación de cuotas de mantenimiento, detalle de contratos e importes conciliados.**

## 14. Criterios de aceptación

1. Ingreso solo por invitación y controles por rol tanto en UI como en servidor.
2. Alta de terreno sin rentas, y desarrollo con múltiples unidades de Stone y referencias de terceros.
3. Un tercero aparece como contexto sin generar ingresos, contratos ni documentos administrables.
4. Ficha separa identidad legal, administración, superficie legal y área estimada de GIS.
5. Mapa permite consultar y editar geometrías solo con permisos; no crea polígonos ficticios.
6. Ficha muestra fotos, documentos privados versionados, alertas y los movimientos financieros de su unidad.
7. Contratos permiten múltiples unidades, condiciones versionadas, vencimientos y depósitos diferenciados de renta.
8. Un cargo admite pagos parciales; un pago puede aplicarse a múltiples cargos; anticipos no inflan automáticamente la cobranza del periodo.
9. Los gastos son independientes de los cargos de recuperación al arrendatario.
10. Importar el mismo lote o fila no duplica cargos/pagos; cada fila tiene procedencia y estatus.
11. Los $2,900 de diferencia y el caso Central de Playa del informe producen alertas hasta conciliación.
12. Los KPIs tienen moneda, IVA, periodo y definición del origen; no se presentan «reales» inconsistentes como conciliados.
13. El primer prototipo usa datos sintéticos y puede navegarse antes de cargar documentos familiares.
14. Se puede configurar, para un inmueble/período piloto, si Excel o Stone será la fuente principal sin crear doble contabilización.

## 15. Pendientes de descubrimiento — NO bloquean la Iteración 0/1

| Prioridad | Pregunta | Consecuencia / mitigación provisional |
|---|---|---|
| **Alta antes de datos reales** | ¿Las cuotas de mantenimiento reportadas son pago de Stone, cargo al inquilino, o ambas? | Modelo admite ambos; importación exige clasificación explícita. |
| **Alta antes de datos reales** | ¿Podemos recibir el Excel original, pestañas y fórmulas? | No programar importación definitiva o conciliación irreversible desde PPTX. |
| **Alta antes de finanzas reales** | ¿Qué contratos, unidades y arrendatarios corresponden a las siete líneas de renta? | No asignar a unidades individuales por inferencia. |
| Alta | ¿Qué formatos de planos y coordenadas existen, y son legalmente aprobados o preliminares? | Mapear formatos y procedencia; geometrías bajo revisión. |
| Media | ¿Qué aprobación requieren anulaciones, cierres y ajustes financieros? | Solo rol admin en prototipo; parametrizar luego. |
| Media | ¿Cómo se definen cargos de mantenimiento, depósitos, intereses y aumentos de renta? | Campos y concepto flexible, sin cálculos automáticos no validados. |
| Media | ¿Qué reportes/exportaciones mensuales son obligatorios? | Iniciar dashboard y exportación CSV genérica. |
| Media | ¿Habrá valores de adquisición, mercado, CAP rate y métricas de patrimonio? | Posponer valuación a fase 2. |
| Media | ¿Cuáles permisos sensibles específicos requiere el personal administrativo? | Perfiles mínimos con mínimos privilegios, ajustar antes de producción. |

## 16. Prompt para el primer mensaje en Claude Code

Copia lo siguiente junto con este archivo Markdown en tu proyecto:

```text
Lee por completo Stone_Inmuebles_Product_Spec_v0.2.md y úsalo como fuente de requisitos.

Quiero desarrollar una plataforma privada llamada Stone Inmuebles, con Next.js,
TypeScript, Vercel, Supabase y mapa geográfico. Inicialmente administramos
solo propiedades/unidades de Stone; en desarrollos compartidos se muestran
otras unidades únicamente como referencia visual, sin contratos ni finanzas.

Estamos en transición de Excel a Stone como fuente financiera. Separa
contratos, cargos, cobros, aplicaciones, gastos y recuperaciones. No supongas
cómo funcionan las cuotas de mantenimiento ni corrijas cifras del informe.

PRIMERA ENTREGA — SIN IMPLEMENTAR TODA LA APP DE GOLPE:
1. Inspecciona el repositorio y explica lo que ya existe.
2. Genera IMPLEMENTATION_PLAN.md con arquitectura, rutas, modelo de datos,
   matriz de roles, políticas RLS, migraciones y etapas incrementales.
3. Propón un sistema de diseño y el árbol de componentes UI.
4. Crea un prototipo navegable del dashboard, mapa patrimonial,
   ficha de desarrollo, ficha de unidad y rentas, SOLO CON DATOS SINTÉTICOS.
5. Especifica lo que queda pendiente para pasar a datos reales.

No inventes datos familiares, coordenadas, escrituras, arrendatarios ni rentas.
No expongas documentos ni service-role keys al navegador. Espera mi revisión
del prototipo y del plan antes de implementar el flujo financiero definitivo.
```

---

## Anexo A — Referencias técnicas para implementar/validar

- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase PostGIS: https://supabase.com/docs/guides/database/extensions/postgis
- Supabase Storage privado: https://supabase.com/docs/guides/storage/buckets/fundamentals
- MapLibre: https://maplibre.org/
- Editor geoespacial Geoman: https://geoman.io/docs/maplibre
- Vercel + Next.js: https://vercel.com/docs/frameworks/full-stack/nextjs

**Nota:** confirmar versiones, contratos/licencias de mapas y APIs vigentes en el momento de implementación. Este anexo es técnico, no fuente de información jurídica, fiscal ni patrimonial de Stone.
