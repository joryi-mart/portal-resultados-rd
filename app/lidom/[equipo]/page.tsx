import Image from "next/image";
import NavPildoras from "../../NavPildoras";
import { HISTORIAS_LIDOM } from "../datos";
import EquipoLidomCliente from "./EquipoLidomCliente";

const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

const NOMBRES_EQUIPOS: Record<string, string> = {
  "672": "Tigres del Licey",
  "667": "Águilas Cibaeñas",
  "671": "Leones del Escogido",
  "669": "Estrellas Orientales",
  "668": "Toros del Este",
  "670": "Gigantes del Cibao",
};

export async function generateMetadata(props: { params: Promise<{ equipo: string }> }) {
  const params = await props.params;
  const nombre = NOMBRES_EQUIPOS[params.equipo];
  if (!nombre) return { title: "Equipo no encontrado" };

  const titulo = `${nombre}: Roster, Últimos Juegos y Noticias`;
  const descripcion = `Sigue a ${nombre} de la LIDOM: alineación, últimos resultados y noticias del equipo.`;

  return {
    title: titulo,
    description: descripcion,
    openGraph: { title: titulo, description: descripcion, locale: "es_DO", type: "website" },
    alternates: { canonical: `https://labankerard.com/lidom/${params.equipo}` },
  };
}

export default async function EquipoLidomPage(props: { params: Promise<{ equipo: string }> }) {
  const params = await props.params;
  const nombre = NOMBRES_EQUIPOS[params.equipo];
  const historia = HISTORIAS_LIDOM[params.equipo];

  return (
    <div className="min-h-screen bg-[#FBF7EE]">
      <NavPildoras />
      <div className="px-4 py-8 sm:px-8">
        <a href="/lidom" className="mb-3 inline-block font-mono text-sm text-[#1E4D8C] hover:underline">← Ver todos los equipos de LIDOM</a>

        {nombre && historia ? (
          <>
            {historia.foto ? (
              <div className="mb-4">
                <div className="relative h-52 w-full sm:h-72">
                  <Image
                    src={historia.foto.url}
                    alt={"Estadio de " + nombre}
                    fill
                    sizes="(max-width: 640px) 100vw, 640px"
                    className="rounded-xl object-cover"
                  />
                </div>
                <p className="mt-1.5 text-right text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                  Foto: {historia.foto.autor} / Wikimedia Commons ({historia.foto.licencia})
                </p>
              </div>
            ) : null}

            <div
              className="mb-6 flex items-center gap-3 rounded-xl p-4"
              style={{ backgroundColor: historia.color + "14", borderLeft: `6px solid ${historia.color}` }}
            >
              <Image
                src={`https://www.mlbstatic.com/team-logos/${params.equipo}.svg`}
                alt={"Logo de " + nombre}
                width={56}
                height={56}
                unoptimized
                className="h-14 w-14 object-contain"
              />
              <h1 className="text-2xl font-bold" style={{ color: historia.color }}>{nombre}</h1>
            </div>

            <div className="mb-8 rounded-xl border bg-white p-5" style={{ borderColor: historia.color + "40" }}>
              <p className="mb-3 text-sm leading-relaxed text-[#10203A]">{historia.resumen}</p>
              <div className="grid grid-cols-1 gap-2 font-mono text-xs sm:grid-cols-3" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                <p>🗓️ <b>Fundado:</b> {historia.fundado}</p>
                <p>🏟️ <b>Estadio:</b> {historia.estadio}</p>
                <p>🏆 <b>Títulos:</b> {historia.titulos}</p>
              </div>

              <p className="mb-2 mt-4 font-mono text-xs font-bold uppercase tracking-wide" style={{ color: COLOR_TEXTO_SECUNDARIO }}>⭐ Peloteros famosos que han vestido este uniforme</p>
              <div className="flex flex-col gap-3">
                {historia.famosos.map(function (jugador) {
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
                  href={"https://www.instagram.com/" + historia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-semibold text-[#1E4D8C] hover:underline"
                >
                  📷 Instagram
                </a>
                <a
                  href={"https://x.com/" + historia.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-semibold text-[#1E4D8C] hover:underline"
                >
                  𝕏 Twitter/X
                </a>
              </div>
            </div>
          </>
        ) : null}

        <EquipoLidomCliente equipoId={params.equipo} />
      </div>
    </div>
  );
}
