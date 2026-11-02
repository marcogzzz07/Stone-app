# Stone Inmuebles

Plataforma web privada de inventario, administración de rentas y exploración patrimonial geográfica.

- **Requisitos:** `Stone_Inmuebles_Product_Spec_v0.2.md`
- **Plan técnico:** `IMPLEMENTATION_PLAN.md`
- **Estado:** Iteración 0 — prototipo navegable con datos sintéticos `[DEMO]`. Sin conexión a datos reales.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Recharts · MapLibre GL · Supabase (Postgres + PostGIS + Auth + Storage) · Vercel.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con las claves del proyecto Supabase
npm run dev
```

Abre http://localhost:3000.

## Reglas del repositorio

- Nunca subir `.env.local`, claves `service_role`, documentos ni datos reales de Stone.
- Los datos de `src/lib/mock/` son sintéticos y se eliminan al conectar Supabase.
- Toda cifra financiera distingue subtotal, IVA, total, moneda, período y origen.
