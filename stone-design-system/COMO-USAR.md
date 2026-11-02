# Cómo usar esta carpeta con Claude Code

1. Copia la carpeta `stone-design-system/` a la raíz del repositorio de la plataforma.
2. Agrega esto al `CLAUDE.md` del repositorio:

```
## Diseño
Antes de crear o modificar cualquier pantalla o componente, lee stone-design-system/README.md
y la guía del componente en stone-design-system/components/. Usa solo los tokens definidos ahí.
```

3. Pídele a Claude Code: "Configura el proyecto con stone-design-system/implementacion.md". Eso instala las fuentes, reemplaza `app/globals.css` y deja shadcn/ui con los colores de Stone.
4. Copia los logos de `assets/logos/` a `public/`.

## Contenido

- `README.md`: brand book (principios, color, tipografía, cifras, gráficas, logo).
- `implementacion.md`: fuentes, modo oscuro, globals.css y reglas para Claude Code.
- `globals.css`: el mismo CSS listo para copiar.
- `tokens.json`: todos los tokens, fuente única de valores.
- `components/`: una guía por componente.
- `reference/componentes-referencia.css`: estilos de las vistas previas, solo como referencia visual.
- `assets/logos/`: logo para fondo claro, para fondo oscuro e isotipo (PNG).
