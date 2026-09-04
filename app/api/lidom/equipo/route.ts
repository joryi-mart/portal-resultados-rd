import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";

const SPORT_ID_LIDOM = 17;
const TEMPORADA_ACTUAL = new Date().getFullYear();

const EQUIPOS_LIDOM: Record<number, string> = {
  672: "Tigres del Licey",
  667: "Águilas Cibaeñas",
  671: "Leones del Escogido",
  669: "Estrellas Orientales",
  668: "Toros del Este",
  670: "Gigantes del Cibao",
};

async function obtenerRoster(id: string) {
  const res = await fetch(`https://statsapi.mlb.com/api/v1/teams/${id}/roster?season=${TEMPORADA_ACTUAL}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.roster || []).map((r: any) => ({
    id: r.person?.id,
    nombre: r.person?.fullName,
    posicion: r.position?.abbreviation || "",
    numero: r.jerseyNumber || "",
  }));
}

async function obtenerUltimosJuegos(id: string) {
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/schedule?sportId=${SPORT_ID_LIDOM}&teamId=${id}&season=${TEMPORADA_ACTUAL}&gameType=R`
  );
  if (!res.ok) return [];
  const data = await res.json();
  const juegos: any[] = [];
  (data.dates || []).forEach((d: any) => {
    (d.games || []).forEach((g: any) => juegos.push(g));
  });

  return juegos
    .filter((g) => g.status?.abstractGameState === "Final")
    .sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime())
    .slice(0, 10)
    .map((g) => ({
      gamePk: g.gamePk,
      fecha: g.gameDate,
      rival: g.teams?.away?.team?.id === Number(id) ? g.teams?.home?.team?.name : g.teams?.away?.team?.name,
      esLocal: g.teams?.home?.team?.id === Number(id),
      carrerasPropias: g.teams?.home?.team?.id === Number(id) ? g.teams?.home?.score : g.teams?.away?.score,
      carrerasRival: g.teams?.home?.team?.id === Number(id) ? g.teams?.away?.score : g.teams?.home?.score,
    }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || "";
    if (!id || !EQUIPOS_LIDOM[Number(id)]) {
      return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
    }

    const cacheKey = "lidom-equipo-" + id;
    const cacheado = getCache(cacheKey);
    if (cacheado) return NextResponse.json(cacheado);

    const [roster, ultimosJuegos] = await Promise.all([
      obtenerRoster(id),
      obtenerUltimosJuegos(id),
    ]);

    const resultado = {
      id: Number(id),
      nombre: EQUIPOS_LIDOM[Number(id)],
      roster,
      ultimosJuegos,
    };

    setCache(cacheKey, resultado, 3 * 60 * 60 * 1000);
    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error obteniendo detalle del equipo", detalle: error.message },
      { status: 500 }
    );
  }
}
