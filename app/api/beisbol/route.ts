import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";

const PALABRAS_DOMINICANAS = [
  "lidom",
  "dominicano",
  "dominicana",
  "república dominicana",
  "quisqueya",
  "quisqueyano",
  "quisqueyana",
  "licey",
  "águilas cibaeñas",
  "aguilas cibaenas",
  "gigantes del cibao",
  "toros del este",
  "estrellas orientales",
  "leones del escogido",
  "santo domingo",
  "san pedro de macorís",
  "las estrellas",
  "criollo",
  "peloteros dominicanos",
  "as dominicano",
];

const TEMPORADA_ACTUAL = new Date().getFullYear();

function esNoticiaDominicanosEnMLB(articulo: any) {
  const texto = `${articulo.title || ""} ${articulo.description || ""}`.toLowerCase();
  return PALABRAS_DOMINICANAS.some((palabra) => texto.includes(palabra));
}

async function obtenerCalendarioMLB(fecha: string | null) {
  const claveCache = "mlb-schedule-" + (fecha || "hoy");
  const cacheado = getCache(claveCache);
  if (cacheado) return cacheado;

  const parametroFecha = fecha ? `&date=${fecha}` : "";
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/schedule?sportId=1&hydrate=probablePitcher,broadcasts,decisions${parametroFecha}`
  );
  if (!res.ok) throw new Error(`Error MLB API: ${res.status}`);
  const data = await res.json();

  setCache(claveCache, data, 5 * 60 * 1000);
  return data;
}

async function obtenerNoticiasMLB() {
  const cacheado = getCache("noticias-mlb");
  if (cacheado) return cacheado;

  const apiKey = process.env.CURRENTS_API_KEY;
  if (!apiKey) throw new Error("Falta la clave CURRENTS_API_KEY en .env.local");

  const query = encodeURIComponent(
    'MLB OR "Grandes Ligas" OR "béisbol" OR "beisbol" OR "Serie Mundial"'
  );
  const url = `https://api.currentsapi.services/v1/search?keywords=${query}&language=es`;

  const res = await fetch(url, {
    headers: {
      Authorization: apiKey,
    },
  });
  if (!res.ok) throw new Error(`Error Currents API: ${res.status}`);
  const data = await res.json();

  const resultado = { ...data, news: data.news || [] };

  setCache("noticias-mlb", resultado, 15 * 60 * 1000);
  return resultado;
}

async function obtenerEquiposMLB() {
  const cacheado = getCache("mlb-equipos");
  if (cacheado) return cacheado;

  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/teams?sportId=1&season=${TEMPORADA_ACTUAL}`
  );
  if (!res.ok) throw new Error(`Error MLB API (equipos): ${res.status}`);
  const data = await res.json();

  const equipos = (data.teams || []).map((t: any) => ({
    id: t.id,
    nombre: t.name,
    liga: t.league?.name || "",
    division: t.division?.name || "",
  }));

  setCache("mlb-equipos", equipos, 24 * 60 * 60 * 1000);
  return equipos;
}

async function obtenerJugadoresDominicanos() {
  const cacheado = getCache("mlb-dominicanos");
  if (cacheado) return cacheado;

  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/sports/1/players?season=${TEMPORADA_ACTUAL}`
  );
  if (!res.ok) throw new Error(`Error MLB API (jugadores): ${res.status}`);
  const data = await res.json();

  const dominicanos = (data.people || [])
    .filter((p: any) => p.birthCountry === "Dominican Republic")
    .map((p: any) => ({
      id: p.id,
      nombre: p.fullName,
      posicion: p.primaryPosition?.abbreviation || "",
      equipo: p.currentTeam?.name || "Sin equipo actual",
    }))
    .sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));

  setCache("mlb-dominicanos", dominicanos, 6 * 60 * 60 * 1000);
  return dominicanos;
}

