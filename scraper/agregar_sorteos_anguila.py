"""
Agrega los 11 sorteos de Anguila de cada hora que faltaban (30-oct-2026).
No borra ni cambia los 4 que ya existian (10 AM, Mediodia, Tarde, Noche). Si
un sorteo de esa hora ya existe, no lo repite: se puede correr varias veces.
"""

import os
import requests

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
HEADERS = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
}

NUEVOS = [
    ("Anguila 8:00 AM", "08:00:00"), ("Anguila 9:00 AM", "09:00:00"), ("Anguila 11:00 AM", "11:00:00"),
    ("Anguila 12:00 PM", "12:00:00"), ("Anguila 2:00 PM", "14:00:00"), ("Anguila 3:00 PM", "15:00:00"),
    ("Anguila 4:00 PM", "16:00:00"), ("Anguila 5:00 PM", "17:00:00"), ("Anguila 7:00 PM", "19:00:00"),
    ("Anguila 8:00 PM", "20:00:00"), ("Anguila 10:00 PM", "22:00:00"),
]


def main():
    r = requests.get(f"{SUPABASE_URL}/rest/v1/sorteos?loteria_id=eq.20&select=hora_sorteo", headers=HEADERS, timeout=15)
    r.raise_for_status()
    ya_hay = {s["hora_sorteo"][:5] for s in r.json() if s.get("hora_sorteo")}
    filas = [
        {"loteria_id": 20, "nombre": nombre, "hora_sorteo": hora, "dias_semana": "L,M,X,J,V,S,D"}
        for nombre, hora in NUEVOS
        if hora[:5] not in ya_hay
    ]
    if not filas:
        print("Ya estaban los 15 sorteos de Anguila.")
        return
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/sorteos",
        headers={**HEADERS, "Prefer": "return=representation"},
        json=filas, timeout=15,
    )
    if not r.ok:
        print("Error:", r.status_code, r.text)
        r.raise_for_status()
    for s in r.json():
        print("Agregado:", s["id"], s["nombre"], s["hora_sorteo"])


if __name__ == "__main__":
    main()
