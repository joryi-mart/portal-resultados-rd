import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

export const metadata = {
  title: "Contacto",
  description: "Cómo escribirle a La Bankera RD por correo o por Facebook.",
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
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            La Bankera RD · labankerard.com
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <p className="mb-8 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          ¿Tienes una pregunta, viste un dato incorrecto, o quieres proponernos algo? Escríbenos por cualquiera de
          estos medios.
        </p>

        <div className="mb-4 flex items-center gap-4 rounded-xl border border-[#10203A]/12 bg-white p-5">
          <span className="text-2xl">✉️</span>
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">Correo</p>
            <a href="mailto:contacto@labankerard.com" className="font-mono text-sm underline" style={{ color: COLOR_AZUL }}>
              contacto@labankerard.com
            </a>
          </div>
        </div>

        <a
          href="https://www.facebook.com/profile.php?id=1315560834976047"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-8 flex items-center gap-4 rounded-xl border border-[#10203A]/12 bg-white p-5 transition hover:shadow-md"
        >
          <span className="text-2xl">📘</span>
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">Facebook</p>
            <p className="font-mono text-sm" style={{ color: COLOR_AZUL }}>la bankera RD</p>
          </div>
        </a>

        <p className="text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
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
