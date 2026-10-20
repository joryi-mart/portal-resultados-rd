// lib/juegosDeHoy.ts
// Datos para la publicación "Juegos de hoy en MLB": hora de cada juego en hora
// de RD, abridores, canales nacionales y, en playoffs, cómo va la serie.
// Todo sale de la API oficial de MLB; nunca se inventa nada.

import { MLB_EN_ESPANOL } from "./resultadosDeportes";

export type JuegoDeHoy = {
  visitante: string;
  local: string;
  hora: string; // "8:00 PM", ya en hora de RD
  serie?: string; // "Serie Divisional AL · Juego 5" (solo playoffs)
  estadoSerie?: string; // "Serie empatada 2-2"
  decisivo: boolean;
  abridores?: string; // "Sean Burke vs Gavin Williams"
  tv?: string; // "TBS · truTV · Univision/TUDN"
};

const SERIES_EN_ESPANOL: Record<string, string> = {
  "AL Wild Card Series": "Comodín AL",
  "NL Wild Card Series": "Comodín NL",
  "AL Division Series": "Serie Divisional AL",
  "NL Division Series": "Serie Divisional NL",
  "AL Championship Series": "Serie de Campeonato AL",
  "NL Championship Series": "Serie de Campeonato NL",
  "World Series": "Serie Mundial",
};

// Fecha de "hoy" en República Dominicana (fijo en UTC-4, sin horario de verano).
export function hoyRD() {
  return new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function horaRD(fechaUTC: string) {
  const d = new Date(new Date(fechaUTC).getTime() - 4 * 60 * 60 * 1000);
  const h = d.getUTCHours();
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h < 12 ? "AM" : "PM"}`;
}

export async function obtenerJuegosDeHoyMLB(fechaISO: string): Promise<JuegoDeHoy[]> {
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${fechaISO}&hydrate=team,probablePitcher,seriesStatus,broadcasts(all)`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`MLB respondio ${res.status}`);
  const data = await res.json();
  // Solo juegos que todavía no empiezan (ni suspendidos ni pospuestos).
  const juegos: any[] = (data.dates?.[0]?.games || []).filter(function (j: any) {
    return j.status?.abstractGameState === "Preview" && !/Postponed|Suspended|Cancelled/i.test(j.status?.detailedState || "");
  });
  juegos.sort(function (a, b) { return a.gameDate.localeCompare(b.gameDate); });

  const nombre = function (t: any) { return MLB_EN_ESPANOL[t.name] || t.teamName || t.name; };

  return juegos.map(function (j) {
    const away = j.teams.away;
    const home = j.teams.home;
    const s = j.seriesStatus;
    const esPlayoff = ["F", "D", "L", "W"].includes(j.gameType) && s;

    let estadoSerie: string | undefined;
    if (esPlayoff) {
      if (s.isTied) {
        estadoSerie = s.wins === 0 ? "Comienza la serie" : `Serie empatada ${s.wins}-${s.losses}`;
      } else {
        // s.result viene como "CLE leads 2-1"; se cambia la abreviatura por el nombre.
        const m = /^(\w+) leads? (\d+-\d+)/.exec(s.result || "");
        const lider = m && [away.team, home.team].find(function (t: any) { return t.abbreviation === m[1]; });
        if (m && lider) estadoSerie = `${nombre(lider)} gana la serie ${m[2]}`;
      }
    }

    const tv = Array.from(new Set<string>(
      (j.broadcasts || [])
        .filter(function (b: any) { return b.type === "TV" && b.isNational; })
        .map(function (b: any) { return String(b.name).replace(/\s*\/\s*/g, "/"); })
    )).slice(0, 3);

    const pAway = away.probablePitcher?.fullName;
    const pHome = home.probablePitcher?.fullName;

    return {
      visitante: nombre(away.team),
      local: nombre(home.team),
      hora: horaRD(j.gameDate),
      serie: esPlayoff ? `${SERIES_EN_ESPANOL[j.seriesDescription] || j.seriesDescription} · Juego ${j.seriesGameNumber}` : undefined,
      estadoSerie,
      decisivo: Boolean(esPlayoff && s.isTied && s.wins > 0 && j.seriesGameNumber === j.gamesInSeries),
      abridores: pAway && pHome ? `${pAway} vs ${pHome}` : undefined,
      tv: tv.length ? tv.join(" · ") : undefined,
    };
  });
}

export function captionJuegosDeHoy(fechaTexto: string, juegos: JuegoDeHoy[]) {
  const hayDecisivo = juegos.some(function (j) { return j.decisivo; });
  const cuerpo = juegos
    .map(function (j) {
      const lineas = [`${j.decisivo ? "🔥 " : ""}${j.visitante} vs ${j.local} — 🕗 ${j.hora}`];
      if (j.serie) lineas.push(`🏆 ${j.serie}${j.estadoSerie ? ` (${j.estadoSerie})` : ""}`);
      if (j.abridores) lineas.push(`⚾ Abridores: ${j.abridores}`);
      if (j.tv) lineas.push(`📺 ${j.tv}`);
      return lineas.join("\n");
    })
    .join("\n\n");
  return (
    `⚾ ¿Qué juegos hay hoy en MLB? Aquí están 👇${hayDecisivo ? " ¡Hay juego decisivo!" : ""}\n${fechaTexto} · Horas de República Dominicana\n\n${cuerpo}\n\n` +
    `¿Quién crees que gana hoy? Déjalo en los comentarios 👇\n\n` +
    `👉 Síguenos para recibir los juegos y resultados cada día.\n\n` +
    `Más en https://labankerard.com/beisbol\n\n🔎 Búscanos en Google como «La Bankera RD».\nPágina informativa.\n\n#MLB #GrandesLigas #BeisbolDominicano`
  );
}
