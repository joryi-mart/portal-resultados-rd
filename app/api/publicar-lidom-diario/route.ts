import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";
import { generarImagenPosicionesLidom, generarImagenJuegosLidom, NOMBRE_CORTO_LIDOM } from "@/lib/imagenLidom";

// Publica en Facebook la tabla de posiciones y los juegos de hoy de LIDOM,
// con datos reales de la API oficial de MLB (sportId=17, liga 131 = Liga de
// Beisbol Dominicano). Pensada para un cron diario; si LIDOM no tiene
// temporada activa, no publica nada. Se activa con ?clave=<REEL_DIARIO_SECRET
// o CRON_SECRET>, mismo mecanismo que el resto de publicaciones automaticas.
export const dynamic = "force-dynamic";

const LIGA_LIDOM = 131;

function claveValida(recibida: string | null) {
  if (!recibida) return false;
  const b = Buffer.from(recibida.trim());
  return [process.env.REEL_DIARIO_SECRET, process.env.CRON_SECRET].some(function (esperada) {
    const limpia = (esperada || "").trim();
    if (!limpia || limpia.length < 12) return false;
    const a = Buffer.from(limpia);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

function hoyRD() {
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return ahoraRD.toISOString().slice(0, 10);
}

function fechaLarga(fechaISO: string) {
  const d = new Date(fechaISO + "T00:00:00");
  const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

async function obtenerPosiciones() {
  const res = await fetch(`https://statsapi.mlb.com/api/v1/standings?leagueId=${LIGA_LIDOM}&season=${new Date().getFullYear()}&standingsTypes=regularSeason`);
  if (!res.ok) throw new Error(`Error MLB API (posiciones): ${res.status}`);
  const data = await res.json();
  const registros = data.records?.[0]?.teamRecords || [];
  return registros
    .map(function (tr: any) {
      return {
        equipoId: tr.team?.id,
        nombre: NOMBRE_CORTO_LIDOM[tr.team?.id] || tr.team?.name || "",
        juegosJugados: tr.gamesPlayed,
        victorias: tr.wins,
        derrotas: tr.losses,
        porcentaje: tr.winningPercentage,
        diferencia: tr.gamesBack,
      };
    })
    .sort(function (a: any, b: any) { return (b.victorias || 0) - (a.victorias || 0); });
}

async function obtenerJuegosDeHoy(fechaISO: string) {
  const res = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=17&leagueId=${LIGA_LIDOM}&date=${fechaISO}&hydrate=team,venue`);
  if (!res.ok) throw new Error(`Error MLB API (juegos): ${res.status}`);
  const data = await res.json();
  const juegos = data.dates?.[0]?.games || [];
  return juegos.map(function (g: any) {
    const idVisitante = g.teams?.away?.team?.id;
    const idLocal = g.teams?.home?.team?.id;
    const horaUTC = new Date(g.gameDate);
    const horaRD = new Date(horaUTC.getTime() - 4 * 60 * 60 * 1000);
    const hora = horaRD.toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" });
    return {
      visitante: NOMBRE_CORTO_LIDOM[idVisitante] || g.teams?.away?.team?.name || "Visitante",
      local: NOMBRE_CORTO_LIDOM[idLocal] || g.teams?.home?.team?.name || "Local",
      venue: g.venue?.name || "",
      hora: `${hora} (hora RD)`,
    };
  });
}

async function crearPublicacion(caption: string, imagen: Buffer, nombreArchivo: string) {
  const formData = new FormData();
  formData.append("source", new Blob([new Uint8Array(imagen)], { type: "image/png" }), nombreArchivo);
  formData.append("caption", caption);
  formData.append("published", "true");
  formData.append("access_token", process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "");

  const res = await fetch(`https://graph.facebook.com/v19.0/me/photos`, { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error creando la publicación en Facebook");
  return data.id as string;
}

async function yaPublicado(slug: string) {
  const { data } = await supabase.from("publicaciones_facebook").select("id, post_id").eq("loteria_slug", slug).limit(1);
  return data && data.length > 0 ? data[0].post_id : null;
}

async function marcarPublicado(slug: string, fechaISO: string, postId: string, mensaje: string) {
  await supabase.from("publicaciones_facebook").insert({ loteria_slug: slug, fecha: fechaISO, post_id: postId, mensaje });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (!claveValida(url.searchParams.get("clave"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const prueba = url.searchParams.get("prueba") === "1";
    if (!prueba && !process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });
    }

    const fecha = hoyRD();
    const fechaTexto = fechaLarga(fecha);
    const resultado: Record<string, any> = {};

    // --- Tabla de posiciones ---
    const slugPosiciones = `lidom-posiciones-${fecha}`;
    const posicionesPrevias = !prueba ? await yaPublicado(slugPosiciones) : null;
    if (posicionesPrevias) {
      resultado.posiciones = { resultado: "ya publicado antes", post_id: posicionesPrevias };
    } else {
      const posiciones = await obtenerPosiciones();
      if (posiciones.length > 0) {
        if (prueba) {
          resultado.posiciones = { posiciones };
        } else {
          const imagen = await generarImagenPosicionesLidom(posiciones, fechaTexto);
          const caption =
            `🏆 TABLA DE POSICIONES — LIDOM\n${fechaTexto}\n\n` +
            posiciones.map(function (p: any, i: number) { return `${i + 1}. ${p.nombre}: ${p.victorias}-${p.derrotas} (${p.porcentaje})`; }).join("\n") +
            `\n\n👉 Más en https://labankerard.com/lidom\n\n🔎 Búscanos en Google como «La Bankera RD».\nPágina informativa.\n\n#LIDOM #BeisbolDominicano`;
          const postId = await crearPublicacion(caption, imagen, "lidom-posiciones.png");
          await marcarPublicado(slugPosiciones, fecha, postId, caption);
          resultado.posiciones = { resultado: "publicado", post_id: postId };
        }
      } else {
        resultado.posiciones = { resultado: "sin datos de posiciones" };
      }
    }

    // --- Juegos de hoy ---
    const slugJuegos = `lidom-juegos-${fecha}`;
    const juegosPrevios = !prueba ? await yaPublicado(slugJuegos) : null;
    if (juegosPrevios) {
      resultado.juegos = { resultado: "ya publicado antes", post_id: juegosPrevios };
    } else {
      const juegos = await obtenerJuegosDeHoy(fecha);
      if (juegos.length > 0) {
        if (prueba) {
          resultado.juegos = { juegos };
        } else {
          const imagen = await generarImagenJuegosLidom(juegos, fechaTexto);
          const caption =
            `⚾ JUEGOS DE HOY — LIDOM\n${fechaTexto}\n\n` +
            juegos.map(function (j: any) { return `${j.visitante} @ ${j.local} — ${j.hora}`; }).join("\n") +
            `\n\n👉 Resultados en vivo en https://labankerard.com/lidom\n\n🔎 Búscanos en Google como «La Bankera RD».\nPágina informativa.\n\n#LIDOM #BeisbolDominicano`;
          const postId = await crearPublicacion(caption, imagen, "lidom-juegos.png");
          await marcarPublicado(slugJuegos, fecha, postId, caption);
          resultado.juegos = { resultado: "publicado", post_id: postId };
        }
      } else {
        resultado.juegos = { resultado: "sin juegos hoy" };
      }
    }

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando LIDOM diario", detalle: error.message }, { status: 500 });
  }
}
