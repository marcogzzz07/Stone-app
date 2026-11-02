---
name: Stone Inmuebles
description: Atlas patrimonial privado · marino como estructura, cian como señal de lo que Stone administra, naranja solo para dinero en alerta.
colors:
  navy: "#101752"
  navy-deep: "#111644"
  ink: "#1c2233"
  text-secondary: "#4a5266"
  canvas: "#f5f6f8"
  surface: "#ffffff"
  surface-muted: "#f0f2f6"
  border: "#e3e8f0"
  input-border: "#d8dde6"
  stone-cyan: "#1593c6"
  cyan-deep: "#0f6f9b"
  cyan-tint: "#e9f4fa"
  cyan-light: "#7fc6e6"
  reference-gray: "#7d8794"
  alert-orange: "#d47a1f"
  alert-orange-deep: "#a85b10"
  ok-green: "#23714a"
  destructive-red: "#b3261e"
  chart-neutral: "#c0c1c4"
  rail-foreground: "#dee0e7"
  rail-accent: "#1b2466"
  rail-border: "#262e6e"
  on-navy: "#ffffff"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.375
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.33
  footnote:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.375
  wordmark:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.28em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
rounded:
  sm: "4.8px"
  md: "6.4px"
  lg: "8px"
  xl: "11.2px"
  pill: "9999px"
spacing:
  "0.5": "2px"
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  rail: "240px"
  bar: "64px"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.on-navy}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.on-navy}"
  button-outline:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-outline-hover:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "{spacing.4}"
  card-title:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
  kpi-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.xl}"
    padding: "{spacing.4}"
  kpi-card-accent:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.stone-cyan}"
    typography: "{typography.headline}"
  kpi-card-warn:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.alert-orange}"
    typography: "{typography.headline}"
  badge-state-confirmado:
    textColor: "{colors.ok-green}"
    typography: "{typography.footnote}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-state-por-verificar:
    textColor: "{colors.alert-orange-deep}"
    typography: "{typography.footnote}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-state-no-disponible:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.footnote}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-scope-stone:
    textColor: "{colors.stone-cyan}"
    typography: "{typography.footnote}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-scope-referencia:
    textColor: "{colors.reference-gray}"
    typography: "{typography.footnote}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  nav-item:
    textColor: "{colors.rail-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  nav-item-hover:
    backgroundColor: "{colors.rail-accent}"
    textColor: "{colors.on-navy}"
  nav-item-active:
    backgroundColor: "{colors.rail-accent}"
    textColor: "{colors.on-navy}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  input:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "32px"
  facet-cover:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.on-navy}"
---

# Design System: Stone Inmuebles

## Overview

**Creative North Star: "El Atlas Patrimonial"**

Stone Inmuebles convierte el informe mensual de la familia en una herramienta. El sistema visual toma la identidad de ese informe (marino, cian, naranja, Archivo) y la lleva a pantalla con más precisión: el marino `navy` es estructura (rail lateral, títulos, bordes de polígono), el cian `stone-cyan` es señal de lo que Stone administra (unidades propias, selección, acciones), y el naranja `alert-orange` aparece únicamente cuando hay dinero en alerta (vencidos, discrepancias, cifras por verificar). Todo lo que no es de Stone se dibuja en gris azulado punteado: es contexto, nunca se mezcla con lo operable.

El tono es sobrio, ejecutivo y cartográfico. La densidad es la de un tablero operativo de escritorio: lienzo gris frío, tarjetas blancas con borde fino, tablas financieras legibles con numerales tabulares. No hay degradados decorativos, ni ilustraciones genéricas, ni sombras flotantes; la profundidad se expresa con tono y borde. La firma visual es el cubo isométrico de Stone descompuesto en facetas: polígonos planos marino/cian que sirven tanto de cabecera de desarrollo como de lenguaje para el mapa.

Rechazos confirmados: el ERP genérico gris con un solo acento; las tarjetas iguales de icono + título + texto; los kickers o eyebrows sobre los títulos (el componente `PageHeader` acepta la prop por compatibilidad pero no la renderiza, deliberadamente).

