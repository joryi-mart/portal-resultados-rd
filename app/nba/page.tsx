"use client";

import { useEffect, useState } from "react";
import NavPildoras from "../NavPildoras";
import Image from "next/image";

type Equipo = {
  id: string;
  nombre: string;
  abreviatura: string;
  logo: string;
};

type Competidor = {
  homeAway: string;
  score?: string;
  team: { id: string; displayName: string; logo?: string };
};

type Juego = {
  id: string;
  status: { type: { description: string; state: string } };
  competitions: { competitors: Competidor[] }[];
};

type Noticia = {
  id: string;
  title: string;
  url: string;
  image: string;
  published: string;
};

type JugadorDominicano = {
  id: string;
  nombre: string;
  posicion: string;
  equipo: string;
};

type Lider = {
  puesto: number;
  nombre: string;
  equipo: string;
  valor: string;
};

type EquipoPosicion = {
  nombre: string;
  juegosJugados: number;
  victorias: number;
  derrotas: number;
  porcentaje: string;
  diferencia: string;
};

type Division = {
  division: string;
  equipos: EquipoPosicion[];
};

type DesempenoJugador = {
  id: string;
  nombre: string;
  equipo: string;
  rival: string;
  puntos: number;
  rebotes: number;
  asistencias: number;
};

