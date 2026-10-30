import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";
import { EJEMPLOS_REGALIA, generarImagenRegalia } from "@/lib/imagenRegalia";

// Publica en Facebook la calculadora de regalía pascual. Lo llama el
// calendario (lib/calendario.json) lunes y jueves, solo en temporada (del 1 de
// octubre al 20 de diciembre, fecha límite para pagar la regalía).
//
// Hasta el 1 de noviembre: un enlace con texto, como máximo una vez por semana
// (los lunes). Esas 3 publicaciones (12, 19 y 26 de octubre) trajeron 3 visitas
// en total, así que desde el 2 de noviembre se prueba otro formato: una imagen
// con un ejemplo concreto ("si ganas RD$25,000 y entraste en mayo, te tocan
// RD$16,667"), lunes y jueves, una de cada ejemplo de lib/imagenRegalia.tsx.
// Es una prueba de 4 publicaciones: después se para hasta revisar las visitas
// (se revisa el 16 de noviembre).
export const dynamic = "force-dynamic";

const URL_CALCULADORA = "https://labankerard.com/calculadora-regalia-pascual";
const URL_PRESTACIONES = "https://labankerard.com/calcular-prestaciones-rd";
const INICIO_IMAGENES = "2026-11-02";
const MARCA_IMAGEN = "calculadora-regalia-foto-";

