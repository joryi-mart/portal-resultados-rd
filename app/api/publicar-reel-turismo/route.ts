import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";

// Publica el reel diario de turismo ("Destinos de RD") como reel en el feed y
// tambien como historia. El video lo genera cada manana
// scripts/generar_reel_turismo.py (en .github/workflows/reel-diario.yml) y lo
// deja en public/reel-turismo.mp4 + .json. Lo llama el calendario de
// publicaciones (lib/calendario.json). Cada reel e historia sale una sola vez
// (se marca en publicaciones_facebook). Se activa con ?clave=<CRON_SECRET>.
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const URL_VIDEO = "https://labankerard.com/reel-turismo.mp4";

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

async function subirVideo(videoId: string, fileUrl: string, token: string) {
  const res = await fetch(`https://rupload.facebook.com/video-upload/v21.0/${videoId}`, {
    method: "POST",
    headers: { Authorization: `OAuth ${token}`, file_url: fileUrl },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || "Error subiendo el video");
}

async function publicarReel(descripcion: string, token: string) {
  const inicio = await fetch(`https://graph.facebook.com/v21.0/me/video_reels?upload_phase=start&access_token=${token}`, { method: "POST" });
  const datosInicio = await inicio.json();
  if (!inicio.ok) throw new Error(datosInicio.error?.message || "Error iniciando la sesion de carga del reel");
  const videoId = datosInicio.video_id as string;

  await subirVideo(videoId, URL_VIDEO, token);

  const res = await fetch(`https://graph.facebook.com/v21.0/me/video_reels`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ upload_phase: "finish", video_id: videoId, video_state: "PUBLISHED", description: descripcion, access_token: token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error publicando el reel");
  return { videoId, post_id: (data.post_id as string | undefined) || videoId };
}

// Facebook no deja reusar el video del reel en la historia: se sube otra vez.
async function publicarHistoria(token: string) {
  const inicio = await fetch(`https://graph.facebook.com/v21.0/me/video_stories?upload_phase=start&access_token=${token}`, { method: "POST" });
  const datosInicio = await inicio.json();
  if (!inicio.ok) throw new Error(datosInicio.error?.message || "Error iniciando la carga de la historia");
  const videoId = datosInicio.video_id as string;

  await subirVideo(videoId, URL_VIDEO, token);

  const res = await fetch(`https://graph.facebook.com/v21.0/me/video_stories`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ upload_phase: "finish", video_id: videoId, access_token: token }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || "Error publicando la historia");
  return { videoId, post_id: (data.post_id as string | undefined) || videoId };
}

async function yaSalio(slug: string) {
  const { data, error } = await supabase.from("publicaciones_facebook").select("post_id").eq("loteria_slug", slug).limit(1);
  if (error) throw new Error(error.message);
  return data && data.length > 0 ? data[0].post_id : null;
}

async function marcar(slug: string, fecha: string, postId: string, mensaje: string) {
  const { error } = await supabase.from("publicaciones_facebook").insert({ loteria_slug: slug, fecha, post_id: postId, mensaje });
  if (error) throw new Error(error.message);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const recibida = url.searchParams.get("clave") || (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!claveValida(recibida)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });

  try {
    const metaRes = await fetch(`https://labankerard.com/reel-turismo.json`, { cache: "no-store" });
    const tipo = metaRes.headers.get("content-type") || "";
    if (!metaRes.ok || !tipo.includes("json")) return NextResponse.json({ resultado: "sin reel de turismo" });
    const meta: { slug: string; fecha: string; caption: string } = await metaRes.json();

    // Si el video de hoy no se genero, no se vuelve a publicar uno viejo.
    const hoy = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (meta.fecha < hoy) return NextResponse.json({ slug: meta.slug, resultado: "el reel guardado no es de hoy, no se publica" });

    const salida: Record<string, unknown> = { slug: meta.slug };

    const reelPrevio = await yaSalio(meta.slug);
    if (reelPrevio) {
      salida.reel = "ya publicado antes";
    } else {
      const reel = await publicarReel(meta.caption, token);
      await marcar(meta.slug, meta.fecha, reel.post_id, meta.caption);
      salida.reel = reel;
    }

    // La historia va aparte: si falla, el reel ya quedo publicado.
    const slugHistoria = `${meta.slug}-historia`;
    try {
      if (await yaSalio(slugHistoria)) {
        salida.historia = "ya publicada antes";
      } else {
        const historia = await publicarHistoria(token);
        await marcar(slugHistoria, meta.fecha, historia.post_id, "Historia: " + meta.caption);
        salida.historia = historia;
      }
    } catch (error: any) {
      salida.historia = { error: "Error publicando la historia en Facebook", detalle: error.message };
    }

    return NextResponse.json(salida);
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando el reel de turismo", detalle: error.message }, { status: 500 });
  }
}
