import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";
import { hoyISO } from "../componentesResultados";
import Calculadora from "./Calculadora";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_TEXTO_SECUNDARIO = "#2E3B48";

// Se regenera una vez al dia para que la cuenta regresiva al 20 de diciembre
// y el año de la calculadora usen la fecha de RD y no la del dia del build.
export const revalidate = 86400;

export const metadata = {
  title: "Calculadora de Regalía Pascual 2026 (Doble Sueldo) RD",
  description: "Calcula gratis cuánto te toca de regalía pascual o doble sueldo en República Dominicana, aunque tengas menos de un año, hayas renunciado o te hayan despedido.",
  openGraph: {
    title: "Calculadora de Regalía Pascual 2026 🎄 ¿Cuánto te toca?",
    description: "Escribe tu sueldo y descubre al instante cuánto te toca de doble sueldo.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/calculadora-regalia-pascual" },
};

const PREGUNTAS = [
  {
    pregunta: "¿Qué es la regalía pascual?",
    respuesta:
      "Es el salario de Navidad, conocido como doble sueldo. Todo empleado del sector privado tiene derecho a recibirlo según el artículo 219 del Código de Trabajo, y equivale a la doceava parte de lo que ganó en el año.",
  },
  {
    pregunta: "¿Cuándo se paga la regalía pascual?",
    respuesta: "La empresa debe pagarla a más tardar el 20 de diciembre de cada año.",
  },
  {
    pregunta: "¿Me toca regalía si tengo menos de un año trabajando?",
    respuesta:
      "Sí. Te toca la parte proporcional al tiempo que trabajaste en el año. Por ejemplo, si entraste en julio, te toca más o menos la mitad de un sueldo.",
  },
  {
    pregunta: "¿Me toca regalía si renuncié o me despidieron?",
    respuesta:
      "Sí. La regalía se gana por el tiempo trabajado, sin importar cómo terminó el contrato. Te deben pagar la parte proporcional de los meses que trabajaste ese año.",
  },
  {
    pregunta: "¿A la regalía le descuentan ISR o TSS?",
    respuesta:
      "No. La regalía pascual está libre del impuesto sobre la renta (ISR) y no se le descuenta la Seguridad Social (TSS). Lo que calcules es lo que debe llegarte completo.",
  },
  {
    pregunta: "¿Las horas extras cuentan para la regalía?",
    respuesta:
      "No. Se calcula con el salario ordinario, es decir, tu sueldo normal. Las horas extras y los bonos por beneficios de la empresa no entran en el cálculo.",
  },
  {
    pregunta: "¿La regalía tiene un límite?",
    respuesta:
      "Sí. No puede ser mayor de 5 salarios mínimos. Esto solo afecta a quienes ganan sueldos altos, y el límite depende del tamaño de la empresa.",
  },
];

export default function CalculadoraRegaliaPage() {
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
            Calculadora de Regalía Pascual
          </h1>
          <p className="mt-2 font-mono text-base text-[#F1F4F8]">
            ¿Cuánto te toca de doble sueldo? Escribe tu sueldo y lo sabrás al instante.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-10">
        <Calculadora hoy={hoyISO()} />

        <section className="mt-10 rounded-xl border border-[#10203A]/12 bg-white p-5 sm:p-6">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-bold">¿Cómo se calcula la regalía pascual?</h2>
          <p className="mb-3 leading-relaxed">
            Se suma todo el sueldo que ganaste en el año y se divide entre 12. Si trabajaste los 12 meses con el mismo
            sueldo, el resultado es igual a un mes de sueldo.
          </p>
          <p className="leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
            <strong className="text-[#10203A]">Ejemplo:</strong> si ganas RD$ 30,000 al mes y entraste a trabajar el 1
            de julio, trabajaste la mitad del año. Tu regalía sería más o menos RD$ 15,000.
          </p>
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

        <p className="mt-6 text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Resultado aproximado, basado en los artículos 219 al 222 del Código de Trabajo y en el salario mínimo del
          sector privado no sectorizado vigente desde febrero de 2026. Para casos especiales (sueldos variables,
          comisiones o sectores con salario mínimo propio), consulta al Ministerio de Trabajo.
        </p>

        <a
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#E7A63C]/40 bg-[#E7A63C]/10 px-4 py-2 text-base font-semibold text-[#10203A] hover:bg-[#E7A63C]/20"
        >
          🎱 ¿Ya viste los resultados de la lotería de hoy? Consulta Nacional, Leidsa, Real y más.
        </a>
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-base text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
