import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";

// Publica en Facebook el enlace a la calculadora de regalía pascual (Facebook
// arma la tarjeta con la imagen de app/calculadora-regalia-pascual/opengraph-image.png).
// Lo llama el calendario (lib/calendario.json) los lunes: como máximo una vez por
// semana (se marca en publicaciones_facebook) y solo en temporada, del 1 de
// octubre al 20 de diciembre, que es la fecha límite para pagar la regalía.
export const dynamic = "force-dynamic";

const URL_CALCULADORA = "https://labankerard.com/calculadora-regalia-pascual";
const URL_PRESTACIONES = "https://labankerard.com/calcular-prestaciones-rd";

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
  return textos[semana % textos.length] + `\n\n#RegaliaPascual #DobleSueldo #RepublicaDominicana`;
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

    // Una sola publicacion por semana: la marca es el lunes de la semana de hoy.
    const fechaHoy = new Date(hoy + "T00:00:00Z");
    const diaSemana = (fechaHoy.getUTCDay() + 6) % 7; // 0 = lunes
    const lunes = new Date(fechaHoy.getTime() - diaSemana * 86400000).toISOString().slice(0, 10);
    const marca = `calculadora-regalia-${lunes}`;
    const { data: yaHay, error: errorConsulta } = await supabase
      .from("publicaciones_facebook")
      .select("loteria_slug")
      .eq("loteria_slug", marca);
    if (errorConsulta) throw new Error(errorConsulta.message);
    if ((yaHay || []).length > 0) return NextResponse.json({ marca, resultado: "ya se publico esta semana" });

    const diasParaPago = Math.round((Date.parse(`${anio}-12-20T00:00:00Z`) - fechaHoy.getTime()) / 86400000);
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
