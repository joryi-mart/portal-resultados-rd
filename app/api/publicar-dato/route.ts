import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";
import { generarImagenDato } from "@/lib/imagenDato";
import { DATOS, captionDato, type Dato } from "@/lib/datosCuriosos";

// Publica en Facebook una tarjeta "¿Sabías qué...?" (contenido que no es de lotería
// del día, para variar la página). Se activa visitando la dirección en el navegador
// con ?clave=<CRON_SECRET>, igual que la revisión de Facebook, para no depender de
// cron-job.org. Cada dato se publica una sola vez (se marca en publicaciones_facebook).
//   ?indice=N      publica el dato N de la lista (lib/datosCuriosos.ts)
//   ?siguiente=1   publica el primer dato que todavía no haya salido, como máximo
//                  uno por día (así lo usa el calendario de publicaciones)
export const dynamic = "force-dynamic";

function claveValida(recibida: string | null) {
  const esperada = (process.env.CRON_SECRET || "").trim();
  if (!esperada || esperada.length < 12 || !recibida) return false;
  const a = Buffer.from(recibida.trim());
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function crearPublicacion(caption: string, imagen: Buffer) {
  const formData = new FormData();
  formData.append("source", new Blob([new Uint8Array(imagen)], { type: "image/png" }), "dato.png");
  formData.append("caption", caption);
  formData.append("published", "true");
  formData.append("access_token", process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "");

  // "me" en vez del numero de FACEBOOK_PAGE_ID, para no depender de ese numero.
  const res = await fetch(`https://graph.facebook.com/v19.0/me/photos`, { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error creando la publicacion en Facebook");
  return data.id as string;
}

async function slugsPublicados(slugs: string[]) {
  const { data, error } = await supabase.from("publicaciones_facebook").select("loteria_slug").in("loteria_slug", slugs);
  if (error) throw new Error(error.message);
  return new Set((data || []).map(function (f: any) { return f.loteria_slug as string; }));
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (!claveValida(url.searchParams.get("clave"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    if (!process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });
    }

    const hoy = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const siguiente = url.searchParams.get("siguiente") === "1";
    const marcaDelDia = `dato-del-dia-${hoy}`;
    let dato: Dato | undefined;

    if (siguiente) {
      const publicados = await slugsPublicados([marcaDelDia, ...DATOS.map(function (d) { return d.slug; })]);
      if (publicados.has(marcaDelDia)) return NextResponse.json({ resultado: "ya hubo dato hoy" });
      dato = DATOS.find(function (d) { return !publicados.has(d.slug); });
      if (!dato) return NextResponse.json({ resultado: "ya se publicaron todos los datos de la lista" });
    } else {
      const indicePedido = Number(url.searchParams.get("indice") || "0");
      dato = DATOS[indicePedido];
      if (!dato) return NextResponse.json({ error: `No hay ningun dato en el indice ${indicePedido}` }, { status: 400 });
      const publicados = await slugsPublicados([dato.slug]);
      if (publicados.has(dato.slug)) return NextResponse.json({ slug: dato.slug, resultado: "ya publicado antes" });
    }

    const caption = captionDato(dato);
    const imagen = await generarImagenDato(dato.texto, dato.pie);
    const idPublicacion = await crearPublicacion(caption, imagen);

    const filas = [{ loteria_slug: dato.slug, fecha: hoy, post_id: idPublicacion, mensaje: caption }];
    if (siguiente) filas.push({ loteria_slug: marcaDelDia, fecha: hoy, post_id: idPublicacion, mensaje: dato.slug });
    const { error: errorInsert } = await supabase.from("publicaciones_facebook").insert(filas);
    if (errorInsert) throw new Error(errorInsert.message);

    const quedan = siguiente ? DATOS.length - (await slugsPublicados(DATOS.map(function (d) { return d.slug; }))).size : undefined;
    return NextResponse.json({ slug: dato.slug, resultado: "publicado", post_id: idPublicacion, quedan });
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando el dato en Facebook", detalle: error.message }, { status: 500 });
  }
}
