import GuiaJuegos from "../GuiaJuegos";

export const metadata = {
  title: "King Lottery (Sint Maarten): Horarios, Cómo Salen los Números y Cómo Revisar Resultados",
  description:
    "Qué es la King Lottery de Sint Maarten, a qué hora salen sus dos sorteos diarios y cómo se forma la quiniela a partir del Pick 3 y el Pick 4.",
  openGraph: {
    title: "King Lottery (Sint Maarten): horarios y cómo funciona",
    description: "Guía de la King Lottery: dos sorteos al día y cómo se forma su quiniela.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/que-es-king-lottery-sint-maarten" },
};

export default function QueEsKingLotterySintMaartenPage() {
  return (
    <GuiaJuegos
      hrefActual="/que-es-king-lottery-sint-maarten"
      titulo="King Lottery (Sint Maarten): cómo funciona y a qué hora sale"
      subtitulo="Dos sorteos al día, con quiniela, palé y tripleta."
      descripcion="Guía de la King Lottery de Sint Maarten: horarios y cómo se forman sus números."
      botones={[{ href: "/sxm", texto: "Ve los resultados de hoy de Sint Maarten" }]}
      introduccion="La King Lottery es una lotería que se transmite desde Philipsburg, en la parte holandesa de la isla de Sint Maarten, y que muchos jugadores dominicanos siguen a diario. En La Bankera RD la publicamos como Sint Maarten (King Lottery)."
      encabezadoJuegos="Lo que necesitas saber"
      juegos={[
        {
          nombre: "Los 2 sorteos del día",
          texto: "Se sortea todos los días dos veces: al mediodía (12:30 p.m.) y por la noche (7:30 p.m.).",
        },
        {
          nombre: "Cómo se forman los números",
          texto: "Su quiniela se arma con los sorteos Pick 3 y Pick 4 de Sint Maarten: el primer número son los dos últimos dígitos del Pick 3, y el segundo y el tercero se forman con las dos parejas de dígitos del Pick 4. El resultado final son tres números del 00 al 99.",
        },
        {
          nombre: "Cómo se juega",
          texto: "Los tres números se pueden jugar como quiniela, palé y tripleta, igual que las quinielas dominicanas. Confirma los premios en tu banca. Tenemos una guía con la mecánica básica.",
        },
        {
          nombre: "Parecido a las loterías americanas",
          texto: "Como usa el formato Pick 3 y Pick 4, su resultado se arma de forma parecida al de New York y Florida en las bancas dominicanas.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿A qué hora salen los sorteos de la King Lottery?",
          respuesta: "Al mediodía (12:30 p.m.) y por la noche (7:30 p.m.), todos los días.",
        },
        {
          pregunta: "¿Cuántos números salen en cada sorteo?",
          respuesta:
            "Tres números de dos cifras, del 00 al 99, armados con los sorteos Pick 3 y Pick 4.",
        },
        {
          pregunta: "¿Qué es el Pick 3 y el Pick 4?",
          respuesta:
            "Son sorteos de tres y cuatro dígitos. En la King Lottery, se usan para formar los tres números de la quiniela.",
        },
      ]}
    />
  );
}
