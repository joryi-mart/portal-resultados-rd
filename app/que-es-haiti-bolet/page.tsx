import GuiaJuegos from "../GuiaJuegos";

export const metadata = {
  title: "Haití Bolet: Qué Es, Horarios de los 6 Sorteos y Cómo Revisar los Resultados",
  description:
    "Qué es el Haití Bolet, a qué hora salen sus seis sorteos diarios, cuántos números se sacan en cada uno y dónde ver los resultados y el historial.",
  openGraph: {
    title: "Haití Bolet: qué es y horarios de los 6 sorteos",
    description: "Guía del Haití Bolet: seis sorteos al día, tres números de dos cifras en cada uno.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/que-es-haiti-bolet" },
};

export default function QueEsHaitiBoletPage() {
  return (
    <GuiaJuegos
      hrefActual="/que-es-haiti-bolet"
      titulo="Haití Bolet: qué es y a qué hora salen sus 6 sorteos"
      subtitulo="La lotería de Haití que muchos siguen también en República Dominicana."
      descripcion="Guía del Haití Bolet: qué es, sus seis sorteos diarios y cómo revisar los resultados."
      botones={[
        { href: "/haiti", texto: "Ve los resultados de hoy de Haití Bolet" },
        { href: "/haiti/historial", texto: "Historial de Haití Bolet" },
      ]}
      introduccion="El Bolet (también escrito borlette) es una de las loterías más populares de Haití, y sus resultados también los siguen muchas personas en República Dominicana y el Caribe. En La Bankera RD publicamos los resultados del Haití Bolet: son seis sorteos al día, todos los días de la semana."
      encabezadoJuegos="Lo que necesitas saber"
      juegos={[
        {
          nombre: "Los 6 sorteos del día",
          texto: "Tres por la mañana (9:30, 10:30 y 11:30 a.m.) y tres por la tarde y noche (5:30, 6:30 y 7:30 p.m.). Estos son los horarios que mostramos en el sitio; si cambian, los actualizamos.",
        },
        {
          nombre: "Cuántos números salen en cada sorteo",
          texto: "Cada sorteo publica tres números de dos cifras, del 00 al 99, como en una quiniela: el primero, el segundo y el tercero.",
        },
        {
          nombre: "Cómo se usa en las bancas",
          texto: "Se sigue de forma parecida a una quiniela: eliges uno o varios números del 00 al 99 y revisas si salieron en alguna de las tres posiciones. Las modalidades exactas y los premios los define cada banca, así que confírmalo donde juegues.",
        },
        {
          nombre: "De dónde viene",
          texto: "El Bolet es una lotería de Haití, no de República Dominicana. Es muy popular allá, y es común que la gente escoja sus números a partir de sus sueños. Por el intercambio entre los dos países, mucha gente en RD también sigue sus resultados.",
        },
        {
          nombre: "Cómo revisar los resultados",
          texto: "En la página de Haití Bolet de La Bankera RD ves el resultado de cada sorteo del día, y en el historial puedes consultar los días anteriores.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿Cuántos sorteos tiene el Haití Bolet al día?",
          respuesta:
            "Seis, todos los días: a las 9:30, 10:30 y 11:30 a.m., y a las 5:30, 6:30 y 7:30 p.m.",
        },
        {
          pregunta: "¿Cuántos números salen en cada sorteo?",
          respuesta: "Tres números de dos cifras, del 00 al 99.",
        },
        {
          pregunta: "¿El Haití Bolet es una lotería dominicana?",
          respuesta:
            "No. Es una lotería de Haití, pero muchas personas en República Dominicana siguen sus resultados, por eso los publicamos.",
        },
        {
          pregunta: "¿Dónde puedo ver los resultados de días anteriores?",
          respuesta:
            "En el historial de Haití Bolet de La Bankera RD, que muestra los resultados de cada día.",
        },
      ]}
    />
  );
}
