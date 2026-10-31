"""
Frase de gancho del dia para los reels (ver el comentario de lib/ganchos.json).
Misma cuenta que lib/ganchos.ts: si cambia una, cambiar la otra.
"""
import json
import os
from datetime import date

_RUTA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "lib", "ganchos.json")
_DATOS = json.load(open(_RUTA, encoding="utf-8"))


def gancho_del_dia(tipo, fecha_publicacion, salida=1):
    """fecha_publicacion: date del dia en que sale la publicacion (hora RD)."""
    p = _DATOS["publicaciones"][tipo]
    grupo = _DATOS["grupos"][p["grupo"]]
    puesto = p["puestos"][(salida - 1) % len(p["puestos"])]
    dia = (fecha_publicacion - date(1970, 1, 1)).days
    return _DATOS["frases"][str(grupo[(dia + puesto) % len(grupo)])]
