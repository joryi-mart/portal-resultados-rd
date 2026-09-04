import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";

const TEMPORADA_ACTUAL = new Date().getFullYear();

const EQUIPOS_LIDOM: Record<number, string> = {
  672: "Tigres del Licey",
  667: "Águilas Cibaeñas",
  671: "Leones del Escogido",
  669: "Estrellas Orientales",
  668: "Toros del Este",
  670: "Gigantes del Cibao",
};

async function obtenerEquipos() {
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

function parsearPosiciones(data: any) {
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

async function obtenerPosiciones(ligaId: number | null) {
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

async function obtenerNoticiasLIDOM() {
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

export async function GET() {
  try {
    const equipos = await obtenerEquipos();
    const ligaId = equipos[0]?.ligaId || null;

    const [posiciones, noticias] = await Promise.all([
      obtenerPosiciones(ligaId).catch(() => []),
      obtenerNoticiasLIDOM().catch(() => ({ news: [] })),
    ]);

    return NextResponse.json({
      actualizado: new Date().toISOString(),
      equipos,
      posiciones,
      noticias,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error obteniendo datos de LIDOM", detalle: error.message },
      { status: 500 }
    );
  }
}
