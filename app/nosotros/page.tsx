import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_VERDE_RD = "#007A33";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

export const metadata = {
  title: "Sobre Nosotros | La Bankera RD",
  description: "Qué es La Bankera RD, desde cuándo existe y qué puedes encontrar en labankerard.com: resultados de loterías dominicanas, béisbol, NBA, fútbol y más.",
  alternates: { canonical: "https://labankerard.com/nosotros" },
};

function Seccion(props: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold" style={{ color: COLOR_AZUL }}>
        {props.titulo}
      </h2>
      <div className="space-y-3 text-base leading-relaxed text-[#10203A]">{props.children}</div>
    </div>
  );
}

export default function NosotrosPage() {
  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Sobre Nosotros
          </h1>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            La Bankera RD · labankerard.com
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <div className="mb-8 rounded-xl border-2 px-4 py-3 text-center" style={{ borderColor: "#E7A63C" }}>
          <p className="font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-wide" style={{ color: "#B97F16" }}>
            Página informativa no oficial de lotería
          </p>
        </div>

        <Seccion titulo="Qué es La Bankera RD">
          <p>
            La Bankera RD es un sitio web dominicano que publica, todos los días, los resultados de las principales
            loterías que se juegan en República Dominicana: Leidsa, Lotería Nacional, Loteka, Lotería Real, La
            Primera, La Suerte Dominicana, Lotedom, y también loterías internacionales como las de New York,
            Florida, Anguila, Haití Bolet, Sint Maarten, Powerball y Mega Millions.
          </p>
          <p>
            El nombre &ldquo;bankera&rdquo; viene de cómo se le dice popularmente, en la calle, a quien vende o
            gestiona jugadas de lotería en República Dominicana. Nuestro sitio no vende jugadas ni gestiona apuestas:
            solo informa los resultados una vez ya salieron.
          </p>
        </Seccion>

        <Seccion titulo="Desde cuándo existimos">
          <p>
            La Bankera RD se lanzó el <strong>1 de septiembre de 2026</strong>. Empezamos con los resultados de
            lotería, y desde entonces hemos ido agregando contenido: guías sobre cómo funciona cada juego, resultados
            de LIDOM y béisbol dominicano, NBA, fútbol, cine, y otra información práctica como el tipo de cambio del
            dólar y los días feriados.
          </p>
        </Seccion>

        <Seccion titulo="Cómo funciona">
          <p>
            Los resultados se publican de forma automática, apenas cada sorteo sale, a partir de las fuentes públicas
            de cada lotería. No somos parte de ninguna lotería ni institución de juegos de azar: somos un portal
            independiente que reúne la información en un solo lugar, para que no tengas que buscar en varios sitios.
          </p>
        </Seccion>

        <Seccion titulo="Nuestro compromiso">
          <p>
            Publicamos la información lo más rápido y clara posible, pero los resultados que mostramos son{" "}
            <strong>informativos, no oficiales</strong>. Para premios, reclamos o cualquier trámite oficial, siempre
            recomendamos confirmar directamente con la lotería correspondiente o sus canales autorizados.
          </p>
        </Seccion>

        <Seccion titulo="Síguenos">
          <p>
            También estamos en Facebook, donde publicamos los resultados apenas salen:{" "}
            <a
              href="https://www.facebook.com/profile.php?id=1315560834976047"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: COLOR_AZUL }}
            >
              la bankera RD en Facebook
            </a>
            .
          </p>
        </Seccion>

        <a
          href="/"
          className="mb-2 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white"
          style={{ backgroundColor: COLOR_VERDE_RD }}
        >
          Ver los resultados de hoy →
        </a>
        <p className="mt-6 text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          ¿Tienes preguntas o quieres escribirnos? Visita nuestra{" "}
          <a href="/contacto" className="underline">página de contacto</a>.
        </p>
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
