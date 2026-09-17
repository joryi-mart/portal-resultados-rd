import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";
import PreguntasFrecuentes from "../PreguntasFrecuentes";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
const COLOR_VERDE_RD = "#007A33";

export const metadata = {
  title: "Historia de la Lotería Nacional Dominicana",
  description:
    "De la caridad del Padre Billini en 1882 a la Lotería Nacional de hoy: la historia completa de la lotería más antigua de República Dominicana.",
  openGraph: {
    title: "Historia de la Lotería Nacional Dominicana",
    description: "La historia de la Lotería Nacional, desde 1882 hasta hoy.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/historia-loteria-nacional" },
};

const LINEA_DE_TIEMPO = [
  { año: "1882", texto: "El sacerdote Francisco Xavier Billini funda \"La Lotería del Padre Billini\" el 24 de octubre, para recaudar fondos y ayudar a enfermos, ancianos y niños pobres. Los billetes de cuatro números se llamaban \"cuartitos\"." },
  { año: "1890", texto: "El 9 de marzo muere el Padre Billini. Ese mismo año, el 10 de septiembre, se emite la Resolución 2958, la primera regulación legal de la lotería." },
  { año: "1920", texto: "El 5 de marzo, la Orden Ejecutiva 420 reorganiza y suprime temporalmente la lotería tal como existía." },
  { año: "1927", texto: "El 26 de junio, la Ley 689 crea formalmente la Lotería Nacional como institución del Estado, sentando las bases de lo que es hoy." },
  { año: "1955", texto: "El 30 de mayo, el Decreto 890 transfiere la administración de la lotería a la Secretaría de Finanzas." },
];

const PREGUNTAS = [
  {
    pregunta: "¿En qué año se fundó la Lotería Nacional?",
    respuesta: "El 24 de octubre de 1882, fundada por el sacerdote dominicano Francisco Xavier Billini.",
  },
  {
    pregunta: "¿Por qué se creó la lotería originalmente?",
    respuesta: "Se creó con fines de caridad, para recaudar fondos destinados a ayudar a enfermos, ancianos y niños pobres.",
  },
  {
    pregunta: "¿Quién administraba la lotería al principio?",
    respuesta: "Una Junta de Caridad de 13 miembros, designados por el propio Padre Billini.",
  },
];

export default function HistoriaLoteriaNacionalPage() {
  const datosEstructurados = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Historia de la Lotería Nacional Dominicana",
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
            Historia de la Lotería Nacional Dominicana
          </h1>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            De una obra de caridad en 1882, a la lotería más antigua del país.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <a
          href="/nacional"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#E7A63C]/40 bg-[#E7A63C]/10 px-4 py-2 text-sm font-semibold text-[#10203A] hover:bg-[#E7A63C]/20"
        >
          🎱 Ve los resultados de hoy de la Lotería Nacional
        </a>

        <p className="mb-8 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          La Lotería Nacional es la más antigua de República Dominicana. Nació el <strong>24 de octubre de 1882</strong>,
          cuando el sacerdote dominicano <strong>Francisco Xavier Billini</strong> la fundó bajo el nombre de "La
          Lotería del Padre Billini" — no como negocio, sino como una forma de recaudar dinero para ayudar a
          enfermos, ancianos y niños pobres de la época. Los billetes originales tenían cuatro números y se conocían
          como "cuartitos".
        </p>

        <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A]">
          Línea de tiempo
        </h2>
        <div className="mb-8 flex flex-col gap-4">
          {LINEA_DE_TIEMPO.map(function (item) {
            return (
              <div key={item.año} className="flex gap-4 rounded-xl border border-[#10203A]/15 bg-white p-5">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold text-white"
                  style={{ backgroundColor: COLOR_VERDE_RD }}
                >
                  {item.año}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{item.texto}</p>
              </div>
            );
          })}
        </div>

        <p className="mb-8 text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Más de 140 años después de su fundación, la Lotería Nacional se transmite en vivo por televisión y sigue
          siendo una de las loterías más jugadas del país, con sorteos de tarde (Gana Más y Juega + Pega +) y de
          noche (Quiniela Nacional).
        </p>

        <p className="mb-8 text-xs italic" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Fuente: sitio oficial de la Lotería Nacional Dominicana (loterianacional.gob.do).
        </p>

        <PreguntasFrecuentes preguntas={PREGUNTAS} />
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
