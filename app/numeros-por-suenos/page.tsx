import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

export const metadata = {
  title: "Números de la Suerte Según tus Sueños (Charada China)",
  description:
    "Diccionario de sueños y números de lotería: qué número jugar según lo que soñaste, basado en la tradicional charada china usada en República Dominicana, Cuba y Puerto Rico.",
  alternates: { canonical: "https://labankerard.com/numeros-por-suenos" },
};

// Los 36 numeros originales de la "charada china", el sistema tradicional de
// sueños y numeros que llego al Caribe con trabajadores chinos a partir de 1847
// y que se sigue usando hoy en Cuba, Puerto Rico y Republica Dominicana.
const CHARADA: { numero: number; significa: string }[] = [
  { numero: 1, significa: "Caballo" },
  { numero: 2, significa: "Mariposa" },
  { numero: 3, significa: "Marinero" },
  { numero: 4, significa: "Gato" },
  { numero: 5, significa: "Monja" },
  { numero: 6, significa: "Jicotea (tortuga de agua)" },
  { numero: 7, significa: "Caracol" },
  { numero: 8, significa: "Muerto" },
  { numero: 9, significa: "Elefante" },
  { numero: 10, significa: "Pescado grande" },
  { numero: 11, significa: "Gallo" },
  { numero: 12, significa: "Ramera" },
  { numero: 13, significa: "Pavo real" },
  { numero: 14, significa: "Gato de tigre" },
  { numero: 15, significa: "Perro" },
  { numero: 16, significa: "Toro" },
  { numero: 17, significa: "Luna" },
  { numero: 18, significa: "Pescado chico" },
  { numero: 19, significa: "Lombriz" },
  { numero: 20, significa: "Gato fino" },
  { numero: 21, significa: "Majá (culebra)" },
  { numero: 22, significa: "Sapo" },
  { numero: 23, significa: "Vapor (barco)" },
  { numero: 24, significa: "Paloma" },
  { numero: 25, significa: "Piedra fina" },
  { numero: 26, significa: "Anguila" },
  { numero: 27, significa: "Avispa" },
  { numero: 28, significa: "Chivo" },
  { numero: 29, significa: "Ratón" },
  { numero: 30, significa: "Camarón" },
  { numero: 31, significa: "Venado" },
  { numero: 32, significa: "Cochino" },
  { numero: 33, significa: "Tiñosa (aura, ave de rapiña)" },
  { numero: 34, significa: "Mono" },
  { numero: 35, significa: "Araña" },
  { numero: 36, significa: "Cachimba (pipa de fumar)" },
];

function numeroDosDigitos(n: number) {
  return n.toString().padStart(2, "0");
}

export default function NumerosPorSuenosPage() {
  const datosEstructurados = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: CHARADA.map(function (c) {
      return {
        "@type": "Question",
        name: `¿Qué número es soñar con ${c.significa.toLowerCase()}?`,
        acceptedAnswer: { "@type": "Answer", text: `Según la charada china, soñar con ${c.significa.toLowerCase()} corresponde al número ${numeroDosDigitos(c.numero)}.` },
      };
    }),
  };

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }} />
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Números de la Suerte Según tus Sueños
          </h1>
          <p className="mt-2 font-mono text-sm font-extrabold uppercase tracking-wide text-[#E7A63C] sm:text-base">
            Página informativa no oficial de lotería
          </p>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            Basado en la charada china, tradición popular del Caribe
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <p className="mb-8 text-base leading-relaxed">
          En República Dominicana, Cuba y Puerto Rico es muy común relacionar lo que soñaste con un número para
          jugar a la lotería. Esta costumbre viene de la <strong>charada china</strong>, un sistema de números y
          significados que llegó al Caribe con los trabajadores chinos que emigraron a partir de 1847, y que se
          sigue usando hoy en día. Aquí tienes los 36 números originales y qué representa cada uno.
        </p>

        <div className="mb-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CHARADA.map(function (c) {
            return (
              <div
                key={c.numero}
                className="flex items-center gap-3 rounded-xl border border-[#10203A]/12 bg-white px-4 py-3"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-[family-name:var(--font-display)] text-base font-extrabold"
                  style={{ borderColor: "#E7A63C", color: COLOR_AZUL }}
                >
                  {numeroDosDigitos(c.numero)}
                </div>
                <p className="text-sm leading-snug">
                  Soñar con <strong>{c.significa}</strong>
                </p>
              </div>
            );
          })}
        </div>

        <div className="mb-8 rounded-xl border border-[#10203A]/12 bg-white p-5">
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-bold" style={{ color: COLOR_AZUL }}>
            ¿Es un sistema oficial?
          </h2>
          <p className="text-sm leading-relaxed">
            No. La charada china es una <strong>tradición popular</strong>, no un método probado ni algo reconocido
            por ninguna lotería. Ninguna lotería dominicana usa estos significados para elegir sus números
            ganadores — los sorteos son completamente al azar. Esta página es solo informativa y cultural, no una
            garantía de ningún tipo.
          </p>
        </div>

        <p className="mb-8 text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Para ver los resultados reales de hoy, visita nuestra{" "}
          <a href="/" className="underline" style={{ color: COLOR_AZUL }}>
            página principal
          </a>
          , o aprende{" "}
          <a href="/como-jugar-loteria" className="underline" style={{ color: COLOR_AZUL }}>
            cómo jugar quiniela, palé y tripleta
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
