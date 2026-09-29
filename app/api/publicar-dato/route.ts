import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";
import { generarImagenDato } from "@/lib/imagenDato";

// Publica en Facebook una tarjeta "¿Sabías qué...?" (contenido que no es de lotería
// del día, para variar la página). Se activa visitando la dirección en el navegador
// con ?clave=<CRON_SECRET>, igual que la revisión de Facebook, para no depender de
// cron-job.org. Cada dato se publica una sola vez (se marca en publicaciones_facebook).
export const dynamic = "force-dynamic";

type Dato = { slug: string; texto: string; pie: string; caption: string };

const DATOS: Dato[] = [
  {
    slug: "dato-nacional-1882",
    texto: "La Lotería Nacional Dominicana nació el 24 de octubre de 1882, fundada por el padre Francisco Xavier Billini.",
    pie: "La creó para recaudar fondos y ayudar a los más pobres. Hoy sigue siendo una de las loterías más antiguas de América.",
    caption:
      "¿Sabías qué...? 🎓\n\n" +
      "La Lotería Nacional Dominicana nació el 24 de octubre de 1882, fundada por el padre Francisco Xavier Billini, " +
      "para recaudar fondos y ayudar a los más pobres. Hoy sigue siendo una de las loterías más antiguas de América.\n\n" +
      "Lee la historia completa en https://labankerard.com/historia-loteria-nacional\n\n" +
      "Página informativa de La Bankera RD.\n\n#LoteriaDominicana #HistoriaDominicana #CuriosidadesRD",
  },
];

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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (!claveValida(url.searchParams.get("clave"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    if (!process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });
    }

    const indicePedido = Number(url.searchParams.get("indice") || "0");
    const dato = DATOS[indicePedido];
    if (!dato) return NextResponse.json({ error: `No hay ningun dato en el indice ${indicePedido}` }, { status: 400 });

    const { data: yaPublicado, error: errorConsulta } = await supabase
      .from("publicaciones_facebook")
      .select("id, post_id")
      .eq("loteria_slug", dato.slug)
      .limit(1);
    if (errorConsulta) throw new Error(errorConsulta.message);
    if (yaPublicado && yaPublicado.length > 0) {
      return NextResponse.json({ slug: dato.slug, resultado: "ya publicado antes", post_id: yaPublicado[0].post_id });
    }

    const imagen = await generarImagenDato(dato.texto, dato.pie);
    const idPublicacion = await crearPublicacion(dato.caption, imagen);

    const hoy = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { error: errorInsert } = await supabase
      .from("publicaciones_facebook")
      .insert({ loteria_slug: dato.slug, fecha: hoy, post_id: idPublicacion, mensaje: dato.caption });
    if (errorInsert) throw new Error(errorInsert.message);

    return NextResponse.json({ slug: dato.slug, resultado: "publicado", post_id: idPublicacion });
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando el dato en Facebook", detalle: error.message }, { status: 500 });
  }
}
