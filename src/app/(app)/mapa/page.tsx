import { PageHeader } from "@/components/patrimonio/kpi-card";
import { Notice } from "@/components/forms/notice";
import { requireMember } from "@/lib/auth/session";
import { listDevelopmentPoints, listDevelopmentRows, listUnitRows } from "@/lib/data/patrimonio";
import { MapExplorer } from "./map-explorer";

export const instant = false;

export default async function MapaPage() {
  await requireMember();
  const [devs, units, points] = await Promise.all([listDevelopmentRows(), listUnitRows(), listDevelopmentPoints()]);
  const withGeo = points.length;
  return (
    <>
      <PageHeader title="Mapa patrimonial" description="Inmuebles y unidades con ubicación verificada." />
      {withGeo < devs.length && (
        <Notice tone="info" title={`${devs.length - withGeo} inmueble(s) sin ubicación`} className="mb-4">
          Aparecen en la lista pero no en el mapa hasta capturar su dirección.
        </Notice>
      )}
      <Notice tone="info" title="Puntos por dirección, no polígonos" className="mb-4">
        Cada inmueble se ubica por su dirección (Central de Playa con el punto exacto de Google Maps; los demás a nivel calle). Los límites del predio se dibujarán cuando haya planos o un recorrido con GPS.
      </Notice>
      <MapExplorer
        developments={devs.map((d) => {
          const p = points.find((x) => x.id === d.id);
          return { id: d.id, name: d.name, city: d.city, address: d.address, lon: p?.lon ?? null, lat: p?.lat ?? null, precisionM: p?.precisionM ?? null, unitsStone: d.unitsStone };
        })}
        units={units.map((u) => ({ id: u.id, code: u.code, name: u.name, developmentId: u.developmentId, referenceOnly: u.referenceOnly, rentableM2: u.rentableM2, tenantName: u.tenantName }))}
      />
    </>
  );
}
