import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";

// Publica los reels de deportes del dia: por cada deporte (lidom, mlb, futbol,
// nba) revisa si existen public/reel-<deporte>.mp4 + .json (generados por
// scripts/generar_reel_diario.py) y los sube a Facebook, uno por uno. Puede
// publicar varios el mismo dia (ej. MLB y futbol a la vez). Pensada para que
// la llame un cron programado cada cierto tiempo. Se activa con
// ?clave=<REEL_DIARIO_SECRET o CRON_SECRET>.
export const dynamic = "force-dynamic";

const DEPORTES = ["lidom", "mlb", "futbol", "nba"];

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

async function iniciarSesion(token: string) {
  const res = await fetch(`https://graph.facebook.com/v21.0/me/video_reels?upload_phase=start&access_token=${token}`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error iniciando la sesion de carga del reel");
  return data.video_id as string;
}

async function subirVideo(videoId: string, fileUrl: string, token: string) {
  const res = await fetch(`https://rupload.facebook.com/video-upload/v21.0/${videoId}`, {
    method: "POST",
    headers: { Authorization: `OAuth ${token}`, file_url: fileUrl },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || "Error subiendo el video del reel");
}

async function publicarReel(videoId: string, descripcion: string, token: string) {
  const res = await fetch(`https://graph.facebook.com/v21.0/me/video_reels`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ upload_phase: "finish", video_id: videoId, video_state: "PUBLISHED", description: descripcion, access_token: token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error publicando el reel");
  return data;
}

// Historias de la pagina: mismo flujo de 3 pasos que el reel, pero en
// /video_stories. Facebook no deja reusar el video del reel, asi que se sube
// otra vez desde la misma URL. Las historias no aceptan videos de mas de 60 s.
async function publicarHistoria(fileUrl: string, token: string) {
  const inicio = await fetch(`https://graph.facebook.com/v21.0/me/video_stories?upload_phase=start&access_token=${token}`, { method: "POST" });
  const datosInicio = await inicio.json();
  if (!inicio.ok) throw new Error(datosInicio.error?.message || "Error iniciando la carga de la historia");
  const videoId = datosInicio.video_id as string;

  await subirVideo(videoId, fileUrl, token);

  const res = await fetch(`https://graph.facebook.com/v21.0/me/video_stories`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ upload_phase: "finish", video_id: videoId, access_token: token }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || "Error publicando la historia");
  return { videoId, post_id: data.post_id as string | undefined };
}

// Publica el reel del deporte tambien como historia, una sola vez por reel
// (se marca en publicaciones_facebook con el slug + "-historia"). Si falla,
// no afecta al reel: el error sale aparte en la respuesta.
async function historiaDeporte(deporte: string, meta: { slug: string; caption: string; fecha: string }, token: string) {
  const slugHistoria = `${meta.slug}-historia`;
  const { data: yaPublicada, error: errorConsulta } = await supabase
    .from("publicaciones_facebook")
    .select("id")
    .eq("loteria_slug", slugHistoria)
    .limit(1);
  if (errorConsulta) throw new Error(errorConsulta.message);
  if (yaPublicada && yaPublicada.length > 0) return "ya publicada antes";

  const historia = await publicarHistoria(`https://labankerard.com/reel-${deporte}.mp4`, token);
  const { error: errorInsert } = await supabase
    .from("publicaciones_facebook")
    .insert({ loteria_slug: slugHistoria, fecha: meta.fecha, post_id: historia.post_id || historia.videoId, mensaje: "Historia: " + meta.caption });
  if (errorInsert) throw new Error(errorInsert.message);
  return historia;
}

async function intentarHistoria(deporte: string, meta: { slug: string; caption: string; fecha: string }, token: string) {
  try {
    return await historiaDeporte(deporte, meta, token);
  } catch (error: any) {
    return { error: "Error publicando la historia en Facebook", detalle: error.message };
  }
}

async function publicarDeporte(deporte: string, token: string) {
  // Si todavia no existe el reel de este deporte (o la web devuelve su pagina
  // normal en vez de un 404 limpio para el archivo faltante), se trata igual:
  // no hay nada que publicar hoy para este deporte.
  const metaRes = await fetch(`https://labankerard.com/reel-${deporte}.json`, { cache: "no-store" });
  const tipo = metaRes.headers.get("content-type") || "";
  if (!metaRes.ok || !tipo.includes("json")) {
    return { deporte, resultado: "sin reel para hoy" };
  }
  let meta: { slug: string; caption: string; fecha: string };
  try {
    meta = await metaRes.json();
  } catch {
    return { deporte, resultado: "sin reel para hoy" };
  }

  const { data: yaPublicado, error: errorConsulta } = await supabase
    .from("publicaciones_facebook")
    .select("id, post_id")
    .eq("loteria_slug", meta.slug)
    .limit(1);
  if (errorConsulta) throw new Error(errorConsulta.message);
  if (yaPublicado && yaPublicado.length > 0) {
    const historia = await intentarHistoria(deporte, meta, token);
    return { deporte, slug: meta.slug, resultado: "ya publicado antes", post_id: yaPublicado[0].post_id, historia };
  }

  const videoId = await iniciarSesion(token);
  await subirVideo(videoId, `https://labankerard.com/reel-${deporte}.mp4`, token);
  const resultado = await publicarReel(videoId, meta.caption, token);

  const { error: errorInsert } = await supabase
    .from("publicaciones_facebook")
    .insert({ loteria_slug: meta.slug, fecha: meta.fecha, post_id: resultado.post_id || videoId, mensaje: meta.caption });
  if (errorInsert) throw new Error(errorInsert.message);

  const historia = await intentarHistoria(deporte, meta, token);
  return { deporte, slug: meta.slug, videoId, resultado, historia };
}

// Sube el video de resumen deportivo (varios deportes concatenados, 3+ min)
// como video normal de Facebook, no como reel: el programa de monetizacion
// por anuncios en video pide ese formato, no reels.
async function publicarVideoNormal(fileUrl: string, titulo: string, descripcion: string, token: string) {
  const res = await fetch(`https://graph.facebook.com/v21.0/me/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ file_url: fileUrl, title: titulo, description: descripcion, access_token: token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error publicando el video de resumen deportivo");
  return data;
}

async function publicarResumenDeportivo(token: string) {
  const metaRes = await fetch(`https://labankerard.com/resumen-deportivo.json`, { cache: "no-store" });
  const tipo = metaRes.headers.get("content-type") || "";
  if (!metaRes.ok || !tipo.includes("json")) {
    return { resultado: "sin resumen para hoy" };
  }
  let meta: { slug: string; caption: string; fecha: string };
  try {
    meta = await metaRes.json();
  } catch {
    return { resultado: "sin resumen para hoy" };
  }

  const { data: yaPublicado, error: errorConsulta } = await supabase
    .from("publicaciones_facebook")
    .select("id, post_id")
    .eq("loteria_slug", meta.slug)
    .limit(1);
  if (errorConsulta) throw new Error(errorConsulta.message);
  if (yaPublicado && yaPublicado.length > 0) {
    return { slug: meta.slug, resultado: "ya publicado antes", post_id: yaPublicado[0].post_id };
  }

  const resultado = await publicarVideoNormal(
    `https://labankerard.com/resumen-deportivo.mp4`,
    "Resumen deportivo del día",
    meta.caption,
    token
  );

  const { error: errorInsert } = await supabase
    .from("publicaciones_facebook")
    .insert({ loteria_slug: meta.slug, fecha: meta.fecha, post_id: resultado.id, mensaje: meta.caption });
  if (errorInsert) throw new Error(errorInsert.message);

  return { slug: meta.slug, resultado };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!claveValida(url.searchParams.get("clave"))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });

  const resultados = [];
  for (const deporte of DEPORTES) {
    try {
      resultados.push(await publicarDeporte(deporte, token));
    } catch (error: any) {
      resultados.push({ deporte, error: "Error publicando este reel en Facebook", detalle: error.message });
    }
  }

  try {
    resultados.push({ tipo: "resumen-deportivo", ...(await publicarResumenDeportivo(token)) });
  } catch (error: any) {
    resultados.push({ tipo: "resumen-deportivo", error: "Error publicando el resumen deportivo", detalle: error.message });
  }

  return NextResponse.json({ resultados });
}
