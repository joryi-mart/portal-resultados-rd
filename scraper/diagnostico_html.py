"""
Diagnóstico - descarga y guarda el HTML real de loteriasdominicanas.us
=========================================================================
Este script NO busca resultados todavía - solo descarga la página y la
guarda completa en un archivo, para que podamos ver la estructura real
del código y escribir el selector correcto (en vez de adivinar).
"""

import requests

URL = "https://www.loteriasdominicanas.us/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    )
}

print(f"Descargando: {URL}")
resp = requests.get(URL, headers=HEADERS, timeout=30)
resp.raise_for_status()
print(f"✅ Descargado (código {resp.status_code}), tamaño: {len(resp.text)} caracteres")

with open("pagina_descargada.html", "w", encoding="utf-8") as f:
    f.write(resp.text)

print("📄 Guardado en: pagina_descargada.html")
print("\nAhora abre ese archivo en VSCode y busca (Ctrl+F) el texto: Gana Más")
print("Copia y pégame las 15-20 líneas que aparezcan alrededor de donde lo encuentres.")
