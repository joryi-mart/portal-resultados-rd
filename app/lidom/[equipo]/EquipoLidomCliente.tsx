"use client";

import { useEffect, useState } from "react";
import { Space_Grotesk } from "next/font/google";
import NavPildoras from "../../NavPildoras";
import { HISTORIAS_LIDOM } from "../datos";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"] });

const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
const COLOR_VERDE = "#007A33";
const COLOR_ROJO = "#B23B26";

type Jugador = { id: number; nombre: string; posicion: string; numero: string };
type Juego = {
  gamePk: number;
  fecha: string;
  rival: string;
  esLocal: boolean;
  carrerasPropias: number;
  carrerasRival: number;
};
type Detalle = { id: number; nombre: string; roster: Jugador[]; ultimosJuegos: Juego[]; proximosJuegos: Juego[] };

export default function EquipoLidomCliente(props: { equipoId: string }) {
  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(function () {
    fetch("/api/lidom/equipo?id=" + props.equipoId)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.detalle || data.error);
          return;
        }
        setDetalle(data);
      })
      .catch(() => setError("No se pudo cargar la información"))
      .finally(() => setCargando(false));
  }, [props.equipoId]);

  function formatearFecha(fechaISO: string) {
    return new Date(fechaISO).toLocaleDateString("es-DO", { day: "numeric", month: "short" });
  }

  return (
    <div className={display.className + " min-h-screen bg-[#FBF7EE]"}>
      <NavPildoras />
      <div className="px-4 py-8 sm:px-8">
        <a href="/lidom" className="mb-3 inline-block font-mono text-sm text-[#1E4D8C] hover:underline">← Ver todos los equipos de LIDOM</a>

        {cargando && <p className="font-mono text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Cargando...</p>}
        {error && <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>}

        {!cargando && !error && detalle && (
          <>
            {HISTORIAS_LIDOM[String(detalle.id)]?.foto && (
              <div className="mb-4">
                <img
                  src={HISTORIAS_LIDOM[String(detalle.id)].foto!.url}
                  alt={"Estadio de " + detalle.nombre}
                  className="h-52 w-full rounded-xl object-cover sm:h-72"
                />
                <p className="mt-1.5 text-right text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                  Foto: {HISTORIAS_LIDOM[String(detalle.id)].foto!.autor} / Wikimedia Commons ({HISTORIAS_LIDOM[String(detalle.id)].foto!.licencia})
                </p>
              </div>
            )}

            <div
              className="mb-6 flex items-center gap-3 rounded-xl p-4"
              style={{
                backgroundColor: (HISTORIAS_LIDOM[String(detalle.id)]?.color || "#10203A") + "14",
                borderLeft: `6px solid ${HISTORIAS_LIDOM[String(detalle.id)]?.color || "#10203A"}`,
              }}
            >
              <img
                src={`https://www.mlbstatic.com/team-logos/${detalle.id}.svg`}
                alt=""
                className="h-14 w-14 object-contain"
                onError={function (e) { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <h1 className="text-2xl font-bold" style={{ color: HISTORIAS_LIDOM[String(detalle.id)]?.color || "#10203A" }}>{detalle.nombre}</h1>
            </div>

            {HISTORIAS_LIDOM[String(detalle.id)] && (
              <div
                className="mb-8 rounded-xl border bg-white p-5"
                style={{ borderColor: HISTORIAS_LIDOM[String(detalle.id)].color + "40" }}
              >
                <p className="mb-3 text-sm leading-relaxed text-[#10203A]">{HISTORIAS_LIDOM[String(detalle.id)].resumen}</p>
                <div className="grid grid-cols-1 gap-2 font-mono text-xs sm:grid-cols-3" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                  <p>🗓️ <b>Fundado:</b> {HISTORIAS_LIDOM[String(detalle.id)].fundado}</p>
                  <p>🏟️ <b>Estadio:</b> {HISTORIAS_LIDOM[String(detalle.id)].estadio}</p>
                  <p>🏆 <b>Títulos:</b> {HISTORIAS_LIDOM[String(detalle.id)].titulos}</p>
                </div>

                <p className="mb-2 mt-4 font-mono text-xs font-bold uppercase tracking-wide" style={{ color: COLOR_TEXTO_SECUNDARIO }}>⭐ Peloteros famosos que han vestido este uniforme</p>
                <div className="flex flex-col gap-3">
                  {HISTORIAS_LIDOM[String(detalle.id)].famosos.map(function (jugador) {
                    return (
                      <div key={jugador.nombre} className="rounded-lg bg-[#1E4D8C]/5 p-3">
                        <p className="text-base font-bold text-[#1E4D8C]">{jugador.nombre}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-[#10203A]">{jugador.bio}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex gap-3 border-t border-[#10203A]/8 pt-4">
                  <a
                    href={"https://www.instagram.com/" + HISTORIAS_LIDOM[String(detalle.id)].instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs font-semibold text-[#1E4D8C] hover:underline"
                  >
                    📷 Instagram
                  </a>
                  <a
                    href={"https://x.com/" + HISTORIAS_LIDOM[String(detalle.id)].x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs font-semibold text-[#1E4D8C] hover:underline"
                  >
                    𝕏 Twitter/X
                  </a>
                </div>
              </div>
            )}

            {detalle.ultimosJuegos.length > 0 ? (
              <>
                <h2 className="mb-3 text-lg font-semibold text-[#10203A]">📋 Últimos juegos</h2>
                <div className="mb-10 overflow-hidden rounded-xl border border-[#10203A]/15 bg-white">
                  {detalle.ultimosJuegos.map(function (j, i) {
                    const gano = j.carrerasPropias > j.carrerasRival;
                    return (
                      <div key={j.gamePk} className={"flex items-center justify-between gap-3 px-4 py-3 " + (i > 0 ? "border-t border-[#10203A]/8" : "")}>
                        <div>
                          <p className="text-sm font-semibold text-[#10203A]">
                            {j.esLocal ? "vs" : "@"} {j.rival}
                          </p>
                          <p className="font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{formatearFecha(j.fecha)}</p>
                        </div>
                        <p className="font-mono text-base font-bold" style={{ color: gano ? COLOR_VERDE : COLOR_ROJO }}>
                          {gano ? "G" : "P"} {j.carrerasPropias}-{j.carrerasRival}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <h2 className="mb-3 text-lg font-semibold text-[#10203A]">📅 Próximos juegos</h2>
                <div className="mb-10 overflow-hidden rounded-xl border border-[#10203A]/15 bg-white">
                  {detalle.proximosJuegos.length === 0 ? (
                    <p className="p-4 text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                      El calendario de la próxima temporada todavía no está publicado.
                    </p>
                  ) : (
                    detalle.proximosJuegos.map(function (j, i) {
                      return (
                        <div key={j.gamePk} className={"flex items-center justify-between gap-3 px-4 py-3 " + (i > 0 ? "border-t border-[#10203A]/8" : "")}>
                          <p className="text-sm font-semibold text-[#10203A]">
                            {j.esLocal ? "vs" : "@"} {j.rival}
                          </p>
                          <p className="font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{formatearFecha(j.fecha)}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

            <h2 className="mb-3 text-lg font-semibold text-[#10203A]">👥 Roster</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {detalle.roster.length === 0 ? (
                <p className="text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                  El roster todavía no está publicado (se activa más cerca de octubre).
                </p>
              ) : (
                detalle.roster.map(function (j) {
                  return (
                    <div key={j.id} className="flex items-center justify-between rounded-lg border border-[#10203A]/10 bg-white px-3 py-2">
                      <span className="text-sm text-[#10203A]">{j.nombre}</span>
                      <span className="font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{j.posicion} {j.numero ? "#" + j.numero : ""}</span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
