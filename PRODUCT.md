# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Administrador familiar:** miembro de la familia propietaria que supervisa todo el portafolio Stone, configura usuarios, aprueba cambios relevantes y accede a documentos sensibles. Lo consulta desde escritorio, en sesiones de revisión mensual.
- **Administración inmobiliaria:** personal operativo que da de alta inmuebles, contratos, cargos, pagos, importaciones y gastos. Uso diario, desktop-first, con tablas y formularios.
- **Consulta familiar:** familiares que visualizan activos, mapa y cifras autorizadas sin editar. Uso ocasional, también en tablet/móvil.
- **Accesos externos (futuro):** asesores legales, fiscales y contables, acotados por entidad, inmueble o tipo de documento.

## Product Purpose

Stone Inmuebles es una plataforma web privada de inventario patrimonial, administración de rentas y exploración geográfica. Unifica propiedades, unidades, planos, coordenadas, documentos legales/fiscales, contratos, rentas, pagos y gastos que hoy viven dispersos en Excel, PowerPoint y archivos. Éxito: saber qué administra Stone y dónde está, reproducir el reporte mensual de forma auditable y migrar gradualmente la operación desde Excel sin romperla.

## Positioning

Un **atlas patrimonial privado**, no un ERP contable ni un reporte de Excel. Conecta la geografía real (polígonos, superficies con procedencia) con el expediente y las finanzas de cada unidad, y distingue siempre lo administrado por Stone de lo que es solo contexto de terceros.

## Operating Context

- Fuente operativa actual: Excel mensual + informe PowerPoint ("Reporte de rentas y mantenimientos").
- Transición en tres etapas (Excel → híbrida → Stone), controlada por propiedad/contrato y período (`source_of_truth`).
- Desarrollos compartidos: Stone gestiona solo sus unidades; las de terceros se muestran como referencia sin contratos, movimientos ni documentos.
- Moneda MXN con IVA; toda cifra distingue subtotal, IVA, total, moneda, período y origen.
- Hosting Vercel; datos y auth en Supabase (Postgres + PostGIS + RLS + Storage privado).

## Capabilities and Constraints

- MVP: inventario, fichas, mapa con polígonos reales, contratos con condiciones versionadas, cargos/pagos/aplicaciones/saldos, gastos y recuperaciones separados, importación con conciliación, dashboard, calendario, documentos privados, roles.
- Fuera del MVP: CFDI/SAT, banca, pagos online, portal de inquilinos, valuación, OCR/IA legal, GIS certificado.
- Nunca inventar polígonos, coordenadas, escrituras, arrendatarios ni rentas; estados de dato explícitos (confirmado / por verificar / no disponible).
- Permisos en servidor y RLS, no solo en UI. Service-role key nunca en el navegador.
- **Pendientes de negocio (no asumir):** naturaleza de las cuotas de mantenimiento, formato del Excel fuente, campos definitivos de contrato, flujos de aprobación, reportes obligatorios.

## Brand Commitments

Confirmados por el usuario el 1 de noviembre de 2026 a partir del informe mensual:

- **Nombre:** Stone Inmuebles. Wordmark "STONE" en mayúsculas espaciadas + "inmuebles" en minúsculas.
- **Logo:** cubo isométrico en cian/azul con interior azul marino y wordmark "STONE inmuebles" en marino. Archivo oficial entregado por el usuario el 2 de noviembre de 2026: `public/brand/stone-logo.png` (2000×730); isotipo recortado en `public/brand/stone-mark.png`. Falta versión vectorial.
- **Paleta oficial:** azul marino `#101752` / `#111644` / `#1C2233`; cian `#1593C6`; azul medio `#0F6F9B`; naranja de acento `#D47A1F` / `#A85B10`; grises fríos `#F5F6F8` / `#F0F2F6` / `#E3E8F0` / `#D8DDE6` / `#C9C9CA`; texto secundario `#4A5266`.
- **Tipografía:** IBM Plex Sans 600 para títulos y Source Sans 3 para texto, interfaz y cifras, según `stone-design-system/README.md` (brand book aprobado el 2 de noviembre de 2026). Antes se probaron Barlow, Albert Sans, Archivo y Figtree.
- **Tono pedido:** misma identidad que el informe, más refinada: sobria, ejecutiva, cartográfica. No ERP genérico.

## Evidence on Hand

- `Stone_Inmuebles_Product_Spec_v0.2.md` — requisitos aprobados.
- `../Stone Inmuebles - Informe Septiembre 2026.pptx` — referencia de campos, KPIs y branding; contiene cifras con discrepancias que no deben corregirse silenciosamente.
- **Ausente:** Excel fuente, planos/coordenadas reales, contratos, logo vectorial, manual de marca. No fabricar.

## Product Principles

1. Lo de Stone es operable; lo de terceros es contexto. Nunca se mezclan en agregados.
2. Cada cifra declara período, moneda, IVA, origen y grado de conciliación.
3. Ausencia de dato ≠ dato: estados explícitos, sin suposiciones de negocio.
4. Excel sigue funcionando mientras Stone gana confianza; la transición se controla por alcance y período.
5. Privado por diseño: invitación, roles, RLS, documentos con enlaces temporales.

## Accessibility & Inclusion

Uso familiar con edades variadas: contraste AA mínimo, tamaños de texto legibles en tablas financieras, navegación por teclado en formularios operativos.
