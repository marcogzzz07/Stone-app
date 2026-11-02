# Etiqueta de estado

Muestra el estado de un inmueble, contrato o pago en forma de píldora con punto de color y texto.

## Estados

| Estado | Clase | Tokens | Uso en Stone |
|---|---|---|---|
| Éxito | `st-badge--success` | `success` sobre `success-soft` | Al corriente, cobrado completo. |
| Pendiente | `st-badge--warning` | `warning` sobre `warning-soft` | Renta o mantenimiento pendiente del mes. |
| Peligro | `st-badge--danger` | `danger` sobre `danger-soft` | Vencido, pendiente recurrente (más de un mes). |
| Informativo | `st-badge--info` | `info` sobre `info-soft` | Nuevo contrato, informe listo, cambios recientes. |
| Neutro | `st-badge--neutral` | `ink-2` sobre `surface-2` | Sin cliente, sin datos, inactivo. |

## Reglas

- El color nunca va solo: siempre hay una palabra. Una celda que solo cambia de color no comunica nada a quien no distingue colores.
- Texto corto, de una a tres palabras.
- No se usa para acciones; para eso está el botón.
- Las reglas de negocio para elegir el estado (por ejemplo, cuántos días para "Vencido") las define administración, no el diseño.

## En shadcn/ui

`<Badge>` de shadcn con `className` por estado, por ejemplo `bg-warning-soft text-warning`.
