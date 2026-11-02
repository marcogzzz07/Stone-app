# Tarjeta KPI

Muestra un indicador clave del periodo: etiqueta, cifra grande y una línea de contexto.

## Anatomía

1. **Etiqueta** (`st-kpi__label`): 14px, `ink-2`. Qué se mide: "Cobrado", "Pendiente del mes".
2. **Valor** (`st-kpi__value`): estilo `kpi` (28px, 600, cifras tabulares), `ink`. Usa `warning` solo si el valor es un pendiente.
3. **Pie** (`st-kpi__foot`): 13px, `ink-3`. Contexto o comparación, con una etiqueta de estado opcional.

## Reglas

- Fila de 4 tarjetas en escritorio, 2 en tableta, 1 en celular. Gap `space-3`.
- Formato de cifras: pesos con separador de miles y sin decimales (`$852,928`); porcentajes con un decimal (`94.3%`).
- Una comparación por tarjeta como máximo. Si necesitas más, usa una tabla.
- No metas gráficas dentro de la tarjeta, salvo una línea mínima (sparkline) si la tendencia es el punto.
- Fondo `surface`, borde `border`, radio `radius-lg`, padding `space-4`.

## En shadcn/ui

`<Card>` de shadcn con `CardHeader` para la etiqueta y `CardContent` para valor y pie. Aplica `tabular-nums` al valor.
