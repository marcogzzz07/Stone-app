# Pestañas

Cambian entre vistas relacionadas de una misma página, como Rentas, Mantenimientos y Servicios de un mismo mes.

## Reglas

- De 2 a 6 pestañas. Si son más, usa un select o el menú lateral.
- Pestaña activa: texto `ink` y línea inferior de 2px en `brand-cyan`. Inactivas: `ink-3`.
- Texto de una o dos palabras, sin íconos.
- Cambiar de pestaña no recarga los filtros de la página (periodo, inmueble).
- Navegables con teclado (flechas izquierda y derecha) y con `role="tablist"`.

## En shadcn/ui

`<Tabs>` de shadcn con la variante de línea: `TabsList` sin fondo y `TabsTrigger` con `data-[state=active]:border-b-2 border-brand-cyan`.
