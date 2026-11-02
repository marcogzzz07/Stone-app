import type { Metadata } from "next";
import { Figtree, Geist_Mono } from "next/font/google";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

// Tipografía elegida por el usuario (2 nov 2026): Figtree. Geométrica cálida;
// la jerarquía se construye con peso y tamaño (700 en cifras y títulos).
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
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
      className={`${figtree.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
