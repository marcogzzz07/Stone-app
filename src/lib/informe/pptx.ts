import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import PptxGenJS from "pptxgenjs";
import type { Informe } from "@/lib/data/informe";

/**
 * Genera el PowerPoint del informe mensual con la plantilla de Stone
 * (16:9, Barlow / Barlow Semi Condensed, azul 101752 y cian 1593C6).
 * Mismas diez láminas que el informe que arma administración; las
 * gráficas son nativas de PowerPoint (editables), ya no capturas de Excel.
 */

const C = {
  navy: "101752",
  cyan: "1593C6",
  cyanDark: "0F6F9B",
  amber: "A85B10",
  amberLight: "D47A1F",
  ink: "1C2233",
  ink2: "4A5266",
  ink3: "5B6478",
  bg: "F5F6F8",
  card: "FCFCFD",
  border: "D8DDE6",
  grid: "C9C9CA",
  tableBorder: "C0C1C4",
  chart: ["12207F", "00A3D9", "6F7894", "23998A", "7E5BC2", "5577E0", "0F5C6E"],
};
const F = { display: "Barlow Semi Condensed", body: "Barlow" };

const money = (v: number) => "$" + Math.round(v).toLocaleString("es-MX");
const num = (v: number) => (Math.abs(v) < 0.5 ? "-" : Math.round(v).toLocaleString("es-MX"));
const num2 = (v: number) => (Math.abs(v) < 0.005 ? "-" : v.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0) + "%";

