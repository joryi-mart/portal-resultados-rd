// lib/quePasoAyer.ts
// Datos para las publicaciones "¿Qué pasó ayer en...?" (MLB, LIDOM, NBA y fútbol).
// A diferencia de resultadosDeportes.ts (solo marcadores), aquí cada juego trae
// sus momentos clave: pitchers de decisión y jonrones (béisbol), máximo anotador
// (NBA) o goleadores (fútbol). Todo sale de las APIs oficiales; nunca se inventa nada.

import { MLB_EN_ESPANOL } from "./resultadosDeportes";

export type DeporteQuePaso = "mlb" | "lidom" | "nba" | "futbol";

export type JuegoDetallado = {
  visitante: string;
  puntosVisitante: number;
  local: string;
  puntosLocal: number;
  detalles: string[];
};

export const DEPORTES_QUE_PASO: Record<DeporteQuePaso, { nombre: string; emoji: string; enlace: string; hashtags: string }> = {
  mlb: { nombre: "MLB", emoji: "⚾", enlace: "https://labankerard.com/beisbol", hashtags: "#MLB #GrandesLigas #BeisbolDominicano" },
  lidom: { nombre: "LIDOM", emoji: "⚾", enlace: "https://labankerard.com/lidom", hashtags: "#LIDOM #BeisbolDominicano #PelotaInvernal" },
  nba: { nombre: "la NBA", emoji: "🏀", enlace: "https://labankerard.com/nba", hashtags: "#NBA #Baloncesto" },
  futbol: { nombre: "LaLiga", emoji: "⚽", enlace: "https://labankerard.com/futbol", hashtags: "#LaLiga #Futbol" },
};

export function esDeporteQuePaso(valor: string | null): valor is DeporteQuePaso {
  return valor === "mlb" || valor === "lidom" || valor === "nba" || valor === "futbol";
}

const NOMBRES_LIDOM: Record<number, string> = {
  672: "Licey", 667: "Águilas", 671: "Escogido", 669: "Estrellas", 668: "Toros", 670: "Gigantes",
};

async function leerJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${new URL(url).host} respondio ${res.status}`);
  return res.json();
}

// Apellido (o nombre completo si es corto) para que las líneas no se hagan eternas.
function corto(nombreCompleto: string) {
  const partes = nombreCompleto.trim().split(/\s+/);
  if (partes.length <= 1) return nombreCompleto;
  const ultimo = partes[partes.length - 1];
  const sufijo = /^(Jr\.?|Sr\.?|II|III|IV)$/i.test(ultimo);
  return sufijo ? `${partes[partes.length - 2]} ${ultimo}` : ultimo;
}

// ---------- Béisbol (MLB y LIDOM, misma API de MLB) ----------

async function jonronesDelJuego(gamePk: number, nombreEquipo: (lado: "away" | "home") => string) {
  const box = await leerJson(`https://statsapi.mlb.com/api/v1/game/${gamePk}/boxscore`);
  const lineas: string[] = [];
  (["away", "home"] as const).forEach(function (lado) {
    const bateadores: string[] = [];
    Object.values(box.teams?.[lado]?.players || {}).forEach(function (p: any) {
      const hr = p?.stats?.batting?.homeRuns || 0;
      if (hr > 0) bateadores.push(`${corto(p.person.fullName)}${hr > 1 ? ` (${hr})` : ""}`);
    });
    if (bateadores.length) lineas.push(`Jonrones ${nombreEquipo(lado)}: ${bateadores.join(", ")}`);
  });
  return lineas;
}

function textoSerie(serie: any, nombre: (equipoEn: string) => string) {
  if (!serie || serie.wins == null) return null;
  const marcador = `${serie.wins}-${serie.losses}`;
  if (serie.isTied) return `Serie empatada ${marcador}`;
  const lider = nombre(serie.winningTeam?.name || "");
  if (serie.isOver) return `${lider} gana la serie ${marcador}`;
  return `Serie: ${lider} arriba ${marcador}`;
}

async function juegosBeisbol(sportId: number, fechaISO: string, soloLidom: boolean): Promise<JuegoDetallado[]> {
  const data = await leerJson(
    `https://statsapi.mlb.com/api/v1/schedule?sportId=${sportId}&date=${fechaISO}&hydrate=team,decisions,seriesStatus`
  );
  const nombreEquipo = function (t: any) {
    if (soloLidom) return NOMBRES_LIDOM[t.id] || t.teamName || t.name;
    return MLB_EN_ESPANOL[t.name] || t.teamName || t.name;
  };
  const nombrePorNombreEn = function (nombreEn: string) { return MLB_EN_ESPANOL[nombreEn] || nombreEn; };

  const juegos: any[] = (data.dates?.[0]?.games || []).filter(function (j: any) {
    if (j.status?.abstractGameState !== "Final" || j.teams?.away?.score == null || j.teams?.home?.score == null) return false;
    if (soloLidom) return j.teams.away.team.id in NOMBRES_LIDOM && j.teams.home.team.id in NOMBRES_LIDOM;
    return true;
  });

  return Promise.all(
    juegos.map(async function (j) {
      const detalles: string[] = [];
      const d = j.decisions || {};
      if (d.winner && d.loser) {
        detalles.push(
          `Ganó: ${corto(d.winner.fullName)} · Perdió: ${corto(d.loser.fullName)}` + (d.save ? ` · Salvó: ${corto(d.save.fullName)}` : "")
        );
      }
      try {
        const jonrones = await jonronesDelJuego(j.gamePk, function (lado) { return nombreEquipo(j.teams[lado].team); });
        detalles.push(...jonrones);
      } catch {
        // Sin el boxscore se publica igual el juego, solo que sin la línea de jonrones.
      }
      // La serie solo tiene sentido en playoffs (en temporada regular cada serie es de 3-4 juegos).
      if (!soloLidom && ["F", "D", "L", "W"].includes(j.gameType)) {
        const serie = textoSerie(j.seriesStatus, nombrePorNombreEn);
        if (serie) detalles.push(serie);
      }
      return {
        visitante: nombreEquipo(j.teams.away.team),
        puntosVisitante: j.teams.away.score,
        local: nombreEquipo(j.teams.home.team),
        puntosLocal: j.teams.home.score,
        detalles,
      };
    })
  );
}

