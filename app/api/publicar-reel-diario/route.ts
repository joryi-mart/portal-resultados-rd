import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";

// Publica el reel diario de deportes: lee public/reel-diario.mp4 (el video) y
// public/reel-diario.json ({slug, caption, fecha}), generados por
// scripts/generar_reel_diario.py, y lo sube a Facebook. Pensada para que la
// llame un asistente en la nube programado, despues de generar y subir esos
// 2 archivos al repositorio. Se activa con ?clave=<REEL_DIARIO_SECRET o CRON_SECRET>.
export const dynamic = "force-dynamic";

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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (!claveValida(url.searchParams.get("clave"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (!token) return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });

    const metaRes = await fetch("https://labankerard.com/reel-diario.json", { cache: "no-store" });
    if (!metaRes.ok) {
      return NextResponse.json({ resultado: "sin reel para hoy (no se genero contenido real)" });
    }
    const meta = (await metaRes.json()) as { slug: string; caption: string; fecha: string };

    const { data: yaPublicado, error: errorConsulta } = await supabase
      .from("publicaciones_facebook")
      .select("id, post_id")
      .eq("loteria_slug", meta.slug)
      .limit(1);
    if (errorConsulta) throw new Error(errorConsulta.message);
    if (yaPublicado && yaPublicado.length > 0) {
      return NextResponse.json({ slug: meta.slug, resultado: "ya publicado antes", post_id: yaPublicado[0].post_id });
    }

    const videoId = await iniciarSesion(token);
    await subirVideo(videoId, "https://labankerard.com/reel-diario.mp4", token);
    const resultado = await publicarReel(videoId, meta.caption, token);

    const { error: errorInsert } = await supabase
      .from("publicaciones_facebook")
      .insert({ loteria_slug: meta.slug, fecha: meta.fecha, post_id: resultado.post_id || videoId, mensaje: meta.caption });
    if (errorInsert) throw new Error(errorInsert.message);

    return NextResponse.json({ slug: meta.slug, videoId, resultado });
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando el reel diario en Facebook", detalle: error.message }, { status: 500 });
  }
}
