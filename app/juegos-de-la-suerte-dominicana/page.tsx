import GuiaJuegos from "../GuiaJuegos";

export const metadata = {
  title: "¿Cómo Funcionan los Juegos de La Suerte Dominicana? Quiniela, Palé y Tripleta",
  description:
    "Cómo se juega La Suerte Dominicana: sus dos sorteos diarios de quiniela (mediodía y tarde) y las modalidades de palé y tripleta.",
  openGraph: {
    title: "¿Cómo Funcionan los Juegos de La Suerte Dominicana?",
    description: "Guía de La Suerte Dominicana: quiniela de mediodía y de tarde, palé y tripleta.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/juegos-de-la-suerte-dominicana" },
};

export default function JuegosDeLaSuerteDominicanaPage() {
  return (
    <GuiaJuegos
      hrefActual="/juegos-de-la-suerte-dominicana"
      titulo="¿Cómo funcionan los juegos de La Suerte Dominicana?"
      subtitulo="Dos sorteos de quiniela al día, con palé y tripleta."
      descripcion="Guía de La Suerte Dominicana y cómo se juega."
      botones={[{ href: "/la-suerte", texto: "Ve los resultados de hoy de La Suerte Dominicana" }]}
      introduccion="La Suerte Dominicana realiza sorteos diarios de quiniela en dos horarios, uno al mediodía y otro por la tarde. Sobre esos sorteos se puede jugar de tres maneras:"
      juegos={[
        {
          nombre: "Quiniela La Suerte (mediodía)",
          texto: "El sorteo de las 12:30 p.m. Se sacan tres números del 00 al 99, que corresponden al primer, segundo y tercer premio. Ganas si tu número sale en cualquiera de las tres posiciones.",
        },
        {
          nombre: "La Suerte Tarde",
          texto: "El segundo sorteo del día, a las 6:00 p.m., con la misma mecánica: tres números del 00 al 99.",
        },
        {
          nombre: "Palé",
          texto: "Eliges dos números y ganas si ambos aparecen entre los tres números sorteados.",
        },
        {
          nombre: "Tripleta",
          texto: "Eliges tres números y ganas si salen los tres.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿A qué hora salen los sorteos de La Suerte Dominicana?",
          respuesta:
            "Uno al mediodía (12:30 p.m.) y otro por la tarde (6:00 p.m.). Consulta el horario exacto en la página de La Suerte de La Bankera RD.",
        },
        {
          pregunta: "¿Cuántos números se sacan en cada sorteo?",
          respuesta: "Tres números entre el 00 y el 99: primer, segundo y tercer premio.",
        },
        {
          pregunta: "¿Qué es un palé y qué es una tripleta?",
          respuesta:
            "Un palé es acertar dos de los tres números sorteados; una tripleta es acertar los tres. Están explicados con más detalle en nuestra guía de cómo jugar.",
        },
      ]}
    />
  );
}
