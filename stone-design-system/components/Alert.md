# Aviso

Mensaje destacado dentro de la página: título en una línea y una explicación con el siguiente paso.

## Tipos

| Tipo | Clase | Tokens | Uso |
|---|---|---|---|
| Pendiente | `st-alert--warning` | `warning-soft`, ícono `warning` | Cobranza atrasada, datos por validar. |
| Informativo | `st-alert--info` | `info-soft`, ícono `info` | Informe nuevo, cambios en el periodo. |
| Error | `st-alert--danger` | `danger-soft`, ícono `danger` | Algo falló y el usuario debe actuar. |
| Éxito | `st-alert--success` | `success-soft`, ícono `success` | Confirmación de una acción. |

## Reglas

- Título en peso 600 que diga el hecho con la cifra ("Torre Evalor acumula $150,800 pendientes"); segunda línea con contexto o qué hacer.
- Los errores explican qué pasó y cómo corregirlo, sin disculpas ni mensajes genéricos.
- Texto siempre en `ink`; el color del tipo va en el fondo suave y en el ícono.
- Máximo dos avisos visibles a la vez. Las confirmaciones de éxito pueden ser notificaciones temporales (toast).

## En shadcn/ui

`<Alert>` de shadcn con `className` por tipo (`bg-warning-soft`, etc.). Para confirmaciones temporales, `sonner` (toast).
