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
  sorteoNombre: string;
  numeros: string;
  creadoEn: string;
};

// Encabezado unico por loteria, para encontrar y editar la publicacion de hoy
// en vez de crear una nueva cada vez que sale un sorteo.
function encabezado(loteriaNombre: string) {
  return `🎱 ${loteriaNombre} — Resultados de hoy`;
}

function construirMensaje(loteriaNombre: string, loteriaSlug: string, resultados: ResultadoDeHoy[]) {
  const lineas = resultados.map(function (r) { return `${r.sorteoNombre}: ${r.numeros}`; }).join("\n");
  return `${encabezado(loteriaNombre)}\n\n${lineas}\n\nVe más resultados en https://labankerard.com/${loteriaSlug}`;
}

async function buscarPublicacionDeHoy(hoy: string, loteriaNombre: string) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/feed?fields=id,message,created_time&limit=25&access_token=${token}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const posts = (data.data || []) as { id: string; message?: string; created_time?: string }[];
  const encontrada = posts.find(function (p) {
    return (
      p.created_time &&
      esDeHoyRD(p.created_time, hoy) &&
      (p.message || "").startsWith(encabezado(loteriaNombre))
    );
  });
  return encontrada || null;
}

async function crearPublicacion(mensaje: string) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ message: mensaje, access_token: token || "" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error creando la publicacion en Facebook");
  return data.id as string;
}

async function editarPublicacion(idPublicacion: string, mensaje: string) {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const res = await fetch(`https://graph.facebook.com/v19.0/${idPublicacion}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ message: mensaje, access_token: token || "" }),
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

    const listaLoterias = ((loterias || []) as unknown as LoteriaFila[]).map(function (l) {
      return { ...l, sorteos: (l.sorteos || []).filter(function (s) { return !SORTEOS_DESCONTINUADOS.includes(s.id); }) };
    });

    const resumen: { creadas: string[]; editadas: string[]; sinCambios: string[] } = {
      creadas: [],
      editadas: [],
      sinCambios: [],
    };

    for (const loteria of listaLoterias) {
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
      const mensajeNuevo = construirMensaje(loteria.nombre, loteria.slug, resultadosDeHoy);

      const publicacionExistente = await buscarPublicacionDeHoy(hoy, loteria.nombre);

      if (!publicacionExistente) {
        await crearPublicacion(mensajeNuevo);
        resumen.creadas.push(loteria.nombre);
      } else if (publicacionExistente.message !== mensajeNuevo) {
        await editarPublicacion(publicacionExistente.id, mensajeNuevo);
        resumen.editadas.push(loteria.nombre);
      } else {
        resumen.sinCambios.push(loteria.nombre);
      }
    }

    return NextResponse.json(resumen);
  } catch (error: any) {
    return NextResponse.json({ error: "Error publicando en Facebook", detalle: error.message }, { status: 500 });
  }
}
