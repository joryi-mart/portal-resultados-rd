import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const LOTERIAS_DESTACADAS = ["nacional", "leidsa", "real", "loteka"];
const SORTEOS_DESCONTINUADOS = [73, 78, 119];

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

type UltimoResultado = {
  loteriaNombre: string;
  loteriaSlug: string;
  sorteoNombre: string;
  numeros: string;
  fecha: string;
  creadoEn: string;
};

async function yaSePublicoHoy(fechaTexto: string) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/feed?fields=message&limit=1&access_token=${token}`
  );
  if (!res.ok) return false;
  const data = await res.json();
  const ultimoMensaje: string = data.data?.[0]?.message || "";
  return ultimoMensaje.includes(fechaTexto);
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
      .order("id");

    if (error) throw new Error(error.message);

    const listaLoterias = ((loterias || []) as unknown as LoteriaFila[]).map(function (l) {
      return { ...l, sorteos: (l.sorteos || []).filter(function (s) { return !SORTEOS_DESCONTINUADOS.includes(s.id); }) };
    });

    const ultimosResultados: UltimoResultado[] = [];
    listaLoterias.forEach(function (loteria) {
      (loteria.sorteos || []).forEach(function (sorteo) {
        (sorteo.resultados || []).forEach(function (r) {
          if (r.fecha === hoy && r.creado_en) {
            ultimosResultados.push({
              loteriaNombre: loteria.nombre,
              loteriaSlug: loteria.slug,
              sorteoNombre: sorteo.nombre,
              numeros: r.numeros,
              fecha: r.fecha,
              creadoEn: r.creado_en,
            });
          }
        });
      });
    });
    ultimosResultados.sort(function (a, b) { return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime(); });

    const destacados = LOTERIAS_DESTACADAS
      .map(function (slug) { return ultimosResultados.find(function (r) { return r.loteriaSlug === slug; }); })
      .filter(function (r): r is UltimoResultado { return !!r; });

    if (destacados.length === 0) {
      return NextResponse.json({ publicado: false, motivo: "Todavia no hay resultados de hoy para las loterias destacadas" });
    }

    const tituloFecha = fechaTitulo(hoy);

    if (await yaSePublicoHoy(tituloFecha)) {
      return NextResponse.json({ publicado: false, motivo: "Ya se publico hoy" });
    }

    const lineas = destacados
      .map(function (r) { return `${r.loteriaNombre} (${r.sorteoNombre}): ${r.numeros}`; })
      .join("\n");

    const mensaje =
      `🎱 Resultados de hoy ${tituloFecha}\n\n` +
      lineas +
      `\n\nVe todos los resultados en https://labankerard.com`;

    const resultado = await publicarEnFacebook(mensaje);

    return NextResponse.json({ publicado: true, idPublicacion: resultado.id });
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando en Facebook", detalle: error.message }, { status: 500 });
  }
}
