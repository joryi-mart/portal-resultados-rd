import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";
import { nombreMes, obtenerInforme, slugMes, ultimoMesCompleto } from "@/lib/informeMensual";

// Publica en Facebook el "Informe del mes" (labankerard.com/informe/<mes>) del
// ultimo mes terminado. Lo corre el calendario todos los dias, pero solo
// publica en los primeros 7 dias del mes y una sola vez por mes (se marca en
// publicaciones_facebook). Se activa con ?clave=<CRON_SECRET>.
//   ?prueba=1   devuelve el texto sin publicar
export const dynamic = "force-dynamic";

const DIAS_PARA_PUBLICAR = 7;

function claveValida(recibida: string | null) {
  const esperada = (process.env.CRON_SECRET || "").trim();
  if (!esperada || esperada.length < 12 || !recibida) return false;
  const a = Buffer.from(recibida.trim());
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function crearPublicacionConEnlace(mensaje: string, enlace: string) {
  const formData = new FormData();
  formData.append("message", mensaje);
  formData.append("link", enlace);
  formData.append("access_token", process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "");
  // "me" en vez del numero de FACEBOOK_PAGE_ID, para no depender de ese numero.
  const res = await fetch(`https://graph.facebook.com/v19.0/me/feed`, { method: "POST", body: formData });
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
    const prueba = url.searchParams.get("prueba") === "1";

    const ahora = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const hoy = ahora.toISOString().slice(0, 10);
    if (!prueba && ahora.getUTCDate() > DIAS_PARA_PUBLICAR) {
      return NextResponse.json({ resultado: `solo se publica en los primeros ${DIAS_PARA_PUBLICAR} dias del mes` });
    }

    const mes = ultimoMesCompleto();
    const slug = `informe-${slugMes(mes)}`;
    const { data: yaHay, error: errorBuscar } = await supabase.from("publicaciones_facebook").select("id").eq("loteria_slug", slug).limit(1);
    if (errorBuscar) throw new Error(errorBuscar.message);
    if (!prueba && yaHay && yaHay.length > 0) return NextResponse.json({ slug, resultado: "ya publicado antes" });

    const informe = await obtenerInforme(mes);
    const enlace = `https://labankerard.com/informe/${slugMes(mes)}`;
    const lineas = informe
      .filter(function (l) { return l.sorteos > 0 && l.masSalidos[0]; })
      .map(function (l) { return `📍 ${l.nombre}: el ${l.masSalidos[0].numero} (${l.masSalidos[0].veces} veces)`; })
      .join("\n");
    const mensaje =
      `🔥 ¿Cuáles fueron los números que más salieron en ${nombreMes(mes)}? Aquí está el informe del mes 👇\n\n` +
      `${lineas}\n\n` +
      `Mira el top 5 de cada lotería, los números que no salieron ni una vez y cuántos se repitieron:\n${enlace}\n\n` +
      `Página informativa. No vendemos jugadas ni aceptamos apuestas.\n\n` +
      `#LoteriaDominicana #NumerosMasSalidos #Leidsa #Loteka #LoteriaNacional`;

    if (prueba) return NextResponse.json({ slug, mensaje, enlace });
    if (!process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });
    }

    const idPublicacion = await crearPublicacionConEnlace(mensaje, enlace);
    const { error: errorInsert } = await supabase
      .from("publicaciones_facebook")
      .insert({ loteria_slug: slug, fecha: hoy, post_id: idPublicacion, mensaje });
    if (errorInsert) throw new Error(errorInsert.message);
    return NextResponse.json({ slug, resultado: "publicado", post_id: idPublicacion });
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando el informe en Facebook", detalle: error.message }, { status: 500 });
  }
}
