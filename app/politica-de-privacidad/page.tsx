import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

export const metadata = {
  title: "Política de Privacidad | La Bankera RD",
  description: "Cómo La Bankera RD usa cookies, mide las visitas y qué información recoge de quienes visitan labankerard.com.",
  alternates: { canonical: "https://labankerard.com/politica-de-privacidad" },
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

export default function PoliticaDePrivacidadPage() {
  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Política de Privacidad
          </h1>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            Vigente desde el 1 de septiembre de 2026 · La Bankera RD (labankerard.com)
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <p className="mb-8 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Esta página explica, en términos sencillos, qué información recoge La Bankera RD cuando visitas
          labankerard.com, para qué la usamos y qué opciones tienes al respecto. Al usar este sitio, aceptas lo que
          se describe aquí.
        </p>

        <Seccion titulo="Qué información recogemos">
          <p>
            No pedimos que te registres ni creemos una cuenta para consultar resultados de lotería. La información
            que recogemos es la que se genera automáticamente al navegar el sitio: qué páginas visitas, desde qué
            país o dispositivo, y cuánto tiempo te quedas. Esto lo medimos con <strong>Google Analytics</strong>, una
            herramienta de Google que nos ayuda a entender qué contenido es más útil y a mejorar el sitio.
          </p>
        </Seccion>

        <Seccion titulo="Cookies">
          <p>
            Una cookie es un archivo pequeño que el navegador guarda en tu computadora o teléfono para recordar
            cierta información, como tus preferencias o si ya visitaste el sitio antes. Labankerard.com usa cookies
            de Google Analytics con ese fin.
          </p>
          <p>
            Puedes desactivar o borrar las cookies desde la configuración de tu navegador en cualquier momento. Si
            las desactivas, el sitio sigue funcionando normalmente; solo dejamos de recibir esos datos de uso.
          </p>
        </Seccion>

        <Seccion titulo="Notificaciones">
          <p>
            El sitio ofrece un botón para activar avisos que te llegan al teléfono o a la computadora cuando sale
            un resultado nuevo. Esta función es <strong>opcional</strong>: solo se activa si tú la aceptas
            explícitamente, y puedes desactivarla cuando quieras desde la configuración de notificaciones de tu
            navegador.
          </p>
        </Seccion>

        <Seccion titulo="Publicidad">
          <p>
            Labankerard.com puede mostrar publicidad para poder mantener el sitio gratuito, incluida publicidad de{" "}
            <strong>Google AdSense</strong> u otras redes publicitarias. Estas redes pueden usar cookies propias
            para mostrar anuncios relacionados con tus intereses. Cada red de publicidad tiene su propia política de
            privacidad, que puedes consultar en su propio sitio; la de Google está disponible en{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: COLOR_AZUL }}>
              policies.google.com/privacy
            </a>.
          </p>
        </Seccion>

        <Seccion titulo="Con quién compartimos información">
          <p>
            Compartimos información de visitas de forma anónima o agrupada con Google (Analytics y, si aplica,
            AdSense), únicamente para medir el uso del sitio y, en su momento, mostrar publicidad. No vendemos ni
            compartimos tu información personal con nadie más, y no usamos tus datos para fines distintos a los
            descritos aquí.
          </p>
        </Seccion>

        <Seccion titulo="Tus derechos">
          <p>
            Puedes pedirnos en cualquier momento que te expliquemos qué información se ha recogido sobre tu visita,
            o desactivar las cookies y notificaciones como se explica arriba. Como no creamos cuentas de usuario, no
            guardamos datos personales identificables que puedas pedirnos borrar de forma individual.
          </p>
        </Seccion>

        <Seccion titulo="Contacto">
          <p>
            Si tienes preguntas sobre esta política, puedes escribirnos a{" "}
            <a href="mailto:contacto@labankerard.com" className="underline" style={{ color: COLOR_AZUL }}>
              contacto@labankerard.com
            </a>.
          </p>
        </Seccion>

        <p className="text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Esta política puede actualizarse si el sitio agrega nuevas funciones (como publicidad) que cambien la
          información que recogemos. Cualquier cambio se reflejará en esta misma página.
        </p>
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
