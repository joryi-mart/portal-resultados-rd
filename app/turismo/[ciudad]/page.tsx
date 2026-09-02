import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import NavPildoras from "../../NavPildoras";
import { CIUDADES } from "../datos";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
const COLOR_VERDE_RD = "#007A33";

export function generateStaticParams() {
  return CIUDADES.map(function (c) { return { ciudad: c.slug }; });
}

export async function generateMetadata(props: { params: Promise<{ ciudad: string }> }) {
  const params = await props.params;
  const ciudad = CIUDADES.find(function (c) { return c.slug === params.ciudad; });
  if (!ciudad) return { title: "Destino no encontrado | La Bankera RD" };

  const titulo = `Qué hacer en ${ciudad.nombre}, República Dominicana | La Bankera RD`;
  return {
    title: titulo,
    description: ciudad.resumen,
    openGraph: { title: titulo, description: ciudad.resumen, locale: "es_DO", type: "website" },
    alternates: { canonical: `https://labankerard.com/turismo/${params.ciudad}` },
  };
}

export default async function CiudadTurismoPage(props: { params: Promise<{ ciudad: string }> }) {
  const params = await props.params;
  const ciudad = CIUDADES.find(function (c) { return c.slug === params.ciudad; });
  if (!ciudad) notFound();

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <a href="/turismo" className="font-mono text-sm text-[#E7A63C] hover:underline">← Ver todos los destinos</a>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            {ciudad.nombre}
          </h1>
          <p className="mt-2 text-sm text-[#D5DEEA]">{ciudad.resumen}</p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
        <p className="mb-8 text-base leading-relaxed">{ciudad.descripcion}</p>

        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">
          Qué ver y hacer
        </h2>
        <div className="rounded-xl border border-[#10203A]/15 bg-white">
          {ciudad.atracciones.map(function (a, i) {
            return (
              <div key={i} className="flex items-start gap-3 border-t border-[#10203A]/8 px-5 py-4 first:border-t-0">
                <span className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 font-mono text-xs font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed">{a}</p>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/turismo" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Ver todos los destinos</a>
        <span className="mx-2 text-[#10203A]/20">·</span>
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">Ver todas las loterías</a>
      </footer>
    </div>
  );
}
