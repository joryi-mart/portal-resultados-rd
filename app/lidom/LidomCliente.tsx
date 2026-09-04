"use client";

import { useEffect, useState } from "react";
import { Space_Grotesk } from "next/font/google";
import NavPildoras from "../NavPildoras";
import { HISTORIAS_LIDOM } from "./datos";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"] });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

type Equipo = { id: number; nombre: string; ligaId: number | null };
type Posicion = {
  equipoId: number;
  nombre: string;
  juegosJugados: number;
  victorias: number;
  derrotas: number;
  porcentaje: string;
  diferencia: string;
};
type Noticia = { id: string; title: string; url: string; image: string; published: string };

export default function LidomCliente() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [posiciones, setPosiciones] = useState<Posicion[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(function () {
    fetch("/api/lidom")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.detalle || data.error);
          return;
        }
        setEquipos(data.equipos || []);
        setPosiciones(data.posiciones || []);
        setNoticias(data.noticias?.news || []);
      })
      .catch(() => setError("No se pudo cargar la información"))
      .finally(() => setCargando(false));
  }, []);

  function renderEquipo(equipo: Equipo) {
    const pos = posiciones.find(function (p) { return p.equipoId === equipo.id; });
    const foto = HISTORIAS_LIDOM[String(equipo.id)]?.foto;
    const color = HISTORIAS_LIDOM[String(equipo.id)]?.color || "#10203A";
    return (
      <a
        key={equipo.id}
        href={"/lidom/" + equipo.id}
        className="overflow-hidden rounded-xl border-2 bg-white shadow-sm hover:shadow-md"
        style={{ borderColor: color }}
      >
        {foto ? (
          <img src={foto.url} alt="" className="h-28 w-full object-cover" />
        ) : (
          <div className="flex h-28 w-full items-center justify-center bg-[#10203A]/5">
            <img
              src={`https://www.mlbstatic.com/team-logos/${equipo.id}.svg`}
              alt=""
              className="h-14 w-14 object-contain"
              onError={function (e) { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
        <div className="flex items-center gap-3 p-4">
          <img
            src={`https://www.mlbstatic.com/team-logos/${equipo.id}.svg`}
            alt=""
            className="h-10 w-10 shrink-0 object-contain"
            onError={function (e) { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold" style={{ color }}>{equipo.nombre}</p>
            {pos ? (
              <p className="truncate font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                {pos.victorias}-{pos.derrotas} · {pos.diferencia === "-" ? "líder" : pos.diferencia + " GB"}
              </p>
            ) : (
              <p className="truncate font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Fuera de temporada</p>
            )}
          </div>
        </div>
      </a>
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
            onError={function (e) { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : null}
        <div className="min-w-0">
          <p className="line-clamp-3 text-sm font-semibold text-[#10203A]">{noticia.title}</p>
          <p className="mt-1 text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
            {noticia.published ? new Date(noticia.published).toLocaleDateString("es-DO") : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={display.className + " min-h-screen bg-[#FBF7EE]"}>
      <NavPildoras />
      <div className="px-4 py-8 sm:px-8">
        <h1 className="mb-2 text-2xl font-bold text-[#10203A]">🇩🇴 LIDOM</h1>
        <p className="mb-6 rounded-lg bg-[#1E4D8C]/5 p-4 text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          La Liga de Béisbol Profesional de la República Dominicana (LIDOM) es el torneo de béisbol invernal más seguido del país y una de las ligas más competitivas del Caribe. Seis equipos —Tigres del Licey, Águilas Cibaeñas, Leones del Escogido, Estrellas Orientales, Toros del Este y Gigantes del Cibao— se disputan la corona cada temporada, entre mediados de octubre y mediados de enero, con roster llenos de peloteros de Grandes Ligas que regresan a jugar en su país durante el invierno. El campeón representa a República Dominicana en la Serie del Caribe, el torneo más prestigioso del béisbol latinoamericano.
        </p>

        {cargando && <p className="font-mono text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Cargando...</p>}
        {error && <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>}

        {!cargando && !error && (
          <>
            <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {equipos.map(renderEquipo)}
            </div>

            <h2 className="mb-4 text-lg font-semibold text-[#10203A]">📰 Noticias de LIDOM</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {noticias.map(renderNoticia)}
              {noticias.length === 0 && (
                <p className="text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>No hay noticias disponibles por ahora.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
