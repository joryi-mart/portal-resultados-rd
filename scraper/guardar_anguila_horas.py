"""
Guardar los sorteos de cada hora de Anguila - La BankeraRD
================================================================================
Anguila sortea cada hora, de 8:00 AM a 10:00 PM (15 sorteos al dia). Durante
septiembre y octubre de 2026 solo guardabamos 4 (10 AM, 1 PM, 6 PM y 9 PM),
pero en Google Trends crecen "anguila de la 8", "de la 4", "de la 5", "de la
11"... (+30% a +200%). Este script guarda los otros 11 desde enloteria.com, que
publica los 15 con datos estructurados (JSON-LD) faciles de leer.

Los 4 de siempre (ids 116, 126, 127, 128) los siguen guardando
guardar_resultados_v3.py y guardar_anguila_extra.py: aqui no se tocan.

Uso:
  python scraper/guardar_anguila_horas.py            -> resultados de hoy
  python scraper/guardar_anguila_horas.py --dias 30  -> ademas, los ultimos 30 dias
"""

import json
import os
import re
import sys
import time
from datetime import datetime, timedelta, timezone

import requests

SUPABASE_URL = os.environ.get("SUPABASE_URL", "PEGA_AQUI_TU_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "PEGA_AQUI_TU_SERVICE_ROLE_KEY")

LOTERIA_ANGUILA = 20
SORTEOS_DE_OTROS_SCRIPTS = {116, 126, 127, 128}
URL_HOY = "https://enloteria.com/resultados-anguilla"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    )
}


def hoy_rd():
    # Republica Dominicana esta siempre en UTC-4 (no usa horario de verano).
    return (datetime.now(timezone.utc) - timedelta(hours=4)).strftime("%Y-%m-%d")


def cabeceras_supabase():
    return {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
    }


def sorteos_por_hora():
    """{"16:00": sorteo_id} con los sorteos de Anguila que guarda este script."""
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/sorteos?loteria_id=eq.{LOTERIA_ANGUILA}&select=id,hora_sorteo",
        headers=cabeceras_supabase(), timeout=15,
    )
    r.raise_for_status()
    return {
        s["hora_sorteo"][:5]: s["id"]
        for s in r.json()
        if s["id"] not in SORTEOS_DE_OTROS_SCRIPTS and s.get("hora_sorteo")
    }


def eventos_de_la_pagina(html):
    """Los sorteos que trae la pagina en su JSON-LD: [(fecha, "16:00", [n1, n2, n3])]."""
    salida = []
    for bloque in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        try:
            datos = json.loads(bloque)
        except ValueError:
            continue
        pendientes = [datos]
        while pendientes:
            nodo = pendientes.pop()
            if isinstance(nodo, list):
                pendientes.extend(nodo)
                continue
            if not isinstance(nodo, dict):
                continue
            pendientes.extend(v for v in nodo.values() if isinstance(v, (list, dict)))
            if nodo.get("@type") != "Event" or "anguilla" not in str(nodo.get("name", "")).lower():
                continue
            inicio = str(nodo.get("startDate", ""))
            m = re.match(r"(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})", inicio)
            if not m:
                continue
            premios = {}
            for p in nodo.get("additionalProperty") or []:
                nombre = str(p.get("name", ""))
                if "Premio" in nombre:
                    premios[nombre] = str(p.get("value", "")).strip()
            numeros = [premios.get(k) for k in ("Primer Premio", "Segundo Premio", "Tercer Premio")]
            if all(n and re.fullmatch(r"\d{1,2}", n) for n in numeros):
                salida.append((m.group(1), m.group(2), [n.zfill(2) for n in numeros]))
    return salida


def guardar(sorteo_id, fecha, numeros):
    numeros_texto = "-".join(numeros)
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/resultados?sorteo_id=eq.{sorteo_id}&fecha=eq.{fecha}&select=id,numeros",
        headers=cabeceras_supabase(), timeout=15,
    )
    r.raise_for_status()
    existentes = r.json()
    payload = {"sorteo_id": sorteo_id, "fecha": fecha, "numeros": numeros_texto, "fuente": "enloteria-jsonld"}
    if existentes:
        if existentes[0]["numeros"] == numeros_texto:
            return "sin cambios"
        r = requests.patch(
            f"{SUPABASE_URL}/rest/v1/resultados?id=eq.{existentes[0]['id']}",
            headers=cabeceras_supabase(), json=payload, timeout=15,
        )
        r.raise_for_status()
        return "actualizado"
    r = requests.post(f"{SUPABASE_URL}/rest/v1/resultados", headers=cabeceras_supabase(), json=payload, timeout=15)
    r.raise_for_status()
    return "insertado"


def etiqueta_url(hora):
    """"16:00" -> "4pm", como en enloteria.com/resultados-anguilla-4pm-AAAA-MM-DD."""
    h = int(hora[:2])
    return f"{h % 12 or 12}{'am' if h < 12 else 'pm'}"


def main():
    if "PEGA_AQUI" in SUPABASE_URL or "PEGA_AQUI" in SUPABASE_SERVICE_KEY:
        print("Falta configurar SUPABASE_URL y SUPABASE_SERVICE_KEY.")
        return

    dias = 0
    if "--dias" in sys.argv:
        dias = int(sys.argv[sys.argv.index("--dias") + 1])

    por_hora = sorteos_por_hora()
    if not por_hora:
        print("No hay sorteos nuevos de Anguila en la base de datos (faltan los 11 de cada hora).")
        return
    hoy = hoy_rd()
    print(f"Hoy (RD): {hoy} | sorteos de este script: {len(por_hora)}\n")

    # 1) Hoy: una sola pagina trae los 15 sorteos.
    try:
        resp = requests.get(URL_HOY, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        for fecha, hora, numeros in eventos_de_la_pagina(resp.text):
            if fecha != hoy or hora not in por_hora:
                continue
            print(f"  ✅ {hora} -> sorteo {por_hora[hora]}: {numeros} ({guardar(por_hora[hora], fecha, numeros)})")
    except Exception as e:
        print(f"  ❌ Error con {URL_HOY}: {e}")

    # 2) Historial (solo si se pide con --dias): una pagina por sorteo y fecha.
    for d in range(1, dias + 1):
        fecha = (datetime.strptime(hoy, "%Y-%m-%d") - timedelta(days=d)).strftime("%Y-%m-%d")
        for hora, sorteo_id in sorted(por_hora.items()):
            url = f"https://enloteria.com/resultados-anguilla-{etiqueta_url(hora)}-{fecha}"
            try:
                resp = requests.get(url, headers=HEADERS, timeout=30)
                if resp.status_code != 200:
                    print(f"  ⚠️ {url}: {resp.status_code}")
                    continue
                encontrado = [e for e in eventos_de_la_pagina(resp.text) if e[0] == fecha and e[1] == hora]
                if not encontrado:
                    print(f"  ⚠️ {fecha} {hora}: sin resultado en la pagina")
                    continue
                print(f"  ✅ {fecha} {hora}: {encontrado[0][2]} ({guardar(sorteo_id, fecha, encontrado[0][2])})")
            except Exception as e:
                print(f"  ❌ Error con {url}: {e}")
            time.sleep(1)  # sin apurar a la pagina de origen


if __name__ == "__main__":
    main()