export default function NBAPage() {
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [posiciones, setPosiciones] = useState<Division[]>([]);
  const [desempeno, setDesempeno] = useState<DesempenoJugador[]>([]);
  const [dominicanos, setDominicanos] = useState<JugadorDominicano[]>([]);
  const [liderAtaque, setLiderAtaque] = useState<Lider[]>([]);
  const [liderDefensa, setLiderDefensa] = useState<Lider[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);

  useEffect(function () {
    setCargando(true);
    const parametro = fechaSeleccionada ? `?fecha=${fechaSeleccionada}` : "";
    fetch("/api/nba" + parametro)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.detalle || data.error);
          return;
        }
        setJuegos(data.nba?.events || []);
        setNoticias(data.noticiasNBA || []);
        setEquipos(data.equipos || []);
        setPosiciones(data.posicionesNBA || []);
        setDesempeno(data.desempenoDominicanos || []);
        setDominicanos(data.jugadoresDominicanos || []);
        setLiderAtaque(data.liderAtaque || []);
        setLiderDefensa(data.liderDefensa || []);
      })
      .catch(() => setError("No se pudo cargar la información"))
      .finally(() => setCargando(false));
  }, [fechaSeleccionada]);

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

  function iniciales(nombre: string) {
    const partes = nombre.trim().split(" ");
    const primera = partes[0]?.[0] || "";
    const ultima = partes[partes.length - 1]?.[0] || "";
    return (primera + ultima).toUpperCase();
  }

  function renderDesempeno(jugador: DesempenoJugador) {
    return (
      <div
        key={jugador.id}
        className="rounded-xl border border-[#10203A]/15 bg-white p-3 shadow-sm"
      >
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E4D8C]/10 font-mono text-[10px] font-bold text-[#1E4D8C]">
            {iniciales(jugador.nombre)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#10203A]">{jugador.nombre}</p>
            <p className="truncate text-[10px] text-[#5C6B78]">
              {jugador.equipo} vs {jugador.rival}
            </p>
          </div>
        </div>

        <div className="rounded-md bg-[#1E4D8C]/8 px-2 py-1.5 font-mono text-[11px] text-[#10203A]">
          🏀 {jugador.puntos} PTS, {jugador.rebotes} REB, {jugador.asistencias} AST
        </div>
      </div>
    );
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
    const visitante = competidores.find((c) => c.homeAway === "away");
    const local = competidores.find((c) => c.homeAway === "home");
    if (!visitante || !local) return null;

    return (
      <tr key={juego.id} className="border-b border-[#10203A]/10 last:border-0">
        <td className="py-3 pl-4 pr-3 align-top">
          <p className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-[#5C6B78]">
            {juego.status.type.description}
          </p>
          <div className="flex items-center gap-2">
            {visitante.team.logo ? (
              <Image src={visitante.team.logo} alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
            ) : null}
            <span className="text-base font-semibold text-[#10203A]">
              {visitante.team.displayName}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            {local.team.logo ? (
              <Image src={local.team.logo} alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
            ) : null}
            <span className="text-base font-semibold text-[#10203A]">
              {local.team.displayName}
            </span>
          </div>
        </td>
        <td className="w-24 py-3 pr-4 text-right align-top">
          <p className="font-mono text-2xl font-bold text-[#1E4D8C]">{visitante.score ?? "-"}</p>
          <p className="mt-6 font-mono text-2xl font-bold text-[#1E4D8C]">{local.score ?? "-"}</p>
        </td>
      </tr>
    );
  }

  function renderJugadorDominicano(jugador: JugadorDominicano) {
    return (
      <div
        key={jugador.id}
        className="flex items-center gap-3 rounded-xl border border-[#10203A]/15 bg-white p-3 shadow-sm"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1E4D8C]/10 font-mono text-xs font-bold text-[#1E4D8C]">
          {iniciales(jugador.nombre)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#10203A]">{jugador.nombre}</p>
          <p className="truncate text-xs text-[#5C6B78]">
            {jugador.posicion} · {jugador.equipo}
          </p>
        </div>
      </div>
    );
  }

  function renderLider(lider: Lider, etiqueta: string) {
    return (
      <div
        key={lider.puesto + lider.nombre}
        className="flex items-center justify-between gap-3 border-t border-[#10203A]/8 py-2.5 first:border-t-0"
      >
        <div className="flex items-center gap-3">
          <span className="w-6 shrink-0 text-center font-mono text-sm font-bold text-[#5C6B78]">
            {lider.puesto}
          </span>
          <p className="text-sm font-semibold text-[#10203A]">{lider.equipo}</p>
        </div>
        <span className="font-mono text-lg font-bold text-[#1E4D8C]">
          {lider.valor} <span className="text-xs font-normal text-[#5C6B78]">{etiqueta}</span>
        </span>
      </div>
    );
  }

  function renderTablaPosiciones(divisiones: Division[]) {
    return (
      <div className="flex flex-col gap-6">
        {divisiones.map(function (div, indice) {
          return (
            <div key={indice + "-" + div.division}>
              <p className="mb-2 font-semibold text-[#10203A]">{div.division}</p>
              <div className="overflow-x-auto rounded-xl border border-[#10203A]/15 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#10203A]/10 text-left text-xs uppercase text-[#5C6B78]">
                      <th className="px-3 py-2">Equipo</th>
                      <th className="px-3 py-2 text-center">JJ</th>
                      <th className="px-3 py-2 text-center">G</th>
                      <th className="px-3 py-2 text-center">P</th>
                      <th className="px-3 py-2 text-center">%</th>
                      <th className="px-3 py-2 text-center">DIF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {div.equipos.map(function (e) {
                      return (
                        <tr key={e.nombre} className="border-b border-[#10203A]/6 last:border-0">
                          <td className="px-3 py-2 font-semibold text-[#10203A]">{e.nombre}</td>
                          <td className="px-3 py-2 text-center text-[#5C6B78]">{e.juegosJugados}</td>
                          <td className="px-3 py-2 text-center font-semibold text-[#1E4D8C]">{e.victorias}</td>
                          <td className="px-3 py-2 text-center text-[#5C6B78]">{e.derrotas}</td>
                          <td className="px-3 py-2 text-center text-[#5C6B78]">{e.porcentaje}</td>
                          <td className="px-3 py-2 text-center text-[#5C6B78]">{e.diferencia}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        {divisiones.length === 0 && (
          <p className="text-sm text-[#5C6B78]">No hay tabla de posiciones disponible.</p>
        )}
      </div>
    );
  }

  function renderEquipo(equipo: Equipo) {
    return (
      <div
        key={equipo.id}
        className="flex items-center gap-3 rounded-xl border border-[#10203A]/15 bg-white p-3 shadow-sm"
      >
        {equipo.logo ? (
          <Image src={equipo.logo} alt={equipo.nombre} width={36} height={36} className="h-9 w-9 shrink-0" />
        ) : null}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#10203A]">{equipo.nombre}</p>
          <p className="truncate text-xs text-[#5C6B78]">{equipo.abreviatura}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7EE]">
      <NavPildoras />
      <div className="px-4 py-8 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#10203A]">🏀 NBA</h1>
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

      {fechaSeleccionada ? (
        <p className="mb-4 -mt-3 font-mono text-xs text-[#5C6B78]">
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
            <h2 className="mb-1 text-lg font-semibold text-[#10203A]">
              🇩🇴 Desempeño dominicano de hoy
            </h2>
            <p className="mb-4 text-xs text-[#5C6B78]">
              Estadísticas reales de los juegos de hoy — puntos, rebotes y asistencias.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {desempeno.map(renderDesempeno)}
              {desempeno.length === 0 && (
                <p className="text-sm text-[#5C6B78]">
                  Todavía no hay estadísticas disponibles hoy — vuelve a revisar cuando empiecen los juegos.
                </p>
              )}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-[#10203A]">
              Noticias de NBA
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

          <section className="mb-10">
            <h2 className="mb-1 text-lg font-semibold text-[#10203A]">
              Jugadores dominicanos en la NBA
            </h2>
            <p className="mb-4 text-xs text-[#5C6B78]">
              {dominicanos.length} jugadores dominicanos activos en la NBA esta temporada.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dominicanos.map(renderJugadorDominicano)}
              {dominicanos.length === 0 && (
                <p className="text-sm text-[#5C6B78]">No se encontraron jugadores dominicanos.</p>
              )}
            </div>
          </section>

          <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-[#10203A]/15 bg-white p-5">
              <h2 className="mb-2 text-lg font-semibold text-[#10203A]">
                🏆 Mejor ataque (puntos por partido)
              </h2>
              <div>
                {liderAtaque.map((l) => renderLider(l, "PPG"))}
                {liderAtaque.length === 0 && (
                  <p className="text-sm text-[#5C6B78]">No hay datos disponibles.</p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-[#10203A]/15 bg-white p-5">
              <h2 className="mb-2 text-lg font-semibold text-[#10203A]">
                🥇 Mejor defensa (puntos permitidos)
              </h2>
              <div>
                {liderDefensa.map((l) => renderLider(l, "PPG"))}
                {liderDefensa.length === 0 && (
                  <p className="text-sm text-[#5C6B78]">No hay datos disponibles.</p>
                )}
              </div>
            </section>
          </div>

          <section id="posiciones" className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-[#10203A]">
              📋 Tabla de posiciones — NBA
            </h2>
            {renderTablaPosiciones(posiciones)}
          </section>

          <section id="equipos-nba">
            <h2 className="mb-4 text-lg font-semibold text-[#10203A]">
              Equipos de la NBA
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {equipos.map(renderEquipo)}
              {equipos.length === 0 && (
                <p className="text-sm text-[#5C6B78]">No se pudieron cargar los equipos.</p>
              )}
            </div>
          </section>
        </>
      )}
      </div>
    </div>
  );
}