# Menú lateral

Navegación principal de la plataforma: logo arriba, secciones agrupadas y el elemento activo marcado.

## Reglas

- Ancho fijo de 232px en escritorio. Fondo `sidebar` (azul Stone en claro, casi negro en oscuro).
- Logo arriba: la versión para fondo oscuro (`stone-logo-color-fondo-oscuro.png`), 150px de ancho.
- Grupos con etiqueta en mayúsculas (12px, 600): "Reportes", "Portafolio".
- Elementos: ícono de línea de 16px y texto de 15px en `sidebar-ink`.
- Activo: texto `sidebar-ink-active`, fondo blanco al 8% y una barra izquierda de 3px en `brand-cyan`.
- Debajo de 1000px de ancho, el menú se convierte en un panel que se abre con un botón de menú (Sheet de shadcn).
- Íconos sugeridos: lucide-react (LayoutGrid, Home, CreditCard, Wrench, TrendingUp, Box, FileText), que es la librería que usa shadcn.

## En shadcn/ui

El bloque `Sidebar` de shadcn. Sus variables `--sidebar-*` ya están mapeadas en `globals.css`.
