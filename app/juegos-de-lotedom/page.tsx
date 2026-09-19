import GuiaJuegos from "../GuiaJuegos";

export const metadata = {
  title: "¿Cómo Funcionan los Juegos de LoteDom? Quiniela, Quemaito, Agarra 4 y Súper Palé",
  description:
    "Qué ofrece LoteDom y cómo se juega cada producto: Quiniela LoteDom, Quemaito Mayor, Agarra 4 y Súper Palé.",
  openGraph: {
    title: "¿Cómo Funcionan los Juegos de LoteDom?",
    description: "Guía de los productos de LoteDom: Quiniela, Quemaito, Agarra 4 y Súper Palé.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/juegos-de-lotedom" },
};

export default function JuegosDeLoteDomPage() {
  return (
    <GuiaJuegos
      hrefActual="/juegos-de-lotedom"
      titulo="¿Cómo funcionan los juegos de LoteDom?"
      subtitulo="Quiniela, Quemaito Mayor, Agarra 4 y Súper Palé."
      descripcion="Guía de los productos de LoteDom y cómo se juega cada uno."
      botones={[
        { href: "/lotedom", texto: "Ve los resultados de hoy de LoteDom" },
        { href: "/que-es-el-super-pale", texto: "¿Qué es el Súper Palé?" },
      ]}
      introduccion="LoteDom ofrece sus sorteos durante el día, alrededor del mediodía. Sus productos están conectados entre sí: algunos usan los números de otros sorteos de la misma lotería."
      juegos={[
        {
          nombre: "Quiniela LoteDom",
          texto: "El sorteo tradicional de tres números (00-99). Ganas si tu número coincide con el primero, el segundo o el tercer premio.",
        },
        {
          nombre: "Quemaito Mayor",
          texto: "Se juega con un número directo del 00 al 99. Las reglas de premios, incluidos posibles pagos por aproximación, las define LoteDom.",
        },
        {
          nombre: "Súper Palé LoteDom",
          texto: "No tiene sorteo propio: combina el Quemaito Mayor con uno de los premios de la Quiniela LoteDom. Puedes ver cómo funciona en general en nuestra guía del Súper Palé.",
        },
        {
          nombre: "Agarra 4",
          texto: "Se escogen 4 números del 00 al 99. Tres de ellos corresponden a los números de la Quiniela LoteDom y el cuarto al ganador del Quemaito Mayor.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿A qué hora salen los sorteos de LoteDom?",
          respuesta:
            "Alrededor del mediodía. Consulta el horario exacto en la página de LoteDom de La Bankera RD, porque en fechas especiales puede cambiar.",
        },
        {
          pregunta: "¿Qué es el Quemaito Mayor?",
          respuesta:
            "Es un sorteo de LoteDom que se juega con un número directo del 00 al 99, y cuyo resultado también se usa para el Súper Palé y el Agarra 4.",
        },
        {
          pregunta: "¿Cómo se forma el Agarra 4?",
          respuesta:
            "Con cuatro números: tres de la Quiniela LoteDom y uno del Quemaito Mayor.",
        },
      ]}
    />
  );
}
