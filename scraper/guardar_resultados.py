"""
Guardar resultados en Supabase - La BankeraRD
================================================
⚠️ IMPORTANTE: Este script SÍ escribe datos reales en tu base de datos Supabase,
   a diferencia de scraper_prueba.py que solo mostraba resultados en pantalla.

Solo guarda resultados de sorteos que ya identificamos con seguridad (ver
MAPEO_SORTEOS abajo). Cualquier sorteo que encuentre y no esté en ese mapeo,
lo va a IGNORAR y avisarte en pantalla - nunca adivina ni inventa una conexión.

Solo toca la fecha de HOY. No modifica ni borra los datos de prueba ("demo")
que ya tienes cargados con fechas pasadas.
"""

from playwright.sync_api import sync_playwright
from datetime import datetime, timezone, timedelta
import requests
import os

# ============================================================
# CONFIGURACIÓN - se leen de variables de entorno ($env:SUPABASE_URL, etc.)
# ============================================================
SUPABASE_URL = os.environ.get("SUPABASE_URL", "PEGA_AQUI_TU_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "PEGA_AQUI_TU_SERVICE_ROLE_KEY")

# ============================================================
# MAPEO CONOCIDO Y CONFIRMADO: slug del sitio -> id real en tu tabla `sorteos`
# Solo agregamos aquí lo que ya verificamos juntos - nunca se adivina
# ============================================================
MAPEO_SORTEOS = {
    ("leidsa", "loto-mas"): 69,                    # "Loto"
    ("leidsa", "super-pale"): 119,                 # "Súper Palé"
    ("nacional", "juega-mas-pega-mas"): 64,        # "Juega + Pega +"
    ("nacional", "gana-mas"): 62,                  # "Gana Más"
    ("nacional", "quiniela"): 63,                  # "Quiniela Nacional (Noche)"
}

LOTERIAS = {
    "nacional": "loteria-nacional",
    "leidsa": "leidsa",
    "loteka": "loteka",
    "real": "loto-real",
    "lotedom": "lotedom",
    "la-primera": "la-primera",
    "la-suerte": "la-suerte-dominicana",
}

BASE_URL = "https://loteriasdominicanas.com"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)

HOY_RD = (datetime.now(timezone.utc) - timedelta(hours=4)).strftime("%Y-%m-%d")


def extraer_resultados_de_pagina(page, slug_interno, ruta_sitio):
    url = f"{BASE_URL}/{ruta_sitio}/"
    resultados = []

    try:
        page.goto(url, timeout=45000, wait_until="networkidle")
        page.wait_for_selector(".score-shape-circle", timeout=30000)
    except Exception as e:
        print(f"⚠️  {slug_interno}: no cargó ({e})")
        return resultados

    enlaces = page.query_selector_all(f'a[href^="/{ruta_sitio}/"]')
    vistos = set()

    for enlace in enlaces:
        href = enlace.get_attribute("href")
        if not href or href in vistos:
            continue

        bolitas = enlace.query_selector_all(".score-shape-circle span")
        if not bolitas:
            continue

        vistos.add(href)

        numeros = []
        for bolita in bolitas:
            texto = bolita.inner_text().strip()
            if texto.isdigit():
                numeros.append(int(texto))

        if numeros:
            slug_sorteo = href.strip("/").split("/")[-1]
            resultados.append({
                "loteria_slug": slug_interno,
                "sorteo_slug": slug_sorteo,
                "numeros": numeros,
            })

    return resultados


def guardar_en_supabase(sorteo_id, numeros):
    """Guarda (o actualiza si ya existe) el resultado de HOY para este sorteo_id."""
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
    }
    numeros_texto = "-".join(str(n) for n in numeros)

    url_check = (
        f"{SUPABASE_URL}/rest/v1/resultados"
        f"?sorteo_id=eq.{sorteo_id}&fecha=eq.{HOY_RD}&select=id"
    )
    resp = requests.get(url_check, headers=headers, timeout=15)
    resp.raise_for_status()
    existentes = resp.json()

    payload = {
        "sorteo_id": sorteo_id,
        "fecha": HOY_RD,
        "numeros": numeros_texto,
        "fuente": "scraper-playwright",
    }

    if existentes:
        id_existente = existentes[0]["id"]
        url_update = f"{SUPABASE_URL}/rest/v1/resultados?id=eq.{id_existente}"
        r = requests.patch(url_update, headers=headers, json=payload, timeout=15)
        r.raise_for_status()
        return "actualizado"
    else:
        url_insert = f"{SUPABASE_URL}/rest/v1/resultados"
        r = requests.post(url_insert, headers=headers, json=payload, timeout=15)
        r.raise_for_status()
        return "insertado"


def main():
    if "PEGA_AQUI" in SUPABASE_URL or "PEGA_AQUI" in SUPABASE_SERVICE_KEY:
        print("❌ Falta configurar SUPABASE_URL y SUPABASE_SERVICE_KEY.")
        print("   Ábrelas en este archivo (arriba) o configúralas como variables de entorno.")
        return

    print(f"📅 Guardando resultados para hoy: {HOY_RD}\n")

    encontrados_sin_mapear = []
    guardados = []

    with sync_playwright() as p:
        navegador = p.chromium.launch(headless=True)
        pagina = navegador.new_page(user_agent=USER_AGENT)

        for slug_interno, ruta_sitio in LOTERIAS.items():
            resultados = extraer_resultados_de_pagina(pagina, slug_interno, ruta_sitio)

            for r in resultados:
                clave = (r["loteria_slug"], r["sorteo_slug"])
                if clave in MAPEO_SORTEOS:
                    sorteo_id = MAPEO_SORTEOS[clave]
                    try:
                        accion = guardar_en_supabase(sorteo_id, r["numeros"])
                        print(f"  ✅ {clave[0]}/{clave[1]} → sorteo_id {sorteo_id}: {r['numeros']} ({accion})")
                        guardados.append(clave)
                    except Exception as e:
                        print(f"  ❌ Error guardando {clave}: {e}")
                else:
                    encontrados_sin_mapear.append((clave, r["numeros"]))

        navegador.close()

    print(f"\n{'='*60}")
    print(f"RESUMEN: {len(guardados)} sorteos guardados en Supabase")
    print(f"{'='*60}")

    if encontrados_sin_mapear:
        print(f"\n⚠️  Se encontraron {len(encontrados_sin_mapear)} sorteos SIN mapear (no se guardaron):")
        for (loteria, sorteo), numeros in encontrados_sin_mapear:
            print(f"   - {loteria}/{sorteo}: {numeros}")
        print("\n   Mándame esta lista para agregarlos juntos a MAPEO_SORTEOS.")


if __name__ == "__main__":
    main()