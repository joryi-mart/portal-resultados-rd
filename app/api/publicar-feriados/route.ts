import { FACEBOOK_PAUSADO, respuestaFacebookPausado } from "@/lib/facebookPausa";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";
import { ganchoDelDia } from "@/lib/ganchos";
import { FERIADOS, MESES, diasEntre, feriadosDelMes, fechaLarga, hoyRD, proximoFeriado, sumarDias, todosLosFeriados, type Feriado } from "@/lib/feriados";
import { imagenCalendarioFeriados, imagenFeriadosDelMes, imagenProximoFeriado } from "@/lib/imagenFeriados";

// Dias feriados en Facebook, 3 veces al mes (lo corre el calendario a diario a
// las 10 AM; solo publica en estos dias y una vez por mes cada uno):
//   1. Primer lunes del mes: calendario completo del año (desde noviembre, el
//      del año siguiente si ya esta publicado).
//   2. Tres dias antes del primer feriado cuyo aviso cae en el mes: "¿El lunes
//      9 es feriado? Sí". Si en el mes no cae ninguno, el dia 15: "Faltan X dias".
//   3. Dia 25 (28 si el 25 es feriado): los feriados del mes que viene.
// Se activa con ?clave=<CRON_SECRET>.
//   ?prueba=1[&fecha=AAAA-MM-DD]                    dice que se publicaria, sin publicar
//   ?prueba=1&imagen=calendario|aviso|mes[&fecha=]  devuelve la imagen
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ENLACE = "https://labankerard.com/dias-feriados?utm_source=facebook&utm_campaign=fb-feriados";

