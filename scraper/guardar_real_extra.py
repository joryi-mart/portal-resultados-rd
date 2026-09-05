"""
Guardar resultados extra de Loteria Real (Super Pale, Chance Real, Repartidera
Real, Nueva Yol Real, Loto Pool Noche) - La BankeraRD
================================================================================
loteriasdominicanas.us (la fuente principal) no ofrece estos 5 productos de
Loteria Real. Los usuarios pidieron tenerlos completos, y se confirmo que
losnumeros.com.do si los publica, en HTML normal (sin JavaScript), con una
etiqueta de fecha ("Hoy" / "Ayer") junto a cada resultado.
"""

import os
import re
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

# (url de losnumeros.com.do, sorteo_id correspondiente en nuestra base de datos)
PAGINAS = [
    ("https://losnumeros.com.do/loto-real/super-pale/", 143),
    ("https://losnumeros.com.do/loto-real/chance-real/", 144),
    ("https://losnumeros.com.do/loto-real/repartidera-real/", 145),
    ("https://losnumeros.com.do/loto-real/nueva-yol-real/", 146),
    ("https://losnumeros.com.do/loto-real/loto-pool-noche/", 147),
]


def hoy_rd():
    # Republica Dominicana esta siempre en UTC-4 (no usa horario de verano).
    return (datetime.now(timezone.utc) - timedelta(hours=4)).strftime("%Y-%m-%d")


def extraer_resultado(html):
    """Busca el primer bloque de bolitas (numeros) y la etiqueta de fecha que
    lo acompana (Hoy / Ayer / etc). Solo nos interesan los resultados de hoy."""
    idx = html.find("Numbers Area")
    if idx < 0:
        return None
    bloque = html[idx : idx + 3000]

    numeros = re.findall(r'font-black[^>]*>([^<]{1,10})</span>', bloque)
    numeros = [n.strip() for n in numeros if n.strip()]
    if not numeros:
        return None

    m_fecha = re.search(r"<span>(Hoy|Ayer)</span>", bloque)
    etiqueta_fecha = m_fecha.group(1) if m_fecha else ""

    return {"numeros": numeros, "etiqueta_fecha": etiqueta_fecha}


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
        "fuente": "losnumeros-html",
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
            if resultado["etiqueta_fecha"].lower() != "hoy":
                print(f"  ⏳ {url}: todavia muestra '{resultado['etiqueta_fecha']}', no es de hoy")
                continue
            accion = guardar_en_supabase(sorteo_id, hoy, resultado["numeros"])
            print(f"  ✅ sorteo_id {sorteo_id}: {resultado['numeros']} ({accion})")
        except Exception as e:
            print(f"  ❌ Error con {url}: {e}")


if __name__ == "__main__":
    main()
