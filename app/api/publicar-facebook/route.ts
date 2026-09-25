import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generarImagenResultados } from "@/lib/imagenPublicacion";
import { enviarNotificacionATodos } from "@/lib/pushNotificaciones";
import { avisarResultadosRecientes } from "@/lib/indexnow";

const LOTERIAS_DESTACADAS = ["nacional", "leidsa", "real", "loteka"];
const SORTEOS_DESCONTINUADOS = [73, 78, 119];

const HASHTAG_LOTERIA: Record<string, string> = {
  nacional: "#LoteriaNacional",
  leidsa: "#Leidsa",
  real: "#LoteriaReal",
  loteka: "#Loteka",
};

function hoyISO() {
  // Republica Dominicana esta fijo en UTC-4 (no usa horario de verano).
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return ahoraRD.toISOString().slice(0, 10);
}

function fechaTitulo(fechaISO: string) {
  return new Date(fechaISO + "T00:00:00").toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

type ResultadoFila = { numeros: string; fecha: string; creado_en: string };
type SorteoFila = { id: number; nombre: string; resultados: ResultadoFila[] };
type LoteriaFila = { id: number; nombre: string; slug: string; sorteos: SorteoFila[] };

type ResultadoDeHoy = {
  sorteoNombre: string;
  numeros: string;
  creadoEn: string;
};

function construirCaption(loteriaNombre: string, loteriaSlug: string, fecha: string, resultados: ResultadoDeHoy[]) {
  const lineas = resultados.map(function (r) { return `${r.sorteoNombre}: ${r.numeros}`; }).join("\n");
  const hashtag = HASHTAG_LOTERIA[loteriaSlug] || "";
  return (
    `🎱 ${loteriaNombre} — Resultados del ${fechaTitulo(fecha)}\n\n${lineas}\n\n` +
    `Ve más resultados en https://labankerard.com/${loteriaSlug}\n\n` +
    `Página informativa. No vendemos jugadas ni aceptamos apuestas.\n\n` +
    `#LoteriaDominicana #ResultadosHoy ${hashtag}`.trim()
  );
}

async function crearPublicacion(caption: string, imagen: Buffer) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  const formData = new FormData();
  formData.append("source", new Blob([new Uint8Array(imagen)], { type: "image/png" }), "resultado.png");
  formData.append("caption", caption);
  formData.append("published", "true");
  formData.append("access_token", token || "");

  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error creando la publicacion en Facebook");
  return data.id as string;
}

