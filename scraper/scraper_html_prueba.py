"""
Scraper de prueba (HTML simple) - La BankeraRD
=================================================
Este script SOLO IMPRIME los resultados en pantalla, NO los guarda en Supabase.

A diferencia del scraper anterior (que usaba Playwright para loteriasdominicanas.com),
este usa un sitio distinto: loteriasdominicanas.us, que muestra los números
directamente en el HTML normal, sin necesidad de esperar carga con JavaScript.
Por eso aquí NO hace falta Playwright - solo 'requests' (para bajar la página)
y 'BeautifulSoup' (para leerla), mucho más simple y rápido.

Además, todos los sorteos aparecen en UNA SOLA página principal, así que
solo hacemos 1 visita en vez de 7.
"""

import requests
from bs4 import BeautifulSoup
import re
import json

URL = "https://www.loteriasdominicanas.us/"

# Identificador de navegador "normal"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    )
}

# Solo nos interesan links que empiecen con una de estas loterías
LOTERIAS_VALIDAS = [
    "nacional", "leidsa", "loteka", "loteria-real",
    "lotedom", "la-primera", "la-suerte", "loteria-americana",
]


def main():
    print(f"Descargando: {URL}\n")
    resp = requests.get(URL, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    print(f"✅ Página descargada correctamente (código {resp.status_code})\n")

    soup = BeautifulSoup(resp.text, "html.parser")

    resultados = []

    # Buscamos todos los links que apunten a un sorteo específico
    enlaces = soup.find_all("a", href=True)

    for enlace in enlaces:
        href = enlace["href"]

        # Filtramos solo los que son de una lotería conocida
        # (ej: https://www.loteriasdominicanas.us/leidsa/loto-mas/)
        match = re.search(r"loteriasdominicanas\.us/([a-z-]+)/", href)
        if not match or match.group(1) not in LOTERIAS_VALIDAS:
            continue

        loteria_slug = match.group(1)
        nombre_sorteo = enlace.get_text(strip=True)
        if not nombre_sorteo:
            continue

        # Buscamos la lista de números que viene justo después de este link
        lista_numeros = enlace.find_next("ul")
        if not lista_numeros:
            continue

        numeros = []
        for li in lista_numeros.find_all("li"):
            texto = li.get_text(strip=True)
            if texto.replace(".", "").isdigit():
                numeros.append(texto)

        if numeros:
            resultados.append({
                "loteria_slug": loteria_slug,
                "sorteo_nombre": nombre_sorteo,
                "url": href,
                "numeros": numeros,
            })

    print(f"{'='*60}")
    print(f"RESUMEN: {len(resultados)} sorteos encontrados")
    print(f"{'='*60}\n")

    for r in resultados:
        print(f"  ✅ {r['loteria_slug']}/{r['sorteo_nombre']}: {r['numeros']}")

    with open("resultado_prueba_html.json", "w", encoding="utf-8") as f:
        json.dump(resultados, f, indent=2, ensure_ascii=False)
    print(f"\n📄 Resultados guardados en: resultado_prueba_html.json")


if __name__ == "__main__":
    main()
