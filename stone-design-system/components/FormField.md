# Campo de formulario

Etiqueta, control y texto de ayuda o error, apilados en ese orden.

## Reglas

- Etiqueta siempre visible arriba del campo (14px, 600, `ink-2`). El placeholder no reemplaza a la etiqueta.
- Control: fondo `surface`, borde `border-control`, radio `radius-md`, texto 15px. Foco: anillo de 2px en `focus-ring`.
- Ayuda debajo en 13px `ink-3`: unidad, formato esperado.
- Error: borde y texto en `danger`, con un mensaje que diga qué pasó y cómo corregirlo ("Septiembre tiene 30 días. Revisa la fecha."), no solo "Campo inválido".
- Montos alineados con cifras tabulares, con separador de miles y dos decimales.
- Fechas en formato día/mes/año (dd/mm/aaaa).
- En filtros arriba de tablas, los campos van en una fila; en formularios de captura, en una o dos columnas.

## En shadcn/ui

`<Label>`, `<Input>`, `<Select>` y `<Form>` (React Hook Form + Zod) de shadcn. El borde usa `--input`, ya mapeado a `border-control`.
