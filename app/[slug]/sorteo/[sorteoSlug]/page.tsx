import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { slugSorteo } from "@/lib/slug";
import { notFound } from "next/navigation";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

type Resultado = { numeros: string; fecha: string; creado_en: string };
type Sorteo = { id: number; nombre: string; hora_sorteo: string; dias_semana: string; resultados: Resultado[] };
type Loteria = { id: number; nombre: string; slug: string; activa: boolean; sorteos: Sorteo[] };

export const revalidate = 3600;

function hoyISO() {
  // Republica Dominicana esta fijo en UTC-4 (no usa horario de verano),
  // asi que restamos 4 horas sin importar en que zona horaria corra el servidor.
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return ahoraRD.toISOString().slice(0, 10);
}

function nombreDia(letra: string) {
  const mapa: Record<string, string> = { L: "Lun", M: "Mar", X: "Mié", J: "Jue", V: "Vie", S: "Sáb", D: "Dom" };
  return mapa[letra] || letra;
}

function formatearDias(diasSemana: string) {
  if (!diasSemana) return "Todos los días";
  const letras = diasSemana.split(",").map(function (l) { return l.trim(); });
  if (letras.length === 7) return "Todos los días";
  return letras.map(nombreDia).join(", ");
}

function formatearHora12(hora24: string) {
  if (!hora24) return "";
  const partes = hora24.split(":");
  let h = parseInt(partes[0], 10);
  const m = partes[1] || "00";
  const sufijo = h >= 12 ? "p.m." : "a.m.";
  h = h % 12;
  if (h === 0) h = 12;
  return h + ":" + m + " " + sufijo;
}

// Algunos sorteos cambian de hora los domingos (confirmado con la fuente oficial):
// Leidsa sortea Quiniela Pale, Pega 3 Mas, Loto Pool y Super Kino TV a las 3:55pm
// los domingos (no 8:55pm), y Loteria Nacional sortea la Quiniela Nacional de la
// Noche a las 6:00pm los domingos (no 9:00pm).
const HORA_DOMINGO_SORTEOS: Record<number, string> = {
  65: "15:55", 66: "15:55", 67: "15:55", 68: "15:55", 63: "18:00",
};
function horaSorteoEfectiva(sorteoId: number, hora24: string, fechaISO: string) {
  const esDomingo = new Date(fechaISO + "T00:00:00").getDay() === 0;
  if (esDomingo && HORA_DOMINGO_SORTEOS[sorteoId]) return HORA_DOMINGO_SORTEOS[sorteoId];
  return hora24;
}

function tamanoBolita(cantidad: number) {
  if (cantidad >= 6) return "h-11 w-11 text-base";
  if (cantidad >= 5) return "h-12 w-12 text-lg";
  return "h-14 w-14 text-xl";
}

function Bolita(props: { children: React.ReactNode; tamano: string; opaca?: boolean }) {
  const opaca = props.opaca === true;
  return (
    <div
      className={"relative flex shrink-0 items-center justify-center rounded-full font-mono font-bold " + props.tamano + (opaca ? " border-2 border-dashed border-[#9AA5AF] text-[#7B858F]" : " text-white")}
      style={opaca ? { backgroundColor: "#E4E8EB" } : { backgroundColor: COLOR_AZUL }}
    >
      {props.children}
    </div>
  );
}

function calcularCalientesFrios(resultados: Resultado[]) {
  const conteo: Record<string, number> = {};
  resultados.forEach(function (r) {
    r.numeros.split("-").forEach(function (n) {
      const num = n.trim().padStart(2, "0");
      if (num) conteo[num] = (conteo[num] || 0) + 1;
    });
  });
  const entradas = Object.entries(conteo).sort(function (a, b) { return b[1] - a[1]; });
  return {
    calientes: entradas.slice(0, 5),
    frios: entradas.slice(-5).reverse(),
    sorteosContados: resultados.length,
  };
}

async function buscarLoteriaYSorteo(slugLoteria: string, slugSorteoBuscado: string) {
  const { data: loteria, error } = await supabase
    .from("loterias")
    .select("id, nombre, slug, activa, sorteos ( id, nombre, hora_sorteo, dias_semana, resultados ( numeros, fecha, creado_en ) )")
    .eq("slug", slugLoteria)
    .eq("activa", true)
    .maybeSingle();

  if (!loteria || error) return null;

  const loteriaData = loteria as unknown as Loteria;
  const sorteo = (loteriaData.sorteos || []).find(function (s) { return slugSorteo(s.nombre) === slugSorteoBuscado; });
  if (!sorteo) return null;

  return { loteria: loteriaData, sorteo };
}

export async function generateMetadata(props: { params: Promise<{ slug: string; sorteoSlug: string }> }) {
  const params = await props.params;
  const encontrado = await buscarLoteriaYSorteo(params.slug, params.sorteoSlug);
  if (!encontrado) return { title: "Sorteo no encontrado" };

  const { loteria, sorteo } = encontrado;
  const horaTexto = formatearHora12(sorteo.hora_sorteo);
  const titulo = `Resultados ${sorteo.nombre} de ${loteria.nombre} Hoy — ${horaTexto}`;
  const descripcion = `Número ganador de ${sorteo.nombre} (${loteria.nombre}) en vivo y en directo, sorteo de las ${horaTexto} de hoy. Resultado actualizado al instante en La Bankera RD.`;

  return {
    title: titulo,
    description: descripcion,
    openGraph: { title: `${titulo} | La Bankera RD`, description: descripcion, locale: "es_DO", type: "website" },
    alternates: { canonical: `https://labankerard.com/${params.slug}/sorteo/${params.sorteoSlug}` },
  };
}

