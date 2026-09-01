"""
Scraper de resultados de loteriasdominicanas.com para La Bankera RD.

IMPORTANTE - ANTES DE USARLO:
Este script todavía tiene selectores CSS de EJEMPLO, marcados con "# AJUSTAR SELECTOR".
Hay que reemplazarlos por los selectores reales del sitio (ver instrucciones en el
mensaje del chat: Inspeccionar elemento -> Copy outerHTML -> pegarlo en el chat).

Corre cada vez que se ejecuta (pensado para correr cada 30 min vía GitHub Actions).
Guarda los resultados directo en Supabase, en las mismas tablas que ya usa el sitio
(loterias, sorteos, resultados).
"""

import os
import re
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

HEADERS_SUPABASE = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates",
}

HEADERS_NAVEGADOR = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
}

# Mapeo: slug que usamos nosotros en Supabase -> slug/URL de loteriasdominicanas.com
LOTERIAS = {
    "nacional": "loteria-nacional",
    "leidsa": "leidsa",
    "loteka": "loteka",
    "real": "loto-real",
    "lotedom": "lotedom",
    "la-primera": "la-primera",
    "la-suerte": "la-suerte-dominicana",
}

BASE_URL = "https://loteriasdominicanas.com/"


def obtener_fecha_hoy():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def limpiar_texto(texto):
    return re.sub(r"\s+", " ", texto or "").strip()


def extraer_resultados(html, slug_sitio):
    """
    Extrae los resultados de la página de una lotería.

    # AJUSTAR SELECTOR: reemplazar estos selectores por los reales del sitio.
    Los de abajo son un punto de partida razonable basado en patrones comunes
    de sitios de resultados, pero necesitan confirmarse contra el HTML real.
    """
    soup = BeautifulSoup(html, "html.parser")
    resultados = []

    # AJUSTAR SELECTOR: contenedor de cada sorteo/juego en la página
    bloques_sorteo = soup.select(".game-item, .lottery-result, .result-card")

    for bloque in bloques_sorteo:
        # AJUSTAR SELECTOR: nombre del sorteo (ej. "Quiniela Leidsa")
        nombre_el = bloque.select_one(".game-name, .result-title, h3")
        nombre_sorteo = limpiar_texto(nombre_el.get_text()) if nombre_el else None

        # AJUSTAR SELECTOR: cada bolita/número individual dentro del sorteo
        numeros_el = bloque.select(".number, .ball, .result-number")
        numeros = [limpiar_texto(n.get_text()) for n in numeros_el if limpiar_texto(n.get_text())]

        if nombre_sorteo and numeros:
            resultados.append({
                "nombre_sorteo": nombre_sorteo,
                "numeros": "-".join(numeros),
            })

    return resultados


def obtener_id_loteria(slug):
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/loterias?slug=eq.{slug}&select=id",
        headers=HEADERS_SUPABASE,
    )
    resp.raise_for_status()
    data = resp.json()
    return data[0]["id"] if data else None


def obtener_id_sorteo(loteria_id, nombre_sorteo):
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/sorteos?loteria_id=eq.{loteria_id}&nombre=eq.{nombre_sorteo}&select=id",
        headers=HEADERS_SUPABASE,
    )
    resp.raise_for_status()
    data = resp.json()
    return data[0]["id"] if data else None


def guardar_resultado(sorteo_id, numeros, fecha):
    payload = {
        "sorteo_id": sorteo_id,
        "numeros": numeros,
        "fecha": fecha,
    }
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/resultados?on_conflict=sorteo_id,fecha",
        headers=HEADERS_SUPABASE,
        json=payload,
    )
    if not resp.ok:
        print(f"  ⚠ Error guardando resultado: {resp.status_code} {resp.text}")
    else:
        print(f"  ✓ Guardado")


def procesar_loteria(slug_nuestro, slug_sitio):
    print(f"\n--- {slug_nuestro} ({slug_sitio}) ---")

    try:
        resp = requests.get(BASE_URL + slug_sitio + "/", headers=HEADERS_NAVEGADOR, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        print(f"  ✗ No se pudo descargar la página: {e}")
        return

    resultados = extraer_resultados(resp.text, slug_sitio)

    if not resultados:
        print("  ⚠ No se encontró ningún resultado — revisar selectores CSS (# AJUSTAR SELECTOR)")
        return

    loteria_id = obtener_id_loteria(slug_nuestro)
    if not loteria_id:
        print(f"  ✗ No existe la lotería '{slug_nuestro}' en Supabase")
        return

    fecha_hoy = obtener_fecha_hoy()

    for r in resultados:
        sorteo_id = obtener_id_sorteo(loteria_id, r["nombre_sorteo"])
        if not sorteo_id:
            print(f"  ⚠ Sorteo '{r['nombre_sorteo']}' no existe en Supabase (nombre no coincide) — se omite")
            continue
        print(f"  {r['nombre_sorteo']}: {r['numeros']}")
        guardar_resultado(sorteo_id, r["numeros"], fecha_hoy)


def main():
    print(f"Iniciando scraper — {datetime.now(timezone.utc).isoformat()}")
    for slug_nuestro, slug_sitio in LOTERIAS.items():
        procesar_loteria(slug_nuestro, slug_sitio)
    print("\nListo.")


if __name__ == "__main__":
    main()
