import { Space_Grotesk, Manrope } from "next/font/google";
import NavPildoras from "../NavPildoras";
import { mesesDisponibles, nombreMes, slugMes } from "@/lib/informeMensual";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });

export const revalidate = 86400;

export const metadata = {
  title: "Informe del Mes: Números Más Salidos de la Lotería Dominicana",
  description: "Cada mes, los números que más salieron y los que no salieron en la Lotería Nacional, Leidsa, Loteka y Lotería Real, con datos propios de La Bankera RD.",
  alternates: { canonical: "https://labankerard.com/informe" },
};

export default function InformesPage() {
  const meses = mesesDisponibles();
  return (
    <div className={display.variable + " " + body.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">Informe del mes</h1>
          <p className="mt-2 text-base text-[#E6ECF3]">Los números que más salieron cada mes en las loterías dominicanas</p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <p className="mb-6 text-lg leading-relaxed text-[#2E3B48]">
          Al terminar cada mes contamos todos los resultados que guardamos de la Lotería Nacional, Leidsa, Loteka y Lotería
          Real, y publicamos qué números salieron más, cuáles no salieron y cuántos se repitieron.
        </p>
        <ul className="flex flex-col gap-3">
          {meses.map(function (m) {
            return (
              <li key={slugMes(m)}>
                <a href={`/informe/${slugMes(m)}`} className="flex min-h-[56px] items-center justify-between rounded-xl border border-[#10203A]/15 bg-white px-5 text-lg font-bold capitalize text-[#10203A] hover:shadow-md">
                  <span>{nombreMes(m)}</span>
                  <span className="text-[#1E4D8C]">Ver informe →</span>
                </a>
              </li>
            );
          })}
        </ul>
      </main>
      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
