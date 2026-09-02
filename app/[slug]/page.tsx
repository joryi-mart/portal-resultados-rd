import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import NavPildoras from "../NavPildoras";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
const COLOR_VERDE_RD = "#007A33";

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

function formatearDias(diasSemana: string) {
  if (!diasSemana) return "Todos los días";
  const letras = diasSemana.split(",").map(function (l) { return l.trim(); });
  if (letras.length === 7) return "Todos los días";
  return letras.map(nombreDia).join(", ");
}

function tamanoBolita(cantidad: number) {
  if (cantidad >= 6) return "h-11 w-11 text-base";
  if (cantidad >= 5) return "h-12 w-12 text-lg";
  return "h-14 w-14 text-xl";
}

function numerosVistaPrevia(sorteoId: number) {
  const a = Math.abs((sorteoId * 7 + 3) % 100);
  const b = Math.abs((sorteoId * 13 + 11) % 100);
  const c = Math.abs((sorteoId * 19 + 17) % 100);
  function pad(n: number) { return String(n).padStart(2, "0"); }
  return [pad(a), pad(b), pad(c)];
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

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { data: loteria } = await supabase.from("loterias").select("nombre").eq("slug", params.slug).maybeSingle();
  if (!loteria) return { title: "Lotería no encontrada | La Bankera RD" };

  const titulo = `Resultados de ${loteria.nombre} en Vivo | La Bankera RD`;
  const descripcion = `Consulta los números ganadores de todos los sorteos de ${loteria.nombre} en República Dominicana, actualizados en vivo.`;

  return {
    title: titulo,
    description: descripcion,
    openGraph: { title: titulo, description: descripcion, locale: "es_DO", type: "website" },
    alternates: { canonical: `https://labankerard.com/${params.slug}` },
  };
}

export default async function PaginaLoteria(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const hoy = hoyISO();

  const { data: loteria, error } = await supabase
    .from("loterias")
    .select("id, nombre, slug, activa, sorteos ( id, nombre, hora_sorteo, dias_semana, resultados ( numeros, fecha, creado_en ) )")
    .eq("slug", params.slug)
    .eq("activa", true)
    .maybeSingle();

  if (!loteria || error) {
    notFound();
  }

  const loteriaData = loteria as unknown as Loteria;
  const sorteos = loteriaData.sorteos || [];

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <a href="/" className="font-mono text-sm text-[#E7A63C] hover:underline">← Ver todas las loterías</a>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            {loteriaData.nombre}
          </h1>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            {sorteos.length} producto{sorteos.length === 1 ? "" : "s"} · resultados de hoy
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <NavPildoras />

        {sorteos.length === 0 ? (
          <p className="text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Todavía no hay productos registrados para esta lotería.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {sorteos.map(function (sorteo) {
              const resultado = sorteo.resultados.find(function (r) { return r.fecha === hoy; });
              const hayResultadoReal = !!resultado;
              const numeros = resultado ? resultado.numeros.split("-") : numerosVistaPrevia(sorteo.id);
              const tamano = tamanoBolita(numeros.length);
              const { calientes, frios, sorteosContados } = calcularCalientesFrios(sorteo.resultados);
              const hayDatosSuficientes = sorteosContados >= 5;

              return (
                <div key={sorteo.id} className="rounded-xl border border-[#10203A]/15 bg-white p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">
                        {sorteo.nombre}
                      </p>
                      <p className="font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                        {sorteo.hora_sorteo ? formatearHora12(sorteo.hora_sorteo) : "Hora por confirmar"} · {formatearDias(sorteo.dias_semana)}
                      </p>
                    </div>
                    <a
                      href={"/" + params.slug + "/historial"}
                      className="shrink-0 rounded-full border border-[#10203A]/20 px-3 py-1.5 font-mono text-xs font-semibold text-[#10203A] hover:bg-[#10203A]/5"
                    >
                      Ver historial →
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {numeros.map(function (n, i) { return <Bolita key={i} tamano={tamano} opaca={!hayResultadoReal}>{n}</Bolita>; })}
                    {!hayResultadoReal ? (
                      <span className="ml-1 font-mono text-[11px] italic" style={{ color: COLOR_TEXTO_SECUNDARIO }}>(vista previa, todavía no sale hoy)</span>
                    ) : null}
                  </div>

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
                        Basado en {sorteosContados} sorteos guardados. Entre más historial acumulemos, más útil se pone esto.
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Ver todas las loterías</a>
      </footer>
    </div>
  );
}
