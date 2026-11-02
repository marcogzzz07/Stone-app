# Gráfica de barras

Compara montos entre inmuebles con barras horizontales, ordenadas de mayor a menor, con el total a la derecha.

## Cuándo usarla

- Comparar categorías (inmuebles, conceptos de gasto) en un mismo periodo.
- Barras apiladas para partes de un total: cobrado + pendiente = total de renta.
- Horizontales cuando los nombres son largos, como los nombres de inmuebles.

## Reglas

- Ordena de mayor a menor, salvo que exista un orden natural.
- Cobrado en `chart-2`, pendiente en `warning`. El pendiente siempre en `warning` en cualquier gráfica, para que signifique lo mismo en toda la plataforma.
- Pista de fondo de cada barra en `surface-2`, para leer qué tan lejos está del máximo.
- Etiqueta de valor a la derecha en `ink`, 600. Nombres en `ink-2`, 13px.
- Leyenda arriba de la gráfica, unidad a la derecha del título ("Pesos con IVA").
- Sin ejes ni cuadrícula: los valores ya están escritos.
- Radio `radius-sm` (2 a 4px) en las barras. Sin sombras ni degradados.

## En código

Recharts (la base de los charts de shadcn/ui) con `layout="vertical"`, `<Bar stackId="a">` por serie y colores `var(--chart-2)` y `var(--warning)`. Ejes ocultos, `LabelList` a la derecha.
