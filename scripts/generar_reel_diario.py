#!/usr/bin/env python3
"""
Genera un reel de deportes (video vertical, 1080x1920) por cada deporte que
tenga resultados reales de ayer (hora de Republica Dominicana, UTC-4), de
entre: LIDOM, MLB, Liga Espanola, NBA. Pueden salir varios el mismo dia (ej.
MLB y futbol a la vez). El deporte que no tenga resultados ese dia no genera
nada (no se inventa contenido) y se borra su .json viejo si quedo de otro dia.

Salida (por cada deporte con resultados, <slug> = lidom|mlb|futbol|nba):
  public/reel-<slug>.mp4   - el video
  public/reel-<slug>.json  - {"slug": ..., "caption": ..., "fecha": ...}

Se necesita: pip install pillow imageio_ffmpeg edge-tts
"""
import json
import os
import subprocess
import sys
from datetime import datetime, timedelta, timezone

from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FUENTES = os.path.join(RAIZ, "lib", "fuentes")
PUBLIC = os.path.join(RAIZ, "public")

W, H = 1080, 1920
FPS = 24

NAVY = (11, 31, 58)
GOLD = (231, 166, 60)
WHITE = (255, 255, 255)
DIM = (143, 163, 191)

EQUIPOS_LIDOM_IDS = [672, 667, 671, 669, 668, 670]
NOMBRES_LIDOM = {
    672: "Tigres del Licey", 667: "Águilas Cibaeñas", 671: "Leones del Escogido",
    669: "Estrellas Orientales", 668: "Toros del Este", 670: "Gigantes del Cibao",
}
NOMBRES_MLB_ES = {
    "Arizona Diamondbacks": "Diamondbacks", "Atlanta Braves": "Bravos", "Athletics": "Atléticos",
    "Baltimore Orioles": "Orioles", "Boston Red Sox": "Medias Rojas", "Chicago Cubs": "Cachorros",
    "Chicago White Sox": "Medias Blancas", "Cincinnati Reds": "Rojos", "Cleveland Guardians": "Guardianes",
    "Colorado Rockies": "Rockies", "Detroit Tigers": "Tigres", "Houston Astros": "Astros",
    "Kansas City Royals": "Reales", "Los Angeles Angels": "Angelinos", "Los Angeles Dodgers": "Dodgers",
    "Miami Marlins": "Marlins", "Milwaukee Brewers": "Cerveceros", "Minnesota Twins": "Mellizos",
    "New York Mets": "Mets", "New York Yankees": "Yankees", "Philadelphia Phillies": "Filis",
    "Pittsburgh Pirates": "Piratas", "San Diego Padres": "Padres", "San Francisco Giants": "Gigantes",
    "Seattle Mariners": "Marineros", "St. Louis Cardinals": "Cardenales", "Tampa Bay Rays": "Rays",
    "Texas Rangers": "Rangers", "Toronto Blue Jays": "Azulejos", "Washington Nationals": "Nacionales",
}


def ayer_rd():
    return (datetime.now(timezone.utc) - timedelta(hours=4) - timedelta(days=1)).date()


def fecha_larga(fecha):
    dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
    meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
             "septiembre", "octubre", "noviembre", "diciembre"]
    return f"{dias[fecha.weekday()]}, {fecha.day} de {meses[fecha.month - 1]} de {fecha.year}"


def obtener_json(url):
    # Se usa "curl" en vez de la libreria normal de Python: algunas APIs (ej. ESPN)
    # bloquean las peticiones de urllib/requests por su huella tecnica, pero si
    # aceptan las de curl.
    resultado = subprocess.run(["curl", "-s", "-m", "20", url], capture_output=True, check=True)
    return json.loads(resultado.stdout.decode("utf-8"))


