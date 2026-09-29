import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";

// Publica un Reel en Facebook a partir de un video ya alojado en nuestra propia
// web (public/), usando el proceso de 3 pasos que pide la Graph API:
// 1) iniciar la sesion de carga, 2) que Facebook descargue el video (file_url),
// 3) publicar. Se activa visitando la direccion con ?clave=<CRON_SECRET>, igual
// que /api/publicar-dato, para poder probarlo a mano sin pasar por cron-job.org.
export const dynamic = "force-dynamic";

type Reel = { slug: string; archivo: string; descripcion: string };

const REELS: Reel[] = [
  {
    slug: "reel-dato-nacional-1882",
    archivo: "temp-reel-sabias-que.mp4",
    descripcion:
      "¿Sabías qué...? 🎓 La Lotería Nacional Dominicana nació el 24 de octubre de 1882, fundada por el padre " +
      "Francisco Xavier Billini, para ayudar a los más pobres.\n\n" +
      "Más en https://labankerard.com/historia-loteria-nacional\n\n" +
      "Página informativa de La Bankera RD.\n\n#LoteriaDominicana #HistoriaDominicana #CuriosidadesRD",
  },
];

function claveValida(recibida: string | null) {
  const esperada = process.env.CRON_SECRET;
  if (!esperada || esperada.length < 12 || !recibida) return false;
  const a = Buffer.from(recibida);
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function iniciarSesion(token: string) {
  const res = await fetch(`https://graph.facebook.com/v21.0/me/video_reels?upload_phase=start&access_token=${token}`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error iniciando la sesion de carga del reel");
  return { videoId: data.video_id as string, uploadUrl: data.upload_url as string };
}

async function subirVideo(videoId: string, fileUrl: string, token: string) {
  const res = await fetch(`https://rupload.facebook.com/video-upload/v21.0/${videoId}`, {
    method: "POST",
    headers: {
      Authorization: `OAuth ${token}`,
      file_url: fileUrl,
    },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || "Error subiendo el video del reel");
}

async function publicarReel(videoId: string, descripcion: string, token: string) {
  const res = await fetch(`https://graph.facebook.com/v21.0/me/video_reels`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      upload_phase: "finish",
      video_id: videoId,
      video_state: "PUBLISHED",
      description: descripcion,
      access_token: token,
    }),
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

    const indice = Number(url.searchParams.get("indice") || "0");
    const reel = REELS[indice];
    if (!reel) return NextResponse.json({ error: `No hay ningun reel en el indice ${indice}` }, { status: 400 });

    // Cada reel se publica una sola vez para siempre (no por dia, como las
    // loterias): si ya existe un registro con este slug, no se vuelve a publicar.
    const { data: yaPublicado, error: errorConsulta } = await supabase
      .from("publicaciones_facebook")
      .select("id, post_id")
      .eq("loteria_slug", reel.slug)
      .limit(1);
    if (errorConsulta) throw new Error(errorConsulta.message);
    if (yaPublicado && yaPublicado.length > 0) {
      return NextResponse.json({ slug: reel.slug, resultado: "ya publicado antes", post_id: yaPublicado[0].post_id });
    }

    const fileUrl = `https://labankerard.com/${reel.archivo}`;

    const { videoId, uploadUrl } = await iniciarSesion(token);
    await subirVideo(videoId, fileUrl, token);
    const resultado = await publicarReel(videoId, reel.descripcion, token);

    const hoy = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { error: errorInsert } = await supabase
      .from("publicaciones_facebook")
      .insert({ loteria_slug: reel.slug, fecha: hoy, post_id: resultado.post_id || videoId, mensaje: reel.descripcion });
    if (errorInsert) throw new Error(errorInsert.message);

    return NextResponse.json({ slug: reel.slug, videoId, uploadUrl, resultado });
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando el reel en Facebook", detalle: error.message }, { status: 500 });
  }
}
