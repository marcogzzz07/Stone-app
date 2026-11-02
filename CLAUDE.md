# Stone Inmuebles · app

## Diseño
Antes de crear o modificar cualquier pantalla o componente, lee stone-design-system/README.md
y la guía del componente en stone-design-system/components/. Usa solo los tokens definidos ahí.

- `stone-design-system/tokens.json` es la fuente única de valores; `src/app/globals.css` se deriva de él.
- Nada de hexadecimales en componentes: clases de Tailwind por token (`bg-surface`, `text-ink-2`, `bg-warning-soft text-warning`).
- Pendiente = `warning`, vencido = `danger`, siempre con texto. Un solo botón primario por pantalla.
- Gráficas con Recharts y la paleta `chart-1`…`chart-7` en el orden fijo de inmuebles del brand book.

## Datos
Todo lo que se muestra es sintético y lleva `[DEMO]`. Nunca claves service-role en el navegador.
