#!/usr/bin/env python3
"""
Genera un reel vertical (1080x1920) de un destino turistico de RD, con las
fotos reales del lugar que ya usa la web (app/turismo/datos.ts, Wikimedia
Commons) con zoom lento, texto encima y la voz de Dalia. Si Pixabay tiene un
video etiquetado con ese mismo lugar y "dominican", se usa como primera toma
(recortado a vertical). Nunca se usa un video de otro lugar.

Uso:
  python scripts/generar_reel_turismo.py [slug] [--salida archivo.mp4]
  (sin slug, toma el destino siguiente al del ultimo reel, en el orden de datos.ts)

Salida: el .mp4 y un .json al lado con {"slug", "caption"}.
Se necesita: pip install pillow imageio_ffmpeg edge-tts, y PIXABAY_API_KEY
(variable de entorno o .env.local) para los videos; sin ella sale solo con fotos.
"""
import importlib.util
import json
import os
import re
import subprocess
import sys
import urllib.parse
from datetime import datetime, timedelta, timezone

from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_spec = importlib.util.spec_from_file_location("reel", os.path.join(RAIZ, "scripts", "generar_reel_diario.py"))
reel = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(reel)

W, H, FPS = reel.W, reel.H, reel.FPS
NAVY, GOLD, WHITE = reel.NAVY, reel.GOLD, reel.WHITE
ZOOM = 0.12          # cuanto se acerca cada foto durante su toma
TRANSICION = 0.4     # segundos de fundido entre tomas


def fuente(tam, negrita=True):
    nombre = "Manrope-ExtraBold.ttf" if negrita else "Manrope-Regular.ttf"
    return ImageFont.truetype(os.path.join(reel.FUENTES, nombre), tam)


def clave_pixabay():
    if os.environ.get("PIXABAY_API_KEY"):
        return os.environ["PIXABAY_API_KEY"].strip()
    ruta = os.path.join(RAIZ, ".env.local")
    if os.path.exists(ruta):
        for linea in open(ruta, encoding="utf-8-sig"):
            if linea.startswith("PIXABAY_API_KEY="):
                return linea.split("=", 1)[1].strip().strip('"')
    return None


# ---------- Datos del destino (se leen de app/turismo/datos.ts) ----------

def leer_destinos():
    texto = open(os.path.join(RAIZ, "app", "turismo", "datos.ts"), encoding="utf-8").read()
    bloques = re.split(r'\n\s*\{\s*\n\s*slug: "', texto)[1:]
    destinos = []
    for b in bloques:
        slug = b.split('"', 1)[0]
        nombre = re.search(r'nombre: "([^"]+)"', b).group(1)
        resumen = re.search(r'resumen: "([^"]+)"', b).group(1)
        fotos = [
            {"url": m.group(1), "autor": m.group(2), "licencia": m.group(3), "alt": m.group(4) or nombre}
            for m in re.finditer(r'url: "([^"]+)",\s*autor: "([^"]+)",\s*licencia: "([^"]+)",(?:\s*alt: "([^"]+)",)?', b)
        ]
        atr = re.search(r"atracciones: \[(.*?)\]", b, re.S)
        atracciones = re.findall(r'"([^"]+)"', atr.group(1)) if atr else []
        destinos.append({"slug": slug, "nombre": nombre, "resumen": resumen, "fotos": fotos, "atracciones": atracciones})
    return destinos


# ---------- Video de Pixabay, solo si es del mismo lugar ----------

OTROS_LUGARES_RD = ["punta cana", "bavaro", "bávaro", "santo domingo", "puerto plata", "sosua", "sosúa", "cabarete",
                    "samana", "samaná", "las terrenas", "la romana", "bayahibe", "boca chica", "juan dolio",
                    "jarabacoa", "constanza", "santiago", "barahona", "punta rusia", "las galeras"]


