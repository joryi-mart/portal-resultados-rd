"""
Guardar resultados de Anguila 10:00 AM y Anguila Noche - La BankeraRD
================================================================================
El horario oficial de Anguila Lottery es de 4 sorteos diarios: 10:00 AM,
1:00 PM, 6:00 PM y 9:00 PM. loteriasdominicanas.us (la fuente principal) cubre
bien el de 1pm y 6pm (Mediodia/Tarde), pero el de las 10:00 AM nunca lo tuvo y
el de las 9:00 PM (Noche) se quedo trabado varios dias sin actualizar. Ambos
se sacan de losnumeros.com.do en su lugar.
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
    ("https://losnumeros.com.do/anguilla/anguila-10-am/", 116),
    ("https://losnumeros.com.do/anguilla/anguila-9-pm/", 128),
]


def hoy_rd():
    # Republica Dominicana esta siempre en UTC-4 (no usa horario de verano).
    return (datetime.now(timezone.utc) - timedelta(hours=4)).strftime("%Y-%m-%d")


def extraer_resultado(html):
    """Busca el bloque de bolitas (numeros) y la etiqueta Hoy/Ayer con fecha
    exacta que trae esta pagina (formato dd-mm-aaaa)."""
    idx = html.find("Numbers Area")
    if idx < 0:
        return None
    bloque = html[idx : idx + 3500]

    numeros = re.findall(r'font-black[^>]*>([^<]{1,10})</span>', bloque)
    numeros = [n.strip() for n in numeros if n.strip()]
    if not numeros:
        return None

    m_fecha = re.search(
        r'<span>(?:📅\s*)?(Hoy|Ayer)</span><span class="font-normal opacity-85">[^,]*,\s*(\d{2})-(\d{2})-(\d{4})</span>',
        bloque,
    )
    if not m_fecha:
        return None

    etiqueta, dia, mes, anio = m_fecha.groups()
    fecha = f"{anio}-{mes}-{dia}"
    return {"numeros": numeros, "etiqueta": etiqueta, "fecha": fecha}


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
            if resultado["fecha"] != hoy:
                print(f"  ⏳ {url}: todavia muestra el resultado del {resultado['fecha']}, no de hoy")
                continue
            accion = guardar_en_supabase(sorteo_id, hoy, resultado["numeros"])
            print(f"  ✅ sorteo_id {sorteo_id}: {resultado['numeros']} ({accion})")
        except Exception as e:
            print(f"  ❌ Error con {url}: {e}")


if __name__ == "__main__":
    main()
