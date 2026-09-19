import GuiaJuegos from "../GuiaJuegos";

export const metadata = {
  title: "¿Qué es el Súper Palé y cómo se juega? Guía Completa",
  description:
    "Qué es el Súper Palé, por qué no tiene bolas propias y cómo funciona en Leidsa, Lotería Real y LoteDom: se combinan los resultados de dos sorteos.",
  openGraph: {
    title: "¿Qué es el Súper Palé y cómo se juega?",
    description: "El Súper Palé combina dos sorteos. Así funciona en Leidsa, Lotería Real y LoteDom.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/que-es-el-super-pale" },
};

export default function QueEsElSuperPalePage() {
  return (
    <GuiaJuegos
      hrefActual="/que-es-el-super-pale"
      titulo="¿Qué es el Súper Palé y cómo se juega?"
      subtitulo="Un juego que no tiene sorteo propio: combina los resultados de otros dos."
      descripcion="Qué es el Súper Palé y cómo funciona en Leidsa, Lotería Real y LoteDom."
      botones={[
        { href: "/leidsa", texto: "Resultados de Leidsa" },
        { href: "/real", texto: "Resultados de Lotería Real" },
        { href: "/lotedom", texto: "Resultados de LoteDom" },
      ]}
      introduccion="El Súper Palé es una forma de jugar que no tiene bolas ni sorteo propio: en lugar de eso, toma un número de un sorteo y un número de otro sorteo que ya salieron, y los junta. Se escogen dos números del 00 al 99 y, según las reglas generales de este juego, el orden no importa: ganas si tus dos números coinciden con los dos números combinados. Cada lotería decide cuáles dos sorteos combina, así que la mecánica cambia un poco de una a otra."
      encabezadoJuegos="Cómo funciona en cada lotería"
      juegos={[
        {
          nombre: "Súper Palé de Leidsa",
          texto: "Combina el primer premio de la Quiniela Palé de Leidsa con el primer premio de la Lotería Nacional del mismo día. Ganas si aciertas ambos números.",
        },
        {
          nombre: "Súper Palé Real",
          texto: "Combina el primer número de la Quiniela Real (que sale al mediodía) con el primer premio de Gana Más de la Lotería Nacional (2:30 p.m.). Como los dos sorteos ya salieron antes, lo que se publica en la noche es solo la combinación. Por ejemplo, si la Quiniela Real sacó 92 como primer premio y Gana Más sacó 20, el Súper Palé Real de ese día fue 92-20.",
        },
        {
          nombre: "Súper Palé de LoteDom",
          texto: "Combina el Quemaito Mayor de LoteDom con uno de los premios de la Quiniela LoteDom.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿Qué es el Súper Palé?",
          respuesta:
            "Es una modalidad que combina dos resultados de sorteos que ya salieron, en vez de tener su propio sorteo. Se juega con dos números del 00 al 99.",
        },
        {
          pregunta: "¿El Súper Palé tiene sorteo propio?",
          respuesta:
            "No. Su resultado sale de juntar un número de un sorteo con un número de otro, por eso siempre aparece publicado después de que ya salieron los dos sorteos que se combinan.",
        },
        {
          pregunta: "¿Cuál es la diferencia entre un palé normal y el Súper Palé?",
          respuesta:
            "En un palé normal se aciertan dos de los tres números de una misma quiniela. En el Súper Palé se combinan números de dos sorteos distintos, por eso puede ser más difícil de acertar.",
        },
        {
          pregunta: "¿El Súper Palé es igual en todas las loterías?",
          respuesta:
            "La idea es la misma, pero cada lotería escoge cuáles sorteos combina. Por eso, lo más seguro es revisar las reglas de la lotería donde vas a jugar.",
        },
      ]}
    />
  );
}