def juegos_lidom(fecha_iso):
    d = obtener_json(f"https://statsapi.mlb.com/api/v1/schedule?sportId=17&date={fecha_iso}&hydrate=team,decisions")
    fechas = d.get("dates") or []
    juegos = fechas[0]["games"] if fechas else []
    resultado = []
    for g in juegos:
        if g["status"]["abstractGameState"] != "Final":
            continue
        a, h = g["teams"]["away"], g["teams"]["home"]
        if a["team"]["id"] not in EQUIPOS_LIDOM_IDS or h["team"]["id"] not in EQUIPOS_LIDOM_IDS:
            continue
        if a.get("score") is None:
            continue
        visitante, local = NOMBRES_LIDOM[a["team"]["id"]], NOMBRES_LIDOM[h["team"]["id"]]
        juego = (visitante, a["score"], local, h["score"])
        resultado.append(juego)
        # LIDOM usa la misma API que MLB (sportId distinto): se reutiliza el
        # mismo resumen narrado (ganador, lanzador ganador/salvamento, jonrones).
        # No tiene seriesStatus hidratado, asi que esa parte simplemente no sale.
        try:
            RESUMEN_BEISBOL[juego] = resumen_juego_mlb(g, visitante, local)
        except Exception as error:
            print(f"  Sin resumen de LIDOM para {juego}: {error}")
    return resultado


# Frases del resumen de cada juego para la voz (ganador, jonrones/goles,
# lideres de puntos, series), una por deporte. En pantalla solo salen los
# marcadores; esto lo cuenta la narracion, como lo haria un cronista.
RESUMEN_BEISBOL = {}  # MLB y LIDOM comparten formato (misma API)
RESUMEN_NBA = {}
RESUMEN_FUTBOL = {}


def apellido(nombre_completo):
    partes = nombre_completo.split()
    if len(partes) > 1 and partes[-1].rstrip(".") in ("Jr", "Sr", "II", "III"):
        return " ".join(partes[-2:])
    return partes[-1] if partes else nombre_completo


def unir(lista):
    return lista[0] if len(lista) == 1 else ", ".join(lista[:-1]) + " y " + lista[-1]


def resumen_juego_mlb(g, visitante, local):
    a, h = g["teams"]["away"], g["teams"]["home"]
    if a["score"] > h["score"]:
        ganador, perdedor, pg, pp = visitante, local, a["score"], h["score"]
    else:
        ganador, perdedor, pg, pp = local, visitante, h["score"], a["score"]
    frases = [f"Los {ganador} le ganaron {pg} a {pp} a los {perdedor}."]

    dec = g.get("decisions") or {}
    if dec.get("winner"):
        frase = f"Ganó {dec['winner']['fullName']}"
        if dec.get("save"):
            frase += f", y salvó {dec['save']['fullName']}"
        frases.append(frase + ".")

    box = obtener_json(f"https://statsapi.mlb.com/api/v1/game/{g['gamePk']}/boxscore")
    jonroneros = []
    for lado in ("away", "home"):
        for p in (box.get("teams", {}).get(lado, {}).get("players") or {}).values():
            hr = (p.get("stats", {}).get("batting") or {}).get("homeRuns") or 0
            if hr:
                jonroneros.append(apellido(p["person"]["fullName"]) + (" dos veces" if hr == 2 else (f" {hr} veces" if hr > 2 else "")))
    if jonroneros:
        frases.append(f"Jonrón de {unir(jonroneros)}." if len(jonroneros) == 1 else f"Dieron jonrón {unir(jonroneros)}.")

    serie = g.get("seriesStatus") or {}
    if g.get("gameType") in ("F", "D", "L", "W") and serie.get("wins") is not None:
        lider = NOMBRES_MLB_ES.get((serie.get("winningTeam") or {}).get("name", ""), "")
        w, l = serie["wins"], serie["losses"]
        if serie.get("isTied"):
            frases.append(f"La serie está empatada a {w}.")
        elif serie.get("isOver") and lider:
            frases.append(f"¡Los {lider} ganan la serie {w} a {l}!")
        elif lider:
            frases.append(f"Los {lider} están arriba {w} a {l} en la serie.")
    return " ".join(frases)


