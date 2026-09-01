"use client";

import { useEffect, useState } from "react";

type Pitcher = {
  fullName: string;
};

type Juego = {
  gamePk: number;
  status: { detailedState: string; abstractGameState: string };
  gameDate: string;
  teams: {
    away: { team: { name: string }; probablePitcher?: Pitcher };
    home: { team: { name: string }; probablePitcher?: Pitcher };
  };
  venue: { name: string };
};

export default function PicheoPage() {
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(function () {
    fetch("/api/beisbol")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.detalle || data.error);
          return;
        }
        const juegosHoy = data.mlb?.dates?.[0]?.games || [];
        setJuegos(juegosHoy);
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

  function renderJuego(juego: Juego) {
    const pitcherVisitante = juego.teams.away.probablePitcher?.fullName;
    const pitcherLocal = juego.teams.home.probablePitcher?.fullName;
    const hayPicheo = pitcherVisitante || pitcherLocal;

    return (
      <div
        key={juego.gamePk}
        className="rounded-xl border border-[#10203A]/15 bg-white p-5 shadow-sm"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-xs font-semibold uppercase tracking-wide text-[#5C6B78]">
            {juego.status.detailedState}
          </span>
          <span className="font-mono text-xs text-[#5C6B78]">{formatearHora(juego.gameDate)}</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-[#FBF7EE] p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#5C6B78]">
              Visitante
            </p>
            <p className="mb-2 text-base font-bold text-[#10203A]">{juego.teams.away.team.name}</p>
            <p className="font-mono text-sm text-[#1E4D8C]">
              🥎 {pitcherVisitante || "Por confirmar"}
            </p>
          </div>
          <div className="rounded-lg bg-[#FBF7EE] p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#5C6B78]">
              Local
            </p>
            <p className="mb-2 text-base font-bold text-[#10203A]">{juego.teams.home.team.name}</p>
            <p className="font-mono text-sm text-[#1E4D8C]">
              🥎 {pitcherLocal || "Por confirmar"}
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs text-[#5C6B78]">{juego.venue.name}</p>

        {!hayPicheo && (
          <p className="mt-2 text-xs italic text-[#5C6B78]">
            Los picheos probables todavía no han sido anunciados para este juego.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7EE] px-4 py-8 sm:px-8">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {juegos.map(renderJuego)}
          {juegos.length === 0 && (
            <p className="text-sm text-[#5C6B78]">No hay juegos programados para hoy.</p>
          )}
        </div>
      )}
    </div>
  );
}