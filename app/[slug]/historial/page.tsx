import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

type Resultado = { numeros: string; fecha: string; creado_en: string };
type Sorteo = { id: number; nombre: string; resultados: Resultado[] };
type Loteria = { id: number; nombre: string; slug: string; activa: boolean; sorteos: Sorteo[] };

export const revalidate = 3600;

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function nombreMes(fechaISO: string) {
  const [y, m] = fechaISO.split("-").map(Number);
  return MESES[m - 1] + " " + y;
}

function formatearFechaCorta(fechaISO: string) {
  const partes = fechaISO.split("-");
  return partes[2] + "-" + partes[1];
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { data: loteria } = await supabase.from("loterias").select("nombre").eq("slug", params.slug).maybeSingle();
  if (!loteria) return { title: "Lotería no encontrada | La Bankera RD" };

  const titulo = `Historial de resultados de ${loteria.nombre} | La Bankera RD`;
  const descripcion = `Consulta el historial completo de números ganadores de ${loteria.nombre} en República Dominicana, organizado por mes.`;

  return {
    title: titulo,
    description: descripcion,
    openGraph: { title: titulo, description: descripcion, locale: "es_DO", type: "website" },
    alternates: { canonical: `https://labankerard.com/${params.slug}/historial` },
  };
}

export default async function PaginaHistorial(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;

  const { data: loteria, error } = await supabase
    .from("loterias")
    .select("id, nombre, slug, activa, sorteos ( id, nombre, resultados ( numeros, fecha, creado_en ) )")
    .eq("slug", params.slug)
    .eq("activa", true)
    .maybeSingle();

  if (!loteria || error) {
    notFound();
  }

  const loteriaData = loteria as unknown as Loteria;
  const sorteos = loteriaData.sorteos || [];

  // Agrupamos todos los resultados de todos los sorteos por fecha, y dentro de
  // cada fecha por mes, para armar una vista tipo "historial" facil de recorrer.
  const porFecha: Record<string, { sorteoNombre: string; numeros: string }[]> = {};
  sorteos.forEach(function (sorteo) {
    sorteo.resultados.forEach(function (r) {
      if (!porFecha[r.fecha]) porFecha[r.fecha] = [];
      porFecha[r.fecha].push({ sorteoNombre: sorteo.nombre, numeros: r.numeros });
    });
  });

  const fechasOrdenadas = Object.keys(porFecha).sort(function (a, b) { return b.localeCompare(a); });

  const porMes: Record<string, string[]> = {};
  fechasOrdenadas.forEach(function (fecha) {
    const mes = nombreMes(fecha);
    if (!porMes[mes]) porMes[mes] = [];
    porMes[mes].push(fecha);
  });
  const mesesOrdenados = Object.keys(porMes);

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <a href={"/" + params.slug} className="font-mono text-sm text-[#E7A63C] hover:underline">← Volver a {loteriaData.nombre}</a>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Historial de {loteriaData.nombre}
          </h1>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            {fechasOrdenadas.length} día{fechasOrdenadas.length === 1 ? "" : "s"} con resultados guardados
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        {fechasOrdenadas.length === 0 ? (
          <p className="text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Todavía no hay historial guardado para esta lotería.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {mesesOrdenados.map(function (mes) {
              return (
                <div key={mes}>
                  <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold capitalize text-[#10203A]">{mes}</h2>
                  <div className="flex flex-col gap-2">
                    {porMes[mes].map(function (fecha) {
                      return (
                        <a
                          key={fecha}
                          href={"/" + params.slug + "/" + fecha}
                          className="flex flex-col gap-1.5 rounded-lg border border-[#10203A]/12 bg-white p-3 hover:bg-[#FBF7EE] sm:flex-row sm:items-center sm:gap-3"
                        >
                          <span className="shrink-0 rounded-md bg-[#E4E8EB] px-2.5 py-1 font-mono text-xs font-bold text-[#5C6B78] sm:w-16 sm:text-center">
                            {formatearFechaCorta(fecha)}
                          </span>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs">
                            {porFecha[fecha].map(function (item, i) {
                              return (
                                <span key={i} style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                                  <span className="font-semibold text-[#10203A]">{item.sorteoNombre}:</span> {item.numeros}
                                </span>
                              );
                            })}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href={"/" + params.slug} className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a {loteriaData.nombre}</a>
        <span className="mx-2 text-[#10203A]/20">·</span>
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">Ver todas las loterías</a>
      </footer>
    </div>
  );
}
