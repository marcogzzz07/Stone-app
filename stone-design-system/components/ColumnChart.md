# Gráfica de columnas

Muestra una serie por mes en columnas, con una línea punteada para la proyección o meta, y resalta el mes actual.

## Cuándo usarla

- Evolución mensual de ingresos, cobranza o gasto.
- Comparación contra proyección o presupuesto (línea de referencia).
- Para varios inmuebles a lo largo del tiempo usa líneas, una por inmueble, con `chart-1` a `chart-7` en orden fijo (ver la paleta de gráficas en el brand book).

## Reglas

- Columnas en `chart-1`; meses anteriores al 72% de opacidad y el mes actual al 100%, con su valor escrito encima.
- Proyección o meta: línea punteada de 2px en `chart-reference` con puntos huecos.
- Cuadrícula horizontal en `chart-grid` con 4 o 5 marcas redondas (0, 250, 500, 750, 1000). Sin cuadrícula vertical.
- Ejes y meses en `ink-3`, 12px. Unidad en el encabezado ("Miles de pesos"), no en cada marca.
- Eje Y empieza en cero.
- Meses abreviados en español con mayúscula inicial: Ene, Feb, Mar.

## En código

Recharts `ComposedChart` con `<Bar dataKey="real" fill="var(--chart-1)">` y `<Line dataKey="proyeccion" strokeDasharray="6 4" stroke="var(--chart-reference)">`. Con shadcn/ui, usa su `ChartContainer` y pasa estos colores en `chartConfig`.
