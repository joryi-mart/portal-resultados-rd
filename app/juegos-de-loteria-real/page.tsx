import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";
import PreguntasFrecuentes from "../PreguntasFrecuentes";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
const COLOR_AZUL = "#1E4D8C";

export const metadata = {
  title: "¿Cómo Funcionan los Juegos de Lotería Real? Guía Completa",
  description:
    "Qué es Lotería Real y cómo se juega cada uno de sus productos: Quiniela Real, Tu Fecha, Loto Pool Real, Nueva Yol Real, Loto Real, Chance Real y Súper Palé Real.",
  openGraph: {
    title: "¿Cómo Funcionan los Juegos de Lotería Real?",
    description: "Guía de los productos de Lotería Real: Quiniela, Tu Fecha, Loto Pool, Nueva Yol, Loto Real, Chance Real y Súper Palé Real.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/juegos-de-loteria-real" },
};

const JUEGOS = [
  {
    nombre: "Quiniela Real",
    texto: "El sorteo tradicional de tres números (00-99), a las 12:55 p.m. Es la base para jugar quiniela, palé o tripleta, como se explica en nuestra guía de cómo jugar.",
  },
  {
    nombre: "Tu Fecha",
    texto: "Un solo número ganador, elegido entre 00 y 31 (por eso el nombre: coincide con los días del mes). Es de los sorteos más fáciles de acertar de toda la oferta de Lotería Real, aunque paga menos que los demás.",
  },
  {
    nombre: "Loto Pool Real",
    texto: "Se escogen 4 números del 00 al 99. Se gana premio si aciertas los 4, 3, 2 o 1 de los números sorteados, sin importar el orden. Tiene una versión de tarde (12:55 p.m.) y otra de noche, Loto Pool Noche (8:00 p.m.).",
  },
  {
    nombre: "Nueva Yol Real",
    texto: "A pesar del nombre, no tiene relación con los resultados de la lotería de Nueva York — es un sorteo propio de Lotería Real. Se juegan tres números (00-99) más el color de una \"manzana\" (roja, amarilla o verde), y el premio mayor es acertar los tres números junto con el color correcto.",
  },
  {
    nombre: "Repartidera Real",
    texto: "Sorteo de las 1:00 p.m. ligado a las jugadas del día. Los detalles exactos de su mecánica varían según la fuente, así que si tienes dudas sobre cómo se paga, lo mejor es confirmar directamente en tu banca de lotería de confianza.",
  },
  {
    nombre: "Loto Real",
    texto: "Se escogen 6 números del 1 al 38, solo los martes y viernes. El premio mayor es acumulativo: si nadie acierta los 6 números, el bote sigue creciendo para el próximo sorteo.",
  },
  {
    nombre: "Chance Real",
    texto: "Se escogen 5 números del 00 al 99, en el sorteo de las 8:00 p.m. Es uno de los sorteos con premios mayores más altos de Lotería Real, y se transmite en vivo por televisión.",
  },
  {
    nombre: "Súper Palé Real",
    texto: "No es un sorteo con bolas propias — combina resultados que ya salieron antes: el primer premio de la Quiniela Real de las 12:55 p.m. con el primer premio de Gana Más de la Lotería Nacional (2:30 p.m.). Ganas si aciertas ambos números, en cualquier orden. Funciona igual que el Súper Palé de Leidsa.",
  },
];

const PREGUNTAS = [
  {
    pregunta: "¿Quién opera Lotería Real?",
    respuesta:
      "Lotería Real es una de las loterías de capital privado de República Dominicana, con oficina principal en Santiago de los Caballeros, en funcionamiento desde 2009.",
  },
  {
    pregunta: "¿\"Nueva Yol Real\" usa los resultados de la lotería de Nueva York?",
    respuesta:
      "No. Aunque el nombre lo sugiere, es un sorteo propio de Lotería Real, con sus propios números y el color de una \"manzana\" como parte del premio — no tiene ninguna relación con los resultados de Nueva York.",
  },
  {
    pregunta: "¿Cuál es la diferencia entre el Súper Palé Real y la Quiniela Real?",
    respuesta:
      "La Quiniela Real es un sorteo propio de Lotería Real. El Súper Palé Real no tiene sorteo propio — combina el resultado de esa misma Quiniela Real con el primer premio de Gana Más de la Lotería Nacional, ambos ya salidos antes de que se anuncie a las 8:00 p.m.",
  },
  {
    pregunta: "¿A qué hora salen los sorteos de Lotería Real?",
    respuesta:
      "La mayoría de sus productos de tarde salen alrededor de las 12:55 p.m. o 1:00 p.m., y los de noche a las 8:00 p.m. Consulta el horario exacto de cada uno en la página de Lotería Real de La Bankera RD.",
  },
];

export default function JuegosDeLoteriaRealPage() {
  const datosEstructurados = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "¿Cómo funcionan los juegos de Lotería Real?",
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
            ¿Cómo funcionan los juegos de Lotería Real?
          </h1>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            Quiniela Real, Tu Fecha, Loto Pool, Nueva Yol Real, Loto Real, Chance Real y Súper Palé Real, explicados uno por uno.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <a
          href="/real"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#E7A63C]/40 bg-[#E7A63C]/10 px-4 py-2 text-sm font-semibold text-[#10203A] hover:bg-[#E7A63C]/20"
        >
          🎱 Ve los resultados de hoy de Lotería Real
        </a>

        <p className="mb-8 text-base leading-relaxed">
          <strong>Lotería Real</strong> es una de las loterías de capital privado de República Dominicana, con oficina
          principal en Santiago de los Caballeros, en funcionamiento desde 2009. Ofrece varios productos distintos
          a lo largo del día, cada uno con su propia forma de jugar:
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
          , ya que la Quiniela Real parte de esa misma base.
        </p>

        <PreguntasFrecuentes preguntas={PREGUNTAS} />
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
