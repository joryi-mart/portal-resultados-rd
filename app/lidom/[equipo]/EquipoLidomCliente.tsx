"use client";

import { useEffect, useState } from "react";

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

  if (cargando) {
    return <p className="font-mono text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Cargando roster y juegos...</p>;
  }
  if (error) {
    return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>;
  }
  if (!detalle) return null;

  return (
    <>
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
  );
}
