"""
Scraper de prueba - La BankeraRD
==================================
Este script SOLO IMPRIME los resultados en pantalla, NO los guarda en Supabase todavía.
Es para verificar que la extracción de números funciona bien antes de conectarlo a la base de datos.

Usa Playwright (un navegador invisible) para esperar a que la página cargue
completamente los números antes de leerlos - esto es necesario porque
loteriasdominicanas.com carga los resultados después de que la página abre,
no vienen incluidos desde el principio.
"""

from playwright.sync_api import sync_playwright
import json

# Mapeo confirmado: slug interno -> ruta real del sitio
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


def extraer_resultados_de_pagina(page, slug_interno, ruta_sitio):
    """Entra a la página de una lotería y extrae todos los sorteos visibles con sus números."""
    url = f"{BASE_URL}/{ruta_sitio}/"
    print(f"\n{'='*60}")
    print(f"Visitando: {url}")
    print(f"{'='*60}")

    resultados = []

    try:
        page.goto(url, timeout=30000)
        # Esperamos a que aparezcan las bolitas de números en la página
        page.wait_for_selector(".score-shape-circle", timeout=15000)
    except Exception as e:
        print(f"⚠️  No se pudieron cargar los números para {slug_interno}: {e}")
        return resultados

    # Buscamos todos los links <a> que agrupan un sorteo específico
    # (ej: /leidsa/super-pale/, /leidsa/loto-mas/, etc.)
    enlaces = page.query_selector_all(f'a[href^="/{ruta_sitio}/"]')

    vistos = set()  # para no procesar el mismo sorteo dos veces

    for enlace in enlaces:
        href = enlace.get_attribute("href")
        if not href or href in vistos:
            continue

        # Buscamos las bolitas de números DENTRO de este enlace específico
        bolitas = enlace.query_selector_all(".score-shape-circle span")
        if not bolitas:
            continue  # este enlace no tiene números (puede ser un link de menú)

        vistos.add(href)

        numeros = []
        for bolita in bolitas:
            texto = bolita.inner_text().strip()
            if texto.isdigit():
                numeros.append(int(texto))

        if numeros:
            nombre_sorteo = href.strip("/").split("/")[-1]  # ej: "super-pale"
            resultados.append({
                "loteria": slug_interno,
                "sorteo": nombre_sorteo,
                "url": href,
                "numeros": numeros,
            })
            print(f"  ✅ {nombre_sorteo}: {numeros}")

    if not resultados:
        print(f"  ⚠️  No se encontraron resultados para {slug_interno} — revisar selectores")

    return resultados


def main():
    todos_los_resultados = []

    with sync_playwright() as p:
        # headless=True significa que el navegador NO se ve en pantalla (corre en segundo plano)
        # Si algo falla, puedes cambiarlo temporalmente a headless=False para VER lo que hace
        navegador = p.chromium.launch(headless=True)
        pagina = navegador.new_page()

        for slug_interno, ruta_sitio in LOTERIAS.items():
            resultados = extraer_resultados_de_pagina(pagina, slug_interno, ruta_sitio)
            todos_los_resultados.extend(resultados)

        navegador.close()

    print(f"\n\n{'='*60}")
    print(f"RESUMEN FINAL: {len(todos_los_resultados)} sorteos encontrados en total")
    print(f"{'='*60}")
    print(json.dumps(todos_los_resultados, indent=2, ensure_ascii=False))

    # Guardamos también en un archivo, para que puedas revisarlo con calma
    with open("resultado_prueba.json", "w", encoding="utf-8") as f:
        json.dump(todos_los_resultados, f, indent=2, ensure_ascii=False)
    print("\n📄 Resultados guardados en: resultado_prueba.json")


if __name__ == "__main__":
    main()