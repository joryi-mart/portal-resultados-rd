import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";
import { obtenerBracketMLB, generarImagenBracketMLB } from "@/lib/imagenBracketMLB";

// Publica en Facebook la imagen del bracket de la postemporada de MLB, una vez por
// cada resultado nuevo de la Serie Mundial (1-0, 1-1, ... y al final el campeon).
// Uso: /api/publicar-bracket-mlb?clave=<CRON_SECRET>   (?prueba=1 devuelve la imagen sin publicar)
// La llama el calendario cada mañana; si no se jugo un juego nuevo, no publica nada.
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
  formData.append("source", new Blob([new Uint8Array(imagen)], { type: "image/png" }), "bracket-mlb.png");
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
    const prueba = url.searchParams.get("prueba") === "1";
    if (!prueba && !process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });
    }

    const temporada = Number(url.searchParams.get("temporada")) || new Date().getFullYear();
    const bracket = await obtenerBracketMLB(temporada);
    const ws = bracket.mundial;
    const imagen = await generarImagenBracketMLB(bracket);
    if (prueba) {
      return new NextResponse(new Uint8Array(imagen), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
    }

    // Solo se publica cuando ya hay al menos un juego de la Serie Mundial terminado.
    if (!ws || ws.a.victorias + ws.b.victorias === 0) {
      return NextResponse.json({ resultado: "todavia no hay juegos terminados de la Serie Mundial, no se publica" });
    }

    const slug = `bracket-mlb-${temporada}-${ws.a.victorias}-${ws.b.victorias}`;
    const { data: yaPublicado, error: errorConsulta } = await supabase
      .from("publicaciones_facebook")
      .select("id, post_id")
      .eq("loteria_slug", slug)
      .limit(1);
    if (errorConsulta) throw new Error(errorConsulta.message);
    if (yaPublicado && yaPublicado.length > 0) {
      return NextResponse.json({ slug, resultado: "ya publicado antes (no hubo juego nuevo)", post_id: yaPublicado[0].post_id });
    }

    const lider = ws.a.victorias > ws.b.victorias ? ws.a : ws.b;
    const otro = lider === ws.a ? ws.b : ws.a;
    const campeon = ws.ganador ? ws[ws.ganador] : null;
    const juego = ws.a.victorias + ws.b.victorias;
    const lineas = campeon
      ? [
          `🏆 ¿Quién se llevó el anillo? ¡Los ${campeon.corto} son campeones de la Serie Mundial ${temporada}! 👇`,
          ``,
          `Le ganaron ${lider.victorias}-${otro.victorias} a los ${otro.corto}. Así quedó toda la postemporada.`,
        ]
      : [
          `🏆 ¿Quién se lleva el anillo? Así va la Serie Mundial después del Juego ${juego} 👇`,
          ``,
          ws.a.victorias === ws.b.victorias
            ? `${ws.a.corto} y ${ws.b.corto} están empatados ${ws.a.victorias}-${ws.b.victorias}.`
            : `Los ${lider.corto} ganan la serie ${lider.victorias}-${otro.victorias} a los ${otro.corto}.`,
          `Gana el primero que llegue a ${ws.necesarias} victorias.`,
        ];
    const caption = [
      ...lineas,
      ``,
      `👉 Resultados y béisbol todos los días: https://labankerard.com/beisbol`,
      ``,
      `🔎 Búscanos en Google como «La Bankera RD».`,
      ``,
      `#SerieMundial #MLB #Beisbol #${ws.a.corto.replace(/\s/g, "")} #${ws.b.corto.replace(/\s/g, "")}`,
    ].join("\n");

    const fecha = new Date(Date.now() - 4 * 3600 * 1000).toISOString().slice(0, 10);
    const idPublicacion = await crearPublicacion(caption, imagen);
    const { error: errorInsert } = await supabase
      .from("publicaciones_facebook")
      .insert({ loteria_slug: slug, fecha, post_id: idPublicacion, mensaje: caption });
    if (errorInsert) throw new Error(errorInsert.message);

    return NextResponse.json({ slug, resultado: "publicado", post_id: idPublicacion });
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando el bracket de MLB", detalle: error.message }, { status: 500 });
  }
}
