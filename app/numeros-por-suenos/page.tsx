import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";
import PreguntasFrecuentes from "../PreguntasFrecuentes";
import BuscadorLista from "./BuscadorLista";
import { NUMEROS_POR_NOMBRE, NUMEROS_POR_PROFESION } from "./datosNombresProfesiones";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

export const metadata = {
  title: "Números de la Suerte Según tus Sueños, Nombres y Profesiones",
  description:
    "Diccionario de sueños, nombres y profesiones con su número de lotería: la charada china, más qué número corresponde a cada nombre de persona y a cada oficio, tradición popular de República Dominicana, Cuba y Puerto Rico.",
  alternates: { canonical: "https://labankerard.com/numeros-por-suenos" },
};

// Los primeros 36 numeros son la "charada china" original, llegada al Caribe
// con trabajadores chinos a partir de 1847. Del 37 al 100 es la ampliacion
// popular conocida como "charada cubana", que agrego mas significados con
// el tiempo. Cada numero de la fuente trae varios significados posibles
// (ej. "62: Matrimonio, Robo, Asesinato, Crimen"); aqui se eligio uno solo
// por numero, el mas neutral/familiar, para mantener el tono de la pagina.
// El numero 100 de la charada equivale al 00 en una loteria de dos cifras.
export const CHARADA: { numero: number; significa: string }[] = [
  { numero: 1, significa: "Caballo" },
  { numero: 2, significa: "Mariposa" },
  { numero: 3, significa: "Marinero" },
  { numero: 4, significa: "Gato" },
  { numero: 5, significa: "Monja" },
  { numero: 6, significa: "Jicotea (tortuga de agua)" },
  { numero: 7, significa: "Caracol" },
  { numero: 8, significa: "Muerto" },
  { numero: 9, significa: "Elefante" },
  { numero: 10, significa: "Pescado grande" },
  { numero: 11, significa: "Gallo" },
  { numero: 12, significa: "Ramera" },
  { numero: 13, significa: "Pavo real" },
  { numero: 14, significa: "Gato de tigre" },
  { numero: 15, significa: "Perro" },
  { numero: 16, significa: "Toro" },
  { numero: 17, significa: "Luna" },
  { numero: 18, significa: "Pescado chico" },
  { numero: 19, significa: "Lombriz" },
  { numero: 20, significa: "Gato fino" },
  { numero: 21, significa: "Majá (culebra)" },
  { numero: 22, significa: "Sapo" },
  { numero: 23, significa: "Vapor (barco)" },
  { numero: 24, significa: "Paloma" },
  { numero: 25, significa: "Piedra fina" },
  { numero: 26, significa: "Anguila" },
  { numero: 27, significa: "Avispa" },
  { numero: 28, significa: "Chivo" },
  { numero: 29, significa: "Ratón" },
  { numero: 30, significa: "Camarón" },
  { numero: 31, significa: "Venado" },
  { numero: 32, significa: "Cochino" },
  { numero: 33, significa: "Tiñosa (aura, ave de rapiña)" },
  { numero: 34, significa: "Mono" },
  { numero: 35, significa: "Araña" },
  { numero: 36, significa: "Cachimba (pipa de fumar)" },
  { numero: 37, significa: "Hormiga" },
  { numero: 38, significa: "Carro" },
  { numero: 39, significa: "Conejo" },
  { numero: 40, significa: "Cura (sacerdote)" },
  { numero: 41, significa: "Lagartijo" },
  { numero: 42, significa: "Pato" },
  { numero: 43, significa: "Alacrán" },
  { numero: 44, significa: "Caldero" },
  { numero: 45, significa: "Tiburón" },
  { numero: 46, significa: "Guagua (autobús)" },
  { numero: 47, significa: "Pájaro chiquito" },
  { numero: 48, significa: "Cucaracha" },
  { numero: 49, significa: "Fogón" },
  { numero: 50, significa: "Policía" },
  { numero: 51, significa: "Soldado" },
  { numero: 52, significa: "Bicicleta" },
  { numero: 53, significa: "Luz eléctrica" },
  { numero: 54, significa: "Flores" },
  { numero: 55, significa: "Cangrejo" },
  { numero: 56, significa: "Reina" },
  { numero: 57, significa: "Cama" },
  { numero: 58, significa: "Retrato" },
  { numero: 59, significa: "Langosta" },
  { numero: 60, significa: "Payaso" },
  { numero: 61, significa: "Caballo grande" },
  { numero: 62, significa: "Matrimonio" },
  { numero: 63, significa: "Bandolero" },
  { numero: 64, significa: "Escándalo" },
  { numero: 65, significa: "Comida" },
  { numero: 66, significa: "Beso" },
  { numero: 67, significa: "Hospital" },
  { numero: 68, significa: "Cementerio" },
  { numero: 69, significa: "Pozo" },
  { numero: 70, significa: "Coco" },
  { numero: 71, significa: "Río" },
  { numero: 72, significa: "Lluvia" },
  { numero: 73, significa: "Maleta" },
  { numero: 74, significa: "Papalote" },
  { numero: 75, significa: "Guitarra" },
  { numero: 76, significa: "Bailarina" },
  { numero: 77, significa: "Billetes de banco" },
  { numero: 78, significa: "Rey" },
  { numero: 79, significa: "Lagarto" },
  { numero: 80, significa: "Paraguas" },
  { numero: 81, significa: "Teatro" },
  { numero: 82, significa: "León" },
  { numero: 83, significa: "Bastón" },
  { numero: 84, significa: "Banquero" },
  { numero: 85, significa: "Espejo" },
  { numero: 86, significa: "Tijeras" },
  { numero: 87, significa: "Plátano" },
  { numero: 88, significa: "Espejuelos (gafas)" },
  { numero: 89, significa: "Casa vieja" },
  { numero: 90, significa: "Caramelos" },
  { numero: 91, significa: "Alpargata" },
  { numero: 92, significa: "Avión" },
  { numero: 93, significa: "Sortija" },
  { numero: 94, significa: "Machete" },
  { numero: 95, significa: "Perro grande" },
  { numero: 96, significa: "Zapato viejo" },
  { numero: 97, significa: "Mosquito" },
  { numero: 98, significa: "Piano" },
  { numero: 99, significa: "Serrucho" },
  { numero: 0, significa: "Automóvil" },
];

