import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";
import { generarImagenDato } from "@/lib/imagenDato";
import { EFEMERIDES } from "@/app/efemerides/page";
import { hechoDeWikipedia } from "@/lib/unDiaComoHoy";

// Publica en Facebook la efemeride dominicana del dia (si hay una en la lista
// de app/efemerides/page.tsx para la fecha de hoy). Pensada para que un cron
// la llame una vez al dia; si no hay nada para esa fecha, no publica nada (no
// se inventa contenido). Se activa con ?clave=<REEL_DIARIO_SECRET o CRON_SECRET>.
export const dynamic = "force-dynamic";

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

function hoyRD() {
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return { anio: ahoraRD.getUTCFullYear(), mes: ahoraRD.getUTCMonth() + 1, dia: ahoraRD.getUTCDate() };
}

async function crearPublicacion(caption: string, imagen: Buffer) {
  const formData = new FormData();
  formData.append("source", new Blob([new Uint8Array(imagen)], { type: "image/png" }), "efemeride.png");
  formData.append("caption", caption);
  formData.append("published", "true");
  formData.append("access_token", process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "");

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

    const { anio, mes, dia } = hoyRD();
    const slug = `efemeride-${anio}-${mes}-${dia}`;
    const { data: yaPublicado, error: errorConsulta } = await supabase
      .from("publicaciones_facebook")
      .select("id, post_id")
      .eq("loteria_slug", slug)
      .limit(1);
    if (errorConsulta) throw new Error(errorConsulta.message);
    if (yaPublicado && yaPublicado.length > 0) {
      return NextResponse.json({ slug, resultado: "ya publicado antes", post_id: yaPublicado[0].post_id });
    }

    // Primero la efeméride dominicana de la lista propia; si ese día no tiene, un
    // hecho de Wikipedia ("En este día"), dando prioridad a lo dominicano.
    const propia = EFEMERIDES.find(function (e) { return e.mes === mes && e.dia === dia; });
    const deWikipedia = propia ? null : await hechoDeWikipedia(mes, dia);
    if (!propia && !deWikipedia) return NextResponse.json({ resultado: "sin efemeride para hoy" });
    const texto = propia ? propia.texto : deWikipedia!.texto;
    const dominicana = propia ? true : deWikipedia!.esDominicana;

    const titulo = dominicana ? "UN DÍA COMO HOY EN RD 🇩🇴" : "UN DÍA COMO HOY";
    // ?prueba=1 muestra qué se publicaría hoy, sin publicar nada.
    if (url.searchParams.get("prueba") === "1") return NextResponse.json({ titulo, texto, fuente: propia ? "lista propia" : "Wikipedia" });
    const caption =
      `${titulo}\n\n${texto}\n\n` +
      `¿Lo sabías? Cuéntanos en los comentarios 👇\n\n` +
      (propia ? "" : "Fuente: Wikipedia.\n\n") +
      `Más efemérides en https://labankerard.com/efemerides\n\nPágina informativa de La Bankera RD.\n\n` +
      `#UnDiaComoHoy #EfemeridesRD ${dominicana ? "#HistoriaDominicana" : "#Historia"}`;
    const imagen = await generarImagenDato(texto, "Síguenos para más historia todos los días", titulo);
    const idPublicacion = await crearPublicacion(caption, imagen);

    const fechaISO = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const { error: errorInsert } = await supabase
      .from("publicaciones_facebook")
      .insert({ loteria_slug: slug, fecha: fechaISO, post_id: idPublicacion, mensaje: caption });
    if (errorInsert) throw new Error(errorInsert.message);

    return NextResponse.json({ slug, resultado: "publicado", post_id: idPublicacion });
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando la efemeride en Facebook", detalle: error.message }, { status: 500 });
  }
}
