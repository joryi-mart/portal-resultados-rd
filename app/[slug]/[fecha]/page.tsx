import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

type Resultado = { numeros: string; fecha: string; creado_en: string };
type Sorteo = { id: number; nombre: string; hora_sorteo: string; resultados: Resultado[] };
type Loteria = { id: number; nombre: string; slug: string; activa: boolean; sorteos: Sorteo[] };

export const revalidate = 3600;

function hoyISO() {
  // Republica Dominicana esta fijo en UTC-4 (no usa horario de verano),
  // asi que restamos 4 horas sin importar en que zona horaria corra el servidor.
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return ahoraRD.toISOString().slice(0, 10);
}

function fechaValida(fecha: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha);
}

function sumarDias(fechaISO: string, dias: number) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const f = new Date(y, m - 1, d);
  f.setDate(f.getDate() + dias);
  const yy = f.getFullYear();
  const mm = String(f.getMonth() + 1).padStart(2, "0");
  const dd = String(f.getDate()).padStart(2, "0");
  return yy + "-" + mm + "-" + dd;
}

function formatearFechaLarga(fechaISO: string) {
  const d = new Date(fechaISO + "T00:00:00");
  return d.toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function tamanoBolita(cantidad: number) {
  if (cantidad >= 6) return "h-10 w-10 text-sm";
  if (cantidad >= 5) return "h-11 w-11 text-base";
  return "h-12 w-12 text-lg";
}

function Bolita(props: { children: React.ReactNode; tamano: string }) {
  return (
    <div className={"relative flex shrink-0 items-center justify-center rounded-full font-mono font-bold text-white " + props.tamano} style={{ backgroundColor: COLOR_AZUL }}>
      {props.children}
    </div>
  );
}

export async function generateMetadata(props: { params: Promise<{ slug: string; fecha: string }> }) {
  const params = await props.params;

  if (!fechaValida(params.fecha)) {
    return { title: "Fecha no válida | La Bankera RD" };
  }

  const { data: loteria } = await supabase.from("loterias").select("nombre").eq("slug", params.slug).maybeSingle();
  if (!loteria) return { title: "Lotería no encontrada | La Bankera RD" };

  const fechaLarga = formatearFechaLarga(params.fecha);
  const titulo = `Resultados de ${loteria.nombre} hoy ${fechaLarga} | La Bankera RD`;
  const descripcion = `Consulta los números ganadores de ${loteria.nombre} del ${fechaLarga} en República Dominicana. Resultado oficial actualizado en La Bankera RD.`;

  return {
    title: titulo,
    description: descripcion,
    openGraph: { title: titulo, description: descripcion, locale: "es_DO", type: "website" },
    alternates: { canonical: `https://labankerard.com/${params.slug}/${params.fecha}` },
  };
}

export default async function PaginaResultadoFecha(props: { params: Promise<{ slug: string; fecha: string }> }) {
  const params = await props.params;

  if (!fechaValida(params.fecha)) {
    notFound();
  }

  const hoy = hoyISO();
  const esHoy = params.fecha === hoy;
  const fechaAyer = sumarDias(params.fecha, -1);
  const fechaManana = sumarDias(params.fecha, 1);
  const noMostrarManana = fechaManana > hoy;

  const { data: loteria, error } = await supabase
    .from("loterias")
    .select("id, nombre, slug, activa, sorteos ( id, nombre, hora_sorteo, resultados ( numeros, fecha, creado_en ) )")
    .eq("slug", params.slug)
    .eq("activa", true)
    .maybeSingle();

  if (!loteria || error) {
    notFound();
  }

  const loteriaData = loteria as unknown as Loteria;
  const sorteos = loteriaData.sorteos || [];
  const fechaLarga = formatearFechaLarga(params.fecha);

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <a href={"/" + params.slug} className="font-mono text-sm text-[#E7A63C] hover:underline">← Ver historial completo de {loteriaData.nombre}</a>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold capitalize text-[#FBF7EE] sm:text-4xl">
            Resultados de {loteriaData.nombre}
          </h1>
          <p className="mt-2 font-mono text-sm capitalize text-[#D5DEEA]">
            {esHoy ? "Hoy, " : ""}{fechaLarga}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <div className="mb-8 flex items-center justify-between">
          <a
            href={"/" + params.slug + "/" + fechaAyer}
            className="rounded-full border border-[#10203A]/20 px-4 py-1.5 font-mono text-xs font-semibold text-[#10203A] hover:bg-[#10203A]/5"
          >
            ← Día anterior
          </a>
          {!noMostrarManana ? (
            <a
              href={"/" + params.slug + "/" + fechaManana}
              className="rounded-full border border-[#10203A]/20 px-4 py-1.5 font-mono text-xs font-semibold text-[#10203A] hover:bg-[#10203A]/5"
            >
              Día siguiente →
            </a>
          ) : null}
        </div>

        {sorteos.length === 0 ? (
          <p className="text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Todavía no hay productos registrados para esta lotería.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {sorteos.map(function (sorteo) {
              const resultado = sorteo.resultados.find(function (r) { return r.fecha === params.fecha; });
              const numeros = resultado ? resultado.numeros.split("-") : [];
              const tamano = tamanoBolita(numeros.length);

              return (
                <div key={sorteo.id} className="rounded-xl border border-[#10203A]/15 bg-white p-5">
                  <p className="mb-1 font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">
                    {sorteo.nombre}
                  </p>
                  <p className="mb-4 font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Sorteo: {sorteo.hora_sorteo}</p>

                  {numeros.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {numeros.map(function (n, i) { return <Bolita key={i} tamano={tamano}>{n}</Bolita>; })}
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                      {esHoy ? "Todavía no hay resultado publicado para hoy." : "No hay resultado registrado para esta fecha."}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href={"/" + params.slug} className="font-mono text-sm text-[#1E4D8C] hover:underline">← Ver historial completo de {loteriaData.nombre}</a>
        <span className="mx-2 text-[#10203A]/20">·</span>
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">Ver todas las loterías</a>
      </footer>
    </div>
  );
}