def buscar_video_pixabay(nombre, carpeta, otros_destinos):
    clave = clave_pixabay()
    if not clave:
        return None
    q = urllib.parse.quote_plus(f"{nombre} dominican republic")
    try:
        datos = reel.obtener_json(f"https://pixabay.com/api/videos/?key={clave}&q={q}&per_page=50&safesearch=true")
    except Exception as error:
        print(f"  Pixabay no respondio ({error}); sigo solo con fotos.")
        return None
    lugar = nombre.lower()
    # Un video etiquetado con otro lugar de RD ademas de este (ej. "puerto plata,
    # punta cana, sosua") no se sabe de donde es: se descarta para no mostrar un
    # sitio con el nombre de otro.
    ajenos = [x for x in OTROS_LUGARES_RD + [o.lower() for o in otros_destinos] if x not in lugar and lugar not in x]
    for v in datos.get("hits", []):
        etiquetas = v.get("tags", "").lower()
        if lugar in etiquetas and "dominican" in etiquetas and not any(a in etiquetas for a in ajenos):
            archivo = v["videos"].get("medium") or v["videos"].get("large")
            if not archivo or not archivo.get("url"):
                continue
            destino = os.path.join(carpeta, "pixabay_tmp.mp4")
            subprocess.run(["curl", "-sfL", "-m", "60", "-o", destino, archivo["url"]], check=True)
            print(f"  Video de Pixabay del lugar: {v['id']} ({etiquetas[:60]})")
            return {"ruta": destino, "autor": v.get("user", "Pixabay")}
    print("  Pixabay no tiene video de este lugar; solo fotos.")
    return None


# ---------- Tomas ----------

def cubrir(img, ancho, alto):
    escala = max(ancho / img.width, alto / img.height)
    img = img.resize((int(img.width * escala) + 1, int(img.height * escala) + 1), Image.LANCZOS)
    x0 = (img.width - ancho) // 2
    y0 = (img.height - alto) // 2
    return img.crop((x0, y0, x0 + ancho, y0 + alto))


class TomaFoto:
    def __init__(self, img):
        self.grande = cubrir(img.convert("RGB"), int(W * (1 + ZOOM)), int(H * (1 + ZOOM)))

    def cuadro(self, t):  # t de 0 a 1 dentro de la toma: zoom lento hacia adentro
        k = 1 + ZOOM * (1 - t)
        cw, ch = int(W * k), int(H * k)
        x0 = (self.grande.width - cw) // 2
        y0 = (self.grande.height - ch) // 2
        return self.grande.crop((x0, y0, x0 + cw, y0 + ch)).resize((W, H), Image.BILINEAR)