**Key Characteristics:**
- Marino `#101752` como estructura; cian `#1593c6` como señal operable; naranja `#d47a1f` solo para dinero en alerta.
- Terceros siempre en gris `#7d8794` y trazo punteado, fuera de cualquier agregado.
- Archivo en toda la interfaz; peso 700 con numerales tabulares para cifras y títulos.
- Superficies planas: tarjetas blancas con anillo de 1px sobre lienzo `#f5f6f8`, sin sombras en reposo.
- Cada cifra lleva pie de definición (periodo · moneda · IVA · origen · conciliación) y los estados de dato son explícitos.
- Facetas isométricas marino/cian como firma, en cabeceras y en el mapa.

## Colors

Una paleta de informe financiero: marinos profundos y grises fríos como base, un cian saturado como única voz operable, y naranja reservado para alertas monetarias. Todos los valores de esta sección son los del tema claro; el bloque `.dark` de `globals.css` define los equivalentes nocturnos (lienzo `#0e1226`, tarjeta `#141a36`, cian aclarado `#3fb0e0`, naranja `#f0a04b`) pero aún no está activado en la interfaz: son tokens, no un modo soportado.

### Primary
- **Marino Stone** (`navy`): columna vertebral del sistema. Fondo del rail lateral, color del botón primario, títulos de página (`PageHeader`), borde de los polígonos Stone en el mapa y perímetro punteado de desarrollo. Es estructura, no acento.
- **Marino Profundo** (`navy-deep`): faceta oscura del cubo; aparece en `FacetCover` y en la variante de tarjeta del tema oscuro. Nunca como texto.
- **Tinta Azulada** (`ink`): color de texto principal sobre lienzo y tarjeta. Es un marino casi negro, no un negro puro: mantiene la temperatura fría del informe.

### Secondary
- **Cian Stone** (`stone-cyan`): la señal de lo que Stone administra. Relleno de unidades Stone en el mapa (35% en reposo, 70% seleccionado), anillo de foco global, icono del ítem de navegación activo, cifras de KPI en tono `accent`, insignia de alcance "Stone", color de selección de texto (28%). Se usa poco y por eso se lee.
- **Cian Profundo** (`cyan-deep`): texto sobre `cyan-tint` y faceta intermedia del cubo; fondo alternativo de `FacetCover` en tono `cyan`.
- **Cian Claro** (`cyan-light`): tercera serie de gráficas y aristas luminosas de las facetas (trazos de 1px al 50–60%).
- **Cian Lavado** (`cyan-tint`): fondo de acento suave para estados hover/seleccionado en menús y popovers.

### Tertiary
- **Naranja de Alerta** (`alert-orange`): exclusivamente dinero en alerta: cifras vencidas o con discrepancia (`KpiCard tone="warn"`), cuarta serie de gráficas, borde de la banda de datos sintéticos, marcador "pendiente de trazo" en el mapa. Nunca es decorativo ni "call to action".
- **Naranja Profundo** (`alert-orange-deep`): texto legible sobre fondos naranja al 10–20% (insignia "Por verificar", banda `[DEMO]`).
- **Gris de Referencia** (`reference-gray`): todo lo que es de terceros. Relleno al 15% y trazo punteado `[2,2]` en el mapa; insignia "Referencia de terceros". Deliberadamente apagado: es contexto.
- **Verde Confirmado** (`ok-green`): únicamente estado de dato "Confirmado" y ocupación "Ocupada". No es color de marca.
- **Rojo Destructivo** (`destructive-red`): acciones destructivas y campos inválidos, siempre con fondo al 10% y texto pleno.

