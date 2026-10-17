#!/usr/bin/env python3
"""
Genera, via Templated.io, las imagenes de las 4 tarjetas "Mas de La Bankera
RD" de la portada (Efemerides, MLB, NBA, Turismo) y las guarda en
public/tarjetas-explorar.json como {clave: {"url": ..., ...}}. La tarjeta
cuyo dato no esta disponible ese dia (ej. MLB fuera de temporada, o la
plantilla de Templated todavia no configurada) simplemente se omite del
JSON; la web usa su icono normal en ese caso (ver app/SeccionExplorar.tsx).

Se necesita: TEMPLATED_API_KEY (variable de entorno o .env.local) y, por
cada tarjeta que se quiera generar, su ID de plantilla en
TEMPLATED_TEMPLATE_EFEMERIDES / _MLB / _NBA / _TURISMO (mismo mecanismo).
Las plantillas se disenan a mano en templated.io; sus capas deben llamarse
exactamente "texto" (texto) y, en turismo, tambien "foto" (imagen).
"""
import json
import os
import re
import subprocess
from datetime import datetime, timedelta, timezone

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(RAIZ, "public")


def variable_entorno(nombre):
    if os.environ.get(nombre):
        return os.environ[nombre].strip()
    ruta = os.path.join(RAIZ, ".env.local")
    if os.path.exists(ruta):
        for linea in open(ruta, encoding="utf-8-sig"):
            if linea.startswith(nombre + "="):
                return linea.split("=", 1)[1].strip().strip('"')
    return None


def hoy_rd():
    return (datetime.now(timezone.utc) - timedelta(hours=4)).date()


def fecha_larga(fecha):
    dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
    meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
             "septiembre", "octubre", "noviembre", "diciembre"]
    return f"{dias[fecha.weekday()]}, {fecha.day} de {meses[fecha.month - 1]} de {fecha.year}"


def leer_json_publico(nombre_archivo):
    ruta = os.path.join(PUBLIC, nombre_archivo)
    if not os.path.exists(ruta):
        return None
    try:
        return json.load(open(ruta, encoding="utf-8"))
    except Exception:
        return None


def texto_efemeride_de_hoy(fecha):
    """Busca en app/efemerides/page.tsx la efemeride de hoy (mismo mes/dia),
    sin importar el ano. No usa el respaldo de Wikipedia que si usa el
    publicador de Facebook: para la tarjeta de la portada, si no hay una
    efemeride dominicana propia, mejor no mostrar nada ese dia."""
    ruta = os.path.join(RAIZ, "app", "efemerides", "page.tsx")
    contenido = open(ruta, encoding="utf-8").read()
    patron = r'\{\s*mes:\s*' + str(fecha.month) + r',\s*dia:\s*' + str(fecha.day) + r',\s*texto:\s*"([^"]+)"'
    m = re.search(patron, contenido)
    return m.group(1) if m else None


def destino_turismo_de_hoy():
    """Lee public/reel-turismo.json (generado por generar_reel_turismo.py)
    para el slug del destino de hoy, y busca su nombre + primera foto en
    app/turismo/datos.ts (mismo parser que usa generar_reel_turismo.py)."""
    datos_reel = leer_json_publico("reel-turismo.json")
    if not datos_reel or datos_reel.get("fecha") != str(hoy_rd()):
        return None
    slug = datos_reel.get("destino")
    if not slug:
        return None
    texto = open(os.path.join(RAIZ, "app", "turismo", "datos.ts"), encoding="utf-8").read()
    bloques = re.split(r'\n\s*\{\s*\n\s*slug: "', texto)[1:]
    for b in bloques:
        if not b.startswith(slug + '"'):
            continue
        nombre = re.search(r'nombre: "([^"]+)"', b).group(1)
        foto = re.search(r'url: "([^"]+)"', b)
        if not foto:
            return None
        return {"nombre": nombre, "foto_url": foto.group(1)}
    return None


def texto_resultados_de_ayer(slug_json, etiqueta):
    datos = leer_json_publico(f"reel-{slug_json}.json")
    ayer = str(hoy_rd() - timedelta(days=1))
    if not datos or datos.get("fecha") != ayer:
        return None
    return f"{etiqueta}: resultados de {fecha_larga(hoy_rd() - timedelta(days=1))}"


def renderizar(template_id, layers):
    clave = variable_entorno("TEMPLATED_API_KEY")
    if not clave:
        print("  Falta TEMPLATED_API_KEY, se omite.")
        return None
    if not template_id:
        print("  Falta el ID de plantilla para esta tarjeta, se omite.")
        return None
    cuerpo = json.dumps({"template": template_id, "layers": layers})
    try:
        resultado = subprocess.run(
            ["curl", "-sf", "-m", "25", "-X", "POST", "https://api.templated.io/v1/render",
             "-H", "Content-Type: application/json",
             "-H", f"Authorization: Bearer {clave}",
             "-d", cuerpo],
            capture_output=True, check=True,
        )
        respuesta = json.loads(resultado.stdout.decode("utf-8"))
        return respuesta.get("url")
    except Exception as error:
        print(f"  No se pudo generar con Templated.io: {error}")
        return None


def main():
    fecha = hoy_rd()
    tarjetas = {}

    efemeride = texto_efemeride_de_hoy(fecha)
    if efemeride:
        url = renderizar(variable_entorno("TEMPLATED_TEMPLATE_EFEMERIDES"), {"texto": {"text": efemeride}})
        if url:
            tarjetas["efemerides"] = {"url": url}
            print("Efemerides: generada.")
    else:
        print("Efemerides: nada para hoy, se omite.")

    mlb = texto_resultados_de_ayer("mlb", "MLB")
    if mlb:
        url = renderizar(variable_entorno("TEMPLATED_TEMPLATE_MLB"), {"texto": {"text": mlb}})
        if url:
            tarjetas["mlb"] = {"url": url}
            print("MLB: generada.")
    else:
        print("MLB: sin resultados de ayer, se omite.")

    nba = texto_resultados_de_ayer("nba", "NBA")
    if nba:
        url = renderizar(variable_entorno("TEMPLATED_TEMPLATE_NBA"), {"texto": {"text": nba}})
        if url:
            tarjetas["nba"] = {"url": url}
            print("NBA: generada.")
    else:
        print("NBA: sin resultados de ayer, se omite.")

    turismo = destino_turismo_de_hoy()
    if turismo:
        url = renderizar(
            variable_entorno("TEMPLATED_TEMPLATE_TURISMO"),
            {"texto": {"text": turismo["nombre"]}, "foto": {"image_url": turismo["foto_url"]}},
        )
        if url:
            tarjetas["turismo"] = {"url": url}
            print("Turismo: generada.")
    else:
        print("Turismo: sin destino de hoy todavia, se omite.")

    tarjetas["fecha"] = str(fecha)
    with open(os.path.join(PUBLIC, "tarjetas-explorar.json"), "w", encoding="utf-8") as f:
        json.dump(tarjetas, f, ensure_ascii=False)
    print(f"Guardado public/tarjetas-explorar.json con {len(tarjetas) - 1} tarjeta(s).")


if __name__ == "__main__":
    main()
