"""
Guardar resultados de loterias americanas (New Jersey, Georgia) - La BankeraRD
================================================================================
loteriasdominicanas.us (la fuente principal) tiene enlaces a estas loterias
pero las paginas muestran "no disponible" - no ofrece datos reales de New
Jersey ni Georgia. Por eso usamos enloteria.com como fuente para estas 5
loterias en especifico, que si tiene datos reales y actualizados en un
bloque de datos estructurados (JSON-LD / schema.org) dentro de cada pagina.
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

# (url de enloteria.com, sorteo_id correspondiente en nuestra base de datos)
PAGINAS = [
    ("https://enloteria.com/resultados-new-jersey-tarde", 138),
    ("https://enloteria.com/resultados-new-jersey-noche", 139),
    ("https://enloteria.com/resultados-georgia-dia", 140),
    ("https://enloteria.com/resultados-georgia-tarde", 141),
    ("https://enloteria.com/resultados-georgia-noche", 142),
]


def hoy_rd():
    # Republica Dominicana esta siempre en UTC-4 (no usa horario de verano).
    return (datetime.now(timezone.utc) - timedelta(hours=4)).strftime("%Y-%m-%d")


def extraer_resultado(html):
    """Busca el bloque JSON-LD con additionalProperty (Primer/Segundo/Tercer Premio)."""
    match = re.search(r'"additionalProperty":(\[[^\]]*\])', html)
    if not match:
        return None
    try:
        propiedades = json.loads(match.group(1))
    except Exception:
        return None

    valores = {p.get("name"): p.get("value") for p in propiedades if p.get("name")}
    numeros = [
        valores.get("Primer Premio"),
        valores.get("Segundo Premio"),
        valores.get("Tercer Premio"),
    ]
    numeros = [n for n in numeros if n]
    fecha = valores.get("Fecha del Sorteo")
    if not numeros or not fecha:
        return None
    return {"numeros": numeros, "fecha": fecha}


def guardar_en_supabase(sorteo_id, fecha, numeros):
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

    payload = {
        "sorteo_id": sorteo_id,
        "fecha": fecha,
        "numeros": numeros_texto,
        "fuente": "enloteria-html",
    }

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

    for url, sorteo_id in PAGINAS:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=30)
            resp.raise_for_status()
            resultado = extraer_resultado(resp.text)
            if not resultado:
                print(f"  ⚠️ No se pudo leer el resultado de {url}")
                continue
            if resultado["fecha"] != hoy:
                print(f"  ⏳ {url}: aun tiene el resultado de {resultado['fecha']}, no de hoy")
                continue
            accion = guardar_en_supabase(sorteo_id, resultado["fecha"], resultado["numeros"])
            print(f"  ✅ sorteo_id {sorteo_id}: {resultado['numeros']} ({accion})")
        except Exception as e:
            print(f"  ❌ Error con {url}: {e}")


if __name__ == "__main__":
    main()
