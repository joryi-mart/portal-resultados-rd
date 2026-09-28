import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generarImagenResultados } from "@/lib/imagenPublicacion";
import { enviarNotificacionATodos } from "@/lib/pushNotificaciones";
import { avisarResultadosRecientes } from "@/lib/indexnow";

const LOTERIAS_DESTACADAS = ["nacional", "leidsa", "real", "loteka"];
const SORTEOS_DESCONTINUADOS = [73, 78, 119];

// Maximo de sorteos por imagen/publicacion. Si un dia una loteria tiene mas
// sorteos que esto (ej. Lotería Real, que llega a tener 8 en un dia), los
// resultados se reparten en varias publicaciones ("parte 2", "parte 3"...)
// en vez de una sola imagen gigante o, peor, una imagen que se queda vieja.
const MAX_SORTEOS_POR_PUBLICACION = 5;

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

function claveParte(slugBase: string, indiceParte: number) {
  // La primera parte conserva el slug de siempre (para no romper nada de lo
  // que ya existe); de la segunda en adelante se numera.
  return indiceParte === 0 ? slugBase : `${slugBase}-parte${indiceParte + 1}`;
}

function construirCaption(loteriaNombre: string, loteriaSlug: string, fecha: string, resultados: ResultadoDeHoy[], numeroParte: number) {
  const lineas = resultados.map(function (r) { return `${r.sorteoNombre}: ${r.numeros}`; }).join("\n");
  const hashtag = HASHTAG_LOTERIA[loteriaSlug] || "";
  const tituloParte = numeroParte > 1 ? ` (parte ${numeroParte})` : "";
  return (
    `🎱 ${loteriaNombre} — Resultados del ${fechaTitulo(fecha)}${tituloParte}\n\n${lineas}\n\n` +
    `Ve más resultados en https://labankerard.com/${loteriaSlug}\n\n` +
    `Página informativa. No vendemos jugadas ni aceptamos apuestas.\n\n` +
    `#LoteriaDominicana #ResultadosHoy ${hashtag}`.trim()
  );
}

async function crearPublicacion(caption: string, imagen: Buffer) {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  const formData = new FormData();
  formData.append("source", new Blob([new Uint8Array(imagen)], { type: "image/png" }), "resultado.png");
  formData.append("caption", caption);
  formData.append("published", "true");
  formData.append("access_token", token || "");

  // Se usa "me" (la pagina duena del token) en vez del numero de FACEBOOK_PAGE_ID,
  // para no depender de que ese numero este guardado correctamente en Vercel.
  const res = await fetch(`https://graph.facebook.com/v19.0/me/photos`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error creando la publicacion en Facebook");
  return data.id as string;
}

async function borrarPublicacion(idFoto: string) {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const res = await fetch(`https://graph.facebook.com/v19.0/${idFoto}?access_token=${token}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error borrando la publicacion en Facebook");
}

export async function GET(request: Request) {
  try {
    const secretoEsperado = process.env.CRON_SECRET;
    const autorizacion = request.headers.get("authorization");
    if (secretoEsperado && autorizacion !== `Bearer ${secretoEsperado}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
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

    const resumen: { creadas: string[]; actualizadas: string[]; sinCambios: string[]; fallidas: { loteria: string; error: string }[] } = {
      creadas: [],
      actualizadas: [],
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

        // Se reparten los sorteos del dia en grupos de a lo sumo
        // MAX_SORTEOS_POR_PUBLICACION, en el orden en que salieron. Un grupo
        // completo (con el maximo) queda "sellado": una vez publicado, nunca
        // mas se vuelve a tocar, asi que su imagen jamas puede quedar vieja.
        // Solo el ultimo grupo (si no esta lleno) sigue abierto a cambios.
        const partes: ResultadoDeHoy[][] = [];
        for (let i = 0; i < resultadosDeHoy.length; i += MAX_SORTEOS_POR_PUBLICACION) {
          partes.push(resultadosDeHoy.slice(i, i + MAX_SORTEOS_POR_PUBLICACION));
        }

        // Para las notificaciones push: todo resultado que no aparezca en
        // ninguna publicacion ya hecha hoy para esta loteria es "nuevo".
        const publicacionesDeLaLoteria = (publicacionesHoy || []).filter(function (p) {
          return p.loteria_slug === loteria.slug || p.loteria_slug.indexOf(`${loteria.slug}-parte`) === 0;
        });
        const lineasAnteriores = new Set<string>();
        publicacionesDeLaLoteria.forEach(function (p) {
          (p.mensaje || "").split("\n").forEach(function (l: string) { lineasAnteriores.add(l.trim()); });
        });
        const resultadosNuevos = resultadosDeHoy.filter(function (r) {
          return !lineasAnteriores.has(`${r.sorteoNombre}: ${r.numeros}`);
        });

        for (let indiceParte = 0; indiceParte < partes.length; indiceParte++) {
          const resultadosParte = partes[indiceParte];
          const numeroParte = indiceParte + 1;
          const slugParte = claveParte(loteria.slug, indiceParte);
          const nombreConParte = numeroParte > 1 ? `${loteria.nombre} (parte ${numeroParte})` : loteria.nombre;
          const captionNueva = construirCaption(loteria.nombre, loteria.slug, hoy, resultadosParte, numeroParte);

          const publicacionExistente = publicacionesDeLaLoteria.find(function (p) { return p.loteria_slug === slugParte; });

          if (!publicacionExistente) {
            const imagen = await generarImagenResultados(nombreConParte, fechaTitulo(hoy), resultadosParte);
            const idPublicacion = await crearPublicacion(captionNueva, imagen);
            const { error: errorInsert } = await supabase
              .from("publicaciones_facebook")
              .insert({ loteria_slug: slugParte, fecha: hoy, post_id: idPublicacion, mensaje: captionNueva });
            if (errorInsert) throw new Error(errorInsert.message);
            resumen.creadas.push(nombreConParte);
          } else if (publicacionExistente.mensaje !== captionNueva) {
            // Una parte sellada no deberia cambiar nunca; si pasa (ej. se
            // corrigio un numero a mano), tambien se actualiza para reflejarlo.
            // Facebook no deja reemplazar la imagen de una publicacion ya
            // hecha, asi que se borra y se crea una nueva con todo al dia.
            try {
              await borrarPublicacion(publicacionExistente.post_id);
            } catch {
              // Si no se pudo borrar (ej. permisos), se sigue igual: se crea
              // la nueva de todas formas para no perder el resultado nuevo.
            }
            const imagen = await generarImagenResultados(nombreConParte, fechaTitulo(hoy), resultadosParte);
            const idPublicacionNueva = await crearPublicacion(captionNueva, imagen);
            const { error: errorUpdate } = await supabase
              .from("publicaciones_facebook")
              .update({ mensaje: captionNueva, post_id: idPublicacionNueva })
              .eq("loteria_slug", slugParte)
              .eq("fecha", hoy);
            if (errorUpdate) throw new Error(errorUpdate.message);
            resumen.actualizadas.push(nombreConParte);
          } else {
            resumen.sinCambios.push(nombreConParte);
          }
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
