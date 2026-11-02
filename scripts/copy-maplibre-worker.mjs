// Copia el worker de MapLibre a /public (Turbopack no lo resuelve como módulo).
import { copyFileSync } from "node:fs";

copyFileSync(
  "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs",
  "public/maplibre-gl-worker.mjs",
);
