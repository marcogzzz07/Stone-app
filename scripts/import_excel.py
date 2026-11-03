#!/usr/bin/env python3
"""
Importador único del histórico: Excel mensual → SQL para Supabase.

Lee el reporte mensual (hechos: `Facturacion`; catálogos: `Ubicacion de
rentas`, `Propiedades Playa`; servicios: `CXC Mensual`; cobros en efectivo:
`2026 Renta` / `2026 Mtto`) y el archivo de propiedades (`Portafolio`: unidades
con interior y m²). Genera un archivo SQL con todo lo necesario para cargar la
organización `stone`: entidades, inmuebles, unidades, arrendatarios con alias,
contratos con historial de renta, cargos, pagos con aplicaciones, gastos con
prorrateo, fechas críticas y discrepancias.

No corrige nada en silencio: lo que no cuadra se registra en
`import_discrepancias`. Los ids son deterministas (uuid5) para poder repetir.

Lo que depende de datos reales (historial de rentas por arrendatario, alias,
hallazgos puntuales, reglas de prorrateo) vive en un JSON privado fuera del
repositorio (`docs/privado/importacion-<corte>.json`); este script solo sabe
leer la estructura del Excel.

Uso:
  python3 scripts/import_excel.py <config.json> <reporte.xlsx> <propiedades.xlsx> <salida.sql>

El Excel, el JSON de configuración y el SQL generado contienen datos reales:
nunca al repositorio.
"""
import datetime as dt
import hashlib
import json
import re
import sys
import unicodedata
import uuid
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP

import openpyxl

NS = uuid.UUID("5b2d3b4e-6a1f-4c3e-9d0a-0a0b0c000001")
IVA = Decimal("0.16")
MONTH_NAMES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]

# Inmuebles en operación (orden fijo de la paleta chart-1…7 del brand book).
DEV = {
    "heroes de lincon": ("HL", "Héroes de Lincoln", 1),
    "heroes de lincoln": ("HL", "Héroes de Lincoln", 1),
    "torre san jeronimo": ("SJ", "Torre San Jerónimo", 2),
    "san jeronimo": ("SJ", "Torre San Jerónimo", 2),
    "lomas del valle": ("LV", "Lomas del Valle", 3),
    "torre evalor": ("TE", "Torre Evalor", 4),
    "central de playa": ("CP", "Central de Playa", 5),
    "loma blanca": ("LB", "Loma Blanca", 6),
    "santa isabel": ("SI", "Santa Isabel", 7),
}
DEV_NAME = {code: name for code, name, _ in DEV.values()}
DEV_KIND = {"HL": "local", "SJ": "oficina", "LV": "local", "TE": "oficina", "CP": "bodega", "LB": "oficina", "SI": "terreno"}


def uid(*parts) -> str:
    return str(uuid.uuid5(NS, "|".join(str(p) for p in parts)))


def q(v) -> str:
    """Literal SQL."""
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float, Decimal)):
        return str(v)
    if isinstance(v, (dt.date, dt.datetime)):
        return f"'{v.isoformat()[:10]}'"
    if isinstance(v, (dict, list)):
        return "'" + json.dumps(v, ensure_ascii=False).replace("'", "''") + "'::jsonb"
    return "'" + str(v).replace("'", "''") + "'"


