import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generarImagenTanda, type ResultadoTanda } from "@/lib/imagenTanda";
import { enviarNotificacionATodos } from "@/lib/pushNotificaciones";
import { avisarResultadosRecientes } from "@/lib/indexnow";

const LOTERIAS_DESTACADAS = ["nacional", "leidsa", "real", "loteka"];
const SORTEOS_DESCONTINUADOS = [73, 78, 119];

// Maximo de sorteos por imagen (lib/imagenTanda.tsx, cuadricula de 3
// columnas). Con mas, las bolitas quedarian muy chicas: se reparten en varias
// imagenes dentro de la misma publicacion.
const MAX_SORTEOS_POR_IMAGEN = 16;

// Los resultados del dia se publican en 3 tandas fijas, cada una UNA sola vez
// y nunca se borra ni se rehace. Antes se borraba y se volvia a subir la
// publicacion de cada loteria con cada sorteo nuevo: se perdian los "me gusta"
// y Facebook lo veia como contenido repetido. Cada sorteo cae en la tanda
// segun su hora_sorteo (menor que "hasta"). La tanda sale cuando ya llegaron
// todos sus sorteos de hoy o, si alguno falta, al llegar la hora "limite".
// Horas de Republica Dominicana.
const TANDAS = [
  { id: "mediodia", hasta: "14:00", limite: "14:15", gancho: "¿Qué números salieron hoy al mediodía?", tituloImagen: "Resultados del mediodía" },
  { id: "tarde", hasta: "18:00", limite: "16:30", gancho: "¿Qué números salieron hoy en la tarde?", tituloImagen: "Resultados de la tarde" },
  { id: "noche", hasta: "24:00", limite: "23:30", gancho: "¿Qué números salieron esta noche?", tituloImagen: "Resultados de esta noche" },
];

// Las tandas empiezan este dia; antes de esa fecha ya estaba publicado todo
// con el sistema viejo (una publicacion por loteria) y se repetiria.
const INICIO_TANDAS = "2026-10-24";

// Fila diaria en publicaciones_facebook que guarda los resultados ya avisados
// por notificacion push (no es una publicacion de Facebook).
const SLUG_AVISOS_PUSH = "avisos-push";

const LETRAS_DIA = ["D", "L", "M", "X", "J", "V", "S"];

const HASHTAG_LOTERIA: Record<string, string> = {
  nacional: "#LoteriaNacional",
  leidsa: "#Leidsa",
  real: "#LoteriaReal",
  loteka: "#Loteka",
};

function ahoraRD() {
  // Republica Dominicana esta fijo en UTC-4 (no usa horario de verano).
  return new Date(Date.now() - 4 * 60 * 60 * 1000);
}

