import { getCache, setCache } from "@/lib/cache";

// Datos de la LIDOM (equipos, posiciones, juegos de hoy y noticias). Antes se
// pedian desde el navegador (/api/lidom) y Google solo veia "Cargando...":
// la pagina /lidom no se indexaba. Ahora la pagina los pide en el servidor y
// llegan ya escritos en el HTML; /api/lidom usa estas mismas funciones.

const TEMPORADA_ACTUAL = new Date().getFullYear();

export const EQUIPOS_LIDOM: Record<number, string> = {
  672: "Tigres del Licey",
  667: "Águilas Cibaeñas",
  671: "Leones del Escogido",
  669: "Estrellas Orientales",
  668: "Toros del Este",
  670: "Gigantes del Cibao",
};

export type EquipoLidom = { id: number; nombre: string; ligaId: number | null };
export type PosicionLidom = {
  equipoId: number;
  nombre: string;
  juegosJugados: number;
  victorias: number;
  derrotas: number;
  porcentaje: string;
  diferencia: string;
};
export type NoticiaLidom = { id: string; title: string; url: string; image: string; published: string };
export type JuegoLidom = {
  visitanteId: number;
  visitante: string;
  localId: number;
  local: string;
  venue: string;
  hora: string;
  estado: string;
  carrerasVisitante: number | null;
  carrerasLocal: number | null;
};
export type DatosLidom = {
  actualizado: string;
  equipos: EquipoLidom[];
  posiciones: PosicionLidom[];
  juegosHoy: JuegoLidom[];
  noticias: { news: NoticiaLidom[] };
};

async function obtenerEquipos(): Promise<EquipoLidom[]> {
  const cacheado = getCache("lidom-equipos-v2");
  if (cacheado) return cacheado;

  const res = await fetch(`https://statsapi.mlb.com/api/v1/teams?sportId=17&season=${TEMPORADA_ACTUAL}`);
  if (!res.ok) throw new Error(`Error MLB API (equipos LIDOM): ${res.status}`);
  const data = await res.json();

  const idsLidom = Object.keys(EQUIPOS_LIDOM).map(Number);
  const equipos = (data.teams || [])
    .filter((t: any) => idsLidom.includes(t.id))
    .map((t: any) => ({
      id: t.id,
      nombre: EQUIPOS_LIDOM[t.id] || t.name,
      ligaId: t.league?.id || null,
    }));

  setCache("lidom-equipos-v2", equipos, 12 * 60 * 60 * 1000);
  return equipos;
}

function parsearPosiciones(data: any): PosicionLidom[] {
  const registros = data.records?.[0]?.teamRecords || [];
  return registros
    .map((tr: any) => ({
      equipoId: tr.team?.id,
      nombre: EQUIPOS_LIDOM[tr.team?.id] || tr.team?.name || "",
      juegosJugados: tr.gamesPlayed,
      victorias: tr.wins,
      derrotas: tr.losses,
      porcentaje: tr.winningPercentage,
      diferencia: tr.gamesBack,
    }))
    .sort((a: any, b: any) => (b.victorias || 0) - (a.victorias || 0));
}

async function obtenerPosiciones(ligaId: number | null): Promise<PosicionLidom[]> {
  if (!ligaId) return [];
  const cacheado = getCache("lidom-posiciones-v2");
  if (cacheado) return cacheado;

  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/standings?leagueId=${ligaId}&season=${TEMPORADA_ACTUAL}&standingsTypes=regularSeason`
  );
  if (!res.ok) throw new Error(`Error MLB API (posiciones LIDOM): ${res.status}`);
  const data = await res.json();

  const posiciones = parsearPosiciones(data);
  setCache("lidom-posiciones-v2", posiciones, 30 * 60 * 1000);
  return posiciones;
}

export function hoyRD() {
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return ahoraRD.toISOString().slice(0, 10);
}

async function obtenerJuegosDeHoy(ligaId: number | null): Promise<JuegoLidom[]> {
  if (!ligaId) return [];
  const cacheado = getCache("lidom-juegos-hoy-v2");
  if (cacheado) return cacheado;

  const fecha = hoyRD();
  const res = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=17&leagueId=${ligaId}&date=${fecha}&hydrate=team,venue`);
  if (!res.ok) throw new Error(`Error MLB API (juegos de hoy LIDOM): ${res.status}`);
  const data = await res.json();

  const juegosCrudos = data.dates?.[0]?.games || [];
  const juegos = juegosCrudos.map((g: any) => {
    const idVisitante = g.teams?.away?.team?.id;
    const idLocal = g.teams?.home?.team?.id;
    const horaRD = new Date(new Date(g.gameDate).getTime() - 4 * 60 * 60 * 1000);
    return {
      visitanteId: idVisitante,
      visitante: EQUIPOS_LIDOM[idVisitante] || g.teams?.away?.team?.name || "",
      localId: idLocal,
      local: EQUIPOS_LIDOM[idLocal] || g.teams?.home?.team?.name || "",
      venue: g.venue?.name || "",
      hora: horaRD.toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" }),
      estado: g.status?.detailedState || "",
      carrerasVisitante: typeof g.teams?.away?.score === "number" ? g.teams.away.score : null,
      carrerasLocal: typeof g.teams?.home?.score === "number" ? g.teams.home.score : null,
    };
  });

  // Cache corto: los juegos de hoy pueden pasar a "En Progreso"/"Final".
  setCache("lidom-juegos-hoy-v2", juegos, 5 * 60 * 1000);
  return juegos;
}

async function obtenerNoticiasLIDOM(): Promise<{ news: NoticiaLidom[] }> {
  const cacheado = getCache("noticias-lidom");
  if (cacheado) return cacheado;

  const apiKey = process.env.CURRENTS_API_KEY;
  if (!apiKey) throw new Error("Falta la clave CURRENTS_API_KEY en .env.local");

  const query = encodeURIComponent(
    'LIDOM OR "Tigres del Licey" OR "Águilas Cibaeñas" OR "Leones del Escogido" OR "Estrellas Orientales" OR "Toros del Este" OR "Gigantes del Cibao" OR "pelota invernal"'
  );
  const url = `https://api.currentsapi.services/v1/search?keywords=${query}&language=es`;

  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) throw new Error(`Error Currents API (LIDOM): ${res.status}`);
  const data = await res.json();

  const resultado = { ...data, news: data.news || [] };
  setCache("noticias-lidom", resultado, 30 * 60 * 1000);
  return resultado;
}

export async function obtenerDatosLidom(): Promise<DatosLidom> {
  const equipos = await obtenerEquipos();
  const ligaId = equipos[0]?.ligaId || null;

  const [posiciones, juegosHoy, noticias] = await Promise.all([
    obtenerPosiciones(ligaId).catch(() => []),
    obtenerJuegosDeHoy(ligaId).catch(() => []),
    obtenerNoticiasLIDOM().catch(() => ({ news: [] })),
  ]);

  return { actualizado: new Date().toISOString(), equipos, posiciones, juegosHoy, noticias };
}