async function obtenerLideres(categoria: string, cacheKey: string) {
  const cacheado = getCache(cacheKey);
  if (cacheado) return cacheado;

  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/stats/leaders?leaderCategories=${categoria}&season=${TEMPORADA_ACTUAL}&sportId=1&limit=10`
  );
  if (!res.ok) throw new Error(`Error MLB API (${categoria}): ${res.status}`);
  const data = await res.json();

  const lista = (data.leagueLeaders?.[0]?.leaders || []).map((l: any) => ({
    puesto: l.rank,
    nombre: l.person?.fullName || "",
    equipo: l.team?.name || "",
    valor: l.value,
  }));

  setCache(cacheKey, lista, 6 * 60 * 60 * 1000);
  return lista;
}

const NOMBRES_LIDOM = [
  "Licey",
  "Águilas Cibaeñas",
  "Aguilas Cibaenas",
  "Escogido",
  "Estrellas Orientales",
  "Toros del Este",
  "Gigantes del Cibao",
];

async function obtenerEquiposLIDOM() {
  const cacheado = getCache("lidom-equipos");
  if (cacheado) return cacheado;

  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/teams?sportId=17&season=${TEMPORADA_ACTUAL}`
  );
  if (!res.ok) throw new Error(`Error MLB API (LIDOM equipos): ${res.status}`);
  const data = await res.json();

  const equiposLIDOM = (data.teams || []).filter((t: any) =>
    NOMBRES_LIDOM.some((nombre) => (t.name || "").includes(nombre))
  );

  const equipos = equiposLIDOM.map((t: any) => ({
    id: t.id,
    nombre: t.name,
    liga: t.league?.name || "LIDOM",
  }));

  const ligaId = equiposLIDOM[0]?.league?.id || null;

  const resultado = { equipos, ligaId };
  setCache("lidom-equipos", resultado, 12 * 60 * 60 * 1000);
  return resultado;
}

function parsearPosiciones(data: any) {
  return (data.records || []).map((registro: any) => ({
    division: registro.division?.name || "",
    equipos: (registro.teamRecords || []).map((tr: any) => ({
      nombre: tr.team?.name || "",
      equipoId: tr.team?.id,
      juegosJugados: tr.gamesPlayed,
      victorias: tr.wins,
      derrotas: tr.losses,
      porcentaje: tr.winningPercentage,
      diferencia: tr.gamesBack,
    })),
  }));
}

async function obtenerPosicionesMLB() {
  const cacheado = getCache("mlb-posiciones");
  if (cacheado) return cacheado;

  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${TEMPORADA_ACTUAL}&standingsTypes=regularSeason`
  );
  if (!res.ok) throw new Error(`Error MLB API (posiciones): ${res.status}`);
  const data = await res.json();

  const posiciones = parsearPosiciones(data);
  setCache("mlb-posiciones", posiciones, 30 * 60 * 1000);
  return posiciones;
}

async function obtenerPosicionesLIDOM(ligaId: number | null) {
  if (!ligaId) return [];

  const cacheado = getCache("lidom-posiciones");
  if (cacheado) return cacheado;

  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/standings?leagueId=${ligaId}&season=${TEMPORADA_ACTUAL}&sportId=17&standingsTypes=regularSeason`
  );
  if (!res.ok) throw new Error(`Error MLB API (posiciones LIDOM): ${res.status}`);
  const data = await res.json();

  const posiciones = parsearPosiciones(data);
  setCache("lidom-posiciones", posiciones, 30 * 60 * 1000);
  return posiciones;
}

async function obtenerBoxscores(juegos: any[], fecha: string | null) {
  const claveCache = "mlb-boxscores-" + (fecha || "hoy");
  const cacheado = getCache(claveCache);
  if (cacheado) return cacheado;

  if (juegos.length === 0) return [];

  const boxscores = await Promise.all(
    juegos.map((juego) =>
      fetch(`https://statsapi.mlb.com/api/v1/game/${juego.gamePk}/boxscore`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null)
    )
  );

  setCache(claveCache, boxscores, 10 * 60 * 1000);
  return boxscores;
}