def money(v) -> Decimal:
    return Decimal(str(v)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def split_iva(total: Decimal):
    sub = (total / (1 + IVA)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return sub, total - sub


def unaccent(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


SUFFIX = re.compile(r"\b(s ?a ?p ?i de c ?v|s ?a de c ?v|sa de cv|s ?a|s ?c|sofom|e ?n ?r|cv)\b")


def norm(s: str) -> str:
    """Clave de arrendatario: minúsculas, sin acentos ni puntuación ni sufijos societarios."""
    s = unaccent(str(s or "")).lower()
    s = s.replace("(efectivo)", " ")
    s = re.sub(r"[.,;:()]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    prev = None
    while prev != s:
        prev = s
        s = SUFFIX.sub(" ", s)
        s = re.sub(r"\s+", " ", s).strip()
    return s


def dev_of(name: str):
    k = norm(name)
    if k not in DEV:
        raise SystemExit(f"Ubicación desconocida: {name!r}")
    return DEV[k]


def cell_date(v):
    if isinstance(v, dt.datetime):
        return v.date()
    if isinstance(v, dt.date):
        return v
    return None


def pair_key(d: dict, tk: str, dev: str):
    return d.get(f"{tk}|{dev}")


class Importer:
    def __init__(self, cfg: dict, report_path: str, portfolio_path: str):
        self.cfg = cfg
        self.period = dt.date.fromisoformat(cfg["report_period"])
        self.today = dt.date.fromisoformat(cfg["today"])
        self.wb = openpyxl.load_workbook(report_path, data_only=True)
        self.pf = openpyxl.load_workbook(portfolio_path, data_only=True)
        self.sql: list[str] = []
        self.disc: list[dict] = []
        self.org = "(select id from public.organizations where slug = 'stone')"
        self.batch_id = uid("batch", cfg["report_period"])
        self.tenants: dict[str, dict] = {}
        self.units: dict[str, dict] = {}
        self.leases: dict[tuple, dict] = {}
        self.charges: list[dict] = []
        self.payments: list[dict] = []
        self.expenses: list[dict] = []
        self.sha = hashlib.sha256(open(report_path, "rb").read()).hexdigest()
        self.report_name = report_path.split("/")[-1]
        self.portfolio_name = portfolio_path.split("/")[-1]
        self.rent_history = {(h["tenant"], h["dev"]): h["history"] for h in cfg["rent_history"]}

    # ------------------------------------------------------------ util
    def emit(self, s: str):
        self.sql.append(s)

    def add_disc(self, kind, severity, description, sheet=None, cell=None, expected=None, actual=None, target_type=None, target_id=None):
        self.disc.append(dict(kind=kind, severity=severity, description=description, sheet=sheet, cell=cell, expected=expected, actual=actual, target_type=target_type, target_id=target_id))

    def tenant(self, raw: str) -> dict:
        key = norm(raw)
        key = self.cfg["tenant_alias_fix"].get(key, key)
        t = self.tenants.get(key)
        if not t:
            display = re.sub(r"\s+", " ", str(raw)).replace("(EFECTIVO)", "").strip()
            t = self.tenants[key] = {
                "id": uid("tenant", key), "key": key, "display": display, "legal": None, "aliases": set(),
                "kind": "persona_fisica" if key in self.cfg["persona_fisica"] else "persona_moral",
                "pays_cash": key in self.cfg["pays_cash"],
            }
        t["aliases"].add(re.sub(r"\s+", " ", str(raw)).strip())
        return t

    # ------------------------------------------------------------ catálogos
    def load_portfolio(self):
        ws = self.pf["Portafolio"]
        seq = defaultdict(int)
        for row in ws.iter_rows(min_row=8, values_only=True):
            client, loc, interior, m2, rent, status, obs = (list(row) + [None] * 8)[:7]
            if not loc:
                continue
            code, dev_name, _ = dev_of(loc)
            interior = str(interior).strip() if interior not in (None, "-") else None
            if interior is None:
                seq[code] += 1
                ucode = f"{code}-{seq[code]:02d}"
            else:
                ucode = f"{code}-{interior.zfill(2) if interior.isdigit() else interior}"
            name = f"{dev_name} · {('Interior ' + interior) if interior else 'Espacio ' + ucode[-2:]}"
            self.units[ucode] = {
                "id": uid("unit", ucode), "code": ucode, "dev": code, "m2": Decimal(str(m2)) if m2 else None,
                "name": name, "kind": DEV_KIND[code], "occupancy": "occupied" if str(status).lower().startswith("rent") else "vacant",
                "client": client, "rent": Decimal(str(rent)) if rent else None, "obs": str(obs).strip() if obs else None,
                "reference_only": False, "owner": None, "list_rent": None, "notes": str(obs).strip() if obs else None,
            }

    def load_playa(self):
        ws = self.wb["Propiedades Playa"]
        for row in ws.iter_rows(min_row=4, values_only=True):
            owner, m2, desc, price, client = (list(row) + [None] * 6)[1:6]
            if not desc:
                continue
            desc = str(desc).strip()
            m = re.search(r"([A-D]?\s?\d+[A-B]?)$", desc.replace("Cross Dock 1 ", "Cross Dock "))
            interior = m.group(1).replace(" ", "") if m else desc
            ucode = f"CP-{interior}"
            owner_key = norm(owner)
            is_stone = "stone" in owner_key
            u = self.units.get(ucode)
            if not u:
                u = self.units[ucode] = {
                    "id": uid("unit", ucode), "code": ucode, "dev": "CP", "m2": Decimal(str(m2)), "name": "", "kind": "bodega",
                    "occupancy": "unknown", "client": client, "rent": None, "obs": None, "reference_only": False, "owner": None, "list_rent": None, "notes": None,
                }
            u["name"] = f"{DEV_NAME['CP']} · {desc}"
            u["kind"] = "bodega" if ("Bodega" in desc or "Cross" in desc) else "local"
            u["list_rent"] = money(price) if price else None
            u["owner"] = "stone" if is_stone else ("cib" if "cib" in owner_key else "gik")
            u["reference_only"] = not is_stone
            if client:
                u["notes"] = (u["notes"] + " · " if u["notes"] else "") + f"Cliente según Propiedades Playa: {str(client).strip()}"

    def new_lease(self, key, tenant, dev, m2, rent, mtto, end, comment, row, in_ubicacion):
        return {
            "id": uid("lease", *key), "code": f"{dev}-{tenant['key'][:18].replace(' ', '-')}" + (f"-{key[2]}" if len(key) > 2 else ""),
            "tenant": tenant, "dev": dev, "m2": m2, "rent": rent, "mtto": mtto, "end": end, "comment": comment, "row": row,
            "in_ubicacion": in_ubicacion, "in_portafolio": not in_ubicacion, "units": [],
        }

    def load_leases(self):
        ws = self.wb["Ubicacion de rentas"]
        total_rent = Decimal(0)
        for i, row in enumerate(ws.iter_rows(min_row=5, values_only=True), start=5):
            name, loc, m2, rent, mtto, end, comment = (list(row) + [None] * 8)[1:8]
            if not name or not loc:
                continue
            code, _, _ = dev_of(loc)
            t = self.tenant(name)
            key = (t["key"], code)
            rent = money(rent)
            total_rent += rent
            self.leases[key] = self.new_lease(key, t, code, Decimal(str(m2)) if m2 else None, rent, money(mtto) if mtto else None,
                                              cell_date(end), str(comment).strip() if comment else None, i, True)
        self.ubicacion_total = total_rent

        # Unidades rentadas del Portafolio → contrato existente o nuevo (por verificar)
        for u in self.units.values():
            if u["dev"] == "CP" or not u.get("client") or u["occupancy"] != "occupied":
                continue
            t = self.tenant(u["client"])
            key = (t["key"], u["dev"])
            l = self.leases.get(key)
            if l and l["units"] and u["rent"] != l["rent"]:
                key = (t["key"], u["dev"], u["code"])
                l = None
            if not l:
                l = self.leases[key] = self.new_lease(key, t, u["dev"], u["m2"], u["rent"], None, None, u["obs"], None, False)
                self.add_disc("contrato_solo_portafolio", "warning",
                              f"{t['display']} en {u['name']} ({u['rent']:,} MXN) aparece rentado en Portafolio pero no en 'Ubicacion de rentas'. Se creó el contrato como por verificar.",
                              sheet="Portafolio", target_type="lease", target_id=l["id"], actual=u["rent"])
            else:
                l["in_portafolio"] = True
                if u["rent"] is not None and u["rent"] != l["rent"]:
                    self.add_disc("renta_portafolio_vs_ubicacion", "warning",
                                  f"{t['display']} ({u['name']}): renta {l['rent']:,} en 'Ubicacion de rentas' y {u['rent']:,} en Portafolio.",
                                  sheet="Portafolio", expected=l["rent"], actual=u["rent"], target_type="lease", target_id=l["id"])
                if u["m2"] and l["m2"] and abs(u["m2"] - l["m2"]) > Decimal("0.01"):
                    self.add_disc("m2_portafolio_vs_ubicacion", "info",
                                  f"{t['display']} ({u['name']}): {l['m2']} m² en 'Ubicacion de rentas' y {u['m2']} m² en Portafolio. La unidad usa Portafolio; el contrato, Ubicacion.",
                                  sheet="Portafolio", expected=l["m2"], actual=u["m2"], target_type="lease", target_id=l["id"])
            l["units"].append(u)

        for pk, ucode in self.cfg["lease_unit_override"].items():
            tk, dev = pk.split("|")
            l = self.leases.get((tk, dev))
            if l and not l["units"] and ucode in self.units:
                l["units"].append(self.units[ucode])
                self.units[ucode]["occupancy"] = "occupied"

        for key, l in self.leases.items():
            tk, dev = key[0], key[1]
            if not l["units"]:
                self.add_disc("contrato_sin_unidad", "warning", f"{l['tenant']['display']} en {DEV_NAME[dev]}: no se pudo asociar una unidad del Portafolio.", sheet="Ubicacion de rentas", target_type="lease", target_id=l["id"])
            if l["in_ubicacion"] and l["end"] is None and not pair_key(self.cfg["lease_end_override"], tk, dev):
                self.add_disc("contrato_sin_vencimiento", "info", f"{l['tenant']['display']} ({DEV_NAME[dev]}): sin fecha de vencimiento capturada.", sheet="Ubicacion de rentas", cell=f"G{l['row']}", target_type="lease", target_id=l["id"])
            if l["end"] and l["end"] < self.today:
                self.add_disc("contrato_vencido_facturando", "warning", f"{l['tenant']['display']} ({DEV_NAME[dev]}): el contrato venció el {l['end']} y sigue facturando. ¿Renovado?", sheet="Ubicacion de rentas", cell=f"G{l['row']}", target_type="lease", target_id=l["id"])
            if l["comment"] and "hasta junio" in l["comment"].lower():
                self.add_disc("comentario_desactualizado", "info", f"{l['tenant']['display']}: el comentario dice que el mantenimiento se facturó hasta junio, pero hay facturas de mantenimiento posteriores.", sheet="Ubicacion de rentas", cell=f"H{l['row']}", target_type="lease", target_id=l["id"])

    # ------------------------------------------------------------ hechos
    def load_invoices(self):
        ws = self.wb["Facturacion"]
        for i, row in enumerate(ws.iter_rows(min_row=5, values_only=True), start=5):
            estado, folio, concept, mes, fdate, loc, client, facturado, _, pdate, pagado, _, pte = (list(row) + [None] * 16)[1:14]
            if not client or facturado in (None, 0, ""):
                continue
            code, dev_name, _ = dev_of(loc)
            t = self.tenant(client)
            concept_key = "rent" if str(concept).strip().lower().startswith("renta") else "maintenance"
            period = dt.date(self.period.year, int(mes), 1)
            total = money(facturado)
            sub, tax = split_iva(total)
            inv_date = cell_date(fdate)
            folio_s = str(int(folio)) if isinstance(folio, (int, float)) else (str(folio).strip() if folio else None)
            lease = self.leases.get((t["key"], code))
            if not lease:
                cands = [l for k, l in self.leases.items() if k[0] == t["key"] and k[1] == code]
                lease = cands[0] if cands else None
            cid = uid("charge", folio_s or f"row{i}")
            notes = []
            if inv_date and inv_date.year < period.year:
                self.add_disc("fecha_factura_anio", "warning", f"Factura {folio_s}: fecha de factura {inv_date} (año anterior) con MES {mes} y pago en {cell_date(pdate)}. Probable error de captura.", sheet="Facturacion", cell=f"F{i}", target_type="charge", target_id=cid)
            elif inv_date and inv_date.month != period.month:
                self.add_disc("mes_vs_fecha_factura", "info", f"Factura {folio_s}: MES {mes} pero fecha de factura {inv_date}. Se respeta MES como período.", sheet="Facturacion", cell=f"E{i}", target_type="charge", target_id=cid)
            if not folio_s:
                notes.append("Sin folio en el reporte")
                self.add_disc("sin_folio", "warning", f"Fila {i} de Facturacion ({t['display']}, {concept_key}, mes {mes}, {total:,}) no tiene folio.", sheet="Facturacion", cell=f"C{i}", target_type="charge", target_id=cid)
            if not lease:
                notes.append("Sin contrato asociado en Ubicacion de rentas/Portafolio")
                self.add_disc("cargo_sin_contrato", "warning", f"Factura {folio_s}: {t['display']} en {dev_name} no tiene contrato en los catálogos.", sheet="Facturacion", cell=f"H{i}", target_type="charge", target_id=cid)
            unit = lease["units"][0] if lease and lease["units"] else None
            ch = {
                "id": cid, "tenant": t, "lease": lease, "unit": unit, "dev": code, "concept": concept_key, "period": period,
                "folio": folio_s, "invoice_date": inv_date, "due": period, "sub": sub, "tax": tax, "total": total,
                "row": i, "estado": str(estado).strip().upper() if estado else None, "notes": "; ".join(notes) or None,
                "source_key": f"facturacion:{folio_s}" if folio_s else f"facturacion:row:{i}", "pte": money(pte or 0),
            }
            self.charges.append(ch)
            paid = money(pagado) if pagado not in (None, "", 0) else Decimal(0)
            pay_date = cell_date(pdate)
            if paid > 0:
                if not pay_date:
                    self.add_disc("pago_sin_fecha", "warning", f"Factura {folio_s}: pagado {paid:,} sin fecha de pago. Se usó la fecha de factura.", sheet="Facturacion", cell=f"K{i}", target_type="charge", target_id=cid)
                    pay_date = inv_date or period
                if paid > total + Decimal("0.005"):
                    self.add_disc("pago_mayor_que_factura", "danger", f"Factura {folio_s}: pagado {paid:,} mayor que facturado {total:,}. Se aplicó solo {total:,}; el resto queda sin aplicar.", sheet="Facturacion", cell=f"L{i}", expected=total, actual=paid, target_type="charge", target_id=cid)
                self.payments.append({"id": uid("payment", ch["source_key"]), "tenant": t, "date": pay_date, "amount": paid, "method": "transfer", "ref": None,
                                      "allocs": [(cid, min(paid, total))], "notes": f"Pago de la factura {folio_s or 'sin folio'} según Facturacion", "source_key": "pago:" + ch["source_key"]})
            if ch["estado"] == "PENDIENTE" and paid > 0:
                self.add_disc("estado_vs_pago", "warning", f"Factura {folio_s}: estado PENDIENTE pero con pago registrado.", sheet="Facturacion", cell=f"B{i}", target_type="charge", target_id=cid)
            if ch["estado"] == "PAGADA" and paid < total - Decimal("0.005"):
                self.add_disc("estado_vs_pago", "warning", f"Factura {folio_s}: estado PAGADA pero pagado {paid:,} < facturado {total:,}.", sheet="Facturacion", cell=f"B{i}", expected=total, actual=paid, target_type="charge", target_id=cid)

    def load_cash(self):
        """Cobros en efectivo sin factura: solo aparecen en las matrices mensuales."""
        for spec in self.cfg["cash_rows"]:
            ws = self.wb[spec["sheet"]]
            row = [r for r in ws.iter_rows(min_row=spec["row"], max_row=spec["row"], values_only=True)][0]
            t = self.tenant(row[1])
            lease = self.leases.get((t["key"], spec["dev"]))
            for m in range(1, 13):
                v = row[spec["first_col"] - 1 + m - 1]
                if not isinstance(v, (int, float)) or v == 0:
                    continue
                total = money(v)
                sub, tax = split_iva(total)
                period = dt.date(self.period.year, m, 1)
                key = f"{spec['sheet']}:{t['key']}:{m}:{spec['concept']}"
                cid = uid("charge", key)
                unit = lease["units"][0] if lease and lease["units"] else None
                self.charges.append({
                    "id": cid, "tenant": t, "lease": lease, "unit": unit, "dev": spec["dev"], "concept": spec["concept"], "period": period,
                    "folio": None, "invoice_date": period, "due": period, "sub": sub, "tax": tax, "total": total, "row": spec["row"],
                    "estado": "PAGADA", "notes": f"Cobro en efectivo sin factura; tomado de la hoja '{spec['sheet']}' (fecha de pago no registrada)",
                    "source_key": key, "pte": Decimal(0),
                })
                self.payments.append({"id": uid("payment", key), "tenant": t, "date": period, "amount": total, "method": "cash", "ref": None,
                                      "allocs": [(cid, total)], "notes": f"Efectivo según hoja '{spec['sheet']}', columna {MONTH_NAMES[m-1]}; fecha de pago no registrada", "source_key": "pago:" + key})

    def load_services(self):
        s = self.cfg["services"]
        ws = self.wb[s["sheet"]]
        for r in ws.iter_rows(min_row=s["rows"][0], max_row=s["rows"][1], values_only=True):
            label = r[s["label_col"]]
            if not label or label not in s["categories"]:
                continue
            for dev, col in s["dev_cols"].items():
                v = r[col]
                if not isinstance(v, (int, float)) or v == 0:
                    continue
                total = money(v)
                category = s["categories"][label]
                passthrough = dev == s["passthrough_dev"]
                e = {"id": uid("expense", self.cfg["report_period"], dev, label), "dev": dev, "category": category,
                     "vendor": s["vendors"].get(f"{dev}|{category}"), "period": self.period, "total": total,
                     "classification": "tenant_passthrough" if passthrough else "pending", "recoverable": passthrough,
                     "notes": f"Servicios de {MONTH_NAMES[self.period.month-1]} según '{s['sheet']}' ({label}, {DEV_NAME[dev]}). IVA no desglosado en el reporte.", "shares": []}
                if passthrough:
                    for sh in s["shares"]:
                        pct, factor = Decimal(sh["pct"]), Decimal(sh["factor"])
                        e["shares"].append((sh["tenant"], pct, factor, (total * pct / 100 * factor).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)))
                self.expenses.append(e)

    # ------------------------------------------------------------ conciliación contra Resumen
    def reconcile(self):
        ws = self.wb["Resumen"]
        self.summary = {"por_inmueble": {}}
        for i, row in enumerate(ws.iter_rows(min_row=6, max_row=12, values_only=True), start=6):
            code = dev_of(row[1])[0]
            r = {"pactado": money(row[6]), "pagado_mes": money(row[8] or 0), "pte_mes": money(row[9] or 0), "pte_anio": money(row[10] or 0)}
            alloc_by_charge = defaultdict(Decimal)
            for p in self.payments:
                for cid, amt in p["allocs"]:
                    alloc_by_charge[cid] += amt
            paid_month = sum((alloc_by_charge[c["id"]] for c in self.charges if c["dev"] == code and c["concept"] == "rent" and c["period"] == self.period), Decimal(0))
            pactado = sum((l["rent"] for l in self.leases.values() if l["dev"] == code and l["in_ubicacion"]), Decimal(0))
            pte_fact = sum((c["pte"] for c in self.charges if c["dev"] == code and c["concept"] == "rent"), Decimal(0))
            self.summary["por_inmueble"][code] = {"pagado_mes_recalculado": str(paid_month), "pagado_mes_resumen": str(r["pagado_mes"]), "pendiente_facturas_renta": str(pte_fact), "pte_anio_resumen": str(r["pte_anio"]), "pactado": str(pactado)}
            mes = MONTH_NAMES[self.period.month - 1]
            if abs(paid_month - r["pagado_mes"]) > Decimal("0.01"):
                self.add_disc("pagado_mes_no_cuadra", "danger", f"{DEV_NAME[code]}: pagado de {mes} recalculado desde Facturacion = {paid_month:,}; Resumen dice {r['pagado_mes']:,}.", sheet="Resumen", cell=f"I{i}", expected=r["pagado_mes"], actual=paid_month)
            pte_calc = pactado - paid_month
            if abs(pte_calc - r["pte_mes"]) > Decimal("0.01"):
                self.add_disc("pendiente_mes_no_cuadra", "warning", f"{DEV_NAME[code]}: pendiente de {mes} = pactado {pactado:,} − pagado {paid_month:,} = {pte_calc:,}; Resumen dice {r['pte_mes']:,}.", sheet="Resumen", cell=f"J{i}", expected=r["pte_mes"], actual=pte_calc)
            if abs(pte_fact - r["pte_anio"]) > Decimal("0.01"):
                self.add_disc("pendiente_anio_vs_facturas", "warning", f"{DEV_NAME[code]}: facturas de renta pendientes suman {pte_fact:,}; 'Pte de pago' anual en Resumen es {r['pte_anio']:,} (pactado × meses − pagado, con ajustes manuales).", sheet="Resumen", cell=f"K{i}", expected=r["pte_anio"], actual=pte_fact)
        for d in self.cfg["manual_discrepancies"]:
            self.add_disc(d["kind"], d["severity"], d["description"], sheet=d.get("sheet"), cell=d.get("cell"),
                          expected=money(d["expected"]) if d.get("expected") else None, actual=money(d["actual"]) if d.get("actual") else None)
        pf_total = money(self.cfg["portfolio_total"])
        if abs(pf_total - self.ubicacion_total) > Decimal("0.01"):
            self.add_disc("total_portafolio_vs_ubicacion", "info", f"Renta mensual registrada en Portafolio ({pf_total:,}) difiere del total de 'Ubicacion de rentas' ({self.ubicacion_total:,}).", sheet="Portafolio", cell="G5", expected=self.ubicacion_total, actual=pf_total)
        self.summary.update({
            "cargos": len(self.charges), "pagos": len(self.payments), "contratos": len(self.leases), "arrendatarios": len(self.tenants),
            "unidades": len(self.units), "gastos": len(self.expenses), "discrepancias": len(self.disc),
            "facturado_total": str(sum(c["total"] for c in self.charges)), "pagado_total": str(sum(p["amount"] for p in self.payments)),
            "pendiente_total": str(sum(c["pte"] for c in self.charges)),
        })

    # ------------------------------------------------------------ JSON + cargador
    def payload(self) -> dict:
        cfg = self.cfg
        d = lambda x: x.isoformat() if isinstance(x, (dt.date, dt.datetime)) else x
        n = lambda x: None if x is None else str(x)
        leases = []
        for key, l in self.leases.items():
            tk, dev = key[0], key[1]
            start = pair_key(cfg["lease_start"], tk, dev)
            end = pair_key(cfg["lease_end_override"], tk, dev) or (l["end"].isoformat() if l["end"] else None)
            status = "expired" if (end and pair_key(cfg["lease_end_override"], tk, dev) and dt.date.fromisoformat(end) < self.today) else "active"
            notes = [x for x in [l["comment"], None if start else "Fecha de inicio no capturada en el reporte; condición vigente desde el 1 de enero"] if x]
            hist = self.rent_history.get((tk, dev)) or [[f"{self.period.year}-01-01", str(l["rent"])]]
            terms = []
            for idx, (frm, amount) in enumerate(hist):
                to = (dt.date.fromisoformat(hist[idx + 1][0]) - dt.timedelta(days=1)).isoformat() if idx + 1 < len(hist) else (end if status == "expired" else None)
                tnotes = []
                if len(hist) > 1:
                    tnotes.append("Historial reconstruido de las fórmulas de la matriz mensual")
                if tk in cfg["variable_rent"]:
                    tnotes.append(cfg["variable_rent"][tk])
                if l["tenant"]["pays_cash"]:
                    tnotes.append("Mantenimiento variable, en efectivo")
                terms.append([frm, to, str(money(amount)), "; ".join(tnotes) or None])
            leases.append([l["code"], tk, dev, status, start, end, n(l["m2"]), "; ".join(notes) or None, [u["code"] for u in l["units"]], terms])
        tenant_idx = {k: i for i, k in enumerate(self.tenants)}
        lease_idx = {l["code"]: i for i, l in enumerate(self.leases.values())}
        charges = []
        pay_by_charge = {}
        for pmt in self.payments:
            for cid, amt in pmt["allocs"]:
                pay_by_charge[cid] = pmt
        for c in self.charges:
            pm = pay_by_charge.get(c["id"])
            charges.append([c["source_key"], c["folio"], tenant_idx[c["tenant"]["key"]], lease_idx[c["lease"]["code"]] if c["lease"] else None,
                            c["unit"]["code"] if c["unit"] else None, c["dev"], "r" if c["concept"] == "rent" else "m", d(c["period"]), d(c["invoice_date"]),
                            str(c["total"]), c["notes"], d(pm["date"]) if pm else None, str(pm["amount"]) if pm else None, (pm["method"][0] if pm else None)])
        key_of = {}
        for l in self.leases.values():
            key_of[("lease", l["id"])] = l["code"]
        for c in self.charges:
            key_of[("charge", c["id"])] = c["source_key"]
        return {
            "batch": {"file_name": self.report_name + " + " + self.portfolio_name, "sha": self.sha, "period": d(self.period),
                      "sheets": ["Facturacion", "Ubicacion de rentas", "Propiedades Playa", "CXC Mensual", "2026 Renta", "2026 Mtto", "Resumen", "Portafolio"], "summary": self.summary},
            "entities": [["stone", "Stone Inmuebles", True], ["cib", "CIB Inmuebles", False], ["gik", "GIK Capital", False]],
            "developments": [[code, name, order, code == "CP"] for code, name, order in sorted(set(DEV.values()), key=lambda x: x[2])],
            "units": [[u["code"], u["dev"], u["name"], u["kind"], u["reference_only"], u["owner"], u["occupancy"], n(u["list_rent"]), n(u["m2"]), u["notes"]] for u in self.units.values()],
            "tenants": [[t["key"], t["display"], t["kind"], t["pays_cash"], sorted(t["aliases"])] for t in self.tenants.values()],
            "leases": leases,
            "charges": charges,
            "expenses": [[e["id"], e["dev"], e["category"], e["vendor"], d(e["period"]), str(e["total"]), e["classification"], e["recoverable"], e["notes"],
                          [[tk, str(pct), str(factor), str(amount)] for tk, pct, factor, amount in e["shares"]]] for e in self.expenses],
            "discrepancies": [[x["kind"], x["severity"], x["sheet"], x["cell"], x["description"], n(x["expected"]), n(x["actual"]), x["target_type"],
                               key_of.get((x["target_type"], x["target_id"]))] for x in self.disc],
        }

    def write(self, out_path, loader_path):
        body = open(loader_path).read()
        payload = json.dumps(self.payload(), ensure_ascii=False, separators=(",", ":"))
        assert "$payload$" not in payload
        sql = "-- Generado por scripts/import_excel.py. Contiene datos reales: no versionar.\n"
        sql += "do $$\ndeclare\n  p jsonb := $payload$" + payload + "$payload$::jsonb;\n" + body.split("declare", 1)[1] + "$$;\n"
        with open(out_path, "w") as f:
            f.write(sql)
        self.sql = [sql]


def main():
    if len(sys.argv) != 5:
        print(__doc__)
        sys.exit(2)
    cfg = json.load(open(sys.argv[1]))
    loader = __file__.rsplit("/", 2)[0] + "/supabase/import/loader.plpgsql"
    imp = Importer(cfg, sys.argv[2], sys.argv[3])
    imp.load_portfolio()
    imp.load_playa()
    imp.load_leases()
    imp.load_invoices()
    imp.load_cash()
    imp.load_services()
    imp.reconcile()
    imp.write(sys.argv[4], loader)
    print(json.dumps(imp.summary, indent=2, ensure_ascii=False))
    print(f"{len(imp.sql[0])} bytes · {len(imp.disc)} discrepancias → {sys.argv[4]}")
    by_kind = defaultdict(int)
    for d in imp.disc:
        by_kind[f"{d['severity']}:{d['kind']}"] += 1
    for k, v in sorted(by_kind.items()):
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
