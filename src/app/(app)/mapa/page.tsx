import { PageHeader } from "@/components/patrimonio/kpi-card";
import { Notice } from "@/components/forms/notice";
import { requireMember } from "@/lib/auth/session";
import { listDevelopmentRows, listUnitRows } from "@/lib/data/patrimonio";
import { MapExplorer } from "./map-explorer";

export const instant = false;

export default async function MapaPage() {
  await requireMember();
  const [devs, units] = await Promise.all([listDevelopmentRows(), listUnitRows()]);
  const withGeo = devs.filter((d) => d.hasGeometry).length;
  return (
    <>
      <PageHeader title="Mapa patrimonial" description="Inmuebles y unidades con ubicación verificada." />
      {withGeo === 0 && (
        <Notice tone="info" title="Ningún inmueble tiene ubicación todavía" className="mb-4">
          El reporte mensual no trae direcciones ni coordenadas. En cuanto se capturen (dirección o polígono de cada inmueble) aparecerán aquí; no se dibujan ubicaciones aproximadas.
        </Notice>
      )}
      <MapExplorer
        developments={devs.map((d) => ({ id: d.id, name: d.name, hasGeometry: d.hasGeometry, city: d.city }))}
        units={units.map((u) => ({ id: u.id, code: u.code, name: u.name, developmentId: u.developmentId, referenceOnly: u.referenceOnly, rentableM2: u.rentableM2, hasGeometry: u.hasGeometry }))}
      />
    </>
  );
}
