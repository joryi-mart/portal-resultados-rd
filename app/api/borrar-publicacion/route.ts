import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";

// Borra una publicacion de Facebook por su post_id/video_id, y tambien su
// registro en publicaciones_facebook (para que si se vuelve a generar el
// mismo contenido, publicar-reel-diario/publicar-facebook no digan "ya
// publicado antes" y lo dejen subir de nuevo). Pensada para correcciones
// puntuales (ej. subir de nuevo un reel con un error). Se activa con
// ?clave=<CRON_SECRET>&slug=<loteria_slug guardado en publicaciones_facebook>
export const dynamic = "force-dynamic";

function claveValida(recibida: string | null) {
  const esperada = (process.env.CRON_SECRET || "").trim();
  if (!esperada || esperada.length < 12 || !recibida) return false;
  const a = Buffer.from(recibida.trim());
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (!claveValida(url.searchParams.get("clave"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const slug = url.searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "Falta ?slug=" }, { status: 400 });

    const { data: fila, error: errorConsulta } = await supabase
      .from("publicaciones_facebook")
      .select("id, post_id")
      .eq("loteria_slug", slug)
      .limit(1)
      .maybeSingle();
    if (errorConsulta) throw new Error(errorConsulta.message);
    if (!fila) return NextResponse.json({ resultado: "no se encontro ese slug en publicaciones_facebook" });

    const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const res = await fetch(`https://graph.facebook.com/v19.0/${fila.post_id}?access_token=${token}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Error borrando la publicacion en Facebook");

    const { error: errorBorrar } = await supabase.from("publicaciones_facebook").delete().eq("id", fila.id);
    if (errorBorrar) throw new Error(errorBorrar.message);

    return NextResponse.json({ slug, post_id_borrado: fila.post_id, resultado: "borrado" });
  } catch (error: any) {
    return NextResponse.json({ error: "Error borrando la publicacion", detalle: error.message }, { status: 500 });
  }
}
