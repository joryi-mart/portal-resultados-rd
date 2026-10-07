import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

export const metadata = {
  title: "Aviso Legal",
  description: "Condiciones de uso de labankerard.com: naturaleza informativa del sitio, propiedad de marcas de terceros y responsabilidad sobre los datos publicados.",
  alternates: { canonical: "https://labankerard.com/aviso-legal" },
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

export default function AvisoLegalPage() {
  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Aviso Legal
          </h1>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            Vigente desde el 6 de octubre de 2026 · La Bankera RD (labankerard.com)
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <p className="mb-8 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Al usar labankerard.com aceptas las condiciones descritas en esta página. Si tienes dudas sobre algún
          punto, puedes escribirnos a{" "}
          <a href="mailto:contacto@labankerard.com" className="underline" style={{ color: COLOR_AZUL }}>
            contacto@labankerard.com
          </a>.
        </p>

        <Seccion titulo="Quiénes somos">
          <p>
            La Bankera RD es un proyecto informativo e independiente, administrado por una persona particular desde
            República Dominicana. No es una entidad registrada como negocio formal, no es una lotería, casa de
            apuestas ni representante de ninguna institución oficial de juegos de azar, y no gestiona jugadas,
            pagos ni reclamos de premios.
          </p>
        </Seccion>

        <Seccion titulo="Naturaleza del contenido">
          <p>
            Los resultados, horarios y demás datos publicados en este sitio se recopilan de fuentes públicas con el
            fin de informar al público lo más rápido posible. Aunque procuramos que la información sea exacta,{" "}
            <strong>no garantizamos que esté libre de errores, retrasos o diferencias</strong> frente al resultado
            oficial. Antes de tomar cualquier decisión basada en un resultado, verifícalo en el canal oficial de la
            lotería correspondiente.
          </p>
        </Seccion>

        <Seccion titulo="Marcas y nombres de terceros">
          <p>
            Nombres como Leidsa, Lotería Nacional, Loteka, Lotería Real y demás loterías o instituciones mencionadas
            en este sitio son marcas de sus respectivos dueños. Se mencionan únicamente con fines informativos y de
            identificación; su uso en labankerard.com no implica afiliación, patrocinio ni respaldo por parte de
            esas instituciones.
          </p>
        </Seccion>

        <Seccion titulo="Enlaces a sitios externos">
          <p>
            Este sitio puede enlazar a páginas de terceros (fuentes oficiales, Facebook, Wikimedia Commons, etc.).
            No somos responsables del contenido, disponibilidad ni políticas de esos sitios externos.
          </p>
        </Seccion>

        <Seccion titulo="Limitación de responsabilidad">
          <p>
            El uso de labankerard.com es bajo tu propia responsabilidad. En la medida permitida por la ley, La
            Bankera RD no se hace responsable por decisiones tomadas con base en la información aquí publicada, ni
            por interrupciones temporales del servicio.
          </p>
        </Seccion>

        <Seccion titulo="Propiedad del contenido propio">
          <p>
            Los textos, diseño y elementos originales creados para La Bankera RD (fuera de los datos de resultados
            y marcas de terceros) pertenecen a este proyecto. Puedes citarlos o enlazarlos libremente; para
            reproducirlos de forma extensa, pide permiso primero a{" "}
            <a href="mailto:contacto@labankerard.com" className="underline" style={{ color: COLOR_AZUL }}>
              contacto@labankerard.com
            </a>.
          </p>
        </Seccion>

        <Seccion titulo="Cambios a este aviso">
          <p>
            Este aviso legal puede actualizarse si el sitio agrega nuevas funciones. Cualquier cambio se reflejará
            en esta misma página. Para lo relacionado con cookies y datos de navegación, consulta la{" "}
            <a href="/politica-de-privacidad" className="underline" style={{ color: COLOR_AZUL }}>
              Política de Privacidad
            </a>.
          </p>
        </Seccion>
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
