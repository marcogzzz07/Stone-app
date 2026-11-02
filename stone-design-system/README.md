# Stone Inmuebles

Sistema de diseño de la plataforma web de Stone Inmuebles, donde se consultan los reportes mensuales de rentas, cobranza, mantenimientos y proyección del portafolio. El tono es ejecutivo: claro, sobrio y orientado a cifras.

## Principios

1. **Las cifras primero.** Cada pantalla responde una pregunta con un número visible arriba (cuánto se cobró, cuánto falta) y el detalle abajo.
2. **Sobrio, no frío.** Azul Stone y blancos con tinte azul. Sin degradados, sin sombras fuertes, sin decoración.
3. **El color significa algo.** Cian es la marca y la acción. Ámbar (`warning`) siempre es "pendiente". Rojo (`danger`) siempre es "vencido" o "error". Ningún estado se comunica solo con color: siempre va una palabra.
4. **Consistencia de datos.** Mismo formato de cifras, mismas columnas y mismo orden de inmuebles en toda la plataforma.

## Voz y textos

- Español de México, frases cortas y directas.
- Botones con verbo: "Descargar informe", "Registrar pago".
- Títulos que digan el hecho con la cifra: "Torre Evalor acumula $150,800 pendientes".
- Errores que expliquen qué pasó y cómo corregirlo.
- Sin emojis ni signos de exclamación.

## Color

Los tokens de color tienen tema claro (por defecto) y oscuro. Úsalos por nombre, nunca el valor hexadecimal directo.

| Grupo | Tokens | Regla |
|---|---|---|
| Marca | `brand-navy`, `brand-navy-2`, `brand-cyan`, `brand-cyan-ink` | El navy y el cian vienen del logo. `brand-cyan` es solo para rellenos e indicadores; para texto en cian usa `brand-cyan-ink`. |
| Superficies | `bg`, `surface`, `surface-2`, `border`, `border-control` | Página en `bg`, tarjetas y tablas en `surface`, encabezados de tabla y hovers en `surface-2`. |
| Texto | `ink`, `ink-2`, `ink-3` | Principal, secundario y terciario. Los tres pasan 4.5:1 sobre las tres superficies en ambos temas. |
| Acciones | `primary`, `primary-hover`, `on-primary`, `focus-ring` | En claro el primario es azul Stone; en oscuro es cian con texto azul Stone. |
| Navegación | `sidebar`, `sidebar-ink`, `sidebar-ink-active` | Menú lateral siempre oscuro, en ambos temas. |
| Estados | `success`, `warning`, `danger`, `info` y sus `-soft` | Texto del estado sobre su fondo suave. |
| Gráficas | `chart-1` a `chart-7`, `chart-grid`, `chart-reference` | Ver Gráficas. |

## Tipografía

Dos familias de Google Fonts:

- **IBM Plex Sans** (`display`) para títulos: estilos `display`, `h1`, `h2`, `h3`, en peso 600.
- **Source Sans 3** (`sans`) para texto, interfaz y cifras: estilos `body`, `body-strong`, `small`, `label`, `kpi`, `table-num`.

Como ambas son sans serif parecidas, la jerarquía se marca con tamaño y peso: títulos siempre en 600 y con la escala completa (40, 30, 22, 17). No uses tamaños fuera de la escala.

### Cifras

- Siempre con `font-variant-numeric: tabular-nums`, para que las columnas se alineen.
- Montos en tarjetas: `$852,928` (sin decimales). En tablas: `145,580.00` (dos decimales, sin signo).
- Porcentajes con un decimal: `94.3%`.
- Separador de miles con coma y decimal con punto, como en los reportes actuales.
- Vacío o cero en tablas: `-`.

## Espaciado y forma

- Escala de 4px: `space-1` (4) a `space-12` (48). Padding de tarjeta `space-4`, de panel `space-5`, del área de contenido `space-6`.
- Radios: `radius-md` (6px) en controles, `radius-lg` (10px) en tarjetas y tablas, `radius-full` en etiquetas de estado.
- Sombras casi imperceptibles (`shadow-sm`); separa con bordes (`border`), no con sombras.

## Gráficas

- Una paleta fija: los inmuebles siempre usan el mismo color en todas las gráficas, en este orden: Héroes de Lincoln `chart-1`, Torre San Jerónimo `chart-2`, Lomas del Valle `chart-3`, Torre Evalor `chart-4`, Central de Playa `chart-5`, Loma Blanca `chart-6`, Santa Isabel `chart-7`.
- En comparativos de dos series: Real en `chart-1`, Cobrado en `chart-2`, Pendiente siempre en `warning`, Proyección o meta en línea punteada `chart-reference`.
- Cuadrícula horizontal en `chart-grid`; ejes en `ink-3`; eje Y desde cero.
- Unidad en el encabezado del panel ("Miles de pesos"), no en cada marca.
- Sin 3D, sin pasteles con más de 4 partes, sin degradados.

## Logo

Grupo **Logos** en assets:

- `stone-logo-color.png`: sobre fondos claros (`bg`, `surface`).
- `stone-logo-color-fondo-oscuro.png`: sobre `sidebar` o fondos oscuros; el texto va en blanco.
- `stone-isotipo.png`: solo el cubo, para favicon e ícono de la app.

Espacio libre alrededor del logo: al menos la altura de la letra "S" de STONE. No lo deformes, no le cambies colores ni le agregues sombras. Ancho mínimo 120px.

**Pendiente:** hoy solo hay PNG. El SVG disponible está mal convertido (cubo incompleto y sin color). Para la versión final se necesita un SVG limpio a color.

## Componentes

Botón, Etiqueta de estado, Tarjeta KPI, Tabla de datos, Gráfica de barras, Gráfica de columnas, Campo de formulario, Pestañas, Aviso, Menú lateral y Encabezado de página. Cada uno tiene su guía y su vista previa. Las clases `st-` de `components/bundle.css` son la referencia visual; en la plataforma se implementan con shadcn/ui, como indica cada guía.

## Implementación

La plataforma usa Next.js y Tailwind (se asume Tailwind v4 con shadcn/ui; confirmar). La sección **Implementación en Next.js** trae el `globals.css` completo y la carga de fuentes.
