import type { Metadata } from "next";
import { Archivo, Geist_Mono } from "next/font/google";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

// Tipografía elegida por el usuario (2 nov 2026): Archivo con eje de anchura.
// Ancho normal para interfaz; condensado (font-stretch 75 %) en títulos y cifras.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
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
      className={`${archivo.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