function claveValida(recibida: string | null) {
  const esperada = (process.env.CRON_SECRET || "").trim();
  if (!esperada || esperada.length < 12 || !recibida) return false;
  const a = Buffer.from(recibida.trim());
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Se alterna el texto cada semana para que Facebook no lo vea como la misma
// publicacion repetida.
function mensaje(diasParaPago: number, semana: number) {
  const faltan = diasParaPago === 1 ? "Falta 1 día" : `Faltan ${diasParaPago} días`;
  const textos = [
    `🎄 ¿Cuánto te toca de regalía pascual este año?\n\n` +
      `Escribe tu sueldo y en 1 segundo sabes cuánto te deben pagar de doble sueldo, aunque tengas menos de un año trabajando o ya hayas salido de la empresa.\n\n` +
      `✅ Gratis\n✅ Según el Código de Trabajo\n✅ Libre de descuentos: no paga ISR ni TSS\n\n` +
      `📅 ${faltan} para el 20 de diciembre, fecha límite para pagarla.\n\n` +
      `👉 Calcúlala aquí: ${URL_CALCULADORA}`,
    `💰 ${faltan} para que te paguen el doble sueldo.\n\n` +
      `¿Sabes cuánto te toca? Si entraste este año, si renunciaste o si te botaron, igual te corresponde la parte proporcional.\n\n` +
      `Sácale la cuenta gratis 👉 ${URL_CALCULADORA}\n\n` +
      `¿Te botaron o renunciaste? Calcula también tus prestaciones 👉 ${URL_PRESTACIONES}`,
    `🎁 Regalía pascual 2026: no dejes que te paguen de menos.\n\n` +
      `La regalía es la doceava parte de lo que ganaste en el año, y no le descuentan ISR ni TSS.\n\n` +
      `Calcula cuánto te toca en 1 segundo 👉 ${URL_CALCULADORA}\n\n` +
      `📅 ${faltan} para el 20 de diciembre.`,
  ];
  return textos[semana % textos.length] + `\n\n👉 Síguenos para más información útil de RD.\n\n#RegaliaPascual #DobleSueldo #RepublicaDominicana`;
}

// El enlace va en la segunda línea, antes del "Ver más" de Facebook.
function captionImagen(primeraLinea: string, diasParaPago: number) {
  const faltan = diasParaPago === 1 ? "Falta 1 día" : `Faltan ${diasParaPago} días`;
  return (
    `${primeraLinea}\n` +
    `Calcula el tuyo gratis en 10 segundos 👉 ${URL_CALCULADORA}\n\n` +
    `La regalía es la doceava parte de lo que ganaste en el año: sueldo × meses trabajados ÷ 12. No le descuentan ISR ni TSS.\n\n` +
    `📅 ${faltan} para el 20 de diciembre, fecha límite para pagarla.\n\n` +
    `#RegaliaPascual #DobleSueldo #RepublicaDominicana`
  );
}

async function publicarImagen(caption: string, imagen: Buffer) {
  const formData = new FormData();
  formData.append("source", new Blob([new Uint8Array(imagen)], { type: "image/png" }), "regalia.png");
  formData.append("caption", caption);
  formData.append("published", "true");
  formData.append("access_token", process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "");
  const res = await fetch("https://graph.facebook.com/v19.0/me/photos", { method: "POST", body: formData });
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
    if (!process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });
    }

    const hoy = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const anio = hoy.slice(0, 4);
    if (hoy < `${anio}-10-01` || hoy > `${anio}-12-20`) {
      return NextResponse.json({ resultado: "fuera de temporada (solo del 1 de octubre al 20 de diciembre)" });
    }

    const fechaHoy = new Date(hoy + "T00:00:00Z");
    const diasParaPago = Math.round((Date.parse(`${anio}-12-20T00:00:00Z`) - fechaHoy.getTime()) / 86400000);

    if (hoy >= INICIO_IMAGENES) {
      const { data: previas, error: errorPrevias } = await supabase
        .from("publicaciones_facebook")
        .select("loteria_slug")
        .like("loteria_slug", MARCA_IMAGEN + "%");
      if (errorPrevias) throw new Error(errorPrevias.message);
      const marcas = (previas || []).map(function (p: any) { return p.loteria_slug as string; });
      const marca = MARCA_IMAGEN + hoy;
      if (marcas.includes(marca)) return NextResponse.json({ marca, resultado: "ya se publico hoy" });
      if (marcas.length >= EJEMPLOS_REGALIA.length) {
        return NextResponse.json({ resultado: `prueba terminada (${marcas.length} imagenes); se revisa el 16 de noviembre antes de seguir` });
      }

      const ejemplo = EJEMPLOS_REGALIA[marcas.length];
      const caption = captionImagen(ejemplo.caption, diasParaPago);
      const imagen = await generarImagenRegalia(ejemplo, diasParaPago);
      const idPublicacion = await publicarImagen(caption, imagen);

      const { error: errorInsert } = await supabase
        .from("publicaciones_facebook")
        .insert({ loteria_slug: marca, fecha: hoy, post_id: idPublicacion, mensaje: caption });
      if (errorInsert) throw new Error(errorInsert.message);
      return NextResponse.json({ marca, resultado: "publicado", post_id: idPublicacion });
    }

    // Formato anterior (hasta el 1 de noviembre): una sola publicacion por
    // semana; la marca es el lunes de la semana de hoy.
    const diaSemana = (fechaHoy.getUTCDay() + 6) % 7; // 0 = lunes
    const lunes = new Date(fechaHoy.getTime() - diaSemana * 86400000).toISOString().slice(0, 10);
    const marca = `calculadora-regalia-${lunes}`;
    const { data: yaHay, error: errorConsulta } = await supabase
      .from("publicaciones_facebook")
      .select("loteria_slug")
      .eq("loteria_slug", marca);
    if (errorConsulta) throw new Error(errorConsulta.message);
    if ((yaHay || []).length > 0) return NextResponse.json({ marca, resultado: "ya se publico esta semana" });

    const semana = Math.floor(fechaHoy.getTime() / (7 * 86400000));
    const texto = mensaje(diasParaPago, semana);

    const cuerpo = new URLSearchParams({ message: texto, link: URL_CALCULADORA, access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN });
    const res = await fetch("https://graph.facebook.com/v19.0/me/feed", { method: "POST", body: cuerpo });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Error creando la publicacion en Facebook");

    const { error: errorInsert } = await supabase
      .from("publicaciones_facebook")
      .insert({ loteria_slug: marca, fecha: hoy, post_id: data.id, mensaje: texto });
    if (errorInsert) throw new Error(errorInsert.message);

    return NextResponse.json({ marca, resultado: "publicado", post_id: data.id });
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando la calculadora en Facebook", detalle: error.message }, { status: 500 });
  }
}
