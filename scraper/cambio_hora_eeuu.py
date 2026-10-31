"""
Cambia hora_sorteo de las loterias de EE. UU. cuando Nueva York cambia de hora
(RD no cambia). Invierno: el 1-nov-2026 salen 1 hora mas tarde en RD. Verano:
el 14-mar-2027 vuelven a la hora de antes.

Solo actua el dia del cambio (o con --forzar invierno|verano). Se puede correr
varias veces: siempre deja las mismas horas.
"""

import datetime
import os
import sys

import requests

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
HEADERS = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
}

# id: (verano, invierno)
HORAS = {
    113: ("14:30:00", "15:30:00"),  # New York Tarde
    115: ("22:30:00", "23:30:00"),  # New York Noche
    118: ("13:30:00", "14:30:00"),  # Florida Dia
    114: ("22:00:00", "23:00:00"),  # Florida Noche
    140: ("12:29:00", "13:29:00"),  # Georgia Dia
    141: ("18:59:00", "19:59:00"),  # Georgia Tarde
    142: ("23:34:00", "00:34:00"),  # Georgia Noche
    138: ("12:59:00", "13:59:00"),  # New Jersey Tarde
    139: ("22:57:00", "23:57:00"),  # New Jersey Noche
    112: ("23:00:00", "23:59:00"),  # Powerball
    117: ("23:00:00", "00:00:00"),  # Mega Millions
}

DIAS_DE_CAMBIO = {
    datetime.date(2026, 11, 1): "invierno",
    datetime.date(2027, 3, 14): "verano",
}


def main():
    hoy = datetime.datetime.now(datetime.timezone.utc).date()
    if len(sys.argv) == 3 and sys.argv[1] == "--forzar":
        temporada = sys.argv[2]
    else:
        temporada = DIAS_DE_CAMBIO.get(hoy)
    if temporada not in ("invierno", "verano"):
        print(f"Hoy ({hoy}) no es dia de cambio de hora. No se cambia nada.")
        return
    col = 1 if temporada == "invierno" else 0

    cambiados = []
    for sid, horas in HORAS.items():
        r = requests.patch(
            f"{SUPABASE_URL}/rest/v1/sorteos?id=eq.{sid}",
            headers={**HEADERS, "Prefer": "return=representation"},
            json={"hora_sorteo": horas[col]}, timeout=15,
        )
        r.raise_for_status()
        for s in r.json():
            cambiados.append(f"{s['id']} {s['nombre']} {s['hora_sorteo']}")
            print("Cambiado:", s["id"], s["nombre"], s["hora_sorteo"])

    # El registro de GitHub Actions no se puede leer sin iniciar sesion: se deja
    # la constancia en publicaciones_facebook para poder revisarla.
    requests.post(
        f"{SUPABASE_URL}/rest/v1/publicaciones_facebook",
        headers=HEADERS,
        json={
            "loteria_slug": f"cambio-hora-{temporada}-{hoy}",
            "fecha": str(hoy),
            "post_id": "ok" if len(cambiados) == len(HORAS) else "incompleto",
            "mensaje": " | ".join(cambiados)[:2000],
        },
        timeout=15,
    )


if __name__ == "__main__":
    main()
