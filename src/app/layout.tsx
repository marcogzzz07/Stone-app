import type { Metadata } from "next";
import { Geist_Mono, IBM_Plex_Sans, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

// Tipografía del design system (stone-design-system/implementacion.md):
// IBM Plex Sans para títulos, Source Sans 3 para texto, interfaz y cifras.
const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

const source = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stone Inmuebles · Atlas patrimonial",
  description:
    "Plataforma privada de inventario, administración de rentas y exploración patrimonial geográfica.",
  icons: { icon: "/brand/stone-mark.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-MX"
      className={`${plex.variable} ${source.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
