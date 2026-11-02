---
version: 1
slug: "src-app-app-layout-tsx"
primary_target: "src/app/(app)/layout.tsx"
related_targets: ["src/app/(app)/dashboard/page.tsx","src/app/(app)/mapa/page.tsx"]
---

# Surface brief — App shell y pantallas operativas de Stone Inmuebles

Scope: todas las rutas bajo `src/app/(app)/` (dashboard, mapa, propiedades, unidades, rentas, contratos, documentos, calendario, configuración). Mode: **Operate**.

Audience: administrador familiar y personal de administración inmobiliaria en escritorio; consulta familiar en tablet. Job: revisar patrimonio y cobranza del mes, abrir expedientes, localizar unidades en el mapa. Proof/content: datos sintéticos [DEMO] hasta Iteración 1. Constraints: branding Stone pinned por el usuario (marino, cian, naranja, Barlow); sin ERP genérico; estados de dato explícitos.

Unresolved: logo vectorial; proveedor satelital; dark mode real (solo tokens por ahora).

## Direction contract

THESIS: Un atlas patrimonial con la identidad del informe de Stone, llevada a pantalla con más precisión: marino como estructura, cian como señal de lo que Stone administra, naranja solo para alertas de dinero. Rechaza el dashboard gris con un acento y las tarjetas iguales de icono+título+texto.

OWN-WORLD: Rail lateral marino profundo (#101752) con el cubo de Stone; lienzo gris frío (#F5F6F8) y tarjetas blancas con borde #E3E8F0. Cian #1593C6 para unidades Stone, selección y acciones; gris azulado #7D8794 punteado para referencia de terceros; naranja #D47A1F para vencidos y discrepancias. Barlow para UI, Barlow Semi Condensed en cifras y títulos, numerales tabulares.

STORY: El visitante reconoce su informe mensual convertido en herramienta: ve en segundos cuánto administra Stone, qué se cobró y qué falta, y puede ir del número al mapa y al expediente.

FIRST VIEWPORT: Rail izquierdo 240px con logo arriba y 8 secciones. Topbar con buscador y período. Dashboard: fila de KPIs patrimoniales (4) y financieros (8) en tarjetas blancas con cifra grande en Semi Condensed y pie de definición; debajo, gráfica cargos vs cobros (2/3) + antigüedad (1/3). Acción primaria: filtros de período en topbar.

FORM: Tablero operativo clásico (rail + lienzo), posición 1 de la lista; dirección pinned por el usuario (branding del informe). seed: none (unavailable)

SIGNATURE MOVE: Las facetas del cubo de Stone como lenguaje cartográfico: polígonos de unidades Stone rellenos en cian con borde marino y etiqueta en Semi Condensed; cabeceras de desarrollo con un plano isométrico de facetas marino/cian en lugar de degradados.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Pendientes tras finish review (2026-11-02)

- Etiquetas del mapa en Barlow Semi Condensed: requiere generar glifos PBF (`public/fonts/{fontstack}/{range}.pbf`) y cambiar `glyphs`/`text-font` en `patrimony-map.tsx`.
- Logo vectorial oficial: `public/brand/stone-mark.svg` es una reconstrucción provisional.
- Dark mode: solo tokens, sin toggle.
