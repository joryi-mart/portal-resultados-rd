// lib/resultadosDeportes.ts
// Marcadores finales de un dia para las publicaciones de Facebook de béisbol (MLB) y NBA.
// Devuelve solo juegos ya terminados, con el nombre de los equipos en espanol cuando aplica.

export type JuegoTerminado = {
  visitante: string;
  puntosVisitante: number;
  local: string;
  puntosLocal: number;
  // "J1" / "J2" cuando el mismo cruce se jugo dos veces el mismo dia (doble cartelera).
  etiqueta?: string;
};

const MLB_EN_ESPANOL: Record<string, string> = {
  "Arizona Diamondbacks": "Diamondbacks",
  "Atlanta Braves": "Bravos",
  "Athletics": "Atléticos",
  "Baltimore Orioles": "Orioles",
  "Boston Red Sox": "Medias Rojas",
  "Chicago Cubs": "Cachorros",
  "Chicago White Sox": "Medias Blancas",
  "Cincinnati Reds": "Rojos",
  "Cleveland Guardians": "Guardianes",
  "Colorado Rockies": "Rockies",
  "Detroit Tigers": "Tigres",
  "Houston Astros": "Astros",
  "Kansas City Royals": "Reales",
  "Los Angeles Angels": "Angelinos",
  "Los Angeles Dodgers": "Dodgers",
  "Miami Marlins": "Marlins",
  "Milwaukee Brewers": "Cerveceros",
  "Minnesota Twins": "Mellizos",
  "New York Mets": "Mets",
  "New York Yankees": "Yankees",
  "Philadelphia Phillies": "Filis",
  "Pittsburgh Pirates": "Piratas",
  "San Diego Padres": "Padres",
  "San Francisco Giants": "Gigantes",
  "Seattle Mariners": "Marineros",
  "St. Louis Cardinals": "Cardenales",
  "Tampa Bay Rays": "Rays",
  "Texas Rangers": "Rangers",
  "Toronto Blue Jays": "Azulejos",
  "Washington Nationals": "Nacionales",
};

export async function obtenerJuegosMLB(fechaISO: string): Promise<JuegoTerminado[]> {
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${fechaISO}&hydrate=team`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`MLB respondio ${res.status}`);
  const data = await res.json();
  const juegos: any[] = (data.dates?.[0]?.games || []).filter(function (j: any) {
    return j.status?.abstractGameState === "Final" && j.teams?.away?.score != null && j.teams?.home?.score != null;
  });

  const nombre = function (t: any) { return MLB_EN_ESPANOL[t.name] || t.teamName || t.name; };
  const cruces = new Map<string, number>();
  const cuenta = function (j: any) { return nombre(j.teams.away.team) + "|" + nombre(j.teams.home.team); };
  juegos.forEach(function (j) { cruces.set(cuenta(j), (cruces.get(cuenta(j)) || 0) + 1); });

  return juegos.map(function (j) {
    const doble = (cruces.get(cuenta(j)) || 0) > 1;
    return {
      visitante: nombre(j.teams.away.team),
      puntosVisitante: j.teams.away.score,
      local: nombre(j.teams.home.team),
      puntosLocal: j.teams.home.score,
      etiqueta: doble ? `J${j.gameNumber || 1}` : undefined,
    };
  });
}

export async function obtenerJuegosNBA(fechaISO: string): Promise<JuegoTerminado[]> {
  const fechaCompacta = fechaISO.replace(/-/g, "");
  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${fechaCompacta}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`ESPN respondio ${res.status}`);
  const data = await res.json();
  const resultado: JuegoTerminado[] = [];
  (data.events || []).forEach(function (e: any) {
    if (e.status?.type?.state !== "post") return;
    const equipos: Record<string, any> = {};
    (e.competitions?.[0]?.competitors || []).forEach(function (c: any) { equipos[c.homeAway] = c; });
    if (!equipos.away || !equipos.home) return;
    resultado.push({
      visitante: equipos.away.team.shortDisplayName,
      puntosVisitante: Number(equipos.away.score),
      local: equipos.home.team.shortDisplayName,
      puntosLocal: Number(equipos.home.score),
    });
  });
  return resultado;
}