### Neutral
- **Lienzo Frío** (`canvas`): fondo de la aplicación y del botón outline. Gris con tinte azul, nunca gris neutro.
- **Superficie** (`surface`): tarjetas, popovers y campo de búsqueda.
- **Superficie Atenuada** (`surface-muted`): fondo de listas de pestañas, pies de tarjeta (50%), filas hover de tabla, insignia "No disponible", avatar.
- **Borde Frío** (`border`): divisores, borde del botón outline, borde de la topbar.
- **Borde de Campo** (`input-border`): contorno de inputs y color del scrollbar.
- **Texto Secundario** (`text-secondary`): etiquetas de KPI, pies de definición, placeholders, descripciones.
- **Gris de Gráfica** (`chart-neutral`): quinta serie, para "otros" o sin dato.
- **Rail: texto** (`rail-foreground`), **Rail: acento** (`rail-accent`), **Rail: borde** (`rail-border`): tríada exclusiva de la barra lateral marina; el texto inactivo va al 70% de `rail-foreground`.

### Named Rules
**La Regla del Cian Operable.** El cian `stone-cyan` significa "esto lo administra Stone" o "esto puedes accionar/seleccionar". Nunca se usa como relleno decorativo, fondo de sección ni color de título. Si un elemento cian no es operable ni es de Stone, está mal.

**La Regla del Naranja Monetario.** El naranja aparece solo sobre dinero en alerta: vencido, discrepancia, por verificar. No marca novedades, promociones ni botones. Un dashboard sin problemas de cobranza no muestra naranja.

**La Regla de la Referencia Punteada.** Lo de terceros se dibuja siempre en `reference-gray`, con trazo punteado en el mapa y relleno ≤20%. Nunca entra en una suma, promedio ni gráfica junto a datos Stone.

## Typography

**Display Font:** Archivo 600 condensada (font-stretch 75 %) (con system-ui, sans-serif)
**Body Font:** Archivo 400–500 (con system-ui, sans-serif)
**Label/Mono Font:** Geist Mono (solo para códigos, atajos `⌘K` y la etiqueta `[DEMO]`)

**Character:** Archivo es una grotesca con eje de anchura: el ancho normal (100 %) lleva la interfaz y el condensado (75 %, clase `.num` y `.font-condensed`) lleva títulos y cifras. Una sola familia, dos voces; la jerarquía se construye con anchura, peso (400/500 texto, 600 títulos y cifras) y tamaño.

### Hierarchy
- **Display** (600, 30px escritorio → 34px en lg, line-height 1.1, tracking -0.025em, color `navy`): título de página en `PageHeader`. Uno por pantalla; sin kicker encima.
- **Headline** (600, 28px, line-height 1, tracking -0.01em, tabular): la cifra de `KpiCard`. Colorea en `stone-cyan` (acento) o `alert-orange` (alerta) solo según la regla del color, nunca por jerarquía.
- **Title** (500, 16px, line-height 1.375, Semi Condensed): `CardTitle`; baja a 14px en tarjetas `size="sm"`.
- **Body** (400, 14px, line-height ~1.43): texto de interfaz, celdas de tabla, descripciones. En tablas financieras, numerales tabulares (`.tnum`).
- **Label** (500, 12px): etiquetas de KPI, encabezados de tabla, periodo en topbar.
- **Footnote** (400, 11px, line-height 1.375, color `text-secondary`): pie de definición de cifras, insignias de estado y alcance, metadatos del rail.
- **Wordmark** (700, 17px, mayúsculas, tracking 0.28em, Semi Condensed, blanco): "STONE" en el rail; debajo "inmuebles" en 11px minúsculas con tracking 0.22em al 70%.

### Named Rules
**La Regla de la Cifra Tabular.** Toda cantidad de dinero, superficie o conteo que funcione como dato se compone en Archivo condensada con `font-variant-numeric: tabular-nums`. Archivo regular queda para prosa y etiquetas.

**La Regla del Pie Obligatorio.** Ninguna cifra se muestra sin su pie de definición en Footnote: periodo · moneda · IVA · origen · grado de conciliación. Una cifra sin pie es un error de implementación, no una decisión de diseño.

**La Regla Sin Kicker.** No existen eyebrows, kickers ni sobretítulos en mayúsculas sobre un título. La jerarquía se construye con tamaño, peso y el marino del display, no con una etiqueta encima.

## Layout

