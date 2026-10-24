import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#2E3B48";

export const metadata = {
  title: "Contacto",
  description: "Escríbele a La Bankera RD, desde Santo Domingo, República Dominicana: por correo a contacto@labankerard.com o por Facebook. Respondemos en 24 a 48 horas.",
  alternates: { canonical: "https://labankerard.com/contacto" },
};

export default function ContactoPage() {
  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Contacto
          </h1>
          <p className="mt-2 text-base text-[#E6ECF3]">
            La Bankera RD · Santo Domingo, República Dominicana
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <p className="mb-8 text-lg leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          ¿Tienes una pregunta, viste un dato incorrecto, o quieres proponernos algo? Escríbenos por cualquiera de
          estos medios. <strong className="text-[#10203A]">Respondemos en 24 a 48 horas.</strong>
        </p>

        <div className="mb-4 rounded-xl border border-[#10203A]/12 bg-white p-5">
          <div className="flex items-center gap-4">
            <span className="text-2xl">✉️</span>
            <div>
              <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">Correo</p>
              <p className="text-lg font-semibold" style={{ color: COLOR_TEXTO_SECUNDARIO }}>contacto@labankerard.com</p>
            </div>
          </div>
          <a
            href="mailto:contacto@labankerard.com"
            className="mt-4 flex min-h-[52px] items-center justify-center rounded-xl text-lg font-bold text-white hover:opacity-90"
            style={{ backgroundColor: COLOR_AZUL }}
          >
            Escribir un correo
          </a>
        </div>

        <a
          href="https://www.facebook.com/profile.php?id=1315560834976047"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-8 flex items-center gap-4 rounded-xl border border-[#10203A]/12 bg-white p-5 transition hover:shadow-md"
        >
          <span className="text-2xl">📘</span>
          <div>
            <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">Facebook</p>
            <p className="text-lg font-semibold underline" style={{ color: COLOR_AZUL }}>La Bankera RD</p>
          </div>
        </a>

        <p className="text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Recuerda que La Bankera RD es un portal informativo, independiente y no oficial. No gestionamos jugadas,
          apuestas ni reclamos de premios: para eso, contacta directamente a la lotería correspondiente.
        </p>
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
