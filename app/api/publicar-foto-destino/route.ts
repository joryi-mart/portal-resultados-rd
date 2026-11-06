import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";

// Fotos reales de destinos de RD que manda el dueño de la página, cada una con
// su día de salida. Lo llama el calendario (lib/calendario.json) a diario a las
// 7 PM; solo publica la foto cuya fecha es hoy, y una sola vez (se marca en
// publicaciones_facebook). Para agregar más: poner la foto en public/fb-fotos/
// y una línea nueva en FOTOS.
// Se activa con ?clave=<CRON_SECRET>. Con ?prueba=1[&fecha=AAAA-MM-DD] dice qué
// publicaría, sin publicar.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Foto = { fecha: string; slug: string; imagen: string; caption: string };

const FOTOS: Foto[] = [
  {
    fecha: "2026-11-07",
    slug: "foto-destino-los-patos-mar",
    imagen: "/fb-fotos/los-patos-mar.jpg",
    caption:
      "¿Todavía sin plan para el fin de semana largo? 👇\n" +
      "Esto es Los Patos, en Paraíso, Barahona 💧 Un río de agua dulce y cristalina que baja de la montaña y desemboca en el mar Caribe. Dicen que es uno de los ríos más cortos de las Antillas.\n\n" +
      "📍 Los Patos, Paraíso, Barahona\n\n" +
      "¿Ya fuiste? Cuéntanos 👇\n\n" +
      "#Barahona #LosPatos #RepublicaDominicana #TurismoRD",
  },
  {
    fecha: "2026-11-08",
    slug: "foto-destino-los-patos-escalinata",
    imagen: "/fb-fotos/los-patos-escalinata.jpg",
    caption:
      "¿Ya sabes dónde vas mañana, lunes feriado? 🌊\n" +
      "Escalinatas de piedra de río, sombra de árboles y un agua tan clara que se ven las piedras del fondo. Los Patos, Barahona.\n\n" +
      "Etiqueta a quien te llevarías 👇\n\n" +
      "#Barahona #LosPatos #FeriadoRD #RepublicaDominicana",
  },
];

function claveValida(recibida: string | null) {
  const esperada = (process.env.CRON_SECRET || "").trim();
  if (!esperada || esperada.length < 12 || !recibida) return false;
  const a = Buffer.from(recibida.trim());
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

function hoyRD() {
  return new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function publicarFoto(foto: Foto) {
  const res = await fetch("https://graph.facebook.com/v21.0/me/photos", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      url: `https://labankerard.com${foto.imagen}`,
      caption: foto.caption,
      published: "true",
      access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error publicando la foto en Facebook");
  return (data.post_id as string | undefined) || (data.id as string);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const recibida = url.searchParams.get("clave") || (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!claveValida(recibida)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const prueba = url.searchParams.get("prueba") === "1";
    const fechaPedida = url.searchParams.get("fecha");
    const hoy = prueba && fechaPedida && /^\d{4}-\d{2}-\d{2}$/.test(fechaPedida) ? fechaPedida : hoyRD();

    const deHoy = FOTOS.filter(function (f) { return f.fecha === hoy; });
    if (deHoy.length === 0) return NextResponse.json({ fecha: hoy, resultado: "hoy no toca foto de destino" });
    if (prueba) return NextResponse.json({ fecha: hoy, publicaria: deHoy });
    if (!process.env.FACEBOOK_PAGE_ACCESS_TOKEN) return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });

    const resultados = [];
    for (const foto of deHoy) {
      const { data: ya, error: errorBuscar } = await supabase.from("publicaciones_facebook").select("id").eq("loteria_slug", foto.slug).limit(1);
      if (errorBuscar) throw new Error(errorBuscar.message);
      if (ya && ya.length > 0) {
        resultados.push({ slug: foto.slug, resultado: "ya publicado antes" });
        continue;
      }
      const postId = await publicarFoto(foto);
      const { error: errorInsert } = await supabase.from("publicaciones_facebook").insert({ loteria_slug: foto.slug, fecha: hoy, post_id: postId, mensaje: foto.caption });
      if (errorInsert) throw new Error(errorInsert.message);
      resultados.push({ slug: foto.slug, resultado: "publicado", post_id: postId });
    }
    return NextResponse.json({ fecha: hoy, resultados });
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando la foto de destino", detalle: error.message }, { status: 500 });
  }
}
