"use client";

import { useEffect, useState } from "react";
import NavPildoras from "../../NavPildoras";
import Image from "next/image";

type Pitcher = {
  id: number;
  fullName: string;
};

type Broadcast = {
  name: string;
};

type Juego = {
  gamePk: number;
  status: { detailedState: string; abstractGameState: string };
  gameDate: string;
  teams: {
    away: { team: { id: number; name: string }; probablePitcher?: Pitcher; score?: number };
    home: { team: { id: number; name: string }; probablePitcher?: Pitcher; score?: number };
  };
  venue: { name: string };
  broadcasts?: Broadcast[];
};

type DetallePitcher = {
  temporada: { victorias: number; derrotas: number; era: string } | null;
  ultimaSalida: {
    fecha: string;
    rival: string;
    entradas: string;
    hits: number;
    basesPorBolas: number;
    ponches: number;
    carrerasLimpias: number;
  } | null;
  ultimasTres: { entradas: string; carrerasLimpias: number; era: string } | null;
  splits: {
    casa: { entradas: string; era: string } | null;
    ruta: { entradas: string; era: string } | null;
  };
};

export default function PicheoCliente() {
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [detalles, setDetalles] = useState<Record<string, DetallePitcher>>({});
  const [cargando, setCargando] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(true);
  const [error, setError] = useState("");

  useEffect(function () {
    fetch("/api/beisbol")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.detalle || data.error);
          return;
        }
        const juegosHoy: Juego[] = data.mlb?.dates?.[0]?.games || [];
        setJuegos(juegosHoy);

        const ids = new Set<number>();
        juegosHoy.forEach(function (j) {
          if (j.teams.away.probablePitcher?.id) ids.add(j.teams.away.probablePitcher.id);
          if (j.teams.home.probablePitcher?.id) ids.add(j.teams.home.probablePitcher.id);
        });

        if (ids.size === 0) {
          setCargandoDetalle(false);
          return;
        }

        fetch("/api/beisbol/picheo-detalle?ids=" + Array.from(ids).join(","))
          .then((res) => res.json())
          .then((detalleData) => {
            setDetalles(detalleData.detalles || {});
          })
          .catch(() => {})
          .finally(() => setCargandoDetalle(false));
      })
      .catch(() => setError("No se pudo cargar la información"))
      .finally(() => setCargando(false));
  }, []);

  function volver() {
    window.location.href = "/beisbol";
  }

  function formatearHora(gameDate: string) {
    try {
      return new Date(gameDate).toLocaleTimeString("es-DO", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  }

  function formatearFechaCorta(fechaISO: string) {
    try {
      return new Date(fechaISO + "T00:00:00").toLocaleDateString("es-DO", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return fechaISO;
    }
  }

  function renderDetallePitcher(pitcher: Pitcher | undefined) {
    if (!pitcher) return <p className="text-sm italic text-[#5C6B78]">Por confirmar</p>;

    const detalle = detalles[String(pitcher.id)];

    return (
      <div className="mt-2 rounded-lg bg-[#1E4D8C]/5 p-3">
        <p className="mb-1.5 text-sm font-semibold text-[#1E4D8C]">🥎 {pitcher.fullName}</p>

        {cargandoDetalle && !detalle ? (
          <p className="text-xs text-[#5C6B78]">Cargando estadísticas...</p>
        ) : detalle ? (
          <div className="flex flex-col gap-1.5 font-mono text-xs text-[#10203A]">
            {detalle.temporada && (
              <p>
                <span className="text-[#5C6B78]">Temporada: </span>
                {detalle.temporada.victorias}-{detalle.temporada.derrotas}, ERA {detalle.temporada.era}
              </p>
            )}

            {detalle.ultimaSalida && (
              <p>
                <span className="text-[#5C6B78]">Última salida ({formatearFechaCorta(detalle.ultimaSalida.fecha)} vs {detalle.ultimaSalida.rival}): </span>
                {detalle.ultimaSalida.entradas} IP, {detalle.ultimaSalida.hits} H, {detalle.ultimaSalida.basesPorBolas} BB, {detalle.ultimaSalida.ponches} K, {detalle.ultimaSalida.carrerasLimpias} CL
              </p>
            )}

            {detalle.ultimasTres && (
              <p>
                <span className="text-[#5C6B78]">Últimas 3 salidas: </span>
                {detalle.ultimasTres.entradas} IP, ERA {detalle.ultimasTres.era}
              </p>
            )}

            {(detalle.splits.casa || detalle.splits.ruta) && (
              <p>
                <span className="text-[#5C6B78]">Casa/Ruta: </span>
                {detalle.splits.casa ? "ERA " + detalle.splits.casa.era + " (casa)" : "-"}
                {" · "}
                {detalle.splits.ruta ? "ERA " + detalle.splits.ruta.era + " (ruta)" : "-"}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#5C6B78]">No hay estadísticas disponibles.</p>
        )}
      </div>
    );
  }

  function renderJuego(juego: Juego) {
    const pitcherVisitante = juego.teams.away.probablePitcher;
    const pitcherLocal = juego.teams.home.probablePitcher;

    return (
      <div key={juego.gamePk} className="rounded-xl border border-[#10203A]/15 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[#5C6B78]">
            {juego.status.detailedState} · {formatearHora(juego.gameDate)}
          </p>
          {juego.broadcasts && juego.broadcasts.length > 0 && (
            <p className="text-xs font-semibold text-[#007A33]">
              📺 {juego.broadcasts.map((b) => b.name).join(", ")}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2">
              <Image
                src={`https://www.mlbstatic.com/team-logos/${juego.teams.away.team.id}.svg`}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 shrink-0"
              />
              <span className="text-base font-semibold text-[#10203A]">{juego.teams.away.team.name}</span>
              {juego.teams.away.score !== undefined && (
                <span className="ml-auto font-mono text-xl font-bold text-[#1E4D8C]">{juego.teams.away.score}</span>
              )}
            </div>
            {renderDetallePitcher(pitcherVisitante)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Image
                src={`https://www.mlbstatic.com/team-logos/${juego.teams.home.team.id}.svg`}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 shrink-0"
              />
              <span className="text-base font-semibold text-[#10203A]">{juego.teams.home.team.name}</span>
              {juego.teams.home.score !== undefined && (
                <span className="ml-auto font-mono text-xl font-bold text-[#1E4D8C]">{juego.teams.home.score}</span>
              )}
            </div>
            {renderDetallePitcher(pitcherLocal)}
          </div>
        </div>

        <p className="mt-3 text-xs text-[#5C6B78]">{juego.venue.name}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7EE]">
      <NavPildoras />
      <div className="px-4 py-8 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#10203A]">📊 Hoja de picheo del día</h1>
          <button
            onClick={volver}
            className="rounded-full border border-[#1E4D8C]/30 px-4 py-1.5 font-mono text-xs font-semibold text-[#1E4D8C] hover:bg-[#1E4D8C]/5"
          >
            ← Volver a Béisbol
          </button>
        </div>

        {cargando && (
          <p className="font-mono text-sm text-[#5C6B78]">Cargando picheos...</p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>
        )}

        {!cargando && !error && (
          juegos.length > 0 ? (
            <div className="flex flex-col gap-4">{juegos.map(renderJuego)}</div>
          ) : (
            <p className="text-sm text-[#5C6B78]">No hay juegos programados para hoy.</p>
          )
        )}
      </div>
    </div>
  );
}