async function editarPublicacion(idFoto: string, caption: string) {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const res = await fetch(`https://graph.facebook.com/v19.0/${idFoto}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ caption, access_token: token || "" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error editando la publicacion en Facebook");
}

export async function GET(request: Request) {
  try {
    const secretoEsperado = process.env.CRON_SECRET;
    const autorizacion = request.headers.get("authorization");
    if (secretoEsperado && autorizacion !== `Bearer ${secretoEsperado}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!process.env.FACEBOOK_PAGE_ID || !process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });
    }

    const hoy = hoyISO();

    const { data: loterias, error } = await supabase
      .from("loterias")
      .select("id, nombre, slug, activa, sorteos ( id, nombre, dias_semana, resultados ( numeros, fecha, creado_en ) )")
      .eq("activa", true)
      .in("slug", LOTERIAS_DESTACADAS);

    if (error) throw new Error(error.message);

    const { data: publicacionesHoy, error: errorPublicaciones } = await supabase
      .from("publicaciones_facebook")
      .select("loteria_slug, post_id, mensaje")
      .eq("fecha", hoy);

    if (errorPublicaciones) throw new Error(errorPublicaciones.message);

    const listaLoterias = ((loterias || []) as unknown as LoteriaFila[]).map(function (l) {
      return { ...l, sorteos: (l.sorteos || []).filter(function (s) { return !SORTEOS_DESCONTINUADOS.includes(s.id); }) };
    });

    const resumen: { creadas: string[]; editadas: string[]; sinCambios: string[]; fallidas: { loteria: string; error: string }[] } = {
      creadas: [],
      editadas: [],
      sinCambios: [],
      fallidas: [],
    };

    for (const loteria of listaLoterias) {
      // Cada loteria se procesa por separado: si una falla (ej. un problema
      // puntual de Facebook), las demas se siguen publicando igual.
      try {
        const resultadosDeHoy: ResultadoDeHoy[] = [];
        (loteria.sorteos || []).forEach(function (sorteo) {
          (sorteo.resultados || []).forEach(function (r) {
            if (r.fecha === hoy && r.creado_en) {
              resultadosDeHoy.push({ sorteoNombre: sorteo.nombre, numeros: r.numeros, creadoEn: r.creado_en });
            }
          });
        });

        if (resultadosDeHoy.length === 0) continue;

        resultadosDeHoy.sort(function (a, b) { return new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime(); });
        const captionNueva = construirCaption(loteria.nombre, loteria.slug, hoy, resultadosDeHoy);

        const publicacionExistente = (publicacionesHoy || []).find(function (p) { return p.loteria_slug === loteria.slug; });

        // Resultados que no estaban en la publicacion anterior, para avisar
        // solo de lo nuevo por notificacion push (no de todo el mensaje otra vez).
        const lineasAnteriores = new Set((publicacionExistente?.mensaje || "").split("\n").map(function (l: string) { return l.trim(); }));
        const resultadosNuevos = resultadosDeHoy.filter(function (r) {
          return !lineasAnteriores.has(`${r.sorteoNombre}: ${r.numeros}`);
        });

        if (!publicacionExistente) {
          const imagen = await generarImagenResultados(loteria.nombre, fechaTitulo(hoy), resultadosDeHoy);
          const idPublicacion = await crearPublicacion(captionNueva, imagen);
          const { error: errorInsert } = await supabase
            .from("publicaciones_facebook")
            .insert({ loteria_slug: loteria.slug, fecha: hoy, post_id: idPublicacion, mensaje: captionNueva });
          if (errorInsert) throw new Error(errorInsert.message);
          resumen.creadas.push(loteria.nombre);
        } else if (publicacionExistente.mensaje !== captionNueva) {
          // Facebook a veces no deja editar una publicacion ya hecha (permiso
          // "pages_manage_posts" en nivel basico). Si falla la edicion, en vez
          // de perder el resultado nuevo, se crea una publicacion nueva con
          // todo el detalle actualizado y esa pasa a ser la que se seguira
          // editando (o reemplazando) de aqui en adelante para esta loteria.
          let idPublicacionFinal = publicacionExistente.post_id;
          let seCreoNueva = false;
          try {
            await editarPublicacion(publicacionExistente.post_id, captionNueva);
          } catch {
            const imagen = await generarImagenResultados(loteria.nombre, fechaTitulo(hoy), resultadosDeHoy);
            idPublicacionFinal = await crearPublicacion(captionNueva, imagen);
            seCreoNueva = true;
          }
          const { error: errorUpdate } = await supabase
            .from("publicaciones_facebook")
            .update({ mensaje: captionNueva, post_id: idPublicacionFinal })
            .eq("loteria_slug", loteria.slug)
            .eq("fecha", hoy);
          if (errorUpdate) throw new Error(errorUpdate.message);
          resumen[seCreoNueva ? "creadas" : "editadas"].push(loteria.nombre);
        } else {
          resumen.sinCambios.push(loteria.nombre);
        }

        for (const r of resultadosNuevos) {
          try {
            await enviarNotificacionATodos({
              titulo: `🎱 ${loteria.nombre}`,
              cuerpo: `${r.sorteoNombre}: ${r.numeros}`,
              url: `/${loteria.slug}`,
            });
          } catch {
            // No dejar que un error al notificar arruine la publicacion en Facebook.
          }
        }
      } catch (errorLoteria: any) {
        resumen.fallidas.push({ loteria: loteria.nombre, error: errorLoteria.message });
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