function claveValida(recibida: string | null) {
  const esperada = (process.env.CRON_SECRET || "").trim();
  if (!esperada || esperada.length < 12 || !recibida) return false;
  const a = Buffer.from(recibida.trim());
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function crearPublicacion(caption: string, imagen: Buffer) {
  const formData = new FormData();
  formData.append("source", new Blob([new Uint8Array(imagen)], { type: "image/png" }), "feriados.png");
  formData.append("caption", caption);
  formData.append("published", "true");
  formData.append("access_token", process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "");
  const res = await fetch(`https://graph.facebook.com/v19.0/me/photos`, { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error creando la publicacion en Facebook");
  return data.id as string;
}

type Plan = { tipo: "calendario" | "aviso" | "mes"; slug: string; caption: string; imagen: () => Promise<Buffer> };

function lineasFeriados(lista: Feriado[]) {
  return lista.map(function (f) { return `📅 ${fechaLarga(f.fecha)}: ${f.nombre}${f.nota ? ` (${f.nota.toLowerCase()})` : ""}`; }).join("\n");
}

function cierre() {
  return `\n\n👉 Todos los feriados en: ${ENLACE}\n\nFuente: Ministerio de Trabajo. Página informativa.\n\n#DiasFeriados #RepublicaDominicana #FeriadosRD`;
}

// Que toca publicar en una fecha (puede ser mas de una cosa o ninguna).
function planDelDia(hoy: string): Plan[] {
  const [anio, mes, dia] = hoy.split("-").map(Number);
  const anioMes = hoy.slice(0, 7);
  const gancho = ganchoDelDia("feriados", hoy);
  const planes: Plan[] = [];

  // 1. Primer lunes del mes: calendario completo.
  const esLunes = new Date(hoy + "T12:00:00Z").getUTCDay() === 1;
  if (esLunes && dia <= 7) {
    const anioCal = mes >= 11 && FERIADOS[anio + 1] ? anio + 1 : anio;
    const lista = FERIADOS[anioCal];
    if (lista) {
      planes.push({
        tipo: "calendario",
        slug: `feriados-calendario-${anioMes}`,
        caption: `${gancho} 👇\n🗓️ Días feriados ${anioCal} en República Dominicana, ya con los traslados de ley:\n\n${lineasFeriados(lista)}${cierre()}`,
        imagen: function () { return imagenCalendarioFeriados(anioCal, lista); },
      });
    }
  }

  // 2. Aviso tres dias antes del primer feriado cuyo aviso cae este mes;
  //    si no cae ninguno, cuenta regresiva el dia 15.
  const avisable = todosLosFeriados().find(function (f) { return sumarDias(f.fecha, -3).slice(0, 7) === anioMes; });
  if (avisable && sumarDias(avisable.fecha, -3) === hoy) {
    // "lunes 9"
    const semana = `${fechaLarga(avisable.fecha).split(",")[0]} ${Number(avisable.fecha.slice(8))}`;
    planes.push({
      tipo: "aviso",
      slug: `feriados-aviso-${anioMes}`,
      caption: `${gancho} 👇\n¿El ${semana} es feriado? Sí ✅\n\n${lineasFeriados([avisable])}\n\nEse día no se trabaja (salvo los trabajos que no se detienen).${cierre()}`,
      imagen: function () { return imagenProximoFeriado(avisable, `¿EL ${semana.toUpperCase()} ES FERIADO? SÍ ✅`, "Faltan 3 días"); },
    });
  } else if (!avisable && dia === 15) {
    const siguiente = proximoFeriado(sumarDias(hoy, 1));
    if (siguiente) {
      const faltan = diasEntre(hoy, siguiente.fecha);
      planes.push({
        tipo: "aviso",
        slug: `feriados-aviso-${anioMes}`,
        caption: `${gancho} 👇\n⏳ Faltan ${faltan} días para el próximo feriado:\n\n${lineasFeriados([siguiente])}${cierre()}`,
        imagen: function () { return imagenProximoFeriado(siguiente, "PRÓXIMO FERIADO", `Faltan ${faltan} días`); },
      });
    }
  }

  // 3. Dia 25 (28 si el 25 es feriado): los feriados del mes que viene.
  const diaMes = feriadosDelMes(anioMes).some(function (f) { return f.fecha === `${anioMes}-25`; }) ? 28 : 25;
  if (dia === diaMes) {
    const mesSig = mes === 12 ? `${anio + 1}-01` : `${anio}-${String(mes + 1).padStart(2, "0")}`;
    const nombreMes = MESES[Number(mesSig.slice(5)) - 1];
    const lista = feriadosDelMes(mesSig);
    const siguiente = proximoFeriado(`${mesSig}-01`);
    planes.push({
      tipo: "mes",
      slug: `feriados-mes-${anioMes}`,
      caption: lista.length > 0
        ? `${gancho} 👇\n🗓️ Feriados de ${nombreMes} en República Dominicana (${lista.length}):\n\n${lineasFeriados(lista)}${cierre()}`
        : `${gancho} 👇\n🗓️ En ${nombreMes} no hay feriados en República Dominicana.${siguiente ? `\n\nEl próximo:\n${lineasFeriados([siguiente])}` : ""}${cierre()}`,
      imagen: function () { return imagenFeriadosDelMes(nombreMes, lista, siguiente); },
    });
  }

  return planes;
}

export async function GET(request: Request) {
  if (FACEBOOK_PAUSADO) return respuestaFacebookPausado();
  try {
    const url = new URL(request.url);
    if (!claveValida(url.searchParams.get("clave"))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const prueba = url.searchParams.get("prueba") === "1";
    const fechaPedida = url.searchParams.get("fecha");
    const hoy = prueba && fechaPedida && /^\d{4}-\d{2}-\d{2}$/.test(fechaPedida) ? fechaPedida : hoyRD();

    // Vista previa de una imagen, aunque ese dia no toque publicarla.
    const verImagen = url.searchParams.get("imagen");
    if (prueba && verImagen) {
      const anio = Number(hoy.slice(0, 4));
      const prox = proximoFeriado(hoy);
      let png: Buffer | null = null;
      if (verImagen === "calendario") png = await imagenCalendarioFeriados(FERIADOS[anio + 1] ? anio + 1 : anio, FERIADOS[FERIADOS[anio + 1] ? anio + 1 : anio]);
      if (verImagen === "aviso" && prox) png = await imagenProximoFeriado(prox, `¿EL ${fechaLarga(prox.fecha).split(",")[0].toUpperCase()} ${Number(prox.fecha.slice(8))} ES FERIADO? SÍ ✅`, "Faltan 3 días");
      if (verImagen === "mes") {
        const mesSig = sumarDias(`${hoy.slice(0, 7)}-28`, 7).slice(0, 7);
        png = await imagenFeriadosDelMes(MESES[Number(mesSig.slice(5)) - 1], feriadosDelMes(mesSig), proximoFeriado(`${mesSig}-01`));
      }
      if (!png) return NextResponse.json({ error: "imagen debe ser calendario, aviso o mes" }, { status: 400 });
      return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
    }

    const planes = planDelDia(hoy);
    if (planes.length === 0) return NextResponse.json({ fecha: hoy, resultado: "hoy no toca publicar feriados" });
    if (prueba) return NextResponse.json({ fecha: hoy, publicaria: planes.map(function (p) { return { tipo: p.tipo, slug: p.slug, caption: p.caption }; }) });
    if (!process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });
    }

    const resultados = [];
    for (const p of planes) {
      const { data: ya, error: errorBuscar } = await supabase.from("publicaciones_facebook").select("id").eq("loteria_slug", p.slug).limit(1);
      if (errorBuscar) throw new Error(errorBuscar.message);
      if (ya && ya.length > 0) {
        resultados.push({ slug: p.slug, resultado: "ya publicado antes" });
        continue;
      }
      const postId = await crearPublicacion(p.caption, await p.imagen());
      const { error: errorInsert } = await supabase.from("publicaciones_facebook").insert({ loteria_slug: p.slug, fecha: hoy, post_id: postId, mensaje: p.caption });
      if (errorInsert) throw new Error(errorInsert.message);
      resultados.push({ slug: p.slug, resultado: "publicado", post_id: postId });
    }
    return NextResponse.json({ fecha: hoy, resultados });
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando feriados en Facebook", detalle: error.message }, { status: 500 });
  }
}
