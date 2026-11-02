import { PageHeader } from "@/components/patrimonio/kpi-card";
import { MapExplorer } from "./map-explorer";

export default function MapaPage() {
  return (
    <>
      <PageHeader
        title="Mapa patrimonial"
        description="Desarrollos y unidades con geometría verificada."
      />
      <MapExplorer />
    </>
  );
}