Tablero operativo clásico: rail lateral fijo + lienzo. El rail (`spacing.rail`, 240px) es marino profundo y solo aparece a partir de `lg` (1024px); por debajo se sustituye por un `Sheet` lateral de 256px con el mismo fondo y navegación. La topbar mide `spacing.bar` (64px), es sticky, con fondo `canvas` al 80% y desenfoque, y contiene el buscador (máximo 36rem) y el periodo activo a la derecha. Bajo ella, mientras los datos sean sintéticos, corre una banda `[DEMO]` de 1 línea en gris frío `surface-muted`.

El lienzo lleva padding de 24px (`spacing.6`) en todos los lados y 32px lateral (`spacing.8`) desde `lg`. Las páginas abren con `PageHeader` (título + descripción de máximo 42rem + acciones alineadas al pie, margen inferior 24px), y organizan el contenido en filas de tarjetas con gap de 16px: en el dashboard, una fila de 4 KPIs patrimoniales y otra de 8 financieros, seguidas de una gráfica a 2/3 y una tabla de antigüedad a 1/3. Las secciones se separan con `SectionTitle` (14px semibold + pista en Footnote a la derecha, margen inferior 12px).

El ritmo de espaciado es la escala de Tailwind 4 (base 4px) y en la práctica solo se usan 2, 4, 8, 12, 16, 24 y 32px. Dentro de tarjeta el espaciado interno es una variable (`--card-spacing`, 16px; 12px en `size="sm"`) que gobierna a la vez padding y gap, así que header, contenido y pie siempre comparten el mismo margen. Las tablas son densas: cabecera de 40px, celdas con 8px de padding, sin ajuste de línea.

## Elevation & Depth

