"""
Scraper de prueba (HTML simple) v2 - La BankeraRD
====================================================
Este script SOLO IMPRIME los resultados en pantalla, NO los guarda en Supabase.

Usa loteriasdominicanas.us (estructura HTML confirmada, sin necesidad de Playwright).
Cada resultado viene en un bloque así:
  <div class="card {slug} today" data-share-sorteo="Nombre" data-share-fecha="fecha">
    <a href="/loteria/sorteo/">Nombre</a>
    <ul class="balls"><li>42</li><li>83</li>...</ul>
  </div>
"""

import requests
from bs4 import BeautifulSoup
import json

URL = "https://www.loteriasdominicanas.us/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    )
}


def main():
    print(f"Descargando: {URL}\n")
    resp = requests.get(URL, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    print(f"✅ Página descargada (código {resp.status_code})\n")

    soup = BeautifulSoup(resp.text, "html.parser")

    # Cada resultado está en un <div class="card ..."> con el atributo data-share-sorteo
    tarjetas = soup.find_all("div", attrs={"data-share-sorteo": True})

    resultados = []

    for tarjeta in tarjetas:
        nombre_sorteo = tarjeta.get("data-share-sorteo", "").strip()
        fecha = tarjeta.get("data-share-fecha", "").strip()

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
                "fecha": fecha,
                "numeros": numeros,
                "actualizado": actualizado,
            })

    print(f"{'='*60}")
    print(f"RESUMEN: {len(resultados)} sorteos encontrados")
    print(f"{'='*60}\n")

    for r in resultados:
        marca = "🟢" if r["actualizado"] else "⚪"
        print(f"  {marca} {r['loteria_slug']}/{r['sorteo_slug']} ({r['sorteo_nombre']}): {r['numeros']} - {r['fecha']}")

    with open("resultado_prueba_html.json", "w", encoding="utf-8") as f:
        json.dump(resultados, f, indent=2, ensure_ascii=False)
    print(f"\n📄 Resultados guardados en: resultado_prueba_html.json")


if __name__ == "__main__":
    main()
