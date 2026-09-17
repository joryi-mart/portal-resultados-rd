import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";
import PreguntasFrecuentes from "../PreguntasFrecuentes";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
const COLOR_AZUL = "#1E4D8C";

export const metadata = {
  title: "¿Cómo Funcionan los Juegos de Leidsa? Loto Más, Súper Palé y Más",
  description:
    "Qué es Leidsa y cómo se juega cada uno de sus productos: Loto Más, Quiniela Palé, Súper Palé, Pega 3 Más, Loto Pool y Super Kino TV.",
  openGraph: {
    title: "¿Cómo Funcionan los Juegos de Leidsa?",
    description: "Guía de los productos de Leidsa: Loto Más, Súper Palé, Pega 3 Más, Loto Pool y Super Kino TV.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/juegos-de-leidsa" },
};

const JUEGOS = [
  {
    nombre: "Loto Más",
    texto: "Se escogen 6 números del 1 al 40, más un \"Número Más\" adicional (una bola extra) que hace crecer el premio acumulado cuando nadie lo acierta.",
  },
  {
    nombre: "Quiniela Palé",
    texto: "El sorteo tradicional de tres números (00-99) que da pie a jugar Quiniela, Palé o Tripleta, como se explica en nuestra guía de cómo jugar. Se sortea de lunes a sábado a las 8:55pm, y los domingos a las 3:55pm.",
  },
  {
    nombre: "Súper Palé",
    texto: "No es un sorteo con bolas propias — combina los resultados de dos loterías el mismo día: ganas si el primer premio de la Quiniela Palé de Leidsa coincide con el primer premio de la Lotería Nacional tradicional.",
  },
  {
    nombre: "Pega 3 Más",
    texto: "Sorteo con 51 bolas, donde se puede jugar Quiniela (un número), Tripleta (tres números, sin importar el orden), o Tripleta Exacta (tres números, en el orden exacto en que salieron).",
  },
  {
    nombre: "Loto Pool",
    texto: "Se escogen 5 números de un total de 31 bolas. Se puede ganar acertando 3, 4 o los 5 números.",
  },
  {
    nombre: "Super Kino TV",
    texto: "Se escogen 10 números del 1 al 80. En el sorteo se extraen 20 bolas de las 80, y el premio depende de cuántos de tus 10 números coincidan con las 20 extraídas.",
  },
];

const PREGUNTAS = [
  {
    pregunta: "¿Qué es Leidsa?",
    respuesta:
      "LEIDSA (Lotería Electrónica Internacional Dominicana, S.A.) es una empresa privada que introdujo el concepto de lotería electrónica en República Dominicana, con terminales conectadas en tiempo real, en vez del sistema de lotería tradicional en papel. Inició operaciones el 1 de noviembre de 1997.",
  },
  {
    pregunta: "¿Cuál es la diferencia entre el Súper Palé y la Quiniela Palé?",
    respuesta:
      "La Quiniela Palé es un sorteo propio de Leidsa. El Súper Palé no tiene sorteo propio — combina el resultado de la Quiniela Palé de Leidsa con el de la Lotería Nacional del mismo día.",
  },
  {
    pregunta: "¿Todos los juegos de Leidsa salen a la misma hora?",
    respuesta:
      "No necesariamente — consulta el horario de cada sorteo en la página de Leidsa de La Bankera RD, ya que algunos comparten horario y otros no.",
  },
];

export default function JuegosDeLeidsaPage() {
  const datosEstructurados = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "¿Cómo funcionan los juegos de Leidsa?",
    description: metadata.description,
    inLanguage: "es-DO",
    publisher: { "@type": "Organization", name: "La Bankera RD" },
  };

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }} />
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            ¿Cómo funcionan los juegos de Leidsa?
          </h1>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            Loto Más, Súper Palé, Pega 3 Más, Loto Pool y Super Kino TV, explicados uno por uno.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <a
          href="/leidsa"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#E7A63C]/40 bg-[#E7A63C]/10 px-4 py-2 text-sm font-semibold text-[#10203A] hover:bg-[#E7A63C]/20"
        >
          🎱 Ve los resultados de hoy de Leidsa
        </a>

        <p className="mb-8 text-base leading-relaxed">
          <strong>Leidsa</strong> (Lotería Electrónica Internacional Dominicana, S.A.) es una empresa privada que
          empezó a operar el 1 de noviembre de 1997, y fue la primera en traer a República Dominicana el concepto de{" "}
          <strong>lotería electrónica</strong>: terminales conectadas en tiempo real a un sistema central, en vez
          del sistema tradicional de lotería en papel. Hoy ofrece varios productos distintos, cada uno con su propia
          forma de jugar:
        </p>

        <div className="mb-8 flex flex-col gap-4">
          {JUEGOS.map(function (j) {
            return (
              <div key={j.nombre} className="rounded-xl border border-[#10203A]/15 bg-white p-5">
                <h2 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold" style={{ color: COLOR_AZUL }}>
                  {j.nombre}
                </h2>
                <p className="text-sm leading-relaxed">{j.texto}</p>
              </div>
            );
          })}
        </div>

        <p className="mb-8 text-sm leading-relaxed">
          Si no conoces la mecánica básica de quiniela, palé y tripleta, te recomendamos primero leer nuestra{" "}
          <a href="/como-jugar-loteria" className="underline" style={{ color: COLOR_AZUL }}>
            guía de cómo jugar
          </a>
          , ya que varios de estos juegos de Leidsa parten de esa misma base.
        </p>

        <PreguntasFrecuentes preguntas={PREGUNTAS} />
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
