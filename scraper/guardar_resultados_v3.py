"""
Guardar resultados en Supabase (v3) - La BankeraRD
======================================================
⚠️ IMPORTANTE: Este script SÍ escribe datos reales en tu base de datos Supabase.

Usa loteriasdominicanas.us (HTML simple, sin Playwright).

Solo guarda:
1. Sorteos ya mapeados con seguridad (ver MAPEO_SORTEOS) - identificados por
   (loteria_slug, nombre exacto del sorteo), NO solo por link, porque varios
   sorteos de día/noche comparten el mismo link y solo el nombre los distingue
2. Que además estén marcados como "Actualizado" en el sitio (resultado de HOY)
"""

import os
from datetime import datetime, timedelta, timezone
import requests
from bs4 import BeautifulSoup

URL = "https://www.loteriasdominicanas.us/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    )
}

SUPABASE_URL = os.environ.get("SUPABASE_URL", "PEGA_AQUI_TU_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "PEGA_AQUI_TU_SERVICE_ROLE_KEY")

# ============================================================
# MAPEO CONFIRMADO: (loteria_slug, nombre exacto del sitio) -> sorteo_id real
# Usamos el NOMBRE (no solo el link) porque varios sorteos de día/noche
# comparten el mismo link (ej: la-primera/quiniela sirve para día y noche)
# ============================================================
MAPEO_SORTEOS = {
    ("nacional", "Gana Mas"): 62,
    ("nacional", "Juega mas Pega mas"): 64,
    ("nacional", "Quiniela Nacional"): 63,
    ("leidsa", "Loto Mas"): 69,
    ("leidsa", "Quiniela Pale"): 65,
    ("leidsa", "Pega 3 Mas"): 66,
    ("leidsa", "Super Kino TV"): 68,
    ("leidsa", "Loto Pool Leidsa"): 67,
    ("loteka", "Quiniela Loteka"): 70,
    ("loteka", "Mega Chances"): 72,
    ("loteka", "Toca 3"): 74,
    ("loteka", "La Repartidera"): 125,
    ("loteka", "MegaLotto"): 71,
    ("loteria-real", "Quiniela Real"): 75,
    ("loteria-real", "Tu Fecha"): 77,
    ("loteria-real", "Loto Real"): 76,
    ("loteria-real", "Loto Pool Real"): 137,
    ("lotedom", "Quiniela Lotedom"): 79,
    ("lotedom", "Quemaito Mayor"): 80,
    ("lotedom", "Super Pale"): 82,
    ("lotedom", "Agarra 4"): 83,
    ("la-primera", "La Primera Mediodia"): 81,
    ("la-primera", "Quinielon Dia"): 120,
    ("la-primera", "La Primera Noche"): 121,
    ("la-primera", "Quinielon Noche"): 122,
    ("la-primera", "Loto 5"): 123,
    ("la-suerte", "La Suerte Dominicana Dia"): 111,
    ("la-suerte", "La Suerte Dominicana Noche"): 124,
    ("loteria-americana", "New York Tarde"): 113,
    ("loteria-americana", "New York Noche"): 115,
    ("loteria-americana", "Florida Noche"): 114,
    ("loteria-americana", "Florida Tarde"): 118,
    ("anguila", "Anguila Mediodia"): 126,
    ("anguila", "Anguila Tarde"): 127,
    ("anguila", "Anguila Noche"): 128,
    ("haiti", "Haiti Bolet 9:30 AM"): 129,
    ("haiti", "Haiti Bolet 10:30 AM"): 130,
    ("haiti", "Haiti Bolet 11:30 AM"): 131,
    ("haiti", "Haiti Bolet 5:30 PM"): 132,
    ("haiti", "Haiti Bolet 6:30 PM"): 133,
    ("haiti", "Haiti Bolet 7:30 PM"): 134,
    ("sxm", "SXM Quiniela Dia"): 135,
    ("sxm", "SXM Quiniela Noche"): 136,
}

MESES = {
    "enero": "01", "febrero": "02", "marzo": "03", "abril": "04",
    "mayo": "05", "junio": "06", "julio": "07", "agosto": "08",
    "septiembre": "09", "octubre": "10", "noviembre": "11", "diciembre": "12",
}


def hoy_rd():
    # Republica Dominicana esta siempre en UTC-4 (no usa horario de verano).
    return (datetime.now(timezone.utc) - timedelta(hours=4)).strftime("%Y-%m-%d")


def parsear_fecha(texto_fecha):
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

        # Algunas tarjetas (Anguila, Haiti, SXM) no traen enlace <a> en absoluto.
        # En esos casos usamos la clase CSS de la tarjeta (ej. "anguila-mediodia"),
        # tomando la primera palabra antes del guion como identificador de la lotería.
        if not loteria_slug:
            clases = [c for c in tarjeta.get("class", []) if c not in ("card", "today")]
            if clases:
                loteria_slug = clases[0].split("-")[0]

        bolitas = tarjeta.select("ul.balls li")
        numeros = [li.get_text(strip=True) for li in bolitas if li.get_text(strip=True).isdigit()]

        actualizado = tarjeta.find(class_="updated-badge") is not None

        if numeros:
            resultados.append({
                "loteria_slug": loteria_slug,
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
    hoy = hoy_rd()

    for r in resultados:
        # Algunas tarjetas (ej. Super Kino TV, un juego tipo Kino) nunca traen
        # la insignia "Actualizado" en el sitio fuente, aunque sí muestran un
        # resultado real y vigente. Por eso también aceptamos la tarjeta si su
        # fecha coincide con la de hoy en Republica Dominicana.
        if not r["actualizado"] and r["fecha"] != hoy:
            continue

        clave = (r["loteria_slug"], r["sorteo_nombre"])
        if clave in MAPEO_SORTEOS and r["fecha"]:
            sorteo_id = MAPEO_SORTEOS[clave]
            try:
                accion = guardar_en_supabase(sorteo_id, r["fecha"], r["numeros"])
                print(f"  ✅ {clave[0]}/{clave[1]} → sorteo_id {sorteo_id}: {r['numeros']} ({accion})")
                guardados.append(clave)
            except Exception as e:
                print(f"  ❌ Error guardando {clave}: {e}")
        else:
            sin_mapear_actualizados.append((clave, r["numeros"]))

    print(f"\n{'='*60}")
    print(f"RESUMEN: {len(guardados)} sorteos guardados en Supabase")
    print(f"{'='*60}")

    if sin_mapear_actualizados:
        print(f"\n⚠️  {len(sin_mapear_actualizados)} sorteos de HOY sin mapear (no se guardaron):")
        for (loteria, nombre), numeros in sin_mapear_actualizados:
            print(f"   - {loteria} / {nombre}: {numeros}")


if __name__ == "__main__":
    main()
