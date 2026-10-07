import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";
import { ayerRD, fechaLarga } from "@/lib/publicacionDeportes";
import { DEPORTES_QUE_PASO, captionQuePaso, esDeporteQuePaso, obtenerQuePasoAyer } from "@/lib/quePasoAyer";
import { generarImagenQuePaso } from "@/lib/imagenQuePaso";

// Publica en Facebook "¿Qué pasó ayer en MLB / LIDOM / NBA / LaLiga?": marcadores
// de ayer con sus momentos clave (pitchers, jonrones, anotadores, goles).
// Uso: /api/publicar-que-paso?deporte=mlb|lidom|nba|futbol&clave=<CRON_SECRET>
// La llama el calendario de publicaciones (scripts/ejecutar_calendario.mjs).
// Publica una sola vez por deporte y por día, y nada si ayer no hubo juegos.
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
  formData.append("source", new Blob([new Uint8Array(imagen)], { type: "image/png" }), "que-paso-ayer.png");
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
    const deporte = url.searchParams.get("deporte");
    if (!esDeporteQuePaso(deporte)) {
      return NextResponse.json({ error: "deporte debe ser mlb, lidom, nba o futbol" }, { status: 400 });
    }
    // ?prueba=1 devuelve la imagen sin publicar nada, para revisarla a mano.
    const prueba = url.searchParams.get("prueba") === "1";
    if (!prueba && !process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });
    }

    const fecha = url.searchParams.get("fecha") || ayerRD();
    const slug = `que-paso-${deporte}-${fecha}`;

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

    const juegos = await obtenerQuePasoAyer(deporte, fecha);
    if (juegos.length === 0) return NextResponse.json({ slug, resultado: "sin juegos ayer, no se publica" });

    const d = DEPORTES_QUE_PASO[deporte];
    const textoFecha = fechaLarga(fecha);
    const imagen = await generarImagenQuePaso(
      `¿Qué pasó ayer en ${d.nombre}?`,
      textoFecha.charAt(0).toUpperCase() + textoFecha.slice(1),
      d.enlace.replace("https://", ""),
      juegos
    );
    if (prueba) {
      return new NextResponse(new Uint8Array(imagen), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
    }

    const caption = captionQuePaso(deporte, textoFecha, juegos);
    const idPublicacion = await crearPublicacion(caption, imagen);

    const { error: errorInsert } = await supabase
      .from("publicaciones_facebook")
      .insert({ loteria_slug: slug, fecha, post_id: idPublicacion, mensaje: caption });
    if (errorInsert) throw new Error(errorInsert.message);

    return NextResponse.json({ slug, resultado: "publicado", juegos: juegos.length, post_id: idPublicacion });
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando ¿Qué pasó ayer?", detalle: error.message }, { status: 500 });
  }
}
