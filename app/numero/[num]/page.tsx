import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Bolita } from "@/app/componentesResultados";
import { CHARADA } from "@/app/numeros-por-suenos/page";
import NavPildoras from "@/app/NavPildoras";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

export const revalidate = 21600; // 6 horas: no hace falta recalcular en cada visita

const LOTERIAS_DESTACADAS: { slug: string; nombre: string }[] = [
  { slug: "nacional", nombre: "Lotería Nacional" },
  { slug: "real", nombre: "Lotería Real" },
  { slug: "leidsa", nombre: "Leidsa" },
  { slug: "loteka", nombre: "Loteka" },
];

type FilaResultado = { numeros: string; fecha: string; sorteos: { nombre: string } };
type DatoLoteria = { slug: string; nombre: string; veces: number; ultima: { fecha: string; sorteo: string } | null };

export function generateStaticParams() {
  return Array.from({ length: 100 }, function (_, i) { return { num: String(i).padStart(2, "0") }; });
}

function numeroValido(num: string) {
  return /^\d{2}$/.test(num);
}

async function buscarNumero(numero: string): Promise<DatoLoteria[]> {
  return Promise.all(
    LOTERIAS_DESTACADAS.map(async function (l) {
      const { data, error } = await supabase
        .from("resultados")
        .select("numeros, fecha, sorteos!inner(nombre, loterias!inner(slug))")
        .eq("sorteos.loterias.slug", l.slug)
        .limit(5000);
      if (error || !data) return { ...l, veces: 0, ultima: null };

      const filas = data as unknown as FilaResultado[];
      let veces = 0;
      let ultima: { fecha: string; sorteo: string } | null = null;
      filas.forEach(function (fila) {
        const nums = fila.numeros.split("-").map(function (n) { return n.trim().padStart(2, "0"); });
        if (!nums.includes(numero)) return;
        veces++;
        if (!ultima || fila.fecha > ultima.fecha) {
          ultima = { fecha: fila.fecha, sorteo: fila.sorteos.nombre };
        }
      });
      return { ...l, veces, ultima };
    })
  );
}

function formatearFecha(fechaISO: string) {
  return new Date(fechaISO + "T12:00:00Z").toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function numeroVecino(num: string, delta: number) {
  const n = (parseInt(num, 10) + delta + 100) % 100;
  return String(n).padStart(2, "0");
}

export async function generateMetadata(props: { params: Promise<{ num: string }> }) {
  const params = await props.params;
  if (!numeroValido(params.num)) return { title: "Número no válido" };

  const title = `El Número ${params.num} en las Loterías Dominicanas`;
  const description = `Cuándo salió el número ${params.num} por última vez en Lotería Nacional, Real, Leidsa y Loteka, y cuántas veces ha salido, según nuestros resultados guardados.`;
  return {
    title,
    description,
    alternates: { canonical: `https://labankerard.com/numero/${params.num}` },
    openGraph: { title, description, locale: "es_DO", type: "website" },
  };
}

export default async function NumeroPage(props: { params: Promise<{ num: string }> }) {
  const params = await props.params;
  if (!numeroValido(params.num)) notFound();

  const datos = await buscarNumero(params.num);
  const totalVeces = datos.reduce(function (acc, d) { return acc + d.veces; }, 0);
  const sueno = CHARADA.find(function (c) { return String(c.numero).padStart(2, "0") === params.num; });
  const anterior = numeroVecino(params.num, -1);
  const siguiente = numeroVecino(params.num, 1);

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex items-center gap-3">
            <Bolita tamano="h-16 w-16 text-2xl" primera>{params.num}</Bolita>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
                El Número {params.num}
              </h1>
              <p className="mt-1 font-mono text-sm font-extrabold uppercase tracking-wide text-[#E7A63C] sm:text-base">
                Página informativa no oficial de lotería
              </p>
            </div>
          </div>
          {totalVeces > 0 ? (
            <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
              Ha salido {totalVeces} {totalVeces === 1 ? "vez" : "veces"} en total, entre Nacional, Real, Leidsa y Loteka
            </p>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <div className="mb-6 flex items-center justify-between">
          <a
            href={"/numero/" + anterior}
            className="rounded-full border border-[#10203A]/20 px-4 py-1.5 font-mono text-xs font-semibold text-[#10203A] hover:bg-[#10203A]/5"
          >
            ← Número {anterior}
          </a>
          <a href="/numero" className="font-mono text-xs font-bold underline" style={{ color: COLOR_AZUL }}>
            Ver todos los números
          </a>
          <a
            href={"/numero/" + siguiente}
            className="rounded-full border border-[#10203A]/20 px-4 py-1.5 font-mono text-xs font-semibold text-[#10203A] hover:bg-[#10203A]/5"
          >
            Número {siguiente} →
          </a>
        </div>

        <p className="mb-8 text-base leading-relaxed">
          Cada vez que una lotería publica un resultado, lo guardamos. Aquí puedes ver cuándo salió el número{" "}
          <strong>{params.num}</strong> por última vez en cada una de las loterías más jugadas de República
          Dominicana, y cuántas veces lo hemos visto en lo que llevamos guardando resultados.
        </p>

        <div className="mb-8 flex flex-col gap-4">
          {datos.map(function (d) {
            return (
              <div key={d.slug} className="rounded-xl border border-[#10203A]/15 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-bold" style={{ color: COLOR_AZUL }}>
                    {d.nombre}
                  </h2>
                  <a href={"/" + d.slug} className="text-xs font-bold underline" style={{ color: COLOR_AZUL }}>
                    Ver resultados de hoy →
                  </a>
                </div>
                {d.ultima ? (
                  <>
                    <p className="text-sm leading-relaxed">
                      Salió por última vez el{" "}
                      <a href={"/" + d.slug + "/" + d.ultima.fecha} className="font-bold underline" style={{ color: COLOR_AZUL }}>
                        {formatearFecha(d.ultima.fecha)}
                      </a>
                      , en {d.ultima.sorteo}.
                    </p>
                    <p className="mt-2 font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                      Ha salido {d.veces} {d.veces === 1 ? "vez" : "veces"} en {d.nombre} desde que guardamos resultados.
                    </p>
                  </>
                ) : (
                  <p className="text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                    Todavía no hemos visto este número salir en {d.nombre}.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {sueno ? (
          <div className="mb-8 rounded-xl border border-[#10203A]/12 bg-white p-5">
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-bold" style={{ color: COLOR_AZUL }}>
              ¿Con qué se relaciona el {params.num} en la charada?
            </h2>
            <p className="text-sm leading-relaxed">
              Según la <a href="/numeros-por-suenos" className="underline" style={{ color: COLOR_AZUL }}>charada china</a>,
              el número {params.num} corresponde a soñar con <strong>{sueno.significa}</strong>.
            </p>
          </div>
        ) : null}

        <div className="mb-8 rounded-xl border border-[#10203A]/12 bg-white p-5">
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-bold" style={{ color: COLOR_AZUL }}>
            ¿Esto ayuda a saber qué va a salir?
          </h2>
          <p className="text-sm leading-relaxed">
            No. Cada sorteo es <strong>completamente al azar</strong>, y que un número haya salido antes (o lleve
            tiempo sin salir) no cambia la probabilidad de que salga hoy. Esta página es solo informativa y
            curiosa, no una fórmula para ganar.
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
