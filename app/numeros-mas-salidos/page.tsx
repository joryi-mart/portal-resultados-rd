import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { Bolita } from "@/app/componentesResultados";
import NavPildoras from "../NavPildoras";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

export const revalidate = 21600; // 6 horas: no hace falta recalcular en cada visita

export const metadata = {
  title: "Números Más Salidos en la Lotería Dominicana",
  description:
    "Los números que más veces han salido en Lotería Nacional, Real, Leidsa y Loteka, calculados con nuestros propios resultados guardados día a día.",
  alternates: { canonical: "https://labankerard.com/numeros-mas-salidos" },
};

const LOTERIAS_DESTACADAS: { slug: string; nombre: string }[] = [
  { slug: "nacional", nombre: "Lotería Nacional" },
  { slug: "real", nombre: "Lotería Real" },
  { slug: "leidsa", nombre: "Leidsa" },
  { slug: "loteka", nombre: "Loteka" },
];

type FilaResultado = { numeros: string; fecha: string };

async function obtenerTopPorLoteria(slug: string) {
  const { data, error } = await supabase
    .from("resultados")
    .select("numeros, fecha, sorteos!inner(loterias!inner(slug))")
    .eq("sorteos.loterias.slug", slug)
    .limit(5000);
  if (error || !data) return { top: [], total: 0, desde: null as string | null };

  const filas = data as unknown as FilaResultado[];
  const conteo = new Map<string, number>();
  let fechaMasVieja: string | null = null;

  filas.forEach(function (fila) {
    if (!fechaMasVieja || fila.fecha < fechaMasVieja) fechaMasVieja = fila.fecha;
    fila.numeros.split("-").forEach(function (n) {
      const limpio = n.trim().padStart(2, "0");
      if (!/^\d{2}$/.test(limpio)) return; // se ignoran numeros de 3+ cifras (ej. algunos juegos americanos)
      conteo.set(limpio, (conteo.get(limpio) || 0) + 1);
    });
  });

  const top = Array.from(conteo.entries())
    .sort(function (a, b) { return b[1] - a[1]; })
    .slice(0, 10)
    .map(function ([numero, veces]) { return { numero, veces }; });

  return { top, total: filas.length, desde: fechaMasVieja };
}

function formatearFecha(fechaISO: string) {
  return new Date(fechaISO + "T12:00:00Z").toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default async function NumerosMasSalidosPage() {
  const resultadosPorLoteria = await Promise.all(
    LOTERIAS_DESTACADAS.map(async function (l) {
      const { top, total, desde } = await obtenerTopPorLoteria(l.slug);
      return { ...l, top, total, desde };
    })
  );

  const desdeMasAntigua = resultadosPorLoteria
    .map(function (l) { return l.desde; })
    .filter(function (d): d is string { return !!d; })
    .sort()[0];

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Números Más Salidos
          </h1>
          <p className="mt-2 font-mono text-sm font-extrabold uppercase tracking-wide text-[#E7A63C] sm:text-base">
            Página informativa no oficial de lotería
          </p>
          {desdeMasAntigua ? (
            <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
              Calculado con nuestros propios resultados guardados desde el {formatearFecha(desdeMasAntigua)}
            </p>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <p className="mb-8 text-base leading-relaxed">
          Cada vez que una lotería publica un resultado, lo guardamos. Con ese historial calculamos qué números han
          salido más veces en cada lotería. Entre más tiempo pase, más resultados vamos sumando y más preciso se
          vuelve este conteo.
        </p>

        <div className="mb-8 flex flex-col gap-6">
          {resultadosPorLoteria.map(function (l) {
            return (
              <div key={l.slug} className="rounded-xl border border-[#10203A]/15 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-bold" style={{ color: COLOR_AZUL }}>
                    {l.nombre}
                  </h2>
                  <a href={`/${l.slug}`} className="text-xs font-bold underline" style={{ color: COLOR_AZUL }}>
                    Ver resultados de hoy →
                  </a>
                </div>
                {l.top.length === 0 ? (
                  <p className="text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                    Todavía no tenemos suficientes resultados guardados de esta lotería.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {l.top.map(function (t, i) {
                      return (
                        <div key={t.numero} className="flex flex-col items-center gap-1">
                          <Bolita tamano="h-14 w-14 text-xl" primera={i === 0}>
                            {t.numero}
                          </Bolita>
                          <span className="font-mono text-[11px]" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                            {t.veces}×
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <p className="mt-4 font-mono text-[11px]" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                  Basado en {l.total} números guardados.
                </p>
              </div>
            );
          })}
        </div>

        <div className="mb-8 rounded-xl border border-[#10203A]/12 bg-white p-5">
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-bold" style={{ color: COLOR_AZUL }}>
            ¿Esto ayuda a ganar?
          </h2>
          <p className="text-sm leading-relaxed">
            No. Cada sorteo es <strong>completamente al azar</strong>, y lo que haya salido antes no cambia la
            probabilidad de lo que salga hoy. Esta página es solo informativa y curiosa, no una fórmula para
            ganar. Además, con apenas unas semanas de datos guardados, estos números todavía pueden cambiar mucho
            a medida que pasa el tiempo.
          </p>
        </div>

        <p className="text-xs text-[#5C6B78]">
          Escrito por el equipo de{" "}
          <a href="/nosotros" className="underline" style={{ color: COLOR_AZUL }}>
            La Bankera RD
          </a>
          .
        </p>
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