// ---------- NBA (ESPN) ----------

async function juegosNBA(fechaISO: string): Promise<JuegoDetallado[]> {
  const data = await leerJson(
    `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${fechaISO.replace(/-/g, "")}`
  );
  const resultado: JuegoDetallado[] = [];
  (data.events || []).forEach(function (e: any) {
    if (e.status?.type?.state !== "post") return;
    const equipos: Record<string, any> = {};
    (e.competitions?.[0]?.competitors || []).forEach(function (c: any) { equipos[c.homeAway] = c; });
    if (!equipos.away || !equipos.home) return;

    const anotadores: string[] = [];
    [equipos.away, equipos.home].forEach(function (c: any) {
      const puntos = (c.leaders || []).find(function (l: any) { return l.name === "points"; });
      const lider = puntos?.leaders?.[0];
      if (lider?.athlete?.displayName) {
        anotadores.push(`${corto(lider.athlete.displayName)} ${lider.displayValue} pts (${c.team.shortDisplayName})`);
      }
    });

    resultado.push({
      visitante: equipos.away.team.shortDisplayName,
      puntosVisitante: Number(equipos.away.score),
      local: equipos.home.team.shortDisplayName,
      puntosLocal: Number(equipos.home.score),
      detalles: anotadores.length ? [`Mejores anotadores: ${anotadores.join(" · ")}`] : [],
    });
  });
  return resultado;
}

// ---------- Fútbol, LaLiga (ESPN) ----------

async function juegosFutbol(fechaISO: string): Promise<JuegoDetallado[]> {
  const data = await leerJson(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard?dates=${fechaISO.replace(/-/g, "")}`
  );
  const resultado: JuegoDetallado[] = [];
  (data.events || []).forEach(function (e: any) {
    if (e.status?.type?.state !== "post") return;
    const comp = e.competitions?.[0];
    const equipos: Record<string, any> = {};
    (comp?.competitors || []).forEach(function (c: any) { equipos[c.homeAway] = c; });
    if (!equipos.away || !equipos.home) return;

    const golesPorEquipo: Record<string, string[]> = {};
    (comp.details || []).forEach(function (x: any) {
      if (!x.scoringPlay) return;
      const autor = x.athletesInvolved?.[0]?.displayName;
      if (!autor) return;
      const marca = x.ownGoal ? " (autogol)" : x.penaltyKick ? " (pen.)" : "";
      const equipoId = String(x.team?.id || "");
      (golesPorEquipo[equipoId] = golesPorEquipo[equipoId] || []).push(`${corto(autor)} ${x.clock?.displayValue || ""}${marca}`.trim());
    });

    const lineas: string[] = [];
    [equipos.away, equipos.home].forEach(function (c: any) {
      const goles = golesPorEquipo[String(c.team.id)];
      if (goles?.length) lineas.push(`Goles ${c.team.shortDisplayName}: ${goles.join(", ")}`);
    });

    resultado.push({
      visitante: equipos.away.team.shortDisplayName,
      puntosVisitante: Number(equipos.away.score),
      local: equipos.home.team.shortDisplayName,
      puntosLocal: Number(equipos.home.score),
      detalles: lineas,
    });
  });
  return resultado;
}

export async function obtenerQuePasoAyer(deporte: DeporteQuePaso, fechaISO: string): Promise<JuegoDetallado[]> {
  if (deporte === "mlb") return juegosBeisbol(1, fechaISO, false);
  if (deporte === "lidom") return juegosBeisbol(17, fechaISO, true);
  if (deporte === "nba") return juegosNBA(fechaISO);
  return juegosFutbol(fechaISO);
}

export function captionQuePaso(deporte: DeporteQuePaso, fechaTexto: string, juegos: JuegoDetallado[]) {
  const d = DEPORTES_QUE_PASO[deporte];
  const cuerpo = juegos
    .map(function (j) {
      const marcador = `${j.visitante} ${j.puntosVisitante} - ${j.puntosLocal} ${j.local}`;
      return [marcador, ...j.detalles.map(function (x) { return `• ${x}`; })].join("\n");
    })
    .join("\n\n");
  return (
    `${d.emoji} ¿QUÉ PASÓ AYER EN ${d.nombre.toUpperCase()}?\n${fechaTexto}\n\n${cuerpo}\n\n` +
    `¿Qué te pareció? Te leemos en los comentarios 👇\n\n` +
    `Más en ${d.enlace}\n\nPágina informativa de La Bankera RD.\n\n${d.hashtags}`
  );
}
