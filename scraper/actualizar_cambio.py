"""
Actualizar tipo de cambio en Supabase - La BankeraRD
======================================================
Consulta exchangerate-api.com y guarda las tasas de USD y EUR frente al
peso dominicano (DOP) en la tabla tipo_cambio, una fila por moneda y dia
(se actualiza la del dia si ya existe).
"""

import os
import sys
import requests

EXCHANGE_RATE_API_KEY = os.environ.get("EXCHANGE_RATE_API_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")


def main():
    if not EXCHANGE_RATE_API_KEY or not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("Faltan variables de entorno: EXCHANGE_RATE_API_KEY, SUPABASE_URL o SUPABASE_SERVICE_KEY.")
        sys.exit(1)

    resp = requests.get(
        f"https://v6.exchangerate-api.com/v6/{EXCHANGE_RATE_API_KEY}/latest/USD",
        timeout=30,
    )
    resp.raise_for_status()
    datos = resp.json()

    if datos.get("result") != "success":
        print(f"La API de tipo de cambio no respondio correctamente: {datos}")
        sys.exit(1)

    usd_dop = datos["conversion_rates"]["DOP"]
    usd_eur = datos["conversion_rates"]["EUR"]
    eur_dop = usd_dop / usd_eur

    from datetime import date
    fecha_hoy = date.today().isoformat()

    registros = [
        {
            "moneda_origen": "USD",
            "moneda_destino": "DOP",
            "tasa_compra": round(usd_dop - 0.3, 4),
            "tasa_venta": round(usd_dop + 0.3, 4),
            "fecha": fecha_hoy,
            "fuente": "exchangerate-api",
        },
        {
            "moneda_origen": "EUR",
            "moneda_destino": "DOP",
            "tasa_compra": round(eur_dop - 0.3, 4),
            "tasa_venta": round(eur_dop + 0.3, 4),
            "fecha": fecha_hoy,
            "fuente": "exchangerate-api",
        },
    ]

    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation",
    }
    url = f"{SUPABASE_URL}/rest/v1/tipo_cambio?on_conflict=moneda_origen,moneda_destino,fecha"

    r = requests.post(url, headers=headers, json=registros, timeout=15)
    r.raise_for_status()

    print(f"Tipo de cambio actualizado ({fecha_hoy}):")
    for reg in registros:
        print(f"  {reg['moneda_origen']}: compra {reg['tasa_compra']} / venta {reg['tasa_venta']}")


if __name__ == "__main__":
    main()
