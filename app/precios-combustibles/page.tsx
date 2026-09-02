import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
const COLOR_VERDE_RD = "#007A33";

export const metadata = {
  title: "Precio del Combustible Hoy en República Dominicana",
  description: "Precios semanales de gasolina, gasoil y GLP en República Dominicana, según el Ministerio de Industria, Comercio y Mipymes (MICM).",
  openGraph: {
    title: "Precio del Combustible Hoy en República Dominicana",
    description: "Precios semanales de gasolina, gasoil y GLP según el MICM.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/precios-combustibles" },
};

// El Ministerio de Industria, Comercio y Mipymes (MICM) publica un aviso
// nuevo cada viernes. Estos son los precios de la semana vigente al
// actualizar esta pagina — revisar micm.gob.do para la semana mas reciente.
const SEMANA_VIGENTE = "29 de agosto al 4 de septiembre de 2026";
const PRECIOS = [
  { nombre: "Gasolina Premium", precio: "341.10" },
  { nombre: "Gasolina Regular", precio: "310.50" },
  { nombre: "Gasoil Óptimo", precio: "293.10" },
  { nombre: "Gasoil Regular", precio: "262.80" },
  { nombre: "GLP (Gas Licuado de Petróleo)", precio: "135.20" },
];

export default function PreciosCombustiblesPage() {
  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Precio del Combustible en RD
          </h1>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            Semana del {SEMANA_VIGENTE} · precio por galón, en pesos dominicanos (RD$)
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
        <div className="rounded-xl border border-[#10203A]/15 bg-white">
          {PRECIOS.map(function (p, i) {
            return (
              <div key={i} className="flex items-center justify-between gap-3 border-t border-[#10203A]/8 px-5 py-4 first:border-t-0">
                <p className="font-semibold text-[#10203A]">{p.nombre}</p>
                <p className="font-mono text-lg font-bold" style={{ color: COLOR_VERDE_RD }}>RD${p.precio}</p>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          El <strong>Ministerio de Industria, Comercio y Mipymes (MICM)</strong> publica un aviso nuevo cada
          viernes con los precios que rigen la semana siguiente. Los precios pueden incluir subsidios del
          gobierno para amortiguar el costo internacional del petróleo.
        </p>

        <a
          href="https://micm.gob.do/direcciones/combustibles/avisos-semanales-de-precios/avisos-semanales-de-precios-de-combustibles/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block font-mono text-sm text-[#1E4D8C] hover:underline"
        >
          Ver el aviso oficial más reciente en micm.gob.do →
        </a>
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
