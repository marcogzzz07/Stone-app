import { Card } from "@/components/ui/card";
import { FormShell } from "@/components/forms/form-shell";
import { requireRole } from "@/lib/auth/session";
import { listDevelopments, listLegalEntities, listOperableUnits, listTenants } from "@/lib/data/rentas";
import { ExpenseForm } from "./expense-form";

export const instant = false;

export default async function NuevoGastoPage() {
  await requireRole("operator");
  const [developments, units, entities, tenants] = await Promise.all([listDevelopments(), listOperableUnits(), listLegalEntities(), listTenants()]);

  return (
    <FormShell
      backHref="/rentas?tab=gastos"
      backLabel="Gastos"
      title="Nuevo gasto"
      description="Un servicio, mantenimiento o impuesto pagado por Stone. Si se reparte entre copropietarios o se repercute al arrendatario, captura el prorrateo."
      aside={
        <Card className="gap-2 p-4 text-sm text-ink-2">
          <div className="font-semibold text-ink">Prorrateo</div>
          <p>Cada parte recibe <span className="tnum">total × porcentaje × factor</span>, como el bloque de servicios del reporte mensual.</p>
          <p>El factor es 1 salvo que el contrato o el reglamento indique otra cosa (por ejemplo 1.05). Si no se conoce el porqué del factor, anótalo en la fila para aclararlo después.</p>
          <p>El prorrateo no genera cargos por sí solo: el cargo de recuperación al arrendatario se registra aparte y se vincula al gasto.</p>
        </Card>
      }
    >
      <ExpenseForm developments={developments} units={units} entities={entities} tenants={tenants} />
    </FormShell>
  );
}
