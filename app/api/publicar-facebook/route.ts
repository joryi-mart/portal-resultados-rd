import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const LOTERIAS_DESTACADAS = ["nacional", "leidsa", "real", "loteka"];
const SORTEOS_DESCONTINUADOS = [73, 78, 119];

function hoyISO() {
  // Republica Dominicana esta fijo en UTC-4 (no usa horario de verano).
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return ahoraRD.toISOString().slice(0, 10);
}

function esDeHoyRD(fechaISOConHora: string, hoy: string) {
  const fechaRD = new Date(new Date(fechaISOConHora).getTime() - 4 * 60 * 60 * 1000);
  return fechaRD.toISOString().slice(0, 10) === hoy;
}

type ResultadoFila = { numeros: string; fecha: string; creado_en: string };
type SorteoFila = { id: number; nombre: string; resultados: ResultadoFila[] };
type LoteriaFila = { id: number; nombre: string; slug: string; sorteos: SorteoFila[] };

type ResultadoDeHoy = {
  loteriaNombre: string;
  loteriaSlug: string;
  sorteoId: number;
  sorteoNombre: string;
  numeros: string;
  creadoEn: string;
};

async function obtenerPublicacionesDeHoy(hoy: string) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/feed?fields=message,created_time&limit=25&access_token=${token}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return ((data.data || []) as { message?: string; created_time?: string }[])
    .filter(function (p) { return p.created_time && esDeHoyRD(p.created_time, hoy); })
    .map(function (p) { return p.message || ""; });
}

async function publicarEnFacebook(mensaje: string) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ message: mensaje, access_token: token || "" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error publicando en Facebook");
  return data;
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
      .select("id, nombre, slug, activa, sorteos ( id, nombre, hora_sorteo, dias_semana, resultados ( numeros, fecha, creado_en ) )")
      .eq("activa", true)
      .in("slug", LOTERIAS_DESTACADAS);

    if (error) throw new Error(error.message);

    const listaLoterias = ((loterias || []) as unknown as LoteriaFila[]).map(function (l) {
      return { ...l, sorteos: (l.sorteos || []).filter(function (s) { return !SORTEOS_DESCONTINUADOS.includes(s.id); }) };
    });

    const resultadosDeHoy: ResultadoDeHoy[] = [];
    listaLoterias.forEach(function (loteria) {
      (loteria.sorteos || []).forEach(function (sorteo) {
        (sorteo.resultados || []).forEach(function (r) {
          if (r.fecha === hoy && r.creado_en) {
            resultadosDeHoy.push({
              loteriaNombre: loteria.nombre,
              loteriaSlug: loteria.slug,
              sorteoId: sorteo.id,
              sorteoNombre: sorteo.nombre,
              numeros: r.numeros,
              creadoEn: r.creado_en,
            });
          }
        });
      });
    });

    if (resultadosDeHoy.length === 0) {
      return NextResponse.json({ publicados: 0, motivo: "Todavia no hay resultados de hoy" });
    }

    // Del mas viejo al mas nuevo, para publicar en el orden en que salieron.
    resultadosDeHoy.sort(function (a, b) { return new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime(); });

    const publicacionesDeHoy = await obtenerPublicacionesDeHoy(hoy);
    const pendientes = resultadosDeHoy.filter(function (r) {
      const yaPublicado = publicacionesDeHoy.some(function (mensaje) {
        return mensaje.includes(r.sorteoNombre) && mensaje.includes(r.numeros);
      });
      return !yaPublicado;
    });

    const publicados: number[] = [];
    for (const r of pendientes) {
      const mensaje =
        `🎱 ${r.sorteoNombre} (${r.loteriaNombre})\n\n` +
        `Números: ${r.numeros}\n\n` +
        `Ve más resultados en https://labankerard.com/${r.loteriaSlug}`;
      const resultado = await publicarEnFacebook(mensaje);
      publicados.push(resultado.id);
    }

    return NextResponse.json({ publicados: publicados.length, ids: publicados });
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando en Facebook", detalle: error.message }, { status: 500 });
  }
}
