import { PageHeader } from "@/components/patrimonio/kpi-card";
import { MapExplorer } from "./map-explorer";

export default function MapaPage() {
  return (
    <>
      <PageHeader
        title="Mapa patrimonial"
        description="Desarrollos, propiedades y unidades con geometría verificada. Lo que no tiene trazo validado aparece como pendiente; nunca se inventan polígonos."
      />
      <MapExplorer />
    </>
  );
}
