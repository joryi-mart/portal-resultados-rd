"use client";

import { Space_Grotesk } from "next/font/google";
import Image from "next/image";
import NavPildoras from "../NavPildoras";
import { HISTORIAS_LIDOM } from "./datos";
import type { DatosLidom, EquipoLidom as Equipo, NoticiaLidom as Noticia, JuegoLidom as Juego } from "@/lib/lidom";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"] });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

// La API de MLB da el estado en ingles.
function estadoEnEspanol(j: Juego) {
  if (j.estado === "Final" || j.estado === "Game Over" || j.estado === "Completed Early") return "Final";
  if (j.estado === "In Progress") return "En juego";
  if (j.estado === "Postponed") return "Pospuesto";
  if (j.estado === "Suspended") return "Suspendido";
  if (j.estado === "Delayed" || j.estado.startsWith("Delayed")) return "Retrasado";
  return `${j.hora} (hora RD)`;
}

// Los datos llegan ya cargados desde el servidor (app/lidom/page.tsx), asi
// Google los ve en el HTML en vez de un "Cargando...".
export default function LidomCliente(props: { datos: DatosLidom | null }) {
  const equipos = props.datos?.equipos || [];
  const posiciones = props.datos?.posiciones || [];
  const juegosHoy = props.datos?.juegosHoy || [];
  const noticias = props.datos?.noticias?.news || [];
  const error = props.datos ? "" : "No se pudo cargar la información de la LIDOM. Intenta de nuevo en unos minutos.";

  // Juegos detras del lider, calculado aqui: el "gamesBack" de la API de MLB
  // para la LIDOM venia mal (ponia "líder" a equipos del fondo y numeros
  // negativos al lider real).
  const lider = posiciones[0];
  function juegosDetras(v: number, d: number) {
    if (!lider) return "";
    const gb = ((lider.victorias - v) + (d - lider.derrotas)) / 2;
    return gb <= 0 ? "líder" : `a ${gb.toFixed(1).replace(".0", "")} del líder`;
  }

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
          <div className="relative h-28 w-full">
            <Image src={foto.url} alt={"Estadio de " + equipo.nombre} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
          </div>
        ) : (
          <div className="flex h-28 w-full items-center justify-center bg-[#10203A]/5">
            <Image
              src={`https://www.mlbstatic.com/team-logos/${equipo.id}.svg`}
              alt={"Logo de " + equipo.nombre}
              width={56}
              height={56}
              unoptimized
              className="h-14 w-14 object-contain"
              onError={function (e) { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
        <div className="flex items-center gap-3 p-4">
          <Image
            src={`https://www.mlbstatic.com/team-logos/${equipo.id}.svg`}
            alt={"Logo de " + equipo.nombre}
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 shrink-0 object-contain"
            onError={function (e) { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold" style={{ color }}>{equipo.nombre}</p>
            {pos ? (
              <p className="truncate font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                {pos.victorias}-{pos.derrotas} · {juegosDetras(pos.victorias, pos.derrotas)}
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
          <Image
            src={noticia.image}
            alt={noticia.title}
            width={80}
            height={80}
            unoptimized
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
        <h1 className="mb-2 text-2xl font-bold text-[#10203A] sm:text-3xl">🇩🇴 LIDOM hoy: juegos, resultados y posiciones</h1>
        <p className="mb-6 rounded-lg bg-[#1E4D8C]/5 p-4 text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          La Liga de Béisbol Profesional de la República Dominicana (LIDOM) es el torneo de béisbol invernal más seguido del país y una de las ligas más competitivas del Caribe. Seis equipos —Tigres del Licey, Águilas Cibaeñas, Leones del Escogido, Estrellas Orientales, Toros del Este y Gigantes del Cibao— se disputan la corona cada temporada, entre mediados de octubre y mediados de enero, con roster llenos de peloteros de Grandes Ligas que regresan a jugar en su país durante el invierno. El campeón representa a República Dominicana en la Serie del Caribe, el torneo más prestigioso del béisbol latinoamericano.
        </p>

        <p className="mb-6 text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Más abajo puedes ver la tabla de posiciones actualizada de la temporada, el calendario de juegos de cada equipo y las noticias más recientes de la liga. También puedes entrar al perfil de cada equipo para conocer su historia, su roster y sus peloteros famosos.
        </p>

        {error && <p className="rounded-lg bg-red-50 p-4 text-base text-red-700">{error}</p>}

        {!error && (
          <>
            <h2 className="mb-4 text-xl font-semibold text-[#10203A]">⚾ Juegos de hoy</h2>
            {juegosHoy.length > 0 ? (
              <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {juegosHoy.map(function (j, i) {
                  const hayMarcador = j.carrerasVisitante !== null && j.carrerasLocal !== null && (j.estado === "Final" || j.estado === "Game Over" || j.estado === "Completed Early" || j.estado === "In Progress");
                  return (
                    <div key={i} className="rounded-xl border border-[#10203A]/15 bg-white p-4 shadow-sm">
                      {hayMarcador ? (
                        <div className="flex flex-col gap-1">
                          <p className="flex items-center justify-between gap-3 text-base font-bold text-[#10203A]">
                            <span>{j.visitante}</span><span className="font-mono text-xl">{j.carrerasVisitante}</span>
                          </p>
                          <p className="flex items-center justify-between gap-3 text-base font-bold text-[#10203A]">
                            <span>{j.local}</span><span className="font-mono text-xl">{j.carrerasLocal}</span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-base font-bold text-[#10203A]">{j.visitante} vs. {j.local}</p>
                      )}
                      <p className="mt-1 text-sm text-[#2E3B48]">{j.venue}</p>
                      <p className="mt-2 font-mono text-sm font-bold" style={{ color: COLOR_AZUL }}>{estadoEnEspanol(j)}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mb-10 rounded-lg bg-white p-4 text-base text-[#2E3B48]">Hoy no hay juegos de la LIDOM programados.</p>
            )}

            {posiciones.length > 0 ? (
              <>
                <h2 className="mb-4 text-lg font-semibold text-[#10203A]">🏆 Tabla de posiciones</h2>
                <div className="mb-10 overflow-hidden rounded-xl border border-[#10203A]/15 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#10203A]/10 bg-[#FBF7EE]" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                        <th className="px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wide">Equipo</th>
                        <th className="px-3 py-2.5 text-center font-mono text-xs font-bold uppercase tracking-wide">JJ</th>
                        <th className="px-3 py-2.5 text-center font-mono text-xs font-bold uppercase tracking-wide">G</th>
                        <th className="px-3 py-2.5 text-center font-mono text-xs font-bold uppercase tracking-wide">P</th>
                        <th className="px-3 py-2.5 text-center font-mono text-xs font-bold uppercase tracking-wide">PCT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posiciones.map(function (p) {
                        return (
                          <tr key={p.equipoId} className="border-t border-[#10203A]/6">
                            <td className="px-3 py-2.5 font-semibold text-[#10203A]">{p.nombre}</td>
                            <td className="px-3 py-2.5 text-center">{p.juegosJugados}</td>
                            <td className="px-3 py-2.5 text-center font-bold" style={{ color: COLOR_AZUL }}>{p.victorias}</td>
                            <td className="px-3 py-2.5 text-center">{p.derrotas}</td>
                            <td className="px-3 py-2.5 text-center font-mono text-xs">{p.porcentaje}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}

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
