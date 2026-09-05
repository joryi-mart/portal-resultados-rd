"""
Guardar resultado de MegaLotto (Loteka) - La BankeraRD
================================================================================
loteriasdominicanas.us (la fuente principal) dejo de ofrecer este producto por
completo (ya no aparece ni como tarjeta). Se saca de losnumeros.com.do, la
misma fuente que ya usamos para los extras de Loteria Real y Anguila.
MegaLotto juega 6 numeros del 01 al 49, sorteando lunes y jueves.
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

URL_MEGALOTTO = "https://losnumeros.com.do/loteka/megalotto/"
SORTEO_ID_MEGALOTTO = 71


def hoy_rd():
    # Republica Dominicana esta siempre en UTC-4 (no usa horario de verano).
    return (datetime.now(timezone.utc) - timedelta(hours=4)).strftime("%Y-%m-%d")


def extraer_resultado(html):
    """MegaLotto juega 6 numeros; en la pagina, justo despues salen numeros
    de otro bloque (con otro estilo) que no nos interesan, por eso limitamos
    a los primeros 6."""
    idx = html.find("Numbers Area")
    if idx < 0:
        return None
    bloque = html[idx : idx + 3000]

    numeros = re.findall(r'font-black[^>]*>([^<]{1,10})</span>', bloque)
    numeros = [n.strip() for n in numeros if n.strip()][:6]
    if len(numeros) != 6:
        return None

    m_fecha = re.search(
        r'<span>(?:📅\s*)?(Hoy|Ayer)</span><span class="font-normal opacity-85">[^,]*,\s*(\d{2})-(\d{2})-(\d{4})</span>',
        bloque,
    )
    if not m_fecha:
        return None

    etiqueta_fecha, dia, mes, anio = m_fecha.groups()
    fecha_real = f"{anio}-{mes}-{dia}"

    return {"numeros": numeros, "etiqueta_fecha": etiqueta_fecha, "fecha": fecha_real}


def guardar_en_supabase(fecha, numeros):
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
    }
    numeros_texto = "-".join(numeros)

    url_check = (
        f"{SUPABASE_URL}/rest/v1/resultados"
        f"?sorteo_id=eq.{SORTEO_ID_MEGALOTTO}&fecha=eq.{fecha}&select=id"
    )
    resp = requests.get(url_check, headers=headers, timeout=15)
    resp.raise_for_status()
    existentes = resp.json()

    payload = {
        "sorteo_id": SORTEO_ID_MEGALOTTO,
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

    try:
        resp = requests.get(URL_MEGALOTTO, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        resultado = extraer_resultado(resp.text)
        if not resultado:
            print("  ⚠️ No se pudo leer el resultado de MegaLotto")
        elif resultado["fecha"] != hoy:
            print(f"  ⏳ MegaLotto: todavia muestra el resultado del {resultado['fecha']}, no de hoy ({hoy})")
        else:
            accion = guardar_en_supabase(resultado["fecha"], resultado["numeros"])
            print(f"  ✅ MegaLotto: {resultado['numeros']} ({accion})")
    except Exception as e:
        print(f"  ❌ Error con MegaLotto: {e}")


if __name__ == "__main__":
    main()
