"use client";

import { useEffect, useState } from "react";
import NavPildoras from "../NavPildoras";

type Pitcher = {
  fullName: string;
};

type Juego = {
  gamePk: number;
  status: { detailedState: string; abstractGameState: string };
  teams: {
    away: { team: { id: number; name: string }; score?: number; probablePitcher?: Pitcher };
    home: { team: { id: number; name: string }; score?: number; probablePitcher?: Pitcher };
  };
  venue: { name: string };
  gameDate: string;
};

type Noticia = {
  id: string;
  title: string;
  url: string;
  image: string;
  published: string;
};

type Equipo = {
  id: number;
  nombre: string;
  liga: string;
  division: string;
};

type JugadorDominicano = {
  id: number;
  nombre: string;
  posicion: string;
  equipo: string;
};

type Lider = {
  puesto: number;
  nombre: string;
  equipo: string;
  valor: number;
};

type EquipoLIDOM = {
  id: number;
  nombre: string;
  liga: string;
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
  id: number;
  nombre: string;
  equipo: string;
  rival: string;
  bateo: {
    turnos: number;
    hits: number;
    jonrones: number;
    carreras: number;
    empujadas: number;
  } | null;
  picheo: {
    entradas: string;
    ponches: number;
    carreras: number;
    hits: number;
  } | null;
};