El sistema es plano por defecto y expresa la profundidad por tono y borde, no por sombra. La tarjeta blanca se separa del lienzo gris frío con un anillo de 1px (`ring-1 ring-border`, es decir, `border` #e3e8f0), el rail se separa del lienzo por contraste de valor (marino sobre gris) y por un borde `rail-border`, y la topbar flota sobre el contenido solo gracias a su fondo translúcido con `backdrop-blur`. Los popovers, hojas y menús heredan la sombra mínima de shadcn pero no existe un vocabulario propio de sombras en los tokens.

### Shadow Vocabulary
- **Pestaña activa** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`, `shadow-sm` de Tailwind): única sombra en reposo del sistema, sobre el `TabsTrigger` activo dentro de una lista con fondo `surface-muted`. En la variante `line` desaparece y la sustituye un subrayado de 2px en `ink`.

### Named Rules
**La Regla del Borde Antes que la Sombra.** Una superficie nueva se delimita con un anillo o borde de 1px en `border`. Solo los elementos flotantes temporales (popover, sheet, pestaña activa) pueden proyectar sombra, y siempre la mínima.

## Shapes

Esquinas suavemente redondeadas con una sola raíz: `--radius: 0.5rem` (8px), de la que derivan todos los pasos (`sm` 4.8px, `md` 6.4px, `lg` 8px, `xl` 11.2px). Botones, inputs y listas de pestañas usan `lg`; ítems de navegación y disparadores de pestaña usan `md`; tarjetas usan `xl`. Las insignias (estado, alcance, `Badge` de shadcn) son píldoras completas: la forma redonda es lo que distingue "metadato" de "contenido". Los avatares son círculos.

Los bordes son siempre de 1px y fríos (`border`, `input-border`); el único borde de 2px es el de los polígonos Stone en el mapa y la leyenda, donde el grosor marca la diferencia entre operable (2px continuo marino) y referencia (2px punteado gris) y perímetro (1px punteado marino al 60%). La geometría que no es rectángulo es siempre la faceta isométrica del cubo: polígonos de lados rectos con aristas finas en `cyan-light`, nunca curvas ni círculos decorativos.

## Components

Los componentes son los de shadcn (preset radix-nova) con los tokens de Stone, más un puñado de piezas propias que definen el sistema: `KpiCard`, `DataStateBadge`, `ScopeBadge`, `FacetCover` y el ítem del rail. El carácter general es contenido y preciso: superficies planas, texto mediano, estados claros, sin transformaciones llamativas.

### Buttons
- **Shape:** esquinas suaves (`rounded.lg`, 8px); 32px de alto por defecto (`sm` 28px, `lg` 36px, `xs` 24px); icono de 16px con gap de 6px.
- **Primary:** fondo `navy`, texto blanco, 500/14px, padding horizontal 10px. Es el único botón marino de cada vista.
- **Hover / Focus:** hover baja la opacidad del fondo al 80%; focus-visible pinta el borde en `stone-cyan` y un anillo de 3px de cian al 50%; `:active` desplaza 1px hacia abajo. Transición `all` corta.
- **Outline:** borde `border`, fondo `canvas`, texto `ink`; hover a `surface-muted`.
- **Secondary / Ghost:** `secondary` usa `surface-muted` y oscurece 5% en hover; `ghost` es transparente y toma `surface-muted` en hover (se usa para el botón de menú móvil).
- **Destructive:** rojo al 10% con texto rojo pleno; nunca rojo sólido.
- **Link:** texto `navy` con subrayado en hover.

### Chips
- **Estado de dato** (`DataStateBadge`): píldora de 11px/500 con punto de 6px en `currentColor`. Tres estados fijos: Confirmado (`ok-green` texto, fondo 15%, borde 30%), Por verificar (`alert-orange-deep` texto, fondo naranja 20%, borde 40%), No disponible (`surface-muted`, texto `text-secondary`, borde `border`). No hay cuarto estado.
- **Alcance** (`ScopeBadge`): píldora de 11px/500 sin punto. "Stone" en `stone-cyan` (fondo 15%, borde 40%); "Referencia de terceros" en `reference-gray` con la misma receta. Toda fila, tarjeta o polígono que mezcle alcances debe mostrarla.
- **Badge de shadcn:** 20px de alto, píldora, 12px/500; variante `default` en marino, `outline` con borde `border`. Se usa para conteos y etiquetas neutras, no para estados de dato.

### Cards / Containers
- **Corner Style:** `rounded.xl` (11.2px); las imágenes a sangre heredan el radio.
- **Background:** `surface` blanco; pie opcional en `surface-muted` al 50% con borde superior.
- **Shadow Strategy:** ninguna; anillo de 1px en `border` (ver Elevation & Depth).
- **Border:** el anillo sustituye al borde; no se añade `border` encima.
- **Internal Padding:** `--card-spacing` 16px (12px en `size="sm"`), compartido por header, contenido, pie y gap.

### Inputs / Fields
- **Style:** 32px de alto, borde 1px `input-border`, fondo transparente, `rounded.lg`, 14px en escritorio (16px en móvil para evitar zoom), placeholder en `text-secondary`.
- **Focus:** borde a `stone-cyan` + anillo de 3px de cian al 50%; el `:focus-visible` global del documento usa outline de 2px en `stone-cyan` con offset 2px.
- **Error / Disabled:** `aria-invalid` cambia borde a `destructive-red` con anillo rojo al 20%; disabled al 50% con fondo `input-border` al 50%.
- **Buscador de topbar:** 36px, fondo `surface`, `rounded.md`, icono lupa de 16px a la izquierda y `kbd` ⌘K en Geist Mono a la derecha.

### Navigation
- **Rail:** 240px, fondo `navy`, borde derecho `rail-border`. Arriba el isotipo (30px) + wordmark; abajo, bloque de rol/organización en Footnote al 60% con borde superior.
- **Ítem:** 14px/400, padding 8px 12px, `rounded.md`, icono Lucide de 16px con gap 12px, gap vertical entre ítems de 2px. Default: texto `rail-foreground` al 70%, icono igual. Hover: fondo `rail-accent` al 60%, texto blanco. Activo: fondo `rail-accent` sólido, texto blanco e icono en `stone-cyan` (la única señal cian del rail). Transición de color.
- **Móvil:** el rail se pliega en un `Sheet` lateral de 256px con fondo `navy`, abierto por un botón ghost con icono de menú.
- **Pestañas:** lista en `surface-muted` con padding 3px y `rounded.lg`; disparador 14px/500 en `ink` al 60%, activo en `surface` con sombra mínima. Variante `line`: transparente con subrayado de 2px en `ink`.

### KPI Card (firma)
Tarjeta `size` compacta (padding 16px, gap 4px) que apila cuatro líneas: etiqueta en Label `text-secondary`; cifra en Headline Semi Condensed 28px/600 tabular; sub-línea opcional en 12px `ink` al 80%; y el pie de definición obligatorio en Footnote `text-secondary` (periodo · moneda · IVA · origen · conciliación). La cifra se colorea solo por regla: `accent` (`stone-cyan`) para lo que Stone administra, `warn` (`alert-orange`) para dinero en alerta; por defecto va en `ink`. Nunca lleva icono ni degradado: la jerarquía la hace el tamaño de la cifra.

### Facet Cover (firma)
Cabecera de desarrollo o propiedad que sustituye a la fotografía hasta que existan imágenes reales. Fondo sólido `navy` (o `cyan-deep` en tono `cyan`) con un plano isométrico de facetas superpuestas: polígonos planos en `stone-cyan` (25–55%), `cyan-deep` (35–70%), `navy-deep` (80%) e `ink` (50%), con aristas de 1px en `cyan-light` al 50–60%. Las facetas se concentran en la esquina superior derecha y en la inferior izquierda, dejando el centro libre para el contenido. Es la traducción del cubo del logotipo al lenguaje de la interfaz; el mismo vocabulario gobierna los polígonos del mapa.

### Mapa patrimonial (reglas de color)
- Unidad Stone: relleno `stone-cyan` al 35% (70% seleccionada), trazo 2px continuo `navy`, etiqueta de código en `navy` con halo blanco desde zoom 16.
- Referencia de terceros: relleno `reference-gray` al 15%, trazo 2px punteado `[2,2]` del mismo gris.
- Perímetro de desarrollo: relleno `navy` al 5%, trazo 1.5px punteado `[3,2]` en `navy`.
- Pendiente de trazo: círculo con borde 2px `alert-orange` y relleno al 30%.
- La base ráster se desatura (-0.7) y baja al 85% para que solo los polígonos tengan color.

## Do's and Don'ts

### Do:
- **Do** componer toda cifra en Archivo 600 condensada (font-stretch 75 %) con numerales tabulares y un pie Footnote con periodo · moneda · IVA · origen · conciliación.
- **Do** reservar `stone-cyan` para unidades Stone, selección, foco y el icono del ítem activo; que su rareza lo haga legible.
- **Do** dibujar lo de terceros en `reference-gray` con trazo punteado y relleno ≤20%, y mantenerlo fuera de cualquier agregado.
- **Do** separar superficies con un anillo de 1px (`border`) sobre el lienzo `canvas`, sin sombra en reposo.
- **Do** usar `FacetCover` y la geometría de facetas isométricas marino/cian donde falte una imagen real.
- **Do** mostrar siempre un `DataStateBadge` (Confirmado / Por verificar / No disponible) cuando un dato pueda no estar conciliado.
- **Do** mantener un solo botón marino por vista; el resto en outline o ghost.

### Don't:
- **Don't** usar naranja para novedades, botones ni énfasis: solo para dinero vencido, discrepancias o cifras por verificar.
- **Don't** poner kickers, eyebrows ni sobretítulos en mayúsculas sobre un título de página o tarjeta.
- **Don't** construir filas de tarjetas iguales de icono + título + texto; la jerarquía la da la cifra, no el icono.
- **Don't** mezclar cifras Stone y de referencia en una misma suma, promedio o serie de gráfica.
- **Don't** introducir degradados, sombras flotantes ni ilustraciones genéricas; la profundidad es tono y borde.
- **Don't** usar grises neutros: todo gris del sistema tiene tinte azul (`canvas`, `surface-muted`, `border`, `reference-gray`).
- **Don't** mostrar una cifra sin su pie de definición ni inventar un dato ausente: "No disponible" es un estado, no un cero.
