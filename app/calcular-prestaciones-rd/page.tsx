import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";
import { hoyISO } from "../componentesResultados";
import CalculadoraPrestaciones from "./CalculadoraPrestaciones";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

// Se regenera una vez al día para que la fecha de salida sugerida sea la de hoy en RD.
export const revalidate = 86400;

export const metadata = {
  title: "Calcular Prestaciones Laborales RD 2026 (Preaviso, Cesantía, Vacaciones)",
  description:
    "Calcula gratis tus prestaciones laborales en República Dominicana: preaviso, cesantía, vacaciones y regalía, según el Código de Trabajo. Si te botaron, renunciaste o te despidieron.",
  openGraph: {
    title: "Calcular Prestaciones RD 2026 ⚖️ ¿Cuánto te toca?",
    description: "Escribe tu sueldo y tus fechas y descubre al instante cuánto te deben pagar.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/calcular-prestaciones-rd" },
};

const PREGUNTAS = [
  {
    pregunta: "¿Qué son las prestaciones laborales?",
    respuesta:
      "Son los pagos que la empresa debe darte cuando termina tu contrato sin que hayas cometido una falta: el preaviso y la cesantía. Además, al salir siempre te deben pagar los derechos adquiridos: las vacaciones que no tomaste y la regalía pascual proporcional.",
  },
  {
    pregunta: "¿Cómo se calcula el salario diario?",
    respuesta:
      "Se divide el salario mensual entre 23.83. Por ejemplo, si ganas RD$ 25,000 al mes, tu salario diario es de unos RD$ 1,049. Con ese número se calculan el preaviso, la cesantía y las vacaciones.",
  },
  {
    pregunta: "¿Cuántos días de preaviso me tocan?",
    respuesta:
      "Según el artículo 76 del Código de Trabajo: 7 días si trabajaste más de 3 meses y hasta 6; 14 días si trabajaste más de 6 meses y hasta un año; y 28 días si trabajaste más de un año. Si la empresa te avisó con ese tiempo y trabajaste esos días, no te lo tiene que pagar.",
  },
  {
    pregunta: "¿Cuántos días de cesantía me tocan?",
    respuesta:
      "Según el artículo 80: 6 días si trabajaste de 3 a 6 meses; 13 días de 6 meses a un año; 21 días por cada año si trabajaste de 1 a 5 años; y 23 días por cada año si trabajaste 5 años o más. Si sobran más de 3 meses de un año incompleto, se suman 6 o 13 días más.",
  },
  {
    pregunta: "¿Me toca cesantía si renuncié?",
    respuesta:
      "No, si renunciaste por tu cuenta solo te tocan las vacaciones no tomadas y la regalía proporcional. Pero si renunciaste por una falta de la empresa (por ejemplo, no te pagaban o no te inscribieron en la TSS), eso se llama dimisión, y si se declara justificada te tocan preaviso, cesantía y hasta 6 meses de salario.",
  },
  {
    pregunta: "¿Qué pasa si me despidieron acusándome de una falta?",
    respuesta:
      "Si la falta es real y está probada, solo te tocan las vacaciones y la regalía. Si la empresa no puede probarla en el tribunal, el despido se declara injustificado y te tocan preaviso, cesantía y hasta 6 meses de salario (artículo 95).",
  },
  {
    pregunta: "¿Cuántos días de vacaciones me tocan?",
    respuesta:
      "Después de un año trabajando te tocan 14 días, y desde los 5 años, 18 días. Si saliste antes de cumplir el año pero con más de 5 meses, te toca la parte proporcional: de 6 días (5 meses) a 12 días (11 meses).",
  },
  {
    pregunta: "¿En cuánto tiempo me tienen que pagar las prestaciones?",
    respuesta:
      "La empresa debe pagarte en un plazo de 10 días después de terminar el contrato. Si no lo hace, debe pagarte además un día de salario por cada día de retraso (artículo 86).",
  },
];

export default function CalcularPrestacionesPage() {
  const preguntasParaGoogle = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PREGUNTAS.map(function (p) {
      return { "@type": "Question", name: p.pregunta, acceptedAnswer: { "@type": "Answer", text: p.respuesta } };
    }),
  };

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(preguntasParaGoogle) }} />
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Calcular Prestaciones RD
          </h1>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            Preaviso, cesantía, vacaciones y regalía según el Código de Trabajo dominicano.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-10">
        <CalculadoraPrestaciones hoy={hoyISO()} />

        <section className="mt-10 rounded-xl border border-[#10203A]/12 bg-white p-5 sm:p-6">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-bold">¿Qué me toca según cómo salí?</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                  <th className="py-2 pr-3 font-semibold">Cómo saliste</th>
                  <th className="py-2 pr-3 font-semibold">Preaviso y cesantía</th>
                  <th className="py-2 font-semibold">Vacaciones y regalía</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[#10203A]/8"><td className="py-2 pr-3">Te botaron sin causa (desahucio)</td><td className="py-2 pr-3">✅ Sí</td><td className="py-2">✅ Sí</td></tr>
                <tr className="border-t border-[#10203A]/8"><td className="py-2 pr-3">Despido por una falta probada</td><td className="py-2 pr-3">❌ No</td><td className="py-2">✅ Sí</td></tr>
                <tr className="border-t border-[#10203A]/8"><td className="py-2 pr-3">Despido injustificado (lo decide el tribunal)</td><td className="py-2 pr-3">✅ Sí, y hasta 6 meses de salario</td><td className="py-2">✅ Sí</td></tr>
                <tr className="border-t border-[#10203A]/8"><td className="py-2 pr-3">Renuncia por tu cuenta</td><td className="py-2 pr-3">❌ No</td><td className="py-2">✅ Sí</td></tr>
                <tr className="border-t border-[#10203A]/8"><td className="py-2 pr-3">Dimisión justificada (culpa de la empresa)</td><td className="py-2 pr-3">✅ Sí, y hasta 6 meses de salario</td><td className="py-2">✅ Sí</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-[#10203A]/12 bg-white p-5 sm:p-6">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-bold">Preguntas frecuentes</h2>
          {PREGUNTAS.map(function (p) {
            return (
              <div key={p.pregunta} className="mb-4 last:mb-0">
                <h3 className="font-semibold">{p.pregunta}</h3>
                <p className="mt-1 leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{p.respuesta}</p>
              </div>
            );
          })}
        </section>

        <p className="mt-6 text-xs leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Resultado aproximado, basado en los artículos 76, 80, 86, 95, 177, 180 y 219 del Código de Trabajo (Ley
          16-92). No sustituye la asesoría de un abogado. Para casos especiales (salarios variables, comisiones,
          trabajadores domésticos o del sector público) consulta al Ministerio de Trabajo.
        </p>

        <a
          href="/calculadora-regalia-pascual"
          className="mt-6 flex items-center justify-between rounded-xl border border-[#10203A]/12 bg-white px-5 py-4 hover:shadow-md"
        >
          <span className="font-semibold">🎄 ¿Solo quieres saber tu regalía pascual?</span>
          <span className="font-mono text-sm font-semibold" style={{ color: "#007A33" }}>Calcular →</span>
        </a>

        <a
          href="/"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#E7A63C]/40 bg-[#E7A63C]/10 px-4 py-2 text-sm font-semibold text-[#10203A] hover:bg-[#E7A63C]/20"
        >
          🎱 ¿Ya viste los resultados de la lotería de hoy? Consulta Nacional, Leidsa, Real y más.
        </a>
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
