"""
Guardar resultados en Supabase (v2 - HTML simple) - La BankeraRD
====================================================================
⚠️ IMPORTANTE: Este script SÍ escribe datos reales en tu base de datos Supabase.

Usa loteriasdominicanas.us (HTML simple, sin Playwright - mucho más rápido y confiable
que la versión anterior con loteriasdominicanas.com).

Solo guarda:
1. Sorteos ya mapeados con seguridad (ver MAPEO_SORTEOS)
2. Que además estén marcados como "Actualizado" en el sitio (resultado de HOY)

Cualquier sorteo sin mapear, o que no esté marcado como actualizado, se ignora
y se lista al final para revisar.
"""

import requests
from bs4 import BeautifulSoup

URL = "https://www.loteriasdominicanas.us/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    )
}

import os
SUPABASE_URL = os.environ.get("SUPABASE_URL", "PEGA_AQUI_TU_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "PEGA_AQUI_TU_SERVICE_ROLE_KEY")

# ============================================================
# MAPEO CONFIRMADO: (loteria_slug, sorteo_slug) -> sorteo_id real en tu tabla `sorteos`
# Solo se incluyen coincidencias de nombre exactas y sin ambigüedad
# ============================================================
MAPEO_SORTEOS = {
    ("nacional", "gana-mas"): 62,
    ("nacional", "juega-mas-pega-mas"): 64,
    ("nacional", "quiniela-nacional-noche"): 63,
    ("leidsa", "loto-mas"): 69,
    ("leidsa", "pega-3-mas"): 66,
    ("leidsa", "super-kino-tv"): 68,
    ("leidsa", "loto-pool-leidsa"): 67,
    ("loteka", "quiniela-loteka"): 70,
    ("loteka", "megachance"): 72,
    ("loteka", "toca-3"): 74,
    ("loteria-real", "quiniela-real"): 75,
    ("loteria-real", "tu-fecha-real"): 77,
    ("loteria-real", "loto-real"): 76,
    ("lotedom", "quiniela-lotedom"): 79,
    ("lotedom", "el-quemaito-mayor"): 80,
    ("lotedom", "super-pale-lotedom"): 82,
    ("lotedom", "agarra-4"): 83,
}

MESES = {
    "enero": "01", "febrero": "02", "marzo": "03", "abril": "04",
    "mayo": "05", "junio": "06", "julio": "07", "agosto": "08",
    "septiembre": "09", "octubre": "10", "noviembre": "11", "diciembre": "12",
}


def parsear_fecha(texto_fecha):
    """Convierte '31 Agosto 2026' -> '2026-08-31'. Si falla, devuelve None."""
    try:
        partes = texto_fecha.strip().split()
        dia, mes_nombre, anio = partes[0], partes[1].lower(), partes[2]
        mes = MESES.get(mes_nombre)
        if not mes:
            return None
        return f"{anio}-{mes}-{dia.zfill(2)}"
    except Exception:
        return None


def extraer_resultados():
    resp = requests.get(URL, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    tarjetas = soup.find_all("div", attrs={"data-share-sorteo": True})
    resultados = []

    for tarjeta in tarjetas:
        nombre_sorteo = tarjeta.get("data-share-sorteo", "").strip()
        fecha_texto = tarjeta.get("data-share-fecha", "").strip()

        enlace = tarjeta.find("a", href=True)
        href = enlace["href"] if enlace else ""
        partes = [p for p in href.strip("/").split("/") if p]
        loteria_slug = partes[0] if len(partes) >= 1 else ""
        sorteo_slug = partes[1] if len(partes) >= 2 else ""

        bolitas = tarjeta.select("ul.balls li")
        numeros = [li.get_text(strip=True) for li in bolitas if li.get_text(strip=True).isdigit()]

        actualizado = tarjeta.find(class_="updated-badge") is not None

        if numeros:
            resultados.append({
                "loteria_slug": loteria_slug,
                "sorteo_slug": sorteo_slug,
                "sorteo_nombre": nombre_sorteo,
                "fecha": parsear_fecha(fecha_texto),
                "numeros": numeros,
                "actualizado": actualizado,
            })

    return resultados


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
        "fuente": "scraper-html",
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
        print("❌ Falta configurar SUPABASE_URL y SUPABASE_SERVICE_KEY.")
        return

    print("Descargando resultados...\n")
    resultados = extraer_resultados()
    print(f"✅ {len(resultados)} sorteos encontrados en la página\n")

    guardados = []
    sin_mapear_actualizados = []

    for r in resultados:
        if not r["actualizado"]:
            continue  # solo nos interesan los de HOY

        clave = (r["loteria_slug"], r["sorteo_slug"])
        if clave in MAPEO_SORTEOS and r["fecha"]:
            sorteo_id = MAPEO_SORTEOS[clave]
            try:
                accion = guardar_en_supabase(sorteo_id, r["fecha"], r["numeros"])
                print(f"  ✅ {clave[0]}/{clave[1]} → sorteo_id {sorteo_id}: {r['numeros']} ({accion})")
                guardados.append(clave)
            except Exception as e:
                print(f"  ❌ Error guardando {clave}: {e}")
        else:
            sin_mapear_actualizados.append((clave, r["sorteo_nombre"], r["numeros"]))

    print(f"\n{'='*60}")
    print(f"RESUMEN: {len(guardados)} sorteos guardados en Supabase")
    print(f"{'='*60}")

    if sin_mapear_actualizados:
        print(f"\n⚠️  {len(sin_mapear_actualizados)} sorteos de HOY sin mapear (no se guardaron):")
        for (loteria, sorteo), nombre, numeros in sin_mapear_actualizados:
            print(f"   - {loteria}/{sorteo} ({nombre}): {numeros}")


if __name__ == "__main__":
    main()
