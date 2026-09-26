import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generarImagenMarcadores } from "@/lib/imagenDeportes";
import { DEPORTES, esTipoDeporte, ayerRD, fechaLarga } from "@/lib/publicacionDeportes";

// Publica en Facebook la imagen de "¿quién ganó ayer?" de béisbol o NBA.
// Uso (desde cron-job.org, con la misma clave que la publicación de loterías):
//   /api/publicar-deportes?tipo=beisbol   o   /api/publicar-deportes?tipo=nba
// Publica como máximo una vez por deporte y por día, y no publica nada si no hubo juegos.
export const dynamic = "force-dynamic";

async function crearPublicacion(caption: string, imagen: Buffer) {
  const formData = new FormData();
  formData.append("source", new Blob([new Uint8Array(imagen)], { type: "image/png" }), "marcadores.png");
  formData.append("caption", caption);
  formData.append("published", "true");
  formData.append("access_token", process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "");

  const res = await fetch(`https://graph.facebook.com/v19.0/${process.env.FACEBOOK_PAGE_ID}/photos`, { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error creando la publicacion en Facebook");
  return data.id as string;
}

export async function GET(request: Request) {
  try {
    const secretoEsperado = process.env.CRON_SECRET;
    const autorizacion = request.headers.get("authorization");
    if (secretoEsperado && autorizacion !== `Bearer ${secretoEsperado}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const tipo = new URL(request.url).searchParams.get("tipo");
    if (!esTipoDeporte(tipo)) return NextResponse.json({ error: "tipo debe ser beisbol o nba" }, { status: 400 });

    if (!process.env.FACEBOOK_PAGE_ID || !process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });
    }

    const config = DEPORTES[tipo];
    const fecha = ayerRD();

    const { data: yaPublicada, error: errorConsulta } = await supabase
      .from("publicaciones_facebook")
      .select("id")
      .eq("loteria_slug", config.slug)
      .eq("fecha", fecha)
      .limit(1);
    if (errorConsulta) throw new Error(errorConsulta.message);
    if (yaPublicada && yaPublicada.length > 0) return NextResponse.json({ tipo, fecha, resultado: "ya publicada" });

    const juegos = await config.obtenerJuegos(fecha);
    if (juegos.length === 0) return NextResponse.json({ tipo, fecha, resultado: "sin juegos terminados, no se publica" });

    const textoFecha = fechaLarga(fecha);
    const imagen = await generarImagenMarcadores(config.titulo, `Resultados del ${textoFecha}`, config.enlaceTexto, juegos);
    const caption = config.caption(textoFecha);
    const idPublicacion = await crearPublicacion(caption, imagen);

    const { error: errorInsert } = await supabase
      .from("publicaciones_facebook")
      .insert({ loteria_slug: config.slug, fecha, post_id: idPublicacion, mensaje: caption });
    if (errorInsert) throw new Error(errorInsert.message);

    return NextResponse.json({ tipo, fecha, resultado: "publicada", juegos: juegos.length });
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando deportes en Facebook", detalle: error.message }, { status: 500 });
  }
}
