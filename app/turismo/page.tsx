import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";
import { CIUDADES } from "./datos";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

export const metadata = {
  title: "Turismo en República Dominicana: Guías por Ciudad",
  description: "Guías de qué ver y hacer en los destinos turísticos más visitados de República Dominicana: Punta Cana, Santo Domingo y Puerto Plata.",
  openGraph: {
    title: "Turismo en República Dominicana: Guías por Ciudad",
    description: "Qué ver y hacer en Punta Cana, Santo Domingo y Puerto Plata.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/turismo" },
};

export default function TurismoPage() {
  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Turismo en República Dominicana
          </h1>
          <p className="mt-2 text-sm text-[#D5DEEA]">
            Guías de qué ver y hacer, dónde alojarte y ecoturismo en los destinos más visitados del país
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CIUDADES.map(function (c) {
            return (
              <a
                key={c.slug}
                href={"/turismo/" + c.slug}
                className="group block overflow-hidden rounded-xl border border-[#10203A]/15 bg-white transition hover:border-[#007A33]/40 hover:shadow-lg"
              >
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={c.foto.url}
                    alt={c.nombre}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">
                    {c.nombre}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                    {c.resumen}
                  </p>
                  <span className="mt-2 inline-block font-mono text-sm text-[#1E4D8C]">Ver guía →</span>
                </div>
              </a>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