function fechaTitulo(fechaISO: string) {
  return new Date(fechaISO + "T00:00:00").toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

type ResultadoFila = { numeros: string; fecha: string; creado_en: string };
type SorteoFila = { id: number; nombre: string; hora_sorteo: string | null; dias_semana: string | null; resultados: ResultadoFila[] };
type LoteriaFila = { id: number; nombre: string; slug: string; sorteos: SorteoFila[] };

type ResultadoDeHoy = {
  sorteoNombre: string;
  numeros: string;
  creadoEn: string;
};

// Invitacion a seguir la pagina y a buscar la marca en Google.
const INVITACION = "👉 Síguenos para recibir los resultados apenas salen.\n🔎 Búscanos en Google como «La Bankera RD».\n\n";

function tandaDeSorteo(horaSorteo: string | null) {
  const hora = (horaSorteo || "23:59").slice(0, 5);
  return TANDAS.find(function (t) { return hora < t.hasta; }) || TANDAS[TANDAS.length - 1];
}

// Arriba va un enlace directo por loteria: desde que se juntaron los
// resultados en 3 tandas (24-oct) el unico enlace era el de la portada, al
// final y escondido tras el "Ver más", y las visitas de Facebook a las
// paginas de loteria cayeron de 3-13 por dia a 0 (Analytics). Los numeros
// siguen en la imagen y mas abajo en el texto.
function construirCaption(gancho: string, fecha: string, bloques: { loteria: LoteriaFila; resultados: ResultadoDeHoy[] }[]) {
  const enlaces = bloques.map(function (b) { return `📍 ${b.loteria.nombre} 👉 https://labankerard.com/${b.loteria.slug}`; }).join("\n");
  const cuerpo = bloques.map(function (b) {
    const lineas = b.resultados.map(function (r) { return `${r.sorteoNombre}: ${r.numeros}`; }).join("\n");
    return `${b.loteria.nombre}\n${lineas}`;
  }).join("\n\n");
  const hashtags = bloques.map(function (b) { return HASHTAG_LOTERIA[b.loteria.slug] || ""; }).filter(Boolean).join(" ");
  return (
    `🎱 ${gancho} Aquí están 👇\n${enlaces}\n\n${fechaTitulo(fecha)}\n${cuerpo}\n\n` +
    INVITACION +
    `Ve todos los resultados en https://labankerard.com\n\n` +
    `Página informativa. No vendemos jugadas ni aceptamos apuestas.\n\n` +
    `#LoteriaDominicana #ResultadosHoy ${hashtags}`.trim()
  );
}

// Sube una foto sin publicarla, para luego juntarla con otras en una sola
// publicacion.
async function subirFotoSinPublicar(imagen: Buffer) {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  const formData = new FormData();
  formData.append("source", new Blob([new Uint8Array(imagen)], { type: "image/png" }), "resultado.png");
  formData.append("published", "false");
  formData.append("access_token", token || "");

  // Se usa "me" (la pagina duena del token) en vez del numero de FACEBOOK_PAGE_ID,
  // para no depender de que ese numero este guardado correctamente en Vercel.
  const res = await fetch(`https://graph.facebook.com/v19.0/me/photos`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error subiendo la foto a Facebook");
  return data.id as string;
}

async function crearPublicacionConFotos(caption: string, imagenes: Buffer[]) {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const idsFotos: string[] = [];
  for (const imagen of imagenes) idsFotos.push(await subirFotoSinPublicar(imagen));

  const formData = new FormData();
  formData.append("message", caption);
  idsFotos.forEach(function (id, i) {
    formData.append(`attached_media[${i}]`, JSON.stringify({ media_fbid: id }));
  });
  formData.append("access_token", token || "");

  const res = await fetch(`https://graph.facebook.com/v19.0/me/feed`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error creando la publicacion en Facebook");
  return data.id as string;
}

export async function GET(request: Request) {
  try {
    const secretoEsperado = process.env.CRON_SECRET;
    // .trim(): algunos paneles (ej. cron-job.org) a veces guardan un espacio o
    // salto de linea de mas al pegar la clave; se ignora para no fallar por eso.
    const autorizacion = (request.headers.get("authorization") || "").trim();
    if (secretoEsperado && autorizacion !== `Bearer ${secretoEsperado.trim()}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });
    }

    const ahora = ahoraRD();
    const hoy = ahora.toISOString().slice(0, 10);
    const horaActual = ahora.toISOString().slice(11, 16);
    const letraHoy = LETRAS_DIA[new Date(hoy + "T12:00:00Z").getUTCDay()];

    const { data: loterias, error } = await supabase
      .from("loterias")
      .select("id, nombre, slug, activa, sorteos ( id, nombre, hora_sorteo, dias_semana, resultados ( numeros, fecha, creado_en ) )")
      .eq("activa", true)
      .in("slug", LOTERIAS_DESTACADAS);

    if (error) throw new Error(error.message);

    const { data: publicacionesHoy, error: errorPublicaciones } = await supabase
      .from("publicaciones_facebook")
      .select("loteria_slug, post_id, mensaje")
      .eq("fecha", hoy);

    if (errorPublicaciones) throw new Error(errorPublicaciones.message);

    // Mismo orden en que salen los sorteos en el dia.
    const ORDEN = ["real", "nacional", "loteka", "leidsa"];
    const listaLoterias = ((loterias || []) as unknown as LoteriaFila[])
      .map(function (l) {
        return { ...l, sorteos: (l.sorteos || []).filter(function (s) { return !SORTEOS_DESCONTINUADOS.includes(s.id); }) };
      })
      .sort(function (a, b) { return ORDEN.indexOf(a.slug) - ORDEN.indexOf(b.slug); });

    const resumen: { publicadas: string[]; esperando: string[]; fallidas: { tanda: string; error: string }[]; avisosPush: number } = {
      publicadas: [],
      esperando: [],
      fallidas: [],
      avisosPush: 0,
    };

    // 1) Notificaciones push: salen al momento para cada resultado nuevo,
    // sin esperar a la tanda de Facebook.
    const filaAvisos = (publicacionesHoy || []).find(function (p) { return p.loteria_slug === SLUG_AVISOS_PUSH; });
    const yaAvisados = new Set<string>();
    (publicacionesHoy || []).forEach(function (p) {
      (p.mensaje || "").split("\n").forEach(function (l: string) { yaAvisados.add(l.trim()); });
    });
    const nuevosAvisados: string[] = [];

    for (const loteria of listaLoterias) {
      for (const sorteo of loteria.sorteos) {
        for (const r of sorteo.resultados || []) {
          if (r.fecha !== hoy || !r.creado_en) continue;
          const linea = `${sorteo.nombre}: ${r.numeros}`;
          const clave = `${loteria.slug}|${linea}`;
          // Se compara tambien con la linea sola por las publicaciones del
          // sistema viejo, que la guardaban sin el nombre de la loteria.
          if (yaAvisados.has(clave) || yaAvisados.has(linea)) continue;
          nuevosAvisados.push(clave);
          try {
            await enviarNotificacionATodos({ titulo: `🎱 ${loteria.nombre}`, cuerpo: linea, url: `/${loteria.slug}` });
          } catch {
            // No dejar que un error al notificar arruine la publicacion en Facebook.
          }
        }
      }
    }

    if (nuevosAvisados.length > 0) {
      const mensajeAvisos = [filaAvisos?.mensaje || "", ...nuevosAvisados].filter(Boolean).join("\n");
      const { error: errorAvisos } = filaAvisos
        ? await supabase.from("publicaciones_facebook").update({ mensaje: mensajeAvisos }).eq("loteria_slug", SLUG_AVISOS_PUSH).eq("fecha", hoy)
        : await supabase.from("publicaciones_facebook").insert({ loteria_slug: SLUG_AVISOS_PUSH, fecha: hoy, post_id: "push", mensaje: mensajeAvisos });
      if (errorAvisos) throw new Error(errorAvisos.message);
      resumen.avisosPush = nuevosAvisados.length;
    }

    // 2) Tandas de Facebook.
    for (const tanda of TANDAS) {
      if (hoy < INICIO_TANDAS) break;
      const slugTanda = `tanda-${tanda.id}`;
      if ((publicacionesHoy || []).some(function (p) { return p.loteria_slug === slugTanda; })) continue;

      try {
        let faltanSorteos = false;
        const bloques: { loteria: LoteriaFila; resultados: ResultadoDeHoy[] }[] = [];

        for (const loteria of listaLoterias) {
          const resultados: ResultadoDeHoy[] = [];
          for (const sorteo of loteria.sorteos) {
            if (tandaDeSorteo(sorteo.hora_sorteo).id !== tanda.id) continue;
            const r = (sorteo.resultados || []).find(function (x) { return x.fecha === hoy && x.creado_en; });
            if (r) resultados.push({ sorteoNombre: sorteo.nombre, numeros: r.numeros, creadoEn: r.creado_en });
            else if ((sorteo.dias_semana || "").split(",").includes(letraHoy)) faltanSorteos = true;
          }
          if (resultados.length === 0) continue;
          resultados.sort(function (a, b) { return new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime(); });
          bloques.push({ loteria, resultados });
        }

        if (bloques.length === 0) continue;
        if (faltanSorteos && horaActual < tanda.limite) {
          resumen.esperando.push(tanda.id);
          continue;
        }

        // Una sola imagen vertical con todas las loterias de la tanda (antes era
        // una imagen por loteria y Facebook recortaba el collage). Si un dia
        // hubiera demasiados sorteos para que se lean bien, se reparten en mas
        // de una imagen.
        const todos: ResultadoTanda[] = [];
        bloques.forEach(function (b) {
          b.resultados.forEach(function (r) { todos.push({ loteria: b.loteria.nombre, sorteo: r.sorteoNombre, numeros: r.numeros }); });
        });
        const partes = Math.ceil(todos.length / MAX_SORTEOS_POR_IMAGEN);
        const fechaImagen = fechaTitulo(hoy).replace(",", "").replace(/^./, function (c) { return c.toUpperCase(); });
        const imagenes: Buffer[] = [];
        for (let i = 0; i < partes; i++) {
          const grupo = todos.slice(i * MAX_SORTEOS_POR_IMAGEN, (i + 1) * MAX_SORTEOS_POR_IMAGEN);
          imagenes.push(await generarImagenTanda(tanda.tituloImagen, fechaImagen, grupo));
        }

        const caption = construirCaption(tanda.gancho, hoy, bloques);
        const idPublicacion = await crearPublicacionConFotos(caption, imagenes);
        const { error: errorInsert } = await supabase
          .from("publicaciones_facebook")
          .insert({ loteria_slug: slugTanda, fecha: hoy, post_id: idPublicacion, mensaje: caption });
        if (errorInsert) throw new Error(errorInsert.message);
        resumen.publicadas.push(tanda.id);
      } catch (errorTanda: any) {
        resumen.fallidas.push({ tanda: tanda.id, error: errorTanda.message });
      }
    }

    // Aviso a Bing (IndexNow) de las paginas con resultados nuevos, de TODAS las
    // loterias (no solo las que se publican en Facebook). Nunca debe romper la
    // publicacion: la funcion atrapa sus propios errores.
    const indexnow = await avisarResultadosRecientes(15);

    return NextResponse.json({ ...resumen, indexnow });
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando en Facebook", detalle: error.message }, { status: 500 });
  }
}