class TomaVideo:
    def __init__(self, ruta, duracion, ffmpeg):
        cmd = [ffmpeg, "-v", "error", "-i", ruta, "-t", f"{duracion:.2f}",
               "-vf", f"scale=-2:{H},crop={W}:{H},fps={FPS}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
        crudo = subprocess.run(cmd, capture_output=True, check=True).stdout
        n = len(crudo) // (W * H * 3)
        self.cuadros = [Image.frombuffer("RGB", (W, H), crudo[i * W * H * 3:(i + 1) * W * H * 3]) for i in range(n)]

    def cuadro(self, t):
        i = min(len(self.cuadros) - 1, int(t * len(self.cuadros)))
        return self.cuadros[i]


# ---------- Texto encima ----------

def degradado():
    capa = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(capa)
    for y in range(H):
        if y < 520:
            a = int(170 * (1 - y / 520))
        elif y > H - 900:
            a = int(215 * ((y - (H - 900)) / 900))
        else:
            a = 0
        d.line([(0, y), (W, y)], fill=(11, 31, 58, a))
    return capa


def partir(texto, f, ancho_max):
    palabras, lineas, actual = texto.split(), [], ""
    d = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    for p in palabras:
        prueba = (actual + " " + p).strip()
        if d.textlength(prueba, font=f) <= ancho_max:
            actual = prueba
        else:
            lineas.append(actual)
            actual = p
    if actual:
        lineas.append(actual)
    return lineas


def capa_fija(nombre, enlace):
    """Degradado, etiqueta, titulo y pie: igual en todo el video, se dibuja una sola vez."""
    img = degradado()
    d = ImageDraw.Draw(img)
    f_chip, f_titulo = fuente(38), fuente(92)
    chip = "DESTINOS DE RD"
    ancho_chip = d.textlength(chip, font=f_chip) + 56
    d.rounded_rectangle(((W - ancho_chip) / 2, 150, (W + ancho_chip) / 2, 216), radius=33, fill=GOLD)
    d.text((W / 2, 183), chip, font=f_chip, fill=NAVY, anchor="mm")
    y = 300
    for linea in partir(nombre, f_titulo, W - 120):
        d.text((W / 2, y), linea, font=f_titulo, fill=WHITE, anchor="mm")
        y += 104
    d.text((W / 2, H - 150), enlace, font=fuente(40), fill=GOLD, anchor="mm")
    d.text((W / 2, H - 92), "Página informativa · La Bankera RD", font=fuente(36, False), fill=(214, 224, 238), anchor="mm")
    return img


def capa_leyenda(leyenda):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    f = fuente(50)
    y = H - 520
    for linea in partir(leyenda, f, W - 140)[:4]:
        d.text((W / 2, y), linea, font=f, fill=WHITE, anchor="mm")
        y += 66
    return img


def componer(cuadro, fija, leyenda, alpha):
    img = cuadro.convert("RGBA")
    img.alpha_composite(fija)
    if alpha >= 0.999:
        img.alpha_composite(leyenda)
    elif alpha > 0.001:
        tenue = leyenda.copy()
        tenue.putalpha(leyenda.getchannel("A").point(lambda v: int(v * alpha)))
        img.alpha_composite(tenue)
    return img.convert("RGB")


def main():
    args = sys.argv[1:]
    salida = None
    if "--salida" in args:
        i = args.index("--salida")
        salida = args[i + 1]
        args = args[:i] + args[i + 2:]
    destinos = leer_destinos()
    if args:
        destino = next(d for d in destinos if d["slug"] == args[0])
    else:
        # Rota en orden: el destino siguiente al del ultimo reel publicado.
        anterior = None
        ruta_json = os.path.join(reel.PUBLIC, "reel-turismo.json")
        if os.path.exists(ruta_json):
            anterior = json.load(open(ruta_json, encoding="utf-8")).get("destino")
        slugs = [d["slug"] for d in destinos]
        i = (slugs.index(anterior) + 1) % len(destinos) if anterior in slugs else 0
        destino = destinos[i]
    salida = salida or os.path.join(reel.PUBLIC, "reel-turismo.mp4")
    carpeta = os.path.dirname(os.path.abspath(salida))
    print(f"Destino: {destino['nombre']}")

    import imageio_ffmpeg
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

    # Narracion: nombre, resumen y dos atracciones (el texto antes del " — ").
    atr = [a.split(" — ")[0].strip() for a in destino["atracciones"]][:2]
    texto_voz = f"¿Conoces {destino['nombre']}? Te cuento por qué deberías ir. {destino['resumen']} "
    if atr:
        texto_voz += f"No te pierdas {' ni '.join(atr)}. "
    texto_voz += "Busca La Bankera RD en Google para descubrir más."
    voz, dur_voz = reel.generar_voz(texto_voz, os.path.join(carpeta, "voz_turismo_tmp.mp3"))
    duracion = max(16.0, dur_voz + 1.5)

    # Tomas: video del lugar (si hay) y las fotos reales del destino.
    leyendas = [destino["resumen"]] + [f["alt"] for f in destino["fotos"][1:]]
    tomas, creditos_fotos = [], []
    for foto, leyenda in zip(destino["fotos"], leyendas):
        img = reel.descargar_imagen(foto["url"])
        if img is None:
            continue
        tomas.append((TomaFoto(img), leyenda))
        creditos_fotos.append(f"{foto['autor']} ({foto['licencia']})")
    if not tomas:
        sys.exit("No se pudo descargar ninguna foto del destino.")
    dur_toma = duracion / (len(tomas) + 0)
    video = buscar_video_pixabay(destino["nombre"], carpeta, [d["nombre"] for d in destinos if d is not destino])
    if video:
        dur_toma = duracion / (len(tomas) + 1)
        tomas.insert(0, (TomaVideo(video["ruta"], dur_toma + TRANSICION, ffmpeg), destino["resumen"]))
        # El resumen ya sale sobre el video; la primera foto muestra la atraccion principal.
        tomas[1] = (tomas[1][0], atr[0] if atr else destino["nombre"])

    enlace = f"labankerard.com/turismo/{destino['slug']}"
    fija = capa_fija(destino["nombre"], enlace)
    leyendas_capa = [capa_leyenda(ley) for _, ley in tomas]
    sin_audio = salida + ".sinaudio.mp4"
    cmd = [ffmpeg, "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           # Tope de bitrate: el video se guarda en el repositorio cada dia (unos 4 MB).
           "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "26", "-maxrate", "2M", "-bufsize", "4M", "-preset", "veryfast",
           "-g", str(FPS * 2), "-keyint_min", str(FPS * 2), "-sc_threshold", "0", sin_audio]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    total = int(duracion * FPS)
    for n in range(total):
        seg = n / FPS
        i = min(len(tomas) - 1, int(seg / dur_toma))
        t = (seg - i * dur_toma) / dur_toma
        toma = tomas[i][0]
        cuadro = toma.cuadro(t)
        # Fundido con la toma siguiente en el ultimo tramo.
        resto = (i + 1) * dur_toma - seg
        if resto < TRANSICION and i + 1 < len(tomas):
            sig = tomas[i + 1][0].cuadro(0.0)
            cuadro = Image.blend(cuadro, sig, 1 - resto / TRANSICION)
        alpha = reel.ease((seg - i * dur_toma) / 0.6)
        proc.stdin.write(componer(cuadro, fija, leyendas_capa[i], alpha).tobytes())
    proc.stdin.close()
    proc.wait()

    # Audio: solo la voz (entra a los 0.4 s), con el formato que pide Facebook.
    if voz:
        subprocess.run([ffmpeg, "-y", "-v", "error", "-i", sin_audio, "-i", voz,
                        "-filter_complex", f"[1:a]adelay=400|400,apad=whole_dur={duracion:.2f}[a]", "-map", "0:v", "-map", "[a]",
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", *reel.AUDIO_FACEBOOK, "-t", f"{duracion:.2f}", salida], check=True)
        os.remove(voz)
    else:
        subprocess.run([ffmpeg, "-y", "-v", "error", "-i", sin_audio, "-c", "copy", "-movflags", "+faststart", salida], check=True)
    os.remove(sin_audio)
    if video:
        os.remove(video["ruta"])

    creditos = "Fotos: " + "; ".join(creditos_fotos) + ", vía Wikimedia Commons."
    if video:
        creditos += f" Video: {video['autor']} / Pixabay."
    caption = (
        f"🌴 ¿Conoces {destino['nombre']}? Te cuento por qué deberías ir 👇\n\n{destino['resumen']}\n\n"
        f"👉 Descubre qué hacer, dónde quedarte y cómo llegar: https://{enlace}\n\n"
        f"¿Ya lo conoces? Cuéntanos en los comentarios 👇\n\n🔎 Búscanos en Google como «La Bankera RD».\n\n{creditos}\n\n"
        f"#RepublicaDominicana #TurismoRD #{destino['nombre'].replace(' ', '')}"
    )
    fecha = (datetime.now(timezone.utc) - timedelta(hours=4)).date().isoformat()
    json.dump({"slug": f"reel-turismo-{destino['slug']}-{fecha}", "destino": destino["slug"], "fecha": fecha, "caption": caption},
              open(os.path.splitext(salida)[0] + ".json", "w", encoding="utf-8"), ensure_ascii=False)
    print(f"Listo: {salida} ({duracion:.1f} s)")


if __name__ == "__main__":
    main()
