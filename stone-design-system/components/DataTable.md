# Tabla de datos

Presenta registros por inmueble o por mes, con cifras alineadas, fila de totales y estado al final.

## Reglas de formato

- **Encabezados**: estilo `label` (12px, mayúsculas, 600), `ink-3` sobre `surface-2`.
- **Texto** a la izquierda; **cifras** a la derecha con `tabular-nums` (clase `r`). Nunca centres cifras.
- **Montos** con dos decimales y separador de miles (`145,580.00`). Sin signo de pesos en cada celda: la unidad va en el título o en una nota.
- **Vacío o cero**: un guion `-` en `ink`, no "0.00".
- **Pendientes** en `warning` y peso 600 (`is-warning`), acompañados de la columna Estado.
- **Fila de totales** en `tfoot`: peso 700 sobre `surface-2`. Solo suma columnas que tengan sentido sumar (no precios por m²).
- **Columna de estado** al final, con etiqueta de estado.
- Hover de fila en `surface-2`. Sin rayado cebra: el hover y las líneas bastan.
- Celdas: 11px vertical y 16px horizontal (`space-3`, `space-4`).

## Comportamiento

- En pantallas angostas la tabla se desplaza en horizontal dentro de su contenedor (`st-table-wrap`); la página nunca.
- Más de 15 filas: agrega paginación o búsqueda arriba de la tabla.
- Ordenar por columna es opcional; si se ordena, la flecha va junto al encabezado.

## En shadcn/ui

`<Table>` de shadcn (o `DataTable` con TanStack Table si necesitas ordenar y filtrar). Aplica `text-right tabular-nums` a las celdas numéricas.
