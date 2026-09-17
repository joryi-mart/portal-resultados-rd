import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";
import PreguntasFrecuentes from "../PreguntasFrecuentes";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
const COLOR_AZUL = "#1E4D8C";

export const metadata = {
  title: "¿Cómo Jugar Quiniela, Palé y Tripleta? Guía Completa",
  description:
    "Aprende qué es la quiniela, el palé y la tripleta en las loterías dominicanas: cómo se juega cada una, qué números escoger y cómo se relacionan con los resultados de hoy.",
  openGraph: {
    title: "¿Cómo Jugar Quiniela, Palé y Tripleta? Guía Completa",
    description: "Qué es la quiniela, el palé y la tripleta, y cómo se relacionan con los resultados de la lotería dominicana.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/como-jugar-loteria" },
};

const PREGUNTAS = [
  {
    pregunta: "¿Qué significa cuando salen tres números, por ejemplo 05-23-47?",
    respuesta:
      "El 05 es el número del primer premio, el 23 del segundo premio, y el 47 del tercer premio. Cada posición se juega y se paga distinto.",
  },
  {
    pregunta: "¿Puedo jugar más de un tipo (quiniela, palé y tripleta) con los mismos números?",
    respuesta:
      "Sí, son formas distintas de apostar sobre el mismo sorteo. Puedes jugar solo quiniela, solo palé, solo tripleta, o combinaciones, según lo que ofrezca cada banca o lotería.",
  },
  {
    pregunta: "¿La tripleta importa el orden de los números?",
    respuesta:
      "En la tripleta tradicional no importa el orden — ganas si tus tres números coinciden con los tres que salieron, sin importar en qué posición. Algunos juegos específicos, como la Tripleta Exacta de Pega 3 Más (Leidsa), sí requieren el orden exacto.",
  },
];

export default function ComoJugarLoteriaPage() {
  const datosEstructurados = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "¿Cómo jugar quiniela, palé y tripleta en la lotería dominicana?",
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
            ¿Cómo jugar quiniela, palé y tripleta?
          </h1>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            Guía sencilla de las tres formas más comunes de jugar en las loterías dominicanas.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <a
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#E7A63C]/40 bg-[#E7A63C]/10 px-4 py-2 text-sm font-semibold text-[#10203A] hover:bg-[#E7A63C]/20"
        >
          🎱 ¿Ya viste los resultados de la lotería de hoy? Consulta Nacional, Leidsa, Real y más.
        </a>

        <p className="mb-6 text-base leading-relaxed">
          En la mayoría de las loterías dominicanas (Lotería Nacional, Real, Loteka, La Primera, y la Quiniela Palé
          de Leidsa) cada sorteo saca <strong>tres números de dos cifras</strong>, del 00 al 99, que corresponden al
          primer, segundo y tercer premio. Por ejemplo, si el resultado del día es <strong>05-23-47</strong>, el 05
          es el primer premio, el 23 el segundo, y el 47 el tercero. A partir de esos tres números, hay varias formas
          de jugar:
        </p>

        <div className="mb-6 rounded-xl border border-[#10203A]/15 bg-white p-5">
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold" style={{ color: COLOR_AZUL }}>
            Quiniela
          </h2>
          <p className="text-sm leading-relaxed">
            Es la forma más simple: apuestas a <strong>un solo número</strong> de dos dígitos (del 00 al 99). Ganas
            si ese número coincide con cualquiera de los tres premios del sorteo (primero, segundo o tercero) —
            aunque el pago cambia según en cuál posición caiga.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-[#10203A]/15 bg-white p-5">
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold" style={{ color: COLOR_AZUL }}>
            Palé
          </h2>
          <p className="text-sm leading-relaxed">
            Apuestas a una <strong>combinación de dos números</strong>. Ganas si esos dos números coinciden con dos
            de los tres premios del sorteo, sin importar el orden en que salieron.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-[#10203A]/15 bg-white p-5">
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold" style={{ color: COLOR_AZUL }}>
            Tripleta
          </h2>
          <p className="text-sm leading-relaxed">
            Apuestas a una <strong>combinación de tres números</strong>. Ganas solo si los tres coinciden con los
            tres premios del sorteo (sin importar el orden, en la tripleta tradicional). Hay 161,700 combinaciones
            posibles entre el 00 y el 99, por eso es la más difícil de acertar de las tres — y la que paga más.
          </p>
        </div>

        <p className="mb-8 text-sm leading-relaxed">
          Cada lotería y cada banca puede tener sus propias reglas de pago, así que lo importante de esta guía es
          entender la <strong>mecánica</strong> — cuántos números escoges y cómo se gana — no cuánto se paga, ya que
          eso varía. Algunos juegos, como el <strong>Pega 3 Más</strong> de Leidsa, tienen además una variante
          llamada "Tripleta Exacta", donde sí hay que acertar el orden exacto en que salieron los números.
        </p>

        <PreguntasFrecuentes preguntas={PREGUNTAS} />
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
