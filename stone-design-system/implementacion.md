# Implementación en Next.js

Cómo llevar este sistema a la plataforma (Next.js App Router, Tailwind v4 y shadcn/ui). Si el proyecto usa Tailwind v3, avisa a Claude Code para convertir el bloque `@theme` a `tailwind.config.ts`.

## 1. Fuentes con next/font

En `app/layout.tsx`:

```tsx
import { IBM_Plex_Sans, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-plex", display: "swap" });
const source = Source_Sans_3({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-source", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${plex.variable} ${source.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

## 2. Modo oscuro

Con `next-themes`, `attribute="class"`: la clase `.dark` en `<html>` activa los valores oscuros. El tema por defecto es claro.

## 3. globals.css

Reemplaza el `app/globals.css` que genera shadcn por este. Las variables de shadcn (`--background`, `--primary`, etc.) apuntan a los tokens de Stone, así que los componentes de shadcn salen con la marca sin tocarlos.

```css
/* Stone Inmuebles - globals.css (Next.js + Tailwind v4 + shadcn/ui)
   Generado desde tokens.json. Si cambias un color, cambia tokens.json y regenera. */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --brand-navy: #000649;
  --brand-navy-2: #141E6E;
  --brand-cyan: #00BBF4;
  --brand-cyan-ink: #0074A3;
  --bg: #F5F6F9;
  --surface: #FDFDFE;
  --surface-2: #EDF0F5;
  --border: #DBE0E9;
  --border-control: #7F88A2;
  --ink: #0A0F33;
  --ink-2: #465073;
  --ink-3: #5F6884;
  --primary: #000649;
  --primary-hover: #141E6E;
  --on-primary: #F5F7FC;
  --focus-ring: #00A3D9;
  --sidebar: #000649;
  --sidebar-ink: #C9D0EA;
  --sidebar-ink-active: #FFFFFF;
  --success: #17744A;
  --success-soft: #E3F3EA;
  --warning: #955600;
  --warning-soft: #FBEFD9;
  --danger: #B8322A;
  --danger-soft: #FBE5E3;
  --on-danger: #FFFFFF;
  --info: #0074A3;
  --info-soft: #E0F3FB;
  --chart-1: #12207F;
  --chart-2: #00A3D9;
  --chart-3: #6F7894;
  --chart-4: #23998A;
  --chart-5: #7E5BC2;
  --chart-6: #5577E0;
  --chart-7: #0F5C6E;
  --chart-grid: #E3E7EE;
  --chart-reference: #5F6884;
  --background: var(--bg);
  --foreground: var(--ink);
  --card: var(--surface);
  --card-foreground: var(--ink);
  --popover: var(--surface);
  --popover-foreground: var(--ink);
  --primary-foreground: var(--on-primary);
  --secondary: var(--surface-2);
  --secondary-foreground: var(--ink);
  --muted: var(--surface-2);
  --muted-foreground: var(--ink-3);
  --accent: var(--surface-2);
  --accent-foreground: var(--ink);
  --destructive: var(--danger);
  --destructive-foreground: var(--on-danger);
  --input: var(--border-control);
  --ring: var(--focus-ring);
  --sidebar-background: var(--sidebar);
  --sidebar-foreground: var(--sidebar-ink);
  --sidebar-primary: var(--brand-cyan);
  --sidebar-primary-foreground: var(--brand-navy);
  --radius: 10px;
}

.dark {
  --brand-navy: #000649;
  --brand-navy-2: #1B2580;
  --brand-cyan: #00BBF4;
  --brand-cyan-ink: #4FCFF8;
  --bg: #060A22;
  --surface: #0D1331;
  --surface-2: #141B40;
  --border: #232C55;
  --border-control: #5A6595;
  --ink: #E9EDF8;
  --ink-2: #AAB2D0;
  --ink-3: #848DAE;
  --primary: #00BBF4;
  --primary-hover: #4FCFF8;
  --on-primary: #000649;
  --focus-ring: #4FCFF8;
  --sidebar: #03071A;
  --sidebar-ink: #9AA3C6;
  --sidebar-ink-active: #FFFFFF;
  --success: #43C68C;
  --success-soft: #10301F;
  --warning: #F2A93B;
  --warning-soft: #352610;
  --danger: #F27A6F;
  --danger-soft: #3A1A1A;
  --on-danger: #1A0705;
  --info: #4FCFF8;
  --info-soft: #0E2A3D;
  --chart-1: #8FA2FF;
  --chart-2: #22C3F7;
  --chart-3: #9AA3BD;
  --chart-4: #3FC1AE;
  --chart-5: #B58BE0;
  --chart-6: #5C7BEA;
  --chart-7: #2E8FA6;
  --chart-grid: #1C2450;
  --chart-reference: #848DAE;
}

@theme inline {
  --color-brand-navy: var(--brand-navy);
  --color-brand-navy-2: var(--brand-navy-2);
  --color-brand-cyan: var(--brand-cyan);
  --color-brand-cyan-ink: var(--brand-cyan-ink);
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-border: var(--border);
  --color-border-control: var(--border-control);
  --color-ink: var(--ink);
  --color-ink-2: var(--ink-2);
  --color-ink-3: var(--ink-3);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-on-primary: var(--on-primary);
  --color-focus-ring: var(--focus-ring);
  --color-sidebar: var(--sidebar);
  --color-sidebar-ink: var(--sidebar-ink);
  --color-sidebar-ink-active: var(--sidebar-ink-active);
  --color-success: var(--success);
  --color-success-soft: var(--success-soft);
  --color-warning: var(--warning);
  --color-warning-soft: var(--warning-soft);
  --color-danger: var(--danger);
  --color-danger-soft: var(--danger-soft);
  --color-on-danger: var(--on-danger);
  --color-info: var(--info);
  --color-info-soft: var(--info-soft);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-chart-6: var(--chart-6);
  --color-chart-7: var(--chart-7);
  --color-chart-grid: var(--chart-grid);
  --color-chart-reference: var(--chart-reference);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sidebar-background: var(--sidebar-background);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --font-display: var(--font-plex), "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif;
  --font-sans: var(--font-source), "Source Sans 3", "Helvetica Neue", Arial, sans-serif;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;
  --shadow-sm: 0 1px 2px rgba(10,15,51,0.06);
  --shadow-md: 0 1px 2px rgba(10,15,51,0.06), 0 4px 14px rgba(10,15,51,0.06);
}

@layer base {
  body { @apply bg-bg text-ink font-sans antialiased; font-size: 15px; line-height: 22px; }
  h1, h2, h3, h4 { @apply font-display font-semibold; letter-spacing: -0.01em; }
  .tabular, td, .kpi { font-variant-numeric: tabular-nums; }
  :focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
}
```

## 4. Clases de Tailwind disponibles

Cada token es una clase: `bg-surface`, `text-ink-2`, `border-border-control`, `bg-warning-soft text-warning`, `fill-chart-1`, `font-display`, `font-sans`, `rounded-lg`.

## 5. Reglas para Claude Code

- Usa siempre los tokens por nombre; no escribas colores hexadecimales en componentes.
- Cifras con la clase `tabular-nums` y alineadas a la derecha en tablas.
- Un solo botón primario por pantalla.
- Pendiente siempre en `warning`, vencido en `danger`, siempre con texto.
- Gráficas con Recharts (charts de shadcn) y la paleta `chart-1` a `chart-7` en el orden fijo de inmuebles del brand book.
- Íconos de lucide-react, trazo de 1.5 y 16px en navegación.