export default async function PaginaSorteo(props: { params: Promise<{ slug: string; sorteoSlug: string }> }) {
  const params = await props.params;
  const hoy = hoyISO();

  const encontrado = await buscarLoteriaYSorteo(params.slug, params.sorteoSlug);
  if (!encontrado) notFound();
  const { loteria, sorteo } = encontrado;

  const resultadoHoy = sorteo.resultados.find(function (r) { return r.fecha === hoy; });
  const numeros = resultadoHoy ? resultadoHoy.numeros.split("-") : [];
  const tamano = tamanoBolita(numeros.length || 3);
  const { calientes, frios, sorteosContados } = calcularCalientesFrios(sorteo.resultados);
  const hayDatosSuficientes = sorteosContados >= 5;

  const ultimosResultados = sorteo.resultados
    .slice()
    .sort(function (a, b) { return b.fecha.localeCompare(a.fecha); })
    .slice(0, 10);

  const datosEstructurados = resultadoHoy
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: `${sorteo.nombre} - ${loteria.nombre} - ${hoy}`,
        startDate: `${hoy}T${horaSorteoEfectiva(sorteo.id, sorteo.hora_sorteo, hoy) || "00:00"}:00-04:00`,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        location: { "@type": "VirtualLocation", url: `https://labankerard.com/${params.slug}/sorteo/${params.sorteoSlug}` },
        organizer: { "@type": "Organization", name: loteria.nombre },
        additionalProperty: { "@type": "PropertyValue", name: "Números ganadores", value: resultadoHoy.numeros },
      }
    : null;

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      {datosEstructurados ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }} />
      ) : null}

      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <a href={"/" + params.slug} className="font-mono text-sm text-[#E7A63C] hover:underline">← Volver a {loteria.nombre}</a>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            {sorteo.nombre}
          </h1>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            {loteria.nombre} · {sorteo.hora_sorteo ? formatearHora12(horaSorteoEfectiva(sorteo.id, sorteo.hora_sorteo, hoy)) : "Hora por confirmar"} · {formatearDias(sorteo.dias_semana)}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <div className="rounded-xl border border-[#10203A]/15 bg-white p-5">
          <p className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">Resultado de hoy</p>
          {numeros.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {numeros.map(function (n, i) { return <Bolita key={i} tamano={tamano}>{n}</Bolita>; })}
            </div>
          ) : (
            <span className="inline-block rounded-full px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide" style={{ backgroundColor: "#E4E8EB", color: "#7B858F" }}>
              Pendiente
            </span>
          )}

          {hayDatosSuficientes ? (
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#10203A]/8 pt-4">
              <div>
                <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wide" style={{ color: COLOR_TEXTO_SECUNDARIO }}>🔥 Más calientes</p>
                <div className="flex flex-wrap gap-1">
                  {calientes.map(function ([num, veces]) {
                    return (
                      <span key={num} className="rounded-full bg-[#E4573D]/10 px-2 py-1 font-mono text-xs font-bold text-[#B23B26]">
                        {num} <span className="font-normal opacity-70">({veces})</span>
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wide" style={{ color: COLOR_TEXTO_SECUNDARIO }}>❄️ Más fríos</p>
                <div className="flex flex-wrap gap-1">
                  {frios.map(function ([num, veces]) {
                    return (
                      <span key={num} className="rounded-full bg-[#1E4D8C]/8 px-2 py-1 font-mono text-xs font-bold text-[#1E4D8C]">
                        {num} <span className="font-normal opacity-70">({veces})</span>
                      </span>
                    );
                  })}
                </div>
              </div>
              <p className="col-span-2 font-mono text-[10px]" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                Basado en {sorteosContados} sorteos guardados.
              </p>
            </div>
          ) : null}
        </div>

        {ultimosResultados.length > 0 ? (
          <div className="mt-8 rounded-xl border border-[#10203A]/15 bg-white p-5">
            <p className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">Últimos resultados de {sorteo.nombre}</p>
            <div className="flex flex-col">
              {ultimosResultados.map(function (r, i) {
                return (
                  <a
                    key={i}
                    href={"/" + params.slug + "/" + r.fecha}
                    className="flex items-center justify-between gap-3 border-t border-[#10203A]/6 py-2.5 first:border-t-0 hover:bg-[#FBF7EE]"
                  >
                    <span className="shrink-0 font-mono text-xs font-bold" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{r.fecha}</span>
                    <span className="font-mono text-sm font-semibold text-[#10203A]">{r.numeros}</span>
                  </a>
                );
              })}
            </div>
          </div>
        ) : null}
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href={"/" + params.slug} className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a {loteria.nombre}</a>
        <span className="mx-2 text-[#10203A]/20">·</span>
        <a href={"/" + params.slug + "/historial"} className="font-mono text-sm text-[#1E4D8C] hover:underline">Ver historial completo</a>
      </footer>
    </div>
  );
}
