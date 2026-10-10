import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";
import { fechaLarga } from "@/lib/publicacionDeportes";
import { captionJuegosDeHoy, hoyRD, obtenerJuegosDeHoyMLB } from "@/lib/juegosDeHoy";
import { generarImagenJuegosHoy } from "@/lib/imagenJuegosHoy";

// Publica en Facebook "Juegos de hoy en MLB": hora de cada juego (hora de RD),
// abridores, TV y, en playoffs, cómo va la serie.
// Uso: /api/publicar-juegos-hoy?clave=<CRON_SECRET>
// La llama el calendario de publicaciones (lib/calendario.json).
// Publica una sola vez por día, y nada si hoy no hay juegos.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function claveValida(recibida: string | null) {
  const esperada = (process.env.CRON_SECRET || "").trim();
  if (!esperada || esperada.length < 12 || !recibida) return false;
  const a = Buffer.from(recibida.trim());
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function crearPublicacion(caption: string, imagen: Buffer) {
  const formData = new FormData();
  formData.append("source", new Blob([new Uint8Array(imagen)], { type: "image/png" }), "juegos-de-hoy.png");
  formData.append("caption", caption);
  formData.append("published", "true");
  formData.append("access_token", process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "");

  const res = await fetch(`https://graph.facebook.com/v19.0/me/photos`, { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error creando la publicacion en Facebook");
  return (data.post_id || data.id) as string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (!claveValida(url.searchParams.get("clave"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    // ?prueba=1 devuelve la imagen sin publicar nada, para revisarla a mano.
    const prueba = url.searchParams.get("prueba") === "1";
    if (!prueba && !process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });
    }

    const fecha = url.searchParams.get("fecha") || hoyRD();
    const slug = `juegos-hoy-mlb-${fecha}`;

    if (!prueba) {
      const { data: yaPublicado, error: errorConsulta } = await supabase
        .from("publicaciones_facebook")
        .select("id, post_id")
        .eq("loteria_slug", slug)
        .limit(1);
      if (errorConsulta) throw new Error(errorConsulta.message);
      if (yaPublicado && yaPublicado.length > 0) {
        return NextResponse.json({ slug, resultado: "ya publicado antes", post_id: yaPublicado[0].post_id });
      }
    }

    const juegos = await obtenerJuegosDeHoyMLB(fecha);
    if (juegos.length === 0) return NextResponse.json({ slug, resultado: "sin juegos hoy, no se publica" });

    const textoFecha = fechaLarga(fecha);
    const imagen = await generarImagenJuegosHoy(
      "Juegos de hoy en MLB",
      textoFecha.charAt(0).toUpperCase() + textoFecha.slice(1),
      "labankerard.com/beisbol",
      juegos
    );
    if (prueba) {
      return new NextResponse(new Uint8Array(imagen), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
    }

    const caption = captionJuegosDeHoy(textoFecha, juegos);
    const idPublicacion = await crearPublicacion(caption, imagen);

    const { error: errorInsert } = await supabase
      .from("publicaciones_facebook")
      .insert({ loteria_slug: slug, fecha, post_id: idPublicacion, mensaje: caption });
    if (errorInsert) throw new Error(errorInsert.message);

    return NextResponse.json({ slug, resultado: "publicado", juegos: juegos.length, post_id: idPublicacion });
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando Juegos de hoy", detalle: error.message }, { status: 500 });
  }
}
