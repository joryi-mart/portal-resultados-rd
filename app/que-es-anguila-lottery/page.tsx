import GuiaJuegos from "../GuiaJuegos";

export const metadata = {
  title: "Lotería de Anguila: Horarios de sus 4 Sorteos al Día y Cómo Funciona",
  description:
    "Qué es la lotería de Anguila (Anguilla Lottery), a qué hora salen sus cuatro sorteos diarios, cuántos números salen y cómo se juega en las bancas dominicanas.",
  openGraph: {
    title: "Lotería de Anguila: horarios de sus 4 sorteos al día",
    description: "Guía de la lotería de Anguila: cuatro sorteos diarios, tres números en cada uno.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/que-es-anguila-lottery" },
};

export default function QueEsAnguilaLotteryPage() {
  return (
    <GuiaJuegos
      hrefActual="/que-es-anguila-lottery"
      titulo="Lotería de Anguila: horarios de sus 4 sorteos al día"
      subtitulo="Una lotería del Caribe muy seguida por los jugadores dominicanos."
      descripcion="Guía de la lotería de Anguila: horarios, números por sorteo y cómo se juega."
      botones={[{ href: "/anguila", texto: "Ve los resultados de hoy de Anguila" }]}
      introduccion="Anguila (Anguilla Lottery) es una lotería del Caribe que muchos jugadores dominicanos siguen por la cantidad de sorteos que tiene cada día. En La Bankera RD publicamos sus resultados."
      encabezadoJuegos="Lo que necesitas saber"
      juegos={[
        {
          nombre: "Los 4 sorteos del día",
          texto: "Se sortea todos los días, cuatro veces: a las 10:00 a.m., a la 1:00 p.m. (mediodía), a las 6:00 p.m. (tarde) y a las 9:00 p.m. (noche).",
        },
        {
          nombre: "Cuántos números salen",
          texto: "Cada sorteo publica tres números de dos cifras, del 00 al 99: el primero, el segundo y el tercero, como en una quiniela.",
        },
        {
          nombre: "Cómo se juega",
          texto: "Se juega con las mismas modalidades de la quiniela dominicana: quiniela (un número), palé (dos números) y tripleta (tres números). Los premios los define cada banca, así que confírmalos donde juegues. Tenemos una guía con la mecánica básica.",
        },
        {
          nombre: "Por qué la siguen tantos jugadores",
          texto: "Al tener cuatro sorteos al día, ofrece más oportunidades de revisar y jugar a lo largo del día que las loterías con uno o dos sorteos.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿A qué hora salen los sorteos de Anguila?",
          respuesta:
            "A las 10:00 a.m., 1:00 p.m., 6:00 p.m. y 9:00 p.m., todos los días.",
        },
        {
          pregunta: "¿Cuántos números salen en cada sorteo de Anguila?",
          respuesta: "Tres números de dos cifras, del 00 al 99.",
        },
        {
          pregunta: "¿Anguila es una lotería dominicana?",
          respuesta:
            "No. Es una lotería del Caribe, pero es muy seguida en República Dominicana y por eso publicamos sus resultados.",
        },
      ]}
    />
  );
}
