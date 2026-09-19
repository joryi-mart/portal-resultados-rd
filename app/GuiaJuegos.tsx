import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "./NavPildoras";
import PreguntasFrecuentes from "./PreguntasFrecuentes";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";

const GUIAS = [
  { href: "/como-jugar-loteria", titulo: "Cómo jugar quiniela, palé y tripleta" },
  { href: "/que-es-el-super-pale", titulo: "Qué es el Súper Palé" },
  { href: "/historia-loteria-nacional", titulo: "Historia de la Lotería Nacional" },
  { href: "/juegos-de-leidsa", titulo: "Cómo funcionan los juegos de Leidsa" },
  { href: "/juegos-de-loteria-real", titulo: "Cómo funcionan los juegos de Lotería Real" },
  { href: "/juegos-de-loteka", titulo: "Cómo funcionan los juegos de Loteka" },
  { href: "/juegos-de-la-primera", titulo: "Cómo funcionan los juegos de La Primera" },
  { href: "/juegos-de-lotedom", titulo: "Cómo funcionan los juegos de LoteDom" },
  { href: "/juegos-de-la-suerte-dominicana", titulo: "Cómo funcionan los juegos de La Suerte Dominicana" },
];

export type JuegoGuia = { nombre: string; texto: string };
export type PreguntaGuia = { pregunta: string; respuesta: string };

export default function GuiaJuegos(props: {
  hrefActual: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  botones: { href: string; texto: string }[];
  introduccion: string;
  encabezadoJuegos?: string;
  juegos: JuegoGuia[];
  preguntas: PreguntaGuia[];
}) {
  const datosEstructurados = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: props.titulo,
    description: props.descripcion,
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
            {props.titulo}
          </h1>
          <p className="mt-2 font-mono text-sm font-extrabold uppercase tracking-wide text-[#E7A63C] sm:text-base">
            Página informativa no oficial de lotería
          </p>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">{props.subtitulo}</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <div className="mb-8 flex flex-wrap gap-3">
          {props.botones.map(function (b) {
            return (
              <a
                key={b.href}
                href={b.href}
                className="inline-flex items-center gap-2 rounded-full border border-[#E7A63C]/40 bg-[#E7A63C]/10 px-4 py-2 text-sm font-semibold text-[#10203A] hover:bg-[#E7A63C]/20"
              >
                🎱 {b.texto}
              </a>
            );
          })}
        </div>

        <p className="mb-8 text-base leading-relaxed">{props.introduccion}</p>

        {props.encabezadoJuegos ? (
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A]">{props.encabezadoJuegos}</h2>
        ) : null}
        <div className="mb-8 flex flex-col gap-4">
          {props.juegos.map(function (j) {
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
          Si no conoces la mecánica básica de quiniela, palé y tripleta, te recomendamos leer primero nuestra{" "}
          <a href="/como-jugar-loteria" className="underline" style={{ color: COLOR_AZUL }}>
            guía de cómo jugar
          </a>
          .
        </p>

        <PreguntasFrecuentes preguntas={props.preguntas} />

        <p className="mt-8 rounded-xl border border-[#10203A]/12 bg-white p-4 text-xs leading-relaxed">
          Esta guía es informativa y no oficial. Las reglas, horarios y premios los define cada lotería y pueden cambiar:
          confirma siempre en tu banca o en los canales oficiales de la lotería antes de jugar.
        </p>

        <section className="mt-8">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">Más guías</h2>
          <ul className="flex flex-col gap-1.5 text-sm">
            {GUIAS.filter(function (g) { return g.href !== props.hrefActual; }).map(function (g) {
              return (
                <li key={g.href}>
                  <a href={g.href} className="underline" style={{ color: COLOR_AZUL }}>
                    {g.titulo}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