def juegos_mlb(fecha_iso):
    d = obtener_json(f"https://statsapi.mlb.com/api/v1/schedule?sportId=1&date={fecha_iso}&hydrate=team,decisions,seriesStatus")
    fechas = d.get("dates") or []
    juegos = fechas[0]["games"] if fechas else []
    resultado = []
    for g in juegos:
        if g["status"]["abstractGameState"] != "Final":
            continue
        a, h = g["teams"]["away"], g["teams"]["home"]
        if a.get("score") is None:
            continue
        nombre = lambda t: NOMBRES_MLB_ES.get(t["team"]["name"], t["team"].get("teamName", t["team"]["name"]))
        juego = (nombre(a), a["score"], nombre(h), h["score"])
        resultado.append(juego)
        try:
            RESUMEN_BEISBOL[juego] = resumen_juego_mlb(g, nombre(a), nombre(h))
        except Exception as error:
            print(f"  Sin resumen para {juego}: {error}")
    # Con muchos juegos, se priorizan los mas renidos para un reel corto.
    resultado.sort(key=lambda x: abs(x[1] - x[3]))
    return resultado[:6]


def lider_puntos_nba(competidor):
    for categoria in competidor.get("leaders") or []:
        if categoria.get("name") == "points" and categoria.get("leaders"):
            l = categoria["leaders"][0]
            return apellido(l["athlete"]["fullName"]), l["displayValue"]
    return None, None


def resumen_juego_nba(competidor_visitante, competidor_local, visitante, local, pv, pl):
    ganador, perdedor, pg, pp = (visitante, local, pv, pl) if pv > pl else (local, visitante, pl, pv)
    diferencia = pg - pp
    if diferencia <= 5:
        frase_resultado = f"{ganador} se llevó un partido muy reñido, {pg}-{pp} sobre {perdedor}."
    elif diferencia >= 20:
        frase_resultado = f"{ganador} arrasó {pg}-{pp} a {perdedor}."
    else:
        frase_resultado = f"{ganador} venció {pg}-{pp} a {perdedor}."
    frases = [frase_resultado]

    nombre_v, pts_v = lider_puntos_nba(competidor_visitante)
    nombre_l, pts_l = lider_puntos_nba(competidor_local)
    lideres = []
    if nombre_v:
        lideres.append(f"{nombre_v} con {pts_v} puntos por {visitante}")
    if nombre_l:
        lideres.append(f"{nombre_l} con {pts_l} puntos por {local}")
    if lideres:
        frases.append(f"Lideró {unir(lideres)}." if len(lideres) == 1 else f"Lideraron {unir(lideres)}.")
    return " ".join(frases)


def resumen_juego_futbol(detalles, ids_equipos, visitante, local, pv, pl):
    goles = [
        ev for ev in (detalles or [])
        if ev.get("scoringPlay") and (ev.get("type") or {}).get("text") == "Goal"
    ]
    goles.sort(key=lambda ev: (ev.get("clock") or {}).get("value") or 0)

    if pv == pl:
        frase_resultado = f"{visitante} y {local} empataron {pv}-{pl}."
    else:
        ganador, perdedor, pg, pp = (visitante, local, pv, pl) if pv > pl else (local, visitante, pl, pv)
        frase_resultado = (
            f"{ganador} goleó {pg}-{pp} a {perdedor}." if pg - pp >= 3
            else f"{ganador} venció {pg}-{pp} a {perdedor}."
        )
    frases = [frase_resultado]

    if goles:
        descripciones = []
        for ev in goles:
            jugadores = ev.get("athletesInvolved") or []
            nombre = apellido(jugadores[0]["displayName"]) if jugadores else "un jugador"
            minuto = (ev.get("clock") or {}).get("displayValue", "")
            equipo = visitante if (ev.get("team") or {}).get("id") == ids_equipos.get("away") else local
            descripciones.append(f"{nombre} ({minuto}, {equipo})")
        frases.append(f"Gol de {unir(descripciones)}." if len(descripciones) == 1 else f"Goles de {unir(descripciones)}.")
    return " ".join(frases)


