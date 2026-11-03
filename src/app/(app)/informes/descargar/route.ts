import { NextResponse } from "next/server";
import { getSessionUser, hasRole } from "@/lib/auth/session";
import { buildInforme, listReportMonths } from "@/lib/data/informe";
import { buildPptx } from "@/lib/informe/pptx";

/** Descarga del informe mensual en PowerPoint. Solo admin/operator. */
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user?.membership || !hasRole(user.membership.role, "operator")) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }
  const months = await listReportMonths();
  const url = new URL(request.url);
  const mes = url.searchParams.get("mes") ?? "";
  const period = months.includes(mes) ? mes : months[months.length - 1];
  if (!period) return NextResponse.json({ error: "Sin meses con cargos" }, { status: 404 });
  const informe = await buildInforme(period);
  if (!informe) return NextResponse.json({ error: "Sin datos" }, { status: 404 });
  const buffer = await buildPptx(informe);
  const name = `Stone Inmuebles - Informe ${informe.monthLabel}.pptx`;
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${name.normalize("NFD").replace(/[̀-ͯ]/g, "")}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "no-store",
    },
  });
}
