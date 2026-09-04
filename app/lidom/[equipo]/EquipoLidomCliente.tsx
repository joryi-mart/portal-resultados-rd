"use client";

import { useEffect, useState } from "react";
import { Space_Grotesk } from "next/font/google";
import NavPildoras from "../../NavPildoras";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"] });

const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
const COLOR_VERDE = "#007A33";
const COLOR_ROJO = "#B23B26";

type HistoriaEquipo = {
  fundado: string;
  estadio: string;
  titulos: string;
  resumen: string;
  famosos: string[];
  instagram: string;
  x: string;
  foto: { url: string; autor: string; licencia: string } | null;
};

const HISTORIAS_LIDOM: Record<string, HistoriaEquipo> = {
  "672": {
    fundado: "7 de noviembre de 1907",
    estadio: "Quisqueya Juan Marichal (Santo Domingo, compartido con Escogido)",
    titulos: "23 títulos nacionales · 11 Series del Caribe",
    resumen:
      "Conocidos como \"El Glorioso\", los Tigres del Licey son el equipo más laureado de la LIDOM y uno de los más ganadores del béisbol mundial. Fueron el primer campeón de la liga en 1951 y el primer representante dominicano en ganar una Serie del Caribe, en 1971.",
    famosos: ["Pedro Martínez", "Vladimir Guerrero", "Manny Mota", "Julio Franco"],
    instagram: "tigresdellicey",
    x: "TigresdelLicey",
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Estadio_quisqueya_santo_domingo_dominican_republic_1.jpg",
      autor: "Calt2001",
      licencia: "CC0",
    },
  },
  "667": {
    fundado: "2 de enero de 1933",
    estadio: "Estadio Cibao (Santiago), el más grande del país",
    titulos: "22 títulos nacionales · 6 Series del Caribe",
    resumen:
      "Las Águilas Cibaeñas nacieron como Santiago Baseball Club y adoptaron su nombre actual en 1937. Representan a la región del Cibao y mantienen una de las rivalidades más intensas del béisbol dominicano frente al Licey.",
    famosos: ["Bartolo Colón", "Edwin Encarnación", "Carlos Gómez", "Dellin Betances"],
    instagram: "aguilasbbc",
    x: "aguilascibaenas",
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/07/Estadio_Cibao_Drone.jpg",
      autor: "ThePapo309",
      licencia: "CC BY-SA 4.0",
    },
  },
  "671": {
    fundado: "17 de febrero de 1921",
    estadio: "Quisqueya Juan Marichal (Santo Domingo, compartido con Licey)",
    titulos: "18 títulos nacionales · 5 Series del Caribe",
    resumen:
      "Los Leones del Escogido surgieron de la unión de varios equipos capitalinos para hacerle frente al dominio del Licey. Comparten estadio con su archirrival y han tenido varias dinastías, incluyendo cuatro títulos entre 2009-10 y 2015-16.",
    famosos: ["Juan Marichal", "David Ortiz", "Sammy Sosa", "los hermanos Alou"],
    instagram: "escogidobbclub",
    x: "EscogidoDRTeam",
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Estadio_quisqueya_santo_domingo_dominican_republic_1.jpg",
      autor: "Calt2001",
      licencia: "CC0",
    },
  },
  "669": {
    fundado: "15 de diciembre de 1910",
    estadio: "Estadio Tetelo Vargas (San Pedro de Macorís)",
    titulos: "4 títulos nacionales (1936, 1954, 1967-68, 2018-19)",
    resumen:
      "Las Estrellas Orientales representan a San Pedro de Macorís, ciudad conocida por producir una enorme cantidad de peloteros de Grandes Ligas. Ganaron su cuarto título en 2018-19 tras 51 años de sequía, venciendo a los Toros del Este.",
    famosos: ["Tetelo Vargas", "Alfredo Griffin", "Rico Carty"],
    instagram: "estrellasbc",
    x: "Estrellas_1910",
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/55/Estadio_Tetelo_Vargas.png",
      autor: "Missael1990",
      licencia: "CC BY-SA 4.0",
    },
  },
  "668": {
    fundado: "1983 (como Azucareros del Este)",
    estadio: "Estadio Francisco A. Micheli (La Romana), único estadio privado de la liga",
    titulos: "3 títulos nacionales (1994-95, 2010-11, 2019-20) · 1 Serie del Caribe (2020)",
    resumen:
      "Los Toros del Este representan a La Romana y juegan en el único estadio de la liga que es propiedad privada (de la Central Romana Corporation). Ganaron su primera Serie del Caribe en 2020, un hito histórico para la franquicia.",
    famosos: ["Eddy Garabito", "Cecilio Guante", "Esteban Germán"],
    instagram: "torosdeleste",
    x: "TorosdelEste",
    foto: null,
  },
  "670": {
    fundado: "23 de abril de 1996 (como Gigante del Nordeste)",
    estadio: "Estadio Julián Javier (San Francisco de Macorís)",
    titulos: "2 títulos nacionales (2014-15, 2021-22)",
    resumen:
      "Los Gigantes del Cibao son el equipo más joven de la LIDOM, representando a San Francisco de Macorís. Ganaron su primer título en 2014-15 y el segundo en 2021-22, consolidándose como una fuerza en ascenso de la liga.",
    famosos: ["Marcell Ozuna", "Ketel Marte", "José Sirí", "Camilo Doval"],
    instagram: "gigantescibao",
    x: "Gigantes_Cibao",
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Estadio_Julian_Javier.jpg",
      autor: "OzzyDiaz",
      licencia: "CC BY-SA 3.0",
    },
  },
};

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

            <div className="mb-6 flex items-center gap-3">
              <img
                src={`https://www.mlbstatic.com/team-logos/${detalle.id}.svg`}
                alt=""
                className="h-14 w-14 object-contain"
                onError={function (e) { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <h1 className="text-2xl font-bold text-[#10203A]">{detalle.nombre}</h1>
            </div>

            {HISTORIAS_LIDOM[String(detalle.id)] && (
              <div className="mb-8 rounded-xl border border-[#10203A]/15 bg-white p-5">
                <p className="mb-3 text-sm leading-relaxed text-[#10203A]">{HISTORIAS_LIDOM[String(detalle.id)].resumen}</p>
                <div className="grid grid-cols-1 gap-2 font-mono text-xs sm:grid-cols-3" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                  <p>🗓️ <b>Fundado:</b> {HISTORIAS_LIDOM[String(detalle.id)].fundado}</p>
                  <p>🏟️ <b>Estadio:</b> {HISTORIAS_LIDOM[String(detalle.id)].estadio}</p>
                  <p>🏆 <b>Títulos:</b> {HISTORIAS_LIDOM[String(detalle.id)].titulos}</p>
                </div>

                <p className="mb-1.5 mt-4 font-mono text-[10px] font-bold uppercase tracking-wide" style={{ color: COLOR_TEXTO_SECUNDARIO }}>⭐ Peloteros famosos que han vestido este uniforme</p>
                <div className="flex flex-wrap gap-1.5">
                  {HISTORIAS_LIDOM[String(detalle.id)].famosos.map(function (nombre) {
                    return (
                      <span key={nombre} className="rounded-full bg-[#1E4D8C]/8 px-2.5 py-1 text-xs font-semibold text-[#1E4D8C]">
                        {nombre}
                      </span>
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
