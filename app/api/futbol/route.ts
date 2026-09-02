import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";

const LIGAS_VALIDAS = ["esp.1", "eng.1", "uefa.champions"];

function fechaAFormatoESPN(fecha: string | null) {
  if (!fecha) return null;
  return fecha.replace(/-/g, "");
}

async function obtenerCalendario(liga: string, fecha: string | null) {
  const claveCache = "futbol-scoreboard-" + liga + "-" + (fecha || "hoy");
  const cacheado = getCache(claveCache);
  if (cacheado) return cacheado;

  const fechaESPN = fechaAFormatoESPN(fecha);
  const parametro = fechaESPN ? `?dates=${fechaESPN}` : "";
  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/${liga}/scoreboard${parametro}`
  );
  if (!res.ok) throw new Error(`Error Fútbol API (calendario): ${res.status}`);
  const data = await res.json();

  setCache(claveCache, data, 5 * 60 * 1000);
  return data;
}

async function obtenerEquipos(liga: string) {
  const claveCache = "futbol-equipos-" + liga;
  const cacheado = getCache(claveCache);
  if (cacheado) return cacheado;

  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/${liga}/teams?limit=40`
  );
  if (!res.ok) throw new Error(`Error Fútbol API (equipos): ${res.status}`);
  const data = await res.json();

  const equipos = (data.sports?.[0]?.leagues?.[0]?.teams || []).map((t: any) => ({
    id: t.team.id,
    nombre: t.team.displayName,
    abreviatura: t.team.abbreviation,
    logo: t.team.logos?.[0]?.href || "",
  }));

  setCache(claveCache, equipos, 24 * 60 * 60 * 1000);
  return equipos;
}

async function obtenerNoticias(liga: string) {
  const claveCache = "futbol-noticias-" + liga;
  const cacheado = getCache(claveCache);
  if (cacheado) return cacheado;

  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/${liga}/news?lang=es`
  );
  if (!res.ok) throw new Error(`Error Fútbol API (noticias): ${res.status}`);
  const data = await res.json();

  const noticias = (data.articles || []).map((a: any) => ({
    id: String(a.dataSourceIdentifier || a.headline),
    title: a.headline,
    url: a.links?.web?.href || "",
    image: a.images?.[0]?.url || "",
    published: a.published,
  }));

  setCache(claveCache, noticias, 15 * 60 * 1000);
  return noticias;
}

function extraerValorStat(stats: any[], nombre: string) {
  const stat = (stats || []).find((s: any) => s.name === nombre);
  return stat ? stat.value : 0;
}

function extraerTextoStat(stats: any[], nombre: string) {
  const stat = (stats || []).find((s: any) => s.name === nombre);
  return stat ? stat.displayValue : "-";
}

function parsearPosiciones(data: any) {
  const entradas =
    data.children?.[0]?.standings?.entries ||
    data.standings?.entries ||
    [];

  const equipos = entradas.map((e: any) => ({
    nombre: e.team?.displayName || "",
    logo: e.team?.logos?.[0]?.href || "",
    juegosJugados: extraerValorStat(e.stats, "gamesPlayed"),
    victorias: extraerValorStat(e.stats, "wins"),
    empates: extraerValorStat(e.stats, "ties"),
    derrotas: extraerValorStat(e.stats, "losses"),
    puntos: extraerValorStat(e.stats, "points"),
    diferencia: extraerTextoStat(e.stats, "pointDifferential"),
  }));

  equipos.sort(function (a: any, b: any) {
    return b.puntos - a.puntos;
  });

  return equipos;
}

async function obtenerPosiciones(liga: string) {
  const claveCache = "futbol-posiciones-" + liga;
  const cacheado = getCache(claveCache);
  if (cacheado) return cacheado;

  const res = await fetch(
    `https://site.api.espn.com/apis/v2/sports/soccer/${liga}/standings`
  );
  if (!res.ok) throw new Error(`Error Fútbol API (posiciones): ${res.status}`);
  const data = await res.json();

  const posiciones = parsearPosiciones(data);
  setCache(claveCache, posiciones, 30 * 60 * 1000);
  return posiciones;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const liga = searchParams.get("liga") || "esp.1";
    const fecha = searchParams.get("fecha");

    if (!LIGAS_VALIDAS.includes(liga)) {
      return NextResponse.json({ error: "Liga no soportada" }, { status: 400 });
    }

    const [calendario, equipos, noticias, posiciones] = await Promise.all([
      obtenerCalendario(liga, fecha),
      obtenerEquipos(liga),
      obtenerNoticias(liga),
      obtenerPosiciones(liga),
    ]);

    return NextResponse.json({
      actualizado: new Date().toISOString(),
      liga,
      fecha: fecha || "hoy",
      calendario,
      equipos,
      noticias,
      posiciones,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error obteniendo datos", detalle: error.message },
      { status: 500 }
    );
  }
}