export async function buildPptx(r: Informe): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 × 7.5 in
  pptx.author = "Stone Inmuebles";
  pptx.title = `Informe mensual · ${r.monthLabel}`;
  const logo = await readFile(path.join(process.cwd(), "public", "brand", "stone-logo.png"));
  const logoData = "image/png;base64," + logo.toString("base64");
  const mes = r.monthLabel.split(" ")[0];
  const mesMin = mes.toLowerCase();

  const header = (s: PptxGenJS.Slide, num: string, kicker: string, title: string) => {
    s.background = { color: C.bg };
    s.addImage({ data: logoData, x: 11.45, y: 0.25, w: 1.4, h: 0.62 });
    s.addText(`${num} ${kicker}`, { x: 0.89, y: 0.85, w: 10.4, h: 0.3, fontFace: F.display, fontSize: 12, bold: true, color: C.cyanDark, charSpacing: 2 });
    s.addText(title, { x: 0.89, y: 1.15, w: 10.4, h: 0.45, fontFace: F.display, fontSize: 24, bold: true, color: C.navy });
    s.addShape(pptx.ShapeType.line, { x: 0.89, y: 6.73, w: 11.56, h: 0, line: { color: C.border, width: 0.75 } });
    s.addText(`Stone Inmuebles · Informe mensual · ${r.monthLabel}`, { x: 0.89, y: 6.8, w: 8, h: 0.3, fontFace: F.body, fontSize: 9, color: C.ink3 });
  };
  const card = (s: PptxGenJS.Slide, x: number, y: number, w: number, h: number) =>
    s.addShape(pptx.ShapeType.roundRect, { x, y, w, h, fill: { color: C.card }, line: { color: C.border, width: 0.75 }, rectRadius: 0.08 });
  const kpi = (s: PptxGenJS.Slide, x: number, label: string, value: string, foot: string, valueColor = C.navy, footColor = C.ink3) => {
    card(s, x, 1.85, 2.76, 1.71);
    s.addText(label, { x: x + 0.23, y: 2.05, w: 2.37, h: 0.3, fontFace: F.body, fontSize: 12, color: C.ink3 });
    s.addText(value, { x: x + 0.23, y: 2.38, w: 2.37, h: 0.46, fontFace: F.display, fontSize: 28, bold: true, color: valueColor });
    s.addText(foot, { x: x + 0.23, y: 2.86, w: 2.4, h: 0.5, fontFace: F.body, fontSize: 11, color: footColor, valign: "top" });
  };
  const insight = (s: PptxGenJS.Slide, x: number, y: number, title: string, body: string, accent: string) => {
    card(s, x, y, 5.69, 1.21);
    s.addShape(pptx.ShapeType.rect, { x: x + 0.23, y: y + 0.2, w: 0.04, h: 0.82, fill: { color: accent }, line: { color: accent } });
    s.addText(title, { x: x + 0.44, y: y + 0.2, w: 5.18, h: 0.27, fontFace: F.display, fontSize: 14, bold: true, color: C.navy });
    s.addText(body, { x: x + 0.44, y: y + 0.5, w: 5.18, h: 0.6, fontFace: F.body, fontSize: 12, color: C.ink2, valign: "top" });
  };
  const tableOpts = (colW: number[]): PptxGenJS.TableProps => ({
    x: 0.9,
    y: 1.72,
    w: 11.53,
    colW,
    fontFace: F.body,
    fontSize: 11,
    color: C.ink,
    border: { type: "solid", pt: 0.5, color: C.tableBorder },
    fill: { color: C.card },
    margin: [0.06, 0.08, 0.06, 0.08],
    autoPage: false,
  });
  const th = (t: string, align: "left" | "right" = "right"): PptxGenJS.TableCell => ({ text: t, options: { bold: true, color: "FFFFFF", fill: { color: C.navy }, align, fontSize: 11 } });
  const td = (t: string, align: "left" | "right" = "right", opts: PptxGenJS.TableCellProps = {}): PptxGenJS.TableCell => ({ text: t, options: { align, ...opts } });
  const total = (t: string, align: "left" | "right" = "right"): PptxGenJS.TableCell => ({ text: t, options: { bold: true, fill: { color: "EEF0F4" }, align } });

  // 1 · Portada
  {
    const s = pptx.addSlide();
    s.background = { color: C.bg };
    s.addShape(pptx.ShapeType.rect, { x: 11.98, y: 0, w: 1.35, h: 7.5, fill: { color: C.navy }, line: { color: C.navy } });
    s.addShape(pptx.ShapeType.rect, { x: 11.98, y: 0, w: 0.08, h: 7.5, fill: { color: C.cyan }, line: { color: C.cyan } });
    s.addImage({ data: logoData, x: 0.89, y: 0.9, w: 3.2, h: 1.42 });
    s.addText("REPORTE DE RENTAS Y MANTENIMIENTOS", { x: 0.89, y: 4.78, w: 6.87, h: 0.3, fontFace: F.display, fontSize: 12, bold: true, color: C.cyanDark, charSpacing: 2 });
    s.addText("Informe mensual", { x: 0.89, y: 5.18, w: 8, h: 0.9, fontFace: F.display, fontSize: 60, bold: true, color: C.navy });
    s.addText(r.monthLabel, { x: 0.89, y: 6.18, w: 6.87, h: 0.5, fontFace: F.display, fontSize: 28, bold: true, color: C.ink });
  }

  // 2 · Resumen ejecutivo
  {
    const s = pptx.addSlide();
    header(s, "01", "RESUMEN EJECUTIVO", `${mes} cerró con ${pct(r.resumen.cobrado, r.resumen.pactado)} de cobranza`);
    kpi(s, 0.89, "Renta facturada", money(r.resumen.pactado), `${r.inmuebles.length} inmuebles, con IVA`);
    kpi(s, 3.82, `Cobrado en ${mesMin}`, money(r.resumen.cobrado), `${pct(r.resumen.cobrado, r.resumen.pactado)} de lo facturado`, C.navy, C.cyanDark);
    kpi(s, 6.75, "Pendiente del mes", money(r.resumen.pendienteMes), `${r.resumen.inmueblesPendientes} inmueble(s)`, C.amber);
    kpi(s, 9.68, `Pendiente ${r.year}`, money(r.resumen.pendienteAnio), `Rentas, enero a ${mesMin}`, C.amber);
    const pos = [[0.89, 3.78], [6.75, 3.78], [0.89, 5.17], [6.75, 5.17]];
    r.insights.slice(0, 4).forEach((i, k) => insight(s, pos[k][0], pos[k][1], i.title, i.body, i.tone === "warning" ? C.amberLight : C.cyan));
  }

  // 3 · Rentas por inmueble
  {
    const s = pptx.addSlide();
    header(s, "02", "RENTAS POR INMUEBLE", `Facturación y cobranza de ${mesMin}`);
    const sum = (f: (d: Informe["inmuebles"][number]) => number) => r.inmuebles.reduce((a, d) => a + f(d), 0);
    const rows: PptxGenJS.TableRow[] = [
      [th("Inmueble", "left"), th("m²"), th("Precio × m²"), th("Importe"), th("IVA"), th("Total renta"), th(`Cobrado ${mesMin.slice(0, 4)}.`), th(`Pendiente ${mesMin.slice(0, 4)}.`), th(`Pendiente ${r.year}`)],
      ...r.inmuebles.map((d) => [
        td(d.name, "left"), td(num2(d.m2)), td(d.m2 ? num2(d.importe / d.m2) : "-"), td(num2(d.importe)), td(num2(d.iva)), td(num2(d.total)), td(num2(d.cobrado)),
        td(num2(d.pendienteMes), "right", d.pendienteMes > 0.5 ? { color: C.amber, bold: true } : {}),
        td(num2(d.pendienteAnio), "right", d.pendienteAnio > 0.5 ? { color: C.amber, bold: true } : {}),
      ]),
      [total("Total", "left"), total(num2(sum((d) => d.m2))), total("-"), total(num2(sum((d) => d.importe))), total(num2(sum((d) => d.iva))), total(num2(r.resumen.pactado)), total(num2(r.resumen.cobrado)), total(num2(r.resumen.pendienteMes)), total(num2(r.resumen.pendienteAnio))],
    ];
    s.addTable(rows, tableOpts([2.2, 1.0, 1.1, 1.35, 1.1, 1.3, 1.3, 1.2, 0.98]));
  }

  // 4 · Cobranza pendiente (gráfica nativa)
  {
    const s = pptx.addSlide();
    header(s, "03", "COBRANZA PENDIENTE", "Cobrado contra pendiente por inmueble");
    const sorted = [...r.inmuebles].sort((a, b) => a.total - b.total); // PowerPoint dibuja de abajo hacia arriba
    s.addChart(
      pptx.ChartType.bar,
      [
        { name: `Cobrado ${mesMin}`, labels: sorted.map((d) => d.name), values: sorted.map((d) => Math.round(d.cobrado)) },
        { name: `Pendiente ${mesMin}`, labels: sorted.map((d) => d.name), values: sorted.map((d) => Math.round(Math.max(0, d.pendienteMes))) },
      ],
      {
        x: 0.89, y: 1.8, w: 8.4, h: 4.2, barDir: "bar", barGrouping: "stacked", chartColors: [C.cyan, C.amberLight],
        catAxisLabelFontFace: F.body, catAxisLabelFontSize: 11, catAxisLabelColor: C.ink, valAxisLabelFontFace: F.body, valAxisLabelFontSize: 9, valAxisLabelColor: C.ink3,
        valAxisLabelFormatCode: "$#,##0", valGridLine: { color: C.border, size: 0.5 }, catGridLine: { style: "none" },
        showLegend: true, legendPos: "t", legendFontFace: F.body, legendFontSize: 11, legendColor: C.ink2, showValue: false,
      },
    );
    s.addText("Total renta del mes por inmueble, con IVA.", { x: 0.89, y: 6.1, w: 8.4, h: 0.3, fontFace: F.body, fontSize: 11, color: C.ink3 });
    const pend = r.inmuebles.filter((d) => d.pendienteMes > 0.5 || d.pendienteAnio > 0.5).slice(0, 2);
    pend.forEach((d, k) => {
      const y = 1.85 + k * 2.7;
      card(s, 9.53, y, 2.91, 2.52);
      s.addText(d.name, { x: 9.76, y: y + 0.2, w: 2.53, h: 0.25, fontFace: F.display, fontSize: 14, bold: true, color: C.navy });
      s.addText(`Pendiente ${mesMin}`, { x: 9.76, y: y + 0.48, w: 2.53, h: 0.26, fontFace: F.body, fontSize: 11, color: C.ink3 });
      s.addText(money(Math.max(0, d.pendienteMes)), { x: 9.76, y: y + 0.76, w: 2.53, h: 0.34, fontFace: F.display, fontSize: 18, bold: true, color: C.amber });
      s.addText(`Pendiente ${r.year}`, { x: 9.76, y: y + 1.15, w: 2.53, h: 0.26, fontFace: F.body, fontSize: 11, color: C.ink3 });
      s.addText(money(d.pendienteAnio), { x: 9.76, y: y + 1.43, w: 2.53, h: 0.34, fontFace: F.display, fontSize: 18, bold: true, color: C.amber });
      s.addText(`Cobrado: ${pct(d.cobrado, d.total)} de la renta del mes`, { x: 9.76, y: y + 1.85, w: 2.68, h: 0.5, fontFace: F.body, fontSize: 11, color: C.ink2, valign: "top" });
    });
  }

  // 5 · Mantenimientos y servicios
  {
    const s = pptx.addSlide();
    header(s, "04", "MANTENIMIENTOS Y SERVICIOS", "Cuotas de mantenimiento y gasto en servicios");
    s.addText("Cuotas de mantenimiento", { x: 0.89, y: 1.72, w: 6, h: 0.3, fontFace: F.display, fontSize: 13, bold: true, color: C.navy });
    const sm = (f: (m: Informe["mantenimiento"][number]) => number) => r.mantenimiento.reduce((a, m) => a + f(m), 0);
    const mrows: PptxGenJS.TableRow[] = [
      [th("Inmueble", "left"), th("m²"), th("Importe"), th("IVA"), th("Total cuota"), th(`Pagado ${mesMin.slice(0, 4)}.`), th(`Pendiente ${mesMin.slice(0, 4)}.`), th(`Pendiente ${r.year}`)],
      ...r.mantenimiento.map((m) => [td(m.name, "left"), td(num2(m.m2)), td(num2(m.importe)), td(num2(m.iva)), td(num2(m.facturado)), td(num2(m.pagado)), td(num2(m.pendienteMes), "right", m.pendienteMes > 0.5 ? { color: C.amber, bold: true } : {}), td(num2(m.pendienteAnio), "right", m.pendienteAnio > 0.5 ? { color: C.amber, bold: true } : {})]),
      [total("Total", "left"), total(num2(sm((m) => m.m2))), total(num2(sm((m) => m.importe))), total(num2(sm((m) => m.iva))), total(num2(sm((m) => m.facturado))), total(num2(sm((m) => m.pagado))), total(num2(sm((m) => m.pendienteMes))), total(num2(sm((m) => m.pendienteAnio)))],
    ];
    s.addTable(mrows, { ...tableOpts([2.3, 1.1, 1.4, 1.2, 1.4, 1.4, 1.4, 1.33]), y: 2.05, fontSize: 10 });
    const ySrv = 2.05 + 0.3 * (mrows.length + 1) + 0.35;
    s.addText(`Servicios pagados en ${mesMin}`, { x: 0.89, y: ySrv, w: 6, h: 0.3, fontFace: F.display, fontSize: 13, bold: true, color: C.navy });
    const ss = (f: (x: Informe["servicios"][number]) => number) => r.servicios.reduce((a, x) => a + f(x), 0);
    const srows: PptxGenJS.TableRow[] = [
      [th("Inmueble", "left"), th("Luz"), th("Teléfono"), th("Mantenimiento"), th("Otros"), th("Agua y drenaje"), th("Total")],
      ...r.servicios.map((x) => [td(x.name, "left"), td(num(x.electricity)), td(num(x.phone)), td(num(x.maintenance)), td(num(x.other)), td(num(x.water)), td(num(x.total))]),
      [total("Total", "left"), total(num(ss((x) => x.electricity))), total(num(ss((x) => x.phone))), total(num(ss((x) => x.maintenance))), total(num(ss((x) => x.other))), total(num(ss((x) => x.water))), total(num(ss((x) => x.total)))],
    ];
    s.addTable(srows, { ...tableOpts([2.3, 1.5, 1.5, 1.7, 1.3, 1.7, 1.53]), y: ySrv + 0.33, fontSize: 10 });
    const top = [...r.servicios].sort((a, b) => b.total - a.total)[0];
    if (top) s.addText(`Cifras en pesos mexicanos. ${top.name} concentra ${money(top.total)} de los ${money(ss((x) => x.total))} en servicios (${pct(top.total, ss((x) => x.total))}).`, { x: 0.89, y: 6.35, w: 11.5, h: 0.3, fontFace: F.body, fontSize: 11, color: C.ink3 });
  }

  // 6 · Real vs proyección
  {
    const s = pptx.addSlide();
    header(s, "05", `REAL VS. PROYECCIÓN ${r.year}`, `El acumulado del año va al ${pct(r.resumen.realAcum, r.resumen.proyAcum)} de lo proyectado`);
    s.addChart(
      pptx.ChartType.bar,
      [
        { name: "Proyección", labels: r.proyeccion.map((p) => p.label), values: r.proyeccion.map((p) => Math.round(p.proyeccion / 1000)) },
        { name: "Real", labels: r.proyeccion.map((p) => p.label), values: r.proyeccion.map((p) => Math.round(p.real / 1000)) },
      ],
      {
        x: 0.89, y: 1.8, w: 8.6, h: 2.5, barDir: "col", barGrouping: "clustered", chartColors: [C.navy, C.cyan],
        catAxisLabelFontFace: F.body, catAxisLabelFontSize: 10, catAxisLabelColor: C.ink2, valAxisLabelFontFace: F.body, valAxisLabelFontSize: 9, valAxisLabelColor: C.ink3,
        valAxisLabelFormatCode: "#,##0", valGridLine: { color: C.border, size: 0.5 }, catGridLine: { style: "none" }, showLegend: true, legendPos: "t", legendFontFace: F.body, legendFontSize: 10, legendColor: C.ink2,
      },
    );
    s.addText("Miles de pesos", { x: 0.89, y: 4.32, w: 4, h: 0.25, fontFace: F.body, fontSize: 9, color: C.ink3 });
    const prow = (label: string, f: (p: Informe["proyeccion"][number]) => string, bold = false): PptxGenJS.TableRow => [{ text: label, options: { bold: true, align: "left" } }, ...r.proyeccion.map((p) => ({ text: f(p), options: { align: "right" as const, bold } }))];
    const colW = [1.5, ...r.proyeccion.map(() => (8.6 - 1.5) / r.proyeccion.length)];
    s.addTable(
      [
        [th("", "left"), ...r.proyeccion.map((p) => th(p.label))],
        prow("Proyección", (p) => num(p.proyeccion / 1000)),
        prow("Real", (p) => num(p.real / 1000)),
        prow("Real / proyección", (p) => pct(p.real, p.proyeccion), true),
      ],
      { ...tableOpts(colW), x: 0.89, y: 4.65, w: 8.6, fontSize: 10 },
    );
    card(s, 9.76, 1.85, 2.68, 1.3);
    s.addText("Real acumulado", { x: 9.95, y: 2.0, w: 2.3, h: 0.3, fontFace: F.body, fontSize: 11, color: C.ink3 });
    s.addText(money(r.resumen.realAcum), { x: 9.95, y: 2.3, w: 2.4, h: 0.45, fontFace: F.display, fontSize: 22, bold: true, color: C.navy });
    card(s, 9.76, 3.3, 2.68, 1.3);
    s.addText("Proyección acumulada", { x: 9.95, y: 3.45, w: 2.3, h: 0.3, fontFace: F.body, fontSize: 11, color: C.ink3 });
    s.addText(money(r.resumen.proyAcum), { x: 9.95, y: 3.75, w: 2.4, h: 0.45, fontFace: F.display, fontSize: 22, bold: true, color: C.navy });
    const above = r.proyeccion.filter((p) => p.real >= p.proyeccion).length;
    const below = r.proyeccion.filter((p) => p.real < p.proyeccion).map((p) => p.label.toLowerCase());
    s.addText(`${above} de ${r.proyeccion.length} meses por arriba de lo proyectado.${below.length ? ` Por debajo: ${below.join(", ")}.` : ""}`, { x: 9.76, y: 4.75, w: 2.68, h: 1.2, fontFace: F.body, fontSize: 11, color: C.ink2, valign: "top" });
  }

  // 7 · Tendencia (líneas nativas)
  {
    const s = pptx.addSlide();
    header(s, "06", `TENDENCIA ENERO A ${mes.toUpperCase()}`, "Rentas y mantenimientos por inmueble, mes a mes");
    const lineOpts = (x: number): PptxGenJS.IChartOpts => ({
      x, y: 2.1, w: 5.5, h: 3.9, chartColors: C.chart, barDir: "col", barGrouping: "stacked",
      catAxisLabelFontFace: F.body, catAxisLabelFontSize: 9, catAxisLabelColor: C.ink2, valAxisLabelFontFace: F.body, valAxisLabelFontSize: 9, valAxisLabelColor: C.ink3,
      valAxisLabelFormatCode: "$#,##0", valGridLine: { color: C.border, size: 0.5 }, catGridLine: { style: "none" }, showLegend: true, legendPos: "b", legendFontFace: F.body, legendFontSize: 9, legendColor: C.ink2,
    });
    card(s, 0.89, 1.89, 5.66, 4.4);
    s.addText("Rentas", { x: 1.12, y: 2.0, w: 5, h: 0.25, fontFace: F.display, fontSize: 13, bold: true, color: C.navy });
    s.addChart(pptx.ChartType.bar, r.tendencia.rentas.map((t) => ({ name: t.name, labels: r.tendencia.months, values: t.values.map((v) => Math.round(v)) })), lineOpts(0.97));
    card(s, 6.78, 1.89, 5.66, 4.4);
    s.addText("Mantenimientos", { x: 7.01, y: 2.0, w: 5, h: 0.25, fontFace: F.display, fontSize: 13, bold: true, color: C.navy });
    if (r.tendencia.mtto.length) {
      s.addChart(pptx.ChartType.bar, r.tendencia.mtto.map((t) => ({ name: t.name, labels: r.tendencia.months, values: t.values.map((v) => Math.round(v)) })), { ...lineOpts(6.86), chartColors: r.tendencia.mtto.map((t) => C.chart[Number(t.chart.slice(-1)) - 1] ?? C.chart[0]) });
    } else {
      s.addText("Sin cuotas de mantenimiento cobradas en el período.", { x: 7.01, y: 3.5, w: 5.2, h: 0.5, fontFace: F.body, fontSize: 12, color: C.ink3, align: "center" });
    }
  }

  // 8-9 · Playa del Carmen
  {
    const pages = [r.playa.slice(0, 11), r.playa.slice(11)].filter((p) => p.length);
    pages.forEach((page, k) => {
      const s = pptx.addSlide();
      header(s, "07", `PROPIEDADES PLAYA DEL CARMEN (${k + 1} DE ${pages.length})`, k === 0 ? `${r.playa.length} espacios en inventario, ${r.playa.filter((p) => p.client).length} con cliente registrado` : "Espacios de Stone Inmuebles");
      s.addTable(
        [
          [th("Propietario", "left"), th("m²"), th("Descripción", "left"), th("Renta con IVA"), th("Cliente", "left")],
          ...page.map((p) => [td(p.owner, "left"), td(num2(p.m2)), td(p.desc, "left"), td(p.listRent != null ? num2(p.listRent) : "-"), td(p.client ?? "-", "left")]),
        ],
        tableOpts([2.4, 1.0, 3.6, 1.8, 2.73]),
      );
    });
  }

  // 10 · Cierre
  {
    const s = pptx.addSlide();
    s.background = { color: C.bg };
    s.addImage({ data: logoData, x: 4.6, y: 2.0, w: 4.1, h: 1.82 });
    s.addText("Stone Inmuebles", { x: 0, y: 4.27, w: 13.33, h: 0.4, fontFace: F.display, fontSize: 16, bold: true, color: C.navy, align: "center" });
    s.addText(`Informe mensual · ${r.monthLabel}`, { x: 0, y: 4.67, w: 13.33, h: 0.35, fontFace: F.body, fontSize: 14, color: C.ink, align: "center" });
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 6.58, w: 13.33, h: 0.08, fill: { color: C.cyan }, line: { color: C.cyan } });
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 6.67, w: 13.33, h: 0.83, fill: { color: C.navy }, line: { color: C.navy } });
  }

  const out = await pptx.write({ outputType: "nodebuffer" });
  return out as Buffer;
}