export default function BeisbolPage() {
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equiposLIDOM, setEquiposLIDOM] = useState<EquipoLIDOM[]>([]);
  const [posicionesMLB, setPosicionesMLB] = useState<Division[]>([]);
  const [posicionesLIDOM, setPosicionesLIDOM] = useState<Division[]>([]);
  const [desempeno, setDesempeno] = useState<DesempenoJugador[]>([]);
  const [dominicanos, setDominicanos] = useState<JugadorDominicano[]>([]);
  const [liderJonrones, setLiderJonrones] = useState<Lider[]>([]);
  const [liderPitcheo, setLiderPitcheo] = useState<Lider[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);

  useEffect(function () {
    setCargando(true);
    const parametro = fechaSeleccionada ? `?fecha=${fechaSeleccionada}` : "";
    fetch("/api/beisbol" + parametro)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.detalle || data.error);
          return;
        }
        const juegosHoy: Juego[] = data.mlb?.dates?.[0]?.games || [];
        const conPicheo = juegosHoy.filter(function (j) {
          const terminado = j.status.abstractGameState === "Final";
          return !terminado && (j.teams.away.probablePitcher || j.teams.home.probablePitcher);
        });
        const sinPicheo = juegosHoy.filter(function (j) {
          return conPicheo.indexOf(j) === -1;
        });
        setJuegos(conPicheo.concat(sinPicheo));
        setNoticias(data.noticiasMLB?.news || []);
        setEquipos(data.equipos || []);
        setEquiposLIDOM(data.equiposLIDOM || []);
        setPosicionesMLB(data.posicionesMLB || []);
        setPosicionesLIDOM(data.posicionesLIDOM || []);
        setDesempeno(data.desempenoDominicanos || []);
        setDominicanos(data.jugadoresDominicanos || []);
        setLiderJonrones(data.liderJonrones || []);
        setLiderPitcheo(data.liderPitcheo || []);
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

  function irAPicheo() {
    window.location.href = "/beisbol/picheo";
  }

  function renderDesempeno(jugador: DesempenoJugador) {
    return (
      <div
        key={jugador.id}
        className="rounded-xl border border-[#10203A]/15 bg-white p-3 shadow-sm"
      >
        <div className="mb-2 flex items-center gap-2">
          <img
            src={`https://midfield.mlbstatic.com/v1/people/${jugador.id}/spots/120`}
            alt=""
            className="h-8 w-8 shrink-0 rounded-full bg-[#10203A]/5 object-cover"
            onError={function (e) {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#10203A]">{jugador.nombre}</p>
            <p className="truncate text-[10px] text-[#5C6B78]">
              {jugador.equipo} vs {jugador.rival}
            </p>
          </div>
        </div>

        {jugador.bateo && (
          <div className="rounded-md bg-[#1E4D8C]/8 px-2 py-1.5 font-mono text-[11px] text-[#10203A]">
            🏏 {jugador.bateo.hits}-{jugador.bateo.turnos}
            {jugador.bateo.jonrones > 0 ? `, ${jugador.bateo.jonrones} HR` : ""}
            {jugador.bateo.carreras > 0 ? `, ${jugador.bateo.carreras} C` : ""}
            {jugador.bateo.empujadas > 0 ? `, ${jugador.bateo.empujadas} IC` : ""}
          </div>
        )}

        {jugador.picheo && (
          <div className="mt-1.5 rounded-md bg-[#007A33]/8 px-2 py-1.5 font-mono text-[11px] text-[#10203A]">
            🥎 {jugador.picheo.entradas} IP, {jugador.picheo.ponches} K, {jugador.picheo.carreras} CL
          </div>
        )}
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
          <img
            src={noticia.image}
            alt=""
            className="h-20 w-20 shrink-0 rounded-lg bg-[#10203A]/5 object-cover"
            onError={function (e) {
              (e.target as HTMLImageElement).style.display = "none";
            }}
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

  function horaJuego(fechaISO: string) {
    try {
      return new Date(fechaISO).toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit", hour12: true });
    } catch {
      return "";
    }
  }

  function renderJuego(juego: Juego) {
    const terminado = juego.status.abstractGameState === "Final";
    const pitcherVisitante = juego.teams.away.probablePitcher?.fullName;
    const pitcherLocal = juego.teams.home.probablePitcher?.fullName;
    const hayPicheo = !terminado && (pitcherVisitante || pitcherLocal);

    return (
      <div key={juego.gamePk} className="border-b border-[#10203A]/10 px-4 py-3 last:border-0">
        <p className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-[#5C6B78]">
          {juego.status.detailedState}
          {!terminado ? " · " + horaJuego(juego.gameDate) : ""}
        </p>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src={`https://www.mlbstatic.com/team-logos/${juego.teams.away.team.id}.svg`}
              alt=""
              className="h-7 w-7 shrink-0"
            />
            <span className="truncate text-base font-semibold text-[#10203A]">{juego.teams.away.team.name}</span>
          </div>
          <span className="shrink-0 font-mono text-2xl font-bold text-[#1E4D8C]">{juego.teams.away.score ?? "-"}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src={`https://www.mlbstatic.com/team-logos/${juego.teams.home.team.id}.svg`}
              alt=""
              className="h-7 w-7 shrink-0"
            />
            <span className="truncate text-base font-semibold text-[#10203A]">{juego.teams.home.team.name}</span>
          </div>
          <span className="shrink-0 font-mono text-2xl font-bold text-[#1E4D8C]">{juego.teams.home.score ?? "-"}</span>
        </div>
        {hayPicheo && (
          <p className="mt-2 text-sm text-[#1E4D8C]">
            🥎 {pitcherVisitante || "Por confirmar"} vs {pitcherLocal || "Por confirmar"}
          </p>
        )}
      </div>
    );
  }

  function iniciales(nombre: string) {
    const partes = nombre.trim().split(" ");
    const primera = partes[0]?.[0] || "";
    const ultima = partes[partes.length - 1]?.[0] || "";
    return (primera + ultima).toUpperCase();
  }

  function renderJugadorDominicano(jugador: JugadorDominicano) {
    const urlWikipedia = "https://es.wikipedia.org/wiki/" + encodeURIComponent(jugador.nombre.replace(/ /g, "_"));
    return (
      <a
        key={jugador.id}
        href={urlWikipedia}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl border border-[#10203A]/15 bg-white p-3 shadow-sm hover:shadow-md"
      >
        <div className="relative h-12 w-12 shrink-0">
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#1E4D8C]/10 font-mono text-xs font-bold text-[#1E4D8C]">
            {iniciales(jugador.nombre)}
          </div>
          <img
            src={`https://midfield.mlbstatic.com/v1/people/${jugador.id}/spots/120`}
            alt={jugador.nombre}
            className="absolute inset-0 h-12 w-12 rounded-full object-cover"
            onError={function (e) {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#10203A]">{jugador.nombre}</p>
          <p className="truncate text-xs text-[#5C6B78]">
            {jugador.posicion} · {jugador.equipo}
          </p>
        </div>
      </a>
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
          <div>
            <p className="text-sm font-semibold text-[#10203A]">{lider.nombre}</p>
            <p className="text-xs text-[#5C6B78]">{lider.equipo}</p>
          </div>
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
        <img
          src={`https://www.mlbstatic.com/team-logos/${equipo.id}.svg`}
          alt={equipo.nombre}
          className="h-9 w-9 shrink-0"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#10203A]">{equipo.nombre}</p>
          <p className="truncate text-xs text-[#5C6B78]">{equipo.division}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7EE]">
      <NavPildoras />
      <div className="px-4 py-8 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#10203A]">⚾ Béisbol y MLB</h1>
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
          <button
            onClick={irAPicheo}
            className="rounded-full border border-[#1E4D8C]/30 px-4 py-1.5 font-mono text-xs font-semibold text-[#1E4D8C] hover:bg-[#1E4D8C]/5"
          >
            📊 Ver picheo del día
          </button>
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
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-[#10203A]">
              Juegos de hoy
            </h2>
            {juegos.length > 0 ? (
              <div className="rounded-xl border border-[#10203A]/15 bg-white">
                {juegos.map(renderJuego)}
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
              Estadísticas reales de los juegos de hoy — hits, jonrones, ponches y más.
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
              Noticias de MLB
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {noticias.map(renderNoticia)}
              {noticias.length === 0 && (
                <p className="text-sm text-[#5C6B78]">
                  No hay noticias de dominicanos por ahora.
                </p>
              )}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-1 text-lg font-semibold text-[#10203A]">
              Jugadores dominicanos en MLB
            </h2>
            <p className="mb-4 text-xs text-[#5C6B78]">
              {dominicanos.length} jugadores dominicanos activos en la MLB esta temporada.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dominicanos.slice(0, 24).map(renderJugadorDominicano)}
              {dominicanos.length === 0 && (
                <p className="text-sm text-[#5C6B78]">No se encontraron jugadores dominicanos.</p>
              )}
            </div>
          </section>

          <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section id="jonrones" className="rounded-xl border border-[#10203A]/15 bg-white p-5">
              <h2 className="mb-2 text-lg font-semibold text-[#10203A]">
                🏆 Líderes en jonrones
              </h2>
              <div>
                {liderJonrones.map((l) => renderLider(l, "HR"))}
                {liderJonrones.length === 0 && (
                  <p className="text-sm text-[#5C6B78]">No hay datos disponibles.</p>
                )}
              </div>
            </section>

            <section id="pitchers" className="rounded-xl border border-[#10203A]/15 bg-white p-5">
              <h2 className="mb-2 text-lg font-semibold text-[#10203A]">
                🥇 Mejores pitchers (victorias)
              </h2>
              <div>
                {liderPitcheo.map((l) => renderLider(l, "V"))}
                {liderPitcheo.length === 0 && (
                  <p className="text-sm text-[#5C6B78]">No hay datos disponibles.</p>
                )}
              </div>
            </section>
          </div>

          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-[#10203A]">
              📋 Tabla de posiciones — MLB
            </h2>
            {renderTablaPosiciones(posicionesMLB)}
          </section>

          <section id="lidom" className="mb-10">
            <h2 className="mb-1 text-lg font-semibold text-[#10203A]">
              🇩🇴 Equipos de LIDOM
            </h2>
            <p className="mb-4 text-xs text-[#5C6B78]">
              Liga de Béisbol Profesional de la República Dominicana.
            </p>
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {equiposLIDOM.map(function (e) {
                return (
                  <div
                    key={e.id}
                    className="rounded-xl border border-[#10203A]/15 bg-white p-4 shadow-sm"
                  >
                    <p className="font-semibold text-[#10203A]">{e.nombre}</p>
                    <p className="text-xs text-[#5C6B78]">{e.liga}</p>
                  </div>
                );
              })}
              {equiposLIDOM.length === 0 && (
                <p className="text-sm text-[#5C6B78]">No se pudieron cargar los equipos de LIDOM.</p>
              )}
            </div>
            {renderTablaPosiciones(posicionesLIDOM)}
          </section>

          <section id="equipos-mlb">
            <h2 className="mb-4 text-lg font-semibold text-[#10203A]">
              Equipos de la MLB
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