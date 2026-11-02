# Botón

Dispara una acción; el primario se usa una sola vez por pantalla, para lo que la pantalla existe.

## Variantes

| Variante | Clases | Tokens | Cuándo |
|---|---|---|---|
| Primario | `st-btn st-btn--primary` | `primary`, `on-primary`, `primary-hover` | La acción principal: "Descargar informe", "Guardar". Máximo uno por pantalla. |
| Secundario | `st-btn st-btn--secondary` | `surface`, `ink`, `border-control` | Acciones de apoyo: "Exportar a Excel", "Comparar periodos". |
| Fantasma | `st-btn st-btn--ghost` | `brand-cyan-ink`, hover `info-soft` | Acciones dentro de tablas o tarjetas: "Ver detalle". |
| Peligro | `st-btn st-btn--danger` | `danger`, `on-danger` | Acciones destructivas. Siempre con confirmación. |

Tamaños: `st-btn--sm` (13px, filtros y tablas), normal (15px), `st-btn--lg` (16px, pantallas vacías o de bienvenida).

## Reglas

- Texto con verbo al inicio y en mayúscula solo la primera letra: "Descargar informe", no "DESCARGAR" ni "Informe".
- Ícono opcional a la izquierda, 16px, del mismo color del texto.
- En tema oscuro el primario cambia a cian (`primary` = `#00BBF4`) con texto azul Stone: el azul marino no se distingue sobre fondo oscuro.
- Foco de teclado: anillo de 2px en `focus-ring`.
- Deshabilitado: opacidad 45%. Si es posible, explica por qué está deshabilitado en lugar de solo bloquearlo.

## En shadcn/ui

Usa `<Button>` de shadcn: `default` = primario, `outline` = secundario, `ghost` = fantasma, `destructive` = peligro. Los colores ya vienen mapeados en `globals.css`.
