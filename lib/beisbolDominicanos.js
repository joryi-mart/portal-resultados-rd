// lib/beisbolDominicanos.js
// Lista de jugadores dominicanos activos en la MLB, con su equipo actual ya
// resuelto (la API de MLB solo da el ID del equipo, no el nombre). Usado en
// la pagina "Glorias Dominicanas del Beisbol".

import { getCache, setCache } from "@/lib/cache";

const TEMPORADA_ACTUAL = new Date().getFullYear();

async function obtenerNombresDeEquipos() {
  const cacheado = getCache("mlb-equipos");
  if (cacheado) return cacheado;

  const res = await fetch(`https://statsapi.mlb.com/api/v1/teams?sportId=1&season=${TEMPORADA_ACTUAL}`);
  if (!res.ok) throw new Error(`Error MLB API (equipos): ${res.status}`);
  const data = await res.json();

  const equipos = (data.teams || []).map((t) => ({ id: t.id, nombre: t.name }));
  setCache("mlb-equipos", equipos, 24 * 60 * 60 * 1000);
  return equipos;
}

export async function obtenerJugadoresDominicanosConEquipo() {
  const cacheado = getCache("mlb-dominicanos-con-equipo");
  if (cacheado) return cacheado;

  const [data, equipos] = await Promise.all([
    fetch(`https://statsapi.mlb.com/api/v1/sports/1/players?season=${TEMPORADA_ACTUAL}`).then((r) => {
      if (!r.ok) throw new Error(`Error MLB API (jugadores): ${r.status}`);
      return r.json();
    }),
    obtenerNombresDeEquipos(),
  ]);

  const nombrePorEquipoId = new Map(equipos.map((e) => [e.id, e.nombre]));

  const dominicanos = (data.people || [])
    .filter((p) => p.birthCountry === "Dominican Republic")
    .map((p) => ({
      id: p.id,
      nombre: p.fullName,
      posicion: p.primaryPosition?.abbreviation || "",
      equipo: (p.currentTeam?.id && nombrePorEquipoId.get(p.currentTeam.id)) || "Sin equipo actual",
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  setCache("mlb-dominicanos-con-equipo", dominicanos, 6 * 60 * 60 * 1000);
  return dominicanos;
}