def juegos_futbol(fecha_iso_compacta):
    d = obtener_json(f"https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard?dates={fecha_iso_compacta}")
    resultado = []
    for e in d.get("events", []):
        if e["status"]["type"]["state"] != "post":
            continue
        comp = e["competitions"][0]
        c = comp["competitors"]
        h = next(x for x in c if x["homeAway"] == "home")
        a = next(x for x in c if x["homeAway"] == "away")
        visitante, local = a["team"]["shortDisplayName"], h["team"]["shortDisplayName"]
        pv, pl = int(a["score"]), int(h["score"])
        juego = (visitante, pv, local, pl)
        resultado.append(juego)
        try:
            ids_equipos = {"away": a["team"]["id"], "home": h["team"]["id"]}
            RESUMEN_FUTBOL[juego] = resumen_juego_futbol(comp.get("details"), ids_equipos, visitante, local, pv, pl)
        except Exception as error:
            print(f"  Sin resumen de futbol para {juego}: {error}")
    return resultado


def juegos_nba(fecha_iso_compacta):
    d = obtener_json(f"https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates={fecha_iso_compacta}")
    resultado = []
    for e in d.get("events", []):
        if e["status"]["type"]["state"] != "post":
            continue
        c = e["competitions"][0]["competitors"]
        h = next(x for x in c if x["homeAway"] == "home")
        a = next(x for x in c if x["homeAway"] == "away")
        visitante, local = a["team"]["shortDisplayName"], h["team"]["shortDisplayName"]
        pv, pl = int(a["score"]), int(h["score"])
        juego = (visitante, pv, local, pl)
        resultado.append(juego)
        try:
            RESUMEN_NBA[juego] = resumen_juego_nba(a, h, visitante, local, pv, pl)
        except Exception as error:
            print(f"  Sin resumen de NBA para {juego}: {error}")
    return resultado


def elegir_deportes(fecha):
    # Antes se usaba solo el primer deporte con resultados; ahora se generan
    # TODOS los que tengan resultados reales de ayer, cada uno en su propio
    # archivo, para poder publicar varios reels el mismo dia (ej. MLB y futbol).
    fecha_iso = fecha.isoformat()
    fecha_compacta = fecha.strftime("%Y%m%d")
    candidatos = [
        ("lidom", "LIDOM", "labankerard.com/lidom", "#LIDOM #BeisbolDominicano", lambda: juegos_lidom(fecha_iso)),
        ("mlb", "BÉISBOL MLB", "labankerard.com/beisbol", "#MLB #GrandesLigas", lambda: juegos_mlb(fecha_iso)),
        ("futbol", "LIGA ESPAÑOLA", "labankerard.com/futbol", "#LaLiga #Futbol", lambda: juegos_futbol(fecha_compacta)),
        ("nba", "NBA", "labankerard.com/nba", "#NBA #Baloncesto", lambda: juegos_nba(fecha_compacta)),
    ]
    elegidos = []
    for slug, titulo, enlace, hashtags, fn in candidatos:
        try:
            juegos = fn()
        except Exception as e:
            print(f"  (aviso) {slug} fallo al consultar: {e}", file=sys.stderr)
            continue
        if juegos:
            elegidos.append((slug, titulo, enlace, hashtags, juegos))
    return elegidos


# ---------- Animacion ----------

