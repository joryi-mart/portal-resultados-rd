"""
Guardar resultados de PowerBall y Mega Millions - La BankeraRD
================================================================================
Estos dos sorteos habian sido ocultados porque loteriasdominicanas.us (la
fuente principal) dejo de ofrecerlos. Se reactivan usando las paginas
OFICIALES de cada loteria como fuente:
  - PowerBall: powerball.com (los numeros vienen en texto plano en el HTML)
  - Mega Millions: megamillions.com (tiene un endpoint que responde en JSON)
"""

import os
import re
import json
from datetime import datetime, timedelta, timezone
import requests

SUPABASE_URL = os.environ.get("SUPABASE_URL", "PEGA_AQUI_TU_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "PEGA_AQUI_TU_SERVICE_ROLE_KEY")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    )
}

MESES = {
    "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06",
    "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12",
}


def hoy_rd():
    # Republica Dominicana esta siempre en UTC-4 (no usa horario de verano).
    return (datetime.now(timezone.utc) - timedelta(hours=4)).strftime("%Y-%m-%d")


def obtener_powerball(hoy):
    url = f"https://www.powerball.com/draw-result?gc=powerball&date={hoy}"
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    html = resp.text

    m_fecha = re.search(r'title-date">(\w+), (\w+) (\d{1,2}), (\d{4})', html)
    if not m_fecha:
        return None
    mes = MESES.get(m_fecha.group(2))
    if not mes:
        return None
    fecha = f"{m_fecha.group(4)}-{mes}-{int(m_fecha.group(3)):02d}"

    idx = html.find("game-ball-group")
    if idx < 0:
        return None
    bloque = html[idx: idx + 1500]
    blancas = re.findall(r'white-balls item-powerball">\s*<div>\s*(\d+)\s*</div>', bloque)
    roja = re.search(r'col powerball item-powerball">\s*<div>\s*(\d+)\s*</div>', bloque)
    if len(blancas) != 5 or not roja:
        return None

    return {"fecha": fecha, "numeros": [n.zfill(2) for n in blancas] + [roja.group(1).zfill(2)]}


def obtener_mega_millions(hoy):
    url = "https://www.megamillions.com/cmspages/utilservice.asmx/GetLatestDrawData"
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    # El endpoint devuelve un XML <string> con un JSON adentro como texto.
    m = re.search(r'<string[^>]*>(.*)</string>', resp.text, re.S)
    if not m:
        return None
    datos = json.loads(m.group(1))
    sorteo = datos.get("Drawing")
    if not sorteo:
        return None

    fecha_completa = sorteo.get("PlayDate", "")
    fecha = fecha_completa.split("T")[0]
    numeros = [sorteo.get(f"N{i}") for i in range(1, 6)]
    mega = sorteo.get("MBall")
    if not fecha or any(n is None for n in numeros) or mega is None:
        return None

    return {"fecha": fecha, "numeros": [str(n).zfill(2) for n in numeros] + [str(mega).zfill(2)]}


def guardar_en_supabase(sorteo_id, fecha, numeros, fuente):
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
    }
    numeros_texto = "-".join(numeros)

    url_check = (
        f"{SUPABASE_URL}/rest/v1/resultados"
        f"?sorteo_id=eq.{sorteo_id}&fecha=eq.{fecha}&select=id"
    )
    resp = requests.get(url_check, headers=headers, timeout=15)
    resp.raise_for_status()
    existentes = resp.json()

    payload = {"sorteo_id": sorteo_id, "fecha": fecha, "numeros": numeros_texto, "fuente": fuente}

    if existentes:
        id_existente = existentes[0]["id"]
        r = requests.patch(
            f"{SUPABASE_URL}/rest/v1/resultados?id=eq.{id_existente}",
            headers=headers, json=payload, timeout=15,
        )
        r.raise_for_status()
        return "actualizado"
    else:
        r = requests.post(
            f"{SUPABASE_URL}/rest/v1/resultados",
            headers=headers, json=payload, timeout=15,
        )
        r.raise_for_status()
        return "insertado"


def main():
    if "PEGA_AQUI" in SUPABASE_URL or "PEGA_AQUI" in SUPABASE_SERVICE_KEY:
        print("Falta configurar SUPABASE_URL y SUPABASE_SERVICE_KEY.")
        return

    hoy = hoy_rd()
    print(f"Hoy (RD): {hoy}\n")

    try:
        r = obtener_powerball(hoy)
        if not r:
            print("  ⚠️ No se pudo leer PowerBall")
        elif r["fecha"] != hoy:
            print(f"  ⏳ PowerBall: el ultimo sorteo es del {r['fecha']}, no de hoy")
        else:
            accion = guardar_en_supabase(112, r["fecha"], r["numeros"], "powerball.com")
            print(f"  ✅ PowerBall: {r['numeros']} ({accion})")
    except Exception as e:
        print(f"  ❌ Error con PowerBall: {e}")

    try:
        r = obtener_mega_millions(hoy)
        if not r:
            print("  ⚠️ No se pudo leer Mega Millions")
        elif r["fecha"] != hoy:
            print(f"  ⏳ Mega Millions: el ultimo sorteo es del {r['fecha']}, no de hoy")
        else:
            accion = guardar_en_supabase(117, r["fecha"], r["numeros"], "megamillions.com")
            print(f"  ✅ Mega Millions: {r['numeros']} ({accion})")
    except Exception as e:
        print(f"  ❌ Error con Mega Millions: {e}")


if __name__ == "__main__":
    main()
