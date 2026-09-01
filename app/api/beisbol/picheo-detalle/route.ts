import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";

const TEMPORADA_ACTUAL = new Date().getFullYear();

function outsDesdeIP(ip: string | undefined) {
  if (!ip) return 0;
  const [enteros, tercios] = ip.split(".");
  const e = Number(enteros) || 0;
  const t = Number(tercios) || 0;
  return e * 3 + t;
}

function ipDesdeOuts(outs: number) {
  const enteros = Math.floor(outs / 3);
  const resto = outs % 3;
  return enteros + "." + resto;
}

function calcularEraCombinada(salidas: any[]) {
  let outsTotal = 0;
  let carrerasLimpias = 0;

  salidas.forEach((s) => {
    outsTotal += outsDesdeIP(s.stat?.inningsPitched);
    carrerasLimpias += Number(s.stat?.earnedRuns) || 0;
  });

  const era = outsTotal > 0 ? ((carrerasLimpias * 27) / outsTotal).toFixed(2) : "-";

  return {
    entradas: ipDesdeOuts(outsTotal),
    carrerasLimpias,
    era,
  };
}

async function obtenerTemporada(id: string) {
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/people/${id}/stats?stats=season&group=pitching&season=${TEMPORADA_ACTUAL}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const stat = data.stats?.[0]?.splits?.[0]?.stat;
  if (!stat) return null;
  return {
    victorias: stat.wins ?? 0,
    derrotas: stat.losses ?? 0,
    era: stat.era ?? "-",
  };
}

async function obtenerGameLog(id: string) {
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/people/${id}/stats?stats=gameLog&group=pitching&season=${TEMPORADA_ACTUAL}`
  );
  if (!res.ok) return { ultimaSalida: null, ultimasTres: null };
  const data = await res.json();
  const splits: any[] = data.stats?.[0]?.splits || [];

  if (splits.length === 0) return { ultimaSalida: null, ultimasTres: null };

  // El gameLog viene ordenado del más antiguo al más reciente; tomamos los últimos.
  const recientes = splits.slice(-3).reverse();
  const ultima = recientes[0];

  const ultimaSalida = ultima
    ? {
        fecha: ultima.date,
        rival: ultima.opponent?.name || "",
        entradas: ultima.stat?.inningsPitched || "0.0",
        hits: ultima.stat?.hits ?? 0,
        basesPorBolas: ultima.stat?.baseOnBalls ?? 0,
        ponches: ultima.stat?.strikeOuts ?? 0,
        carrerasLimpias: ultima.stat?.earnedRuns ?? 0,
      }
    : null;

  const ultimasTres = recientes.length > 0 ? calcularEraCombinada(recientes) : null;

  return { ultimaSalida, ultimasTres };
}

async function obtenerSplits(id: string) {
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/people/${id}/stats?stats=statSplits&sitCodes=h,a&group=pitching&season=${TEMPORADA_ACTUAL}`
  );
  if (!res.ok) return { casa: null, ruta: null };
  const data = await res.json();
  const splits: any[] = data.stats?.[0]?.splits || [];

  const casaSplit = splits.find((s: any) => s.split?.code === "h");
  const rutaSplit = splits.find((s: any) => s.split?.code === "a");

  return {
    casa: casaSplit
      ? { entradas: casaSplit.stat?.inningsPitched || "0.0", era: casaSplit.stat?.era || "-" }
      : null,
    ruta: rutaSplit
      ? { entradas: rutaSplit.stat?.inningsPitched || "0.0", era: rutaSplit.stat?.era || "-" }
      : null,
  };
}

async function obtenerDetallePitcher(id: string) {
  const claveCache = "picheo-detalle-" + id;
  const cacheado = getCache(claveCache);
  if (cacheado) return cacheado;

  const [temporada, gameLog, splits] = await Promise.all([
    obtenerTemporada(id).catch(() => null),
    obtenerGameLog(id).catch(() => ({ ultimaSalida: null, ultimasTres: null })),
    obtenerSplits(id).catch(() => ({ casa: null, ruta: null })),
  ]);

  const detalle = {
    temporada,
    ultimaSalida: gameLog.ultimaSalida,
    ultimasTres: gameLog.ultimasTres,
    splits,
  };

  setCache(claveCache, detalle, 3 * 60 * 60 * 1000);
  return detalle;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids") || "";
    const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ detalles: {} });
    }

    const resultados = await Promise.all(
      ids.map((id) => obtenerDetallePitcher(id).catch(() => null))
    );

    const detalles: Record<string, any> = {};
    ids.forEach((id, i) => {
      detalles[id] = resultados[i];
    });

    return NextResponse.json({ detalles });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error obteniendo detalle de picheo", detalle: error.message },
      { status: 500 }
    );
  }
}
