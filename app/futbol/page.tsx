"use client";

import { useEffect, useState } from "react";
import NavPildoras from "../NavPildoras";
import Image from "next/image";

type LigaId = "esp.1" | "eng.1" | "uefa.champions";

const LIGAS: { id: LigaId; nombre: string }[] = [
  { id: "esp.1", nombre: "Liga Española" },
  { id: "eng.1", nombre: "Premier League" },
  { id: "uefa.champions", nombre: "Champions League" },
];

type Competidor = {
  homeAway: string;
  score?: string;
  team: { id: string; displayName: string; logo?: string };
};

type Juego = {
  id: string;
  date: string;
  status: { type: { description: string; state: string } };
  competitions: { competitors: Competidor[] }[];
};

function horaJuego(fechaISO: string) {
  try {
    return new Date(fechaISO).toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return "";
  }
}

type Noticia = {
  id: string;
  title: string;
  url: string;
  image: string;
  published: string;
};

type EquipoPosicion = {
  nombre: string;
  logo: string;
  juegosJugados: number;
  victorias: number;
  empates: number;
  derrotas: number;
  puntos: number;
  diferencia: string;
};

type Gol = {
  nombre: string;
  equipo: string;
  minuto: string;
  penal: boolean;
};

export default function FutbolPage() {
  const [liga, setLiga] = useState<LigaId>("esp.1");
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [posiciones, setPosiciones] = useState<EquipoPosicion[]>([]);
  const [goleadoresPorJuego, setGoleadoresPorJuego] = useState<Record<string, Gol[]>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);

  useEffect(function () {
    setCargando(true);
    const parametroFecha = fechaSeleccionada ? `&fecha=${fechaSeleccionada}` : "";
    fetch("/api/futbol?liga=" + liga + parametroFecha)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.detalle || data.error);
          return;
        }
        setError("");
        setJuegos(data.calendario?.events || []);
        setNoticias(data.noticias || []);
        setPosiciones(data.posiciones || []);
        setGoleadoresPorJuego(data.goleadoresPorJuego || {});
      })
      .catch(() => setError("No se pudo cargar la información"))
      .finally(() => setCargando(false));
  }, [liga, fechaSeleccionada]);

  function irAyer() {
    const base = fechaSeleccionada ? new Date(fechaSeleccionada + "T00:00:00") : new Date();
    base.setDate(base.getDate() - 1);
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, "0");
    const dd = String(base.getDate()).padStart(2, "0");
    setFechaSeleccionada(yyyy + "-" + mm + "-" + dd);
  }

  function irAHoy() {
    setFechaSeleccionada(null);
  }

  function cambiarLiga(nuevaLiga: LigaId) {
    setLiga(nuevaLiga);
    setFechaSeleccionada(null);
  }

  function renderNoticia(noticia: Noticia) {
    const abrirEnlace = function () {
      window.open(noticia.url, "_blank", "noopener,noreferrer");
    };
    return (
      <div
        key={noticia.id}
        onClick={abrirEnlace}
        className="flex cursor-pointer gap-3 overflow-hidden rounded-xl border border-[#10203A]/15 bg-white p-3 shadow-sm hover:shadow-md"
      >
        {noticia.image ? (
          <Image
            src={noticia.image}
            alt=""
            width={80}
            height={80}
            className="h-20 w-20 shrink-0 rounded-lg bg-[#10203A]/5 object-cover"
          />
        ) : null}
        <div className="min-w-0">
          <p className="line-clamp-3 text-sm font-semibold text-[#10203A]">{noticia.title}</p>
          <p className="mt-1 text-xs text-[#5C6B78]">
            {new Date(noticia.published).toLocaleDateString("es-DO")}
          </p>
        </div>
      </div>
    );
  }

  function renderJuego(juego: Juego) {
    const competidores = juego.competitions?.[0]?.competitors || [];
    const local = competidores.find((c) => c.homeAway === "home");
    const visitante = competidores.find((c) => c.homeAway === "away");
    if (!local || !visitante) return null;

    const terminado = juego.status.type.state === "post";
    const goles = goleadoresPorJuego[juego.id] || [];
    const golesLocal = goles.filter((g) => String(g.equipo) === String(local.team.id));
    const golesVisitante = goles.filter((g) => String(g.equipo) === String(visitante.team.id));

    function listaGoles(lista: Gol[]) {
      if (lista.length === 0) return null;
      return (
        <p className="mt-0.5 text-xs text-[#5C6B78]">
          ⚽ {lista.map((g) => g.nombre + (g.minuto ? ` ${g.minuto}` : "") + (g.penal ? " (P)" : "")).join(", ")}
        </p>
      );
    }

    return (
      <tr key={juego.id} className="border-b border-[#10203A]/10 last:border-0">
        <td className="py-3 pl-4 pr-3 align-top">
          <p className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-[#5C6B78]">
            {juego.status.type.description}
            {juego.status.type.state === "pre" ? " · " + horaJuego(juego.date) : ""}
          </p>
          <div className="flex items-center gap-2">
            {local.team.logo ? (
              <Image src={local.team.logo} alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
            ) : null}
            <span className="text-base font-semibold text-[#10203A]">
              {local.team.displayName}
            </span>
          </div>
          {terminado ? listaGoles(golesLocal) : null}
          <div className="mt-1.5 flex items-center gap-2">
            {visitante.team.logo ? (
              <Image src={visitante.team.logo} alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
            ) : null}
            <span className="text-base font-semibold text-[#10203A]">
              {visitante.team.displayName}
            </span>
          </div>
          {terminado ? listaGoles(golesVisitante) : null}
        </td>
        <td className="w-24 py-3 pr-4 text-right align-top">
          <p className="font-mono text-2xl font-bold text-[#1E4D8C]">{local.score ?? "-"}</p>
          <p className="mt-6 font-mono text-2xl font-bold text-[#1E4D8C]">{visitante.score ?? "-"}</p>
        </td>
      </tr>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7EE]">
      <NavPildoras />
      <div className="px-4 py-8 sm:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-[#10203A]">⚽ Fútbol</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={irAyer}
              className="rounded-full border border-[#10203A]/20 px-3 py-1.5 font-mono text-xs font-semibold text-[#10203A] hover:bg-[#10203A]/5"
            >
              ← Ayer
            </button>
            {fechaSeleccionada ? (
              <button
                onClick={irAHoy}
                className="rounded-full border border-[#1E4D8C]/30 bg-[#1E4D8C]/10 px-3 py-1.5 font-mono text-xs font-semibold text-[#1E4D8C] hover:bg-[#1E4D8C]/20"
              >
                Volver a hoy
              </button>
            ) : null}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {LIGAS.map(function (l) {
            const activa = liga === l.id;
            return (
              <button
                key={l.id}
                onClick={function () { cambiarLiga(l.id); }}
                className={
                  "rounded-full border-2 px-4 py-2 font-mono text-sm font-semibold " +
                  (activa
                    ? "border-[#1E4D8C] bg-[#1E4D8C]/15 text-[#1E4D8C]"
                    : "border-[#1E4D8C]/20 bg-[#1E4D8C]/5 text-[#1E4D8C] hover:bg-[#1E4D8C]/10")
                }
              >
                {l.nombre}
              </button>
            );
          })}
        </div>

        {fechaSeleccionada ? (
          <p className="mb-4 -mt-2 font-mono text-xs text-[#5C6B78]">
            Viendo: {fechaSeleccionada}
          </p>
        ) : null}

        {cargando && (
          <p className="font-mono text-sm text-[#5C6B78]">Cargando juegos...</p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>
        )}

        {!cargando && !error && (
          <>
            <section id="juegos" className="mb-10">
              <h2 className="mb-4 text-lg font-semibold text-[#10203A]">
                Juegos de hoy
              </h2>
              {juegos.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-[#10203A]/15 bg-white">
                  <table className="w-full">
                    <tbody>{juegos.map(renderJuego)}</tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-[#5C6B78]">
                  No hay juegos programados para hoy.
                </p>
              )}
            </section>

            <section className="mb-10">
              <h2 className="mb-4 text-lg font-semibold text-[#10203A]">
                Noticias
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {noticias.map(renderNoticia)}
                {noticias.length === 0 && (
                  <p className="text-sm text-[#5C6B78]">
                    No hay noticias disponibles por ahora.
                  </p>
                )}
              </div>
            </section>

            <section id="posiciones" className="mb-10">
              <h2 className="mb-4 text-lg font-semibold text-[#10203A]">
                📋 Tabla de posiciones
              </h2>
              <div className="overflow-x-auto rounded-xl border border-[#10203A]/15 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#10203A]/10 text-left text-xs uppercase text-[#5C6B78]">
                      <th className="px-3 py-2">Equipo</th>
                      <th className="px-3 py-2 text-center">JJ</th>
                      <th className="px-3 py-2 text-center">G</th>
                      <th className="px-3 py-2 text-center">E</th>
                      <th className="px-3 py-2 text-center">P</th>
                      <th className="px-3 py-2 text-center">DIF</th>
                      <th className="px-3 py-2 text-center">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posiciones.map(function (e, i) {
                      return (
                        <tr key={e.nombre} className="border-b border-[#10203A]/6 last:border-0">
                          <td className="flex items-center gap-2 px-3 py-2 font-semibold text-[#10203A]">
                            <span className="w-5 shrink-0 text-center text-xs text-[#5C6B78]">{i + 1}</span>
                            {e.logo ? <Image src={e.logo} alt="" width={20} height={20} className="h-5 w-5 shrink-0" /> : null}
                            {e.nombre}
                          </td>
                          <td className="px-3 py-2 text-center text-[#5C6B78]">{e.juegosJugados}</td>
                          <td className="px-3 py-2 text-center text-[#5C6B78]">{e.victorias}</td>
                          <td className="px-3 py-2 text-center text-[#5C6B78]">{e.empates}</td>
                          <td className="px-3 py-2 text-center text-[#5C6B78]">{e.derrotas}</td>
                          <td className="px-3 py-2 text-center text-[#5C6B78]">{e.diferencia}</td>
                          <td className="px-3 py-2 text-center font-semibold text-[#1E4D8C]">{e.puntos}</td>
                        </tr>
                      );
                    })}
                    {posiciones.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-3 py-4 text-center text-sm text-[#5C6B78]">
                          No hay tabla de posiciones disponible.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}