function calcularDestacadoPorJuego(juegosHoy: any[], boxscores: any[]) {
  const destacados: Record<number, any> = {};

  boxscores.forEach((box, indice) => {
    if (!box) return;
    const juego = juegosHoy[indice];
    let mejor: any = null;
    let mejorPuntaje = 0;

    [box.teams?.away, box.teams?.home].forEach((datos) => {
      if (!datos) return;
      Object.values(datos.players || {}).forEach((j: any) => {
        const bateo = j.stats?.batting;
        if (!bateo || Number(bateo.atBats) === 0) return;

        const puntaje = Number(bateo.hits || 0) + Number(bateo.homeRuns || 0) * 2 + Number(bateo.rbi || 0);
        if (puntaje > mejorPuntaje) {
          mejorPuntaje = puntaje;
          mejor = {
            nombre: j.person?.fullName || "",
            equipo: datos.team?.name || "",
            turnos: bateo.atBats,
            hits: bateo.hits,
            jonrones: bateo.homeRuns,
            empujadas: bateo.rbi,
          };
        }
      });
    });

    if (mejor) destacados[juego.gamePk] = mejor;
  });

  return destacados;
}

async function obtenerDesempenoDominicanos(juegosHoy: any[], boxscores: any[], idsDominicanos: Set<number>) {
  const desempenos: any[] = [];

  boxscores.forEach((box, indice) => {
    if (!box) return;
    const juego = juegosHoy[indice];
    const lados = [
      { datos: box.teams?.away, rival: juego.teams?.home?.team?.name },
      { datos: box.teams?.home, rival: juego.teams?.away?.team?.name },
    ];

    lados.forEach(({ datos, rival }) => {
      if (!datos) return;
      const jugadores = datos.players || {};

      Object.values(jugadores).forEach((j: any) => {
        const id = j.person?.id;
        if (!id || !idsDominicanos.has(id)) return;

        const bateo = j.stats?.batting;
        const picheo = j.stats?.pitching;
        const jugoBateo = bateo && (Number(bateo.atBats) > 0 || Number(bateo.hits) > 0);
        const jugoPicheo = picheo && picheo.inningsPitched && picheo.inningsPitched !== "0.0";

        if (!jugoBateo && !jugoPicheo) return;

        desempenos.push({
          id,
          nombre: j.person?.fullName || "",
          equipo: datos.team?.name || "",
          rival: rival || "",
          bateo: jugoBateo
            ? {
                turnos: bateo.atBats,
                hits: bateo.hits,
                jonrones: bateo.homeRuns,
                carreras: bateo.runs,
                empujadas: bateo.rbi,
              }
            : null,
          picheo: jugoPicheo
            ? {
                entradas: picheo.inningsPitched,
                ponches: picheo.strikeOuts,
                carreras: picheo.runs,
                hits: picheo.hits,
              }
            : null,
        });
      });
    });
  });

  return desempenos;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get("fecha");

    const [mlb, equipos, jugadoresDominicanos, liderJonrones, liderPitcheo, lidom, posicionesMLB] =
      await Promise.all([
        obtenerCalendarioMLB(fecha),
        obtenerEquiposMLB(),
        obtenerJugadoresDominicanos(),
        obtenerLideres("homeRuns", "mlb-lider-jonrones"),
        obtenerLideres("wins", "mlb-lider-pitcheo"),
        obtenerEquiposLIDOM(),
        obtenerPosicionesMLB(),
      ]);

    const idsDominicanos = new Set<number>(jugadoresDominicanos.map((j: any) => Number(j.id)));
    const juegosHoy = mlb?.dates?.[0]?.games || [];

    const [noticiasMLB, posicionesLIDOM, boxscores] = await Promise.all([
      obtenerNoticiasMLB(),
      obtenerPosicionesLIDOM(lidom.ligaId),
      obtenerBoxscores(juegosHoy, fecha),
    ]);

    const desempenoDominicanos = await obtenerDesempenoDominicanos(juegosHoy, boxscores, idsDominicanos);
    const destacadosPorJuego = calcularDestacadoPorJuego(juegosHoy, boxscores);

    return NextResponse.json({
      actualizado: new Date().toISOString(),
      fecha: fecha || "hoy",
      mlb,
      noticiasMLB,
      equipos,
      jugadoresDominicanos,
      liderJonrones,
      liderPitcheo,
      equiposLIDOM: lidom.equipos,
      posicionesMLB,
      posicionesLIDOM,
      desempenoDominicanos,
      destacadosPorJuego,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error obteniendo datos", detalle: error.message },
      { status: 500 }
    );
  }
}