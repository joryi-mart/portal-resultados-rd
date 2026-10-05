import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { Bolita } from "@/app/componentesResultados";
import NavPildoras from "@/app/NavPildoras";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";

export const metadata = {
  title: "Busca Cualquier Número de Lotería (00 al 99)",
  description:
    "Consulta cuándo salió por última vez cualquier número del 00 al 99 en Lotería Nacional, Real, Leidsa y Loteka, y cuántas veces ha salido.",
  alternates: { canonical: "https://labankerard.com/numero" },
};

const NUMEROS = Array.from({ length: 100 }, function (_, i) { return String(i).padStart(2, "0"); });

export default function NumeroIndicePage() {
  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Busca Cualquier Número
          </h1>
          <p className="mt-2 font-mono text-sm font-extrabold uppercase tracking-wide text-[#E7A63C] sm:text-base">
            Página informativa no oficial de lotería
          </p>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            Toca un número para ver cuándo salió por última vez y cuántas veces ha salido
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <p className="mb-8 text-base leading-relaxed">
          Elige cualquier número del 00 al 99 para ver su historial en Lotería Nacional, Real, Leidsa y Loteka:
          cuándo fue la última vez que salió y cuántas veces lo hemos visto desde que guardamos resultados.
        </p>

        <div className="mb-8 grid grid-cols-5 gap-2 sm:grid-cols-10">
          {NUMEROS.map(function (n) {
            return (
              <a key={n} href={"/numero/" + n} className="flex flex-col items-center gap-1 rounded-lg p-1.5 hover:bg-white">
                <Bolita tamano="h-10 w-10 text-sm">{n}</Bolita>
              </a>
            );
          })}
        </div>

        <p className="mb-8 text-sm leading-relaxed" style={{ color: "#5C6B78" }}>
          También puedes ver los{" "}
          <a href="/numeros-mas-salidos" className="underline" style={{ color: COLOR_AZUL }}>
            números más salidos por lotería
          </a>{" "}
          o los{" "}
          <a href="/numeros-por-suenos" className="underline" style={{ color: COLOR_AZUL }}>
            números según tus sueños
          </a>
          .
        </p>

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
