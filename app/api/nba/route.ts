import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";

function fechaAFormatoESPN(fecha: string | null) {
  if (!fecha) return null;
  return fecha.replace(/-/g, "");
}

async function obtenerCalendarioNBA(fecha: string | null) {
  const claveCache = "nba-scoreboard-" + (fecha || "hoy");
  const cacheado = getCache(claveCache);
  if (cacheado) return cacheado;

  const fechaESPN = fechaAFormatoESPN(fecha);
  const parametro = fechaESPN ? `?dates=${fechaESPN}` : "";
  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard${parametro}`
  );
  if (!res.ok) throw new Error(`Error NBA API: ${res.status}`);
  const data = await res.json();

  setCache(claveCache, data, 5 * 60 * 1000);
  return data;
}

async function obtenerEquiposNBA() {
  const cacheado = getCache("nba-equipos");
  if (cacheado) return cacheado;

  const res = await fetch(
    "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams?limit=30"
  );
  if (!res.ok) throw new Error(`Error NBA API (equipos): ${res.status}`);
  const data = await res.json();

  const equipos = (data.sports?.[0]?.leagues?.[0]?.teams || []).map((t: any) => ({
    id: t.team.id,
    nombre: t.team.displayName,
    abreviatura: t.team.abbreviation,
    logo: t.team.logos?.[0]?.href || "",
  }));

  setCache("nba-equipos", equipos, 24 * 60 * 60 * 1000);
  return equipos;
}

async function obtenerNoticiasNBA() {
  const cacheado = getCache("noticias-nba");
  if (cacheado) return cacheado;

  const res = await fetch(
    "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news"
  );
  if (!res.ok) throw new Error(`Error NBA API (noticias): ${res.status}`);
  const data = await res.json();

  const noticias = (data.articles || []).map((a: any) => ({
    id: String(a.dataSourceIdentifier || a.headline),
    title: a.headline,
    url: a.links?.web?.href || "",
    image: a.images?.[0]?.url || "",
    published: a.published,
  }));

  setCache("noticias-nba", noticias, 15 * 60 * 1000);
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

function parsearPosicionesNBA(data: any) {
  const conferencias = data.children || [];
  return conferencias.map((conf: any) => {
    const entradas = conf.standings?.entries || [];
    return {
      division: conf.name || "",
      equipos: entradas.map((e: any) => {
        const victorias = extraerValorStat(e.stats, "wins");
        const derrotas = extraerValorStat(e.stats, "losses");
        return {
          nombre: e.team?.displayName || "",
          equipoId: e.team?.id,
          juegosJugados: victorias + derrotas,
          victorias,
          derrotas,
          porcentaje: extraerTextoStat(e.stats, "winPercent"),
          diferencia: extraerTextoStat(e.stats, "gamesBehind"),
          ppgValor: extraerValorStat(e.stats, "avgPointsFor"),
          ppgTexto: extraerTextoStat(e.stats, "avgPointsFor"),
          oppPpgValor: extraerValorStat(e.stats, "avgPointsAgainst"),
          oppPpgTexto: extraerTextoStat(e.stats, "avgPointsAgainst"),
        };
      }),
    };
  });
}

async function obtenerPosicionesNBA() {
  const cacheado = getCache("nba-posiciones");
  if (cacheado) return cacheado;

  const res = await fetch(
    "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings?region=us&lang=en&contentorigin=espn&type=0&level=2&sort=playoffseed:asc"
  );
  if (!res.ok) throw new Error(`Error NBA API (posiciones): ${res.status}`);
  const data = await res.json();

  const posiciones = parsearPosicionesNBA(data);
  setCache("nba-posiciones", posiciones, 30 * 60 * 1000);
  return posiciones;
}

function calcularLideresOfensivaDefensiva(posiciones: any[]) {
  const todos = posiciones.flatMap((div: any) => div.equipos);

  const mejorAtaque = [...todos]
    .sort((a, b) => b.ppgValor - a.ppgValor)
    .slice(0, 10)
    .map((e, i) => ({ puesto: i + 1, nombre: e.nombre, equipo: e.nombre, valor: e.ppgTexto }));

  const mejorDefensa = [...todos]
    .sort((a, b) => a.oppPpgValor - b.oppPpgValor)
    .slice(0, 10)
    .map((e, i) => ({ puesto: i + 1, nombre: e.nombre, equipo: e.nombre, valor: e.oppPpgTexto }));

  return { mejorAtaque, mejorDefensa };
}

async function obtenerRosterEquipo(idEquipo: string) {
  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${idEquipo}/roster`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.athletes || [];
}