function numeroDosDigitos(n: number) {
  return n.toString().padStart(2, "0");
}

export default function NumerosPorSuenosPage() {
  const faqNombresYProfesiones = [
    {
      pregunta: "¿Qué número le corresponde a mi nombre?",
      respuesta:
        "Busca tu nombre en la tabla de 'Sueños con nombres' de esta página. Es la misma tradición de la charada, pero agrupada por nombre de persona en vez de por animales u objetos.",
    },
    {
      pregunta: "¿Qué número es una profesión u oficio?",
      respuesta:
        "En la tabla de 'Sueños con profesiones' puedes buscar el oficio o profesión que soñaste (médico, maestro, policía, etc.) y ver el número que la tradición le asigna.",
    },
  ];

  const datosEstructurados = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: CHARADA.map(function (c) {
      return {
        "@type": "Question",
        name: `¿Qué número es soñar con ${c.significa.toLowerCase()}?`,
        acceptedAnswer: { "@type": "Answer", text: `Según la charada china, soñar con ${c.significa.toLowerCase()} corresponde al número ${numeroDosDigitos(c.numero)}.` },
      };
    }).concat(
      faqNombresYProfesiones.map(function (f) {
        return {
          "@type": "Question",
          name: f.pregunta,
          acceptedAnswer: { "@type": "Answer", text: f.respuesta },
        };
      })
    ),
  };

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }} />
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Números de la Suerte: Sueños, Nombres y Profesiones
          </h1>
          <p className="mt-2 font-mono text-sm font-extrabold uppercase tracking-wide text-[#E7A63C] sm:text-base">
            Página informativa no oficial de lotería
          </p>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            Basado en la charada china, tradición popular del Caribe
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <p className="mb-8 text-base leading-relaxed">
          En República Dominicana, Cuba y Puerto Rico es muy común relacionar lo que soñaste con un número para
          jugar a la lotería. Esta costumbre viene de la <strong>charada china</strong>, un sistema de números y
          significados que llegó al Caribe con los trabajadores chinos que emigraron a partir de 1847, y que se
          sigue usando hoy en día. Aquí tienes los 100 números, del 00 al 99, con lo que representa cada uno, además
          de las tablas de nombres de persona y de profesiones u oficios, otra forma muy común de elegir número.
        </p>

        <div className="mb-8 flex flex-wrap gap-2">
          <a
            href="https://wa.me/?text=Mira%20esta%20tabla%20de%20n%C3%BAmeros%20seg%C3%BAn%20tus%20sue%C3%B1os%3A%20https%3A%2F%2Flabankerard.com%2Fnumeros-por-suenos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
          >
            Compartir en WhatsApp
          </a>
          <a
            href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flabankerard.com%2Fnumeros-por-suenos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#1464D8] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
          >
            Compartir en Facebook
          </a>
        </div>

        <h2 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-bold" style={{ color: COLOR_AZUL }}>
          La charada completa (00 al 99)
        </h2>
        <div className="mb-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CHARADA.slice()
            .sort(function (a, b) { return a.numero - b.numero; })
            .map(function (c) {
            return (
              <div
                key={c.numero}
                className="flex items-center gap-3 rounded-xl border border-[#10203A]/12 bg-white px-4 py-3"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-[family-name:var(--font-display)] text-base font-extrabold"
                  style={{ borderColor: "#E7A63C", color: COLOR_AZUL }}
                >
                  {numeroDosDigitos(c.numero)}
                </div>
                <p className="text-sm leading-snug">
                  Soñar con <strong>{c.significa}</strong>
                </p>
              </div>
            );
          })}
        </div>

        <h2 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-bold" style={{ color: COLOR_AZUL }}>
          Sueños con nombres de persona
        </h2>
        <p className="mb-4 text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Otra tradición muy usada: a cada nombre también se le asigna un número. Busca el nombre que soñaste.
        </p>
        <div className="mb-8">
          <BuscadorLista datos={NUMEROS_POR_NOMBRE} placeholder="Busca un nombre, por ejemplo: Pedro" />
        </div>

        <h2 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-bold" style={{ color: COLOR_AZUL }}>
          Sueños con profesiones u oficios
        </h2>
        <p className="mb-4 text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Soñar con alguien ejerciendo un oficio o profesión también tiene su número en la tradición popular.
        </p>
        <div className="mb-8">
          <BuscadorLista datos={NUMEROS_POR_PROFESION} placeholder="Busca una profesión, por ejemplo: Médico" />
        </div>

        <div className="mb-8 rounded-xl border border-[#10203A]/12 bg-white p-5">
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-bold" style={{ color: COLOR_AZUL }}>
            ¿Es un sistema oficial?
          </h2>
          <p className="text-sm leading-relaxed">
            No. La charada china y las tablas de nombres y profesiones son <strong>tradición popular</strong>, no un
            método probado ni algo reconocido por ninguna lotería. Ninguna lotería dominicana usa estos significados
            para elegir sus números ganadores — los sorteos son completamente al azar. Esta página es solo
            informativa y cultural, no una garantía de ningún tipo.
          </p>
        </div>

        <PreguntasFrecuentes preguntas={faqNombresYProfesiones} />

        <p className="mb-8 text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Para ver los resultados reales de hoy, visita nuestra{" "}
          <a href="/" className="underline" style={{ color: COLOR_AZUL }}>
            página principal
          </a>
          , o aprende{" "}
          <a href="/como-jugar-loteria" className="underline" style={{ color: COLOR_AZUL }}>
            cómo jugar quiniela, palé y tripleta
          </a>
          . También puedes{" "}
          <a href="/numero" className="underline" style={{ color: COLOR_AZUL }}>
            buscar cualquier número
          </a>{" "}
          para ver su historial.
        </p>

        <p className="text-xs text-[#5C6B78]">
          Escrito por el equipo de{" "}
          <a href="/nosotros" className="underline" style={{ color: COLOR_AZUL }}>
            La Bankera RD
          </a>
          .
        </p>
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