def ease(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def fade_slide(alpha_t, dur=0.5, slide=30):
    a = ease(alpha_t / dur) if dur > 0 else 1.0
    y_off = int((1 - a) * slide)
    return a, y_off


def blend_text(base_img, xy, text, font, color, alpha, anchor="mm", y_off=0):
    if alpha <= 0.001:
        return
    layer = Image.new("RGBA", base_img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.text((xy[0], xy[1] + y_off), text, font=font, fill=color + (int(255 * alpha),), anchor=anchor)
    base_img.alpha_composite(layer)


def generar_video(titulo, subtitulo, enlace, juegos, salida, voz_mp3=None, duracion_voz=0.0):
    b = lambda s: ImageFont.truetype(os.path.join(FUENTES, "Manrope-ExtraBold.ttf"), s)
    r = lambda s: ImageFont.truetype(os.path.join(FUENTES, "Manrope-Regular.ttf"), s)

    dur = max(20 + len(juegos) * 0.55 + 4, duracion_voz + 2.0)
    n_frames = int(FPS * dur)

    def render(t):
        im = Image.new("RGBA", (W, H), NAVY + (255,))
        d = ImageDraw.Draw(im)
        d.rounded_rectangle((36, 60, W - 36, H - 60), radius=28, outline=GOLD, width=4)
        d.text((W // 2, 190), "⚾" if "béisbol" in titulo.lower() or "lidom" in titulo.lower() or "mlb" in titulo.lower()
                else ("🏀" if "nba" in titulo.lower() else "⚽"), font=b(90), fill=GOLD, anchor="mm")
        d.text((W // 2, 310), titulo, font=b(60 if len(titulo) < 14 else 46), fill=WHITE, anchor="mm")
        d.text((W // 2, 385), subtitulo, font=b(46), fill=GOLD, anchor="mm")
        d.line((260, 440, W - 260, 440), fill=(30, 77, 140), width=4)

        inicio, espacio, y0, lh = 0.6, 0.55, 570, 190
        for i, (an, asc, hn, hsc) in enumerate(juegos):
            ai, yoi = (1.0, 0) if i == 0 else fade_slide(t - (inicio + i * espacio), dur=0.5, slide=60)
            if ai <= 0.001:
                continue
            gana_v = asc > hsc
            empate = asc == hsc
            yy = y0 + i * lh
            layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
            dl = ImageDraw.Draw(layer)
            dl.rounded_rectangle((80, yy - 65 + yoi, W - 80, yy + 65 + yoi), radius=16, fill=(19, 44, 80, int(255 * ai)))
            im.alpha_composite(layer)
            colA = DIM if empate else (GOLD if gana_v else DIM)
            colH = DIM if empate else (DIM if gana_v else GOLD)
            blend_text(im, (140, yy), an, r(34) if empate else (b(38) if gana_v else r(34)), colA, ai, anchor="lm", y_off=yoi)
            blend_text(im, (W // 2, yy), f"{asc} - {hsc}", b(46), WHITE, ai, y_off=yoi)
            blend_text(im, (W - 140, yy), hn, r(34) if empate else (r(34) if gana_v else b(38)), colH, ai, anchor="rm", y_off=yoi)

        inicio3 = inicio + len(juegos) * espacio + 1.0
        a3, yo3 = fade_slide(t - inicio3, dur=0.6, slide=30)
        blend_text(im, (W // 2, 1720), enlace, b(44), GOLD, a3, y_off=yo3)
        a4, yo4 = fade_slide(t - inicio3 - 0.3, dur=0.6, slide=20)
        blend_text(im, (W // 2, 1790), "Página informativa · La Bankera RD", r(28), DIM, a4, y_off=yo4)
        return im.convert("RGB")

    import imageio_ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    salida_sin_audio = salida + ".sinaudio.mp4"
    cmd = [ffmpeg_exe, "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "veryfast",
           # Facebook pide un fotograma clave cada 2 s (GOP cerrado de 2 a 5 s).
           "-g", str(FPS * 2), "-keyint_min", str(FPS * 2), "-sc_threshold", "0", salida_sin_audio]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for i in range(n_frames):
        proc.stdin.write(render(i / FPS).tobytes())
    proc.stdin.close()
    proc.wait()

    agregar_melodia_anuncio(ffmpeg_exe, salida_sin_audio, salida, dur, voz_mp3)
    os.remove(salida_sin_audio)
    return dur


# Requisitos de audio de los Reels de Facebook: AAC estereo a 48 kHz. Con el
# audio a 24 kHz mono (lo que sale de la voz) Facebook puede procesar mal el reel.
# faststart pone el indice del video al principio del archivo, como pide Meta.
AUDIO_FACEBOOK = ["-ar", "48000", "-ac", "2", "-movflags", "+faststart"]


def agregar_melodia_anuncio(ffmpeg_exe, video_sin_audio, salida, duracion_video, voz_mp3=None):
    # Melodia tipo fanfarria de resultado/premio, generada con tonos
    # sintetizados, sin usar ninguna pista con derechos de autor. Cada nota
    # lleva su fundamental mas 2 armonicos mas suaves (para que suene a
    # campana/trompeta, no a pitido de prueba), con entrada y salida suaves
    # para que no se oiga como un "beep" seco, y un poco de eco para que se
    # sienta mas "producido". La frase se repite en loop (con un pequeño
    # espacio de silencio entre repeticiones) durante todo el video, no solo
    # al principio.
    carpeta_tmp = os.path.dirname(video_sin_audio)
    notas_wav = os.path.join(carpeta_tmp, "notas_tmp.wav")
    notas_con_espacio_wav = os.path.join(carpeta_tmp, "notas_espacio_tmp.wav")
    melodia_wav = os.path.join(carpeta_tmp, "melodia_tmp.wav")

    # Fanfarria ascendente: Do-Mi-Sol-Do(agudo)-Sol-Do(agudo, sostenida).
    NOTAS = [
        (523.25, 0.13), (659.25, 0.13), (783.99, 0.13),
        (1046.50, 0.16), (783.99, 0.13), (1046.50, 0.70),
    ]
    ARMONICOS = [(1.0, 1.0), (2.0, 0.30), (3.0, 0.12)]  # (multiplo de frecuencia, volumen relativo)

    entradas = []
    filtros = []
    idx_entrada = 0
    for i, (frecuencia, dur_nota) in enumerate(NOTAS):
        etiquetas_armonico = []
        for mult, vol in ARMONICOS:
            entradas += ["-f", "lavfi", "-i", f"sine=frequency={frecuencia * mult}:duration={dur_nota}"]
            etiqueta = f"h{i}_{mult}"
            filtros.append(f"[{idx_entrada}]volume={vol}[{etiqueta}]")
            etiquetas_armonico.append(f"[{etiqueta}]")
            idx_entrada += 1
        fade_salida = max(dur_nota - 0.04, 0.01)
        filtros.append(
            "".join(etiquetas_armonico)
            + f"amix=inputs={len(ARMONICOS)}:duration=first:dropout_transition=0,"
            + f"afade=t=in:d=0.015,afade=t=out:st={fade_salida}:d=0.04[nota{i}]"
        )
    filtros.append("".join(f"[nota{i}]" for i in range(len(NOTAS))) + f"concat=n={len(NOTAS)}:v=0:a=1,aecho=0.6:0.3:60:0.25,volume=4[out]")

    subprocess.run(
        [ffmpeg_exe, "-y", *entradas, "-filter_complex", ";".join(filtros), "-map", "[out]", notas_wav],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True,
    )
    # Pequeño espacio de silencio antes de repetir la frase, para que el loop
    # no suene como un corte abrupto.
    subprocess.run(
        [ffmpeg_exe, "-y", "-i", notas_wav, "-af", "apad=pad_dur=0.35", notas_con_espacio_wav],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True,
    )
    subprocess.run(
        [ffmpeg_exe, "-y", "-stream_loop", "-1", "-i", notas_con_espacio_wav, "-t", str(duracion_video), melodia_wav],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True,
    )
    if voz_mp3:
        # Con narración: la melodía baja a un fondo suave y la voz entra a los 0.4 s.
        subprocess.run(
            [ffmpeg_exe, "-y", "-i", video_sin_audio, "-i", melodia_wav, "-i", voz_mp3,
             "-filter_complex",
             "[1:a]volume=0.22[fondo];[2:a]adelay=400|400,volume=1.6[voz];[fondo][voz]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[a]",
             "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", *AUDIO_FACEBOOK, "-shortest", salida],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True,
        )
    else:
        subprocess.run(
            [ffmpeg_exe, "-y", "-i", video_sin_audio, "-i", melodia_wav, "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", *AUDIO_FACEBOOK, "-shortest", salida],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True,
        )
    os.remove(notas_wav)
    os.remove(notas_con_espacio_wav)
    os.remove(melodia_wav)


VOZ = "es-MX-DaliaNeural"  # voz elegida por el dueño para todos los reels (alegre y clara)
NOMBRE_HABLADO = {"lidom": "la pelota invernal dominicana", "mlb": "Grandes Ligas", "futbol": "LaLiga española", "nba": "la NBA"}


RESUMENES_POR_DEPORTE = {"mlb": RESUMEN_BEISBOL, "lidom": RESUMEN_BEISBOL, "nba": RESUMEN_NBA, "futbol": RESUMEN_FUTBOL}


def texto_narracion(slug, juegos):
    partes = [f"Esto fue lo que pasó ayer en {NOMBRE_HABLADO.get(slug, slug)}."]
    resumen_deporte = RESUMENES_POR_DEPORTE.get(slug, {})
    for juego in juegos:
        visitante, pv, local, pl = juego
        if juego in resumen_deporte:
            partes.append(resumen_deporte[juego])
        elif pv == pl:
            partes.append(f"{visitante} y {local} empataron a {pv}.")
        elif pv > pl:
            partes.append(f"{visitante} {pv}, {local} {pl}.")
        else:
            partes.append(f"{local} {pl}, {visitante} {pv}.")
    partes.append("¿Y tú, quién crees que gana hoy? Déjalo en los comentarios, y síguenos para tener los resultados cada mañana.")
    return " ".join(partes)


def generar_voz(texto, salida_mp3):
    """Narración con la voz de Dalia. Si el servicio de voz falla, el reel sale igual sin voz."""
    try:
        import asyncio
        import edge_tts

        async def hablar():
            await edge_tts.Communicate(texto, VOZ, rate="+8%", pitch="+6Hz").save(salida_mp3)

        asyncio.run(hablar())
        import imageio_ffmpeg
        sonda = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-i", salida_mp3], capture_output=True, text=True)
        import re
        m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", sonda.stderr)
        duracion = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3)) if m else 0.0
        return salida_mp3, duracion
    except Exception as error:
        print(f"  Sin voz (no se pudo generar: {error}); el reel sale solo con música.")
        return None, 0.0


def construir_caption(titulo, subtitulo, fecha, enlace, hashtags):
    return (
        f"{titulo}: {subtitulo}\n\nResultados de {fecha_larga(fecha)}.\n\n"
        f"¿Y tú, quién crees que gana hoy? Déjalo en los comentarios 👇\n\n"
        f"👉 Síguenos para recibir los resultados cada mañana.\n\n"
        f"Más en https://{enlace}\n\nPágina informativa de La Bankera RD.\n\n{hashtags}"
    )


TODOS_LOS_SLUGS = ["lidom", "mlb", "futbol", "nba"]


def construir_caption_resumen(titulos, fecha):
    return (
        f"Resumen deportivo: {unir(titulos)}\n\nResultados de {fecha_larga(fecha)}.\n\n"
        f"👉 Síguenos para recibir los resultados cada mañana.\n\n"
        f"Más en https://labankerard.com\n\nPágina informativa de La Bankera RD.\n\n"
        f"#Deportes #ResumenDeportivo #RepublicaDominicana"
    )


# Une los videos individuales (ya generados arriba) en un solo video mas
# largo, para el programa de monetizacion de Facebook que pide videos
# normales de 3+ minutos (los reels no aplican para ese programa). Se
# concatena con copia directa de flujos (sin recodificar): los 4 videos
# salen siempre del mismo generar_video(), con el mismo codec/resolucion/fps,
# asi que es seguro.
def generar_resumen_deportivo(elegidos, duraciones, fecha):
    import imageio_ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    lista_path = os.path.join(PUBLIC, "resumen_concat_tmp.txt")
    with open(lista_path, "w", encoding="utf-8") as f:
        for slug, *_ in elegidos:
            ruta = os.path.join(PUBLIC, f"reel-{slug}.mp4").replace("\\", "/")
            f.write(f"file '{ruta}'\n")

    salida = os.path.join(PUBLIC, "resumen-deportivo.mp4")
    subprocess.run(
        [ffmpeg_exe, "-y", "-f", "concat", "-safe", "0", "-i", lista_path, "-c", "copy", salida],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    os.remove(lista_path)

    duracion_total = sum(duraciones.values())
    titulos = [titulo for _, titulo, *_ in elegidos]
    caption = construir_caption_resumen(titulos, fecha)
    slug_publicacion = f"resumen-deportivo-{fecha.isoformat()}"
    with open(os.path.join(PUBLIC, "resumen-deportivo.json"), "w", encoding="utf-8") as f:
        json.dump(
            {"slug": slug_publicacion, "caption": caption, "fecha": fecha.isoformat(), "duracion": duracion_total},
            f, ensure_ascii=False,
        )

    print(f"  Resumen deportivo generado: {salida} ({duracion_total:.0f}s), slug: {slug_publicacion}")


def main():
    fecha = ayer_rd()
    elegidos = elegir_deportes(fecha)

    slugs_con_resultados = {e[0] for e in elegidos}
    # Se limpia el .json de cualquier deporte que NO tenga resultados hoy, para
    # que el publicador no reuse uno viejo de otro dia (el .mp4 se deja, pesa
    # poco y se sobrescribe la proxima vez que ese deporte si tenga resultados).
    for slug in TODOS_LOS_SLUGS:
        if slug not in slugs_con_resultados:
            ruta_json = os.path.join(PUBLIC, f"reel-{slug}.json")
            if os.path.exists(ruta_json):
                os.remove(ruta_json)

    if not elegidos:
        print("Sin resultados reales de ningun deporte para " + fecha.isoformat() + ". No se genera nada.")
        # Sin deportes hoy tampoco hay resumen combinado que publicar.
        ruta_resumen_json = os.path.join(PUBLIC, "resumen-deportivo.json")
        if os.path.exists(ruta_resumen_json):
            os.remove(ruta_resumen_json)
        return

    duraciones = {}
    for slug, titulo, enlace, hashtags, juegos in elegidos:
        subtitulo = "¿Quién ganó ayer?" if slug != "futbol" else "Así quedó la jornada"
        print(f"Generando {slug} ({len(juegos)} juegos)...")

        salida_video = os.path.join(PUBLIC, f"reel-{slug}.mp4")
        voz_mp3, duracion_voz = generar_voz(texto_narracion(slug, juegos), os.path.join(PUBLIC, f"voz-{slug}.tmp.mp3"))
        duraciones[slug] = generar_video(titulo, subtitulo, enlace, juegos, salida_video, voz_mp3, duracion_voz)
        if voz_mp3 and os.path.exists(voz_mp3):
            os.remove(voz_mp3)

        caption = construir_caption(titulo, subtitulo, fecha, enlace, hashtags)
        slug_publicacion = f"reel-{slug}-{fecha.isoformat()}"
        with open(os.path.join(PUBLIC, f"reel-{slug}.json"), "w", encoding="utf-8") as f:
            json.dump({"slug": slug_publicacion, "caption": caption, "fecha": fecha.isoformat()}, f, ensure_ascii=False)

        print(f"  Listo: {salida_video} ({os.path.getsize(salida_video)} bytes), slug: {slug_publicacion}")

    # El resumen combinado solo tiene sentido con 2+ deportes (con 1 solo
    # seria identico al reel individual de ese deporte).
    ruta_resumen_json = os.path.join(PUBLIC, "resumen-deportivo.json")
    if len(elegidos) >= 2:
        try:
            generar_resumen_deportivo(elegidos, duraciones, fecha)
        except Exception as error:
            print(f"  (aviso) no se pudo generar el resumen deportivo combinado: {error}", file=sys.stderr)
    elif os.path.exists(ruta_resumen_json):
        os.remove(ruta_resumen_json)


if __name__ == "__main__":
    main()