async function obtenerJugadoresDominicanos(equipos: any[]) {
  const cacheado = getCache("nba-dominicanos");
  if (cacheado) return cacheado;

  const rosters = await Promise.all(
    equipos.map((eq: any) => obtenerRosterEquipo(eq.id).catch(() => []))
  );

  const dominicanos: any[] = [];
  rosters.forEach((jugadores: any[], indice: number) => {
    const equipo = equipos[indice];
    jugadores.forEach((j: any) => {
      const pais = j.birthPlace?.country || "";
      if (pais.toLowerCase().includes("dominican")) {
        dominicanos.push({
          id: String(j.id),
          nombre: j.fullName,
          posicion: j.position?.abbreviation || "",
          equipo: equipo.nombre,
        });
      }
    });
  });

  dominicanos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  setCache("nba-dominicanos", dominicanos, 12 * 60 * 60 * 1000);
  return dominicanos;
}

async function obtenerDesempenoDominicanos(
  juegosHoy: any[],
  idsDominicanos: Set<string>,
  fecha: string | null
) {
  const claveCache = "nba-desempeno-" + (fecha || "hoy");
  const cacheado = getCache(claveCache);
  if (cacheado) return cacheado;

  if (juegosHoy.length === 0 || idsDominicanos.size === 0) return [];

  const resumenes = await Promise.all(
    juegosHoy.map((juego: any) =>
      fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${juego.id}`
      )
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null)
    )
  );

  const desempenos: any[] = [];

  resumenes.forEach((resumen, indice) => {
    if (!resumen?.boxscore?.players) return;
    const juego = juegosHoy[indice];
    const competidores = juego.competitions?.[0]?.competitors || [];

    resumen.boxscore.players.forEach((equipoBox: any) => {
      const equipoId = equipoBox.team?.id;
      const rival =
        competidores.find((c: any) => c.team?.id !== equipoId)?.team?.displayName || "";
      const estadisticas = equipoBox.statistics?.[0];
      const etiquetas: string[] = estadisticas?.labels || [];
      const indicePts = etiquetas.indexOf("PTS");
      const indiceReb = etiquetas.indexOf("REB");
      const indiceAst = etiquetas.indexOf("AST");

      (estadisticas?.athletes || []).forEach((atleta: any) => {
        const id = String(atleta.athlete?.id || "");
        if (!id || !idsDominicanos.has(id)) return;
        if (!atleta.stats || atleta.didNotPlay) return;

        const puntos = Number(atleta.stats[indicePts]) || 0;
        const rebotes = Number(atleta.stats[indiceReb]) || 0;
        const asistencias = Number(atleta.stats[indiceAst]) || 0;

        if (puntos === 0 && rebotes === 0 && asistencias === 0) return;

        desempenos.push({
          id,
          nombre: atleta.athlete?.displayName || "",
          equipo: equipoBox.team?.displayName || "",
          rival,
          puntos,
          rebotes,
          asistencias,
        });
      });
    });
  });

  setCache(claveCache, desempenos, 10 * 60 * 1000);
  return desempenos;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get("fecha");

    const [nba, equipos, noticiasNBA, posicionesNBA] = await Promise.all([
      obtenerCalendarioNBA(fecha),
      obtenerEquiposNBA(),
      obtenerNoticiasNBA(),
      obtenerPosicionesNBA(),
    ]);

    const jugadoresDominicanos = await obtenerJugadoresDominicanos(equipos);
    const idsDominicanos = new Set<string>(jugadoresDominicanos.map((j: any) => String(j.id)));

    const juegosHoy = nba?.events || [];
    const desempenoDominicanos = await obtenerDesempenoDominicanos(
      juegosHoy,
      idsDominicanos,
      fecha
    );

    const { mejorAtaque, mejorDefensa } = calcularLideresOfensivaDefensiva(posicionesNBA);

    return NextResponse.json({
      actualizado: new Date().toISOString(),
      fecha: fecha || "hoy",
      nba,
      noticiasNBA,
      equipos,
      jugadoresDominicanos,
      posicionesNBA,
      desempenoDominicanos,
      liderAtaque: mejorAtaque,
      liderDefensa: mejorDefensa,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error obteniendo datos", detalle: error.message },
      { status: 500 }
    );
  }
}
