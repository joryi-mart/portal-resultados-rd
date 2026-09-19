import GuiaJuegos from "../GuiaJuegos";

const GUIAS_LIDOM = [
  { href: "/como-funciona-la-lidom", titulo: "Cómo funciona la LIDOM" },
  { href: "/equipos-de-la-lidom", titulo: "Los 6 equipos de la LIDOM" },
  { href: "/reglas-basicas-del-beisbol", titulo: "Reglas básicas del béisbol" },
  { href: "/lidom", titulo: "LIDOM hoy: equipos y noticias" },
];

export const metadata = {
  title: "Cómo Funciona la LIDOM: Temporada, Round Robin, Serie Final y Serie del Caribe",
  description:
    "Explicación sencilla de la LIDOM (béisbol invernal dominicano): cuántos equipos hay, cuántos juegos se juegan, cómo funciona el round robin y cómo se llega a la Serie del Caribe.",
  openGraph: {
    title: "Cómo Funciona la LIDOM",
    description: "Serie regular, round robin, serie final y Serie del Caribe, explicados paso a paso.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/como-funciona-la-lidom" },
};

export default function ComoFuncionaLaLidomPage() {
  return (
    <GuiaJuegos
      hrefActual="/como-funciona-la-lidom"
      titulo="Cómo funciona la LIDOM: del primer juego a la Serie del Caribe"
      subtitulo="La Liga de Béisbol Profesional de la República Dominicana, explicada paso a paso."
      descripcion="Cómo funciona la LIDOM: serie regular, round robin, serie final y Serie del Caribe."
      aviso="Página informativa no oficial de la LIDOM"
      icono="⚾"
      mostrarComoJugar={false}
      tituloGuias="Más sobre la LIDOM"
      guiasRelacionadas={GUIAS_LIDOM}
      botones={[
        { href: "/lidom", texto: "Ver la LIDOM hoy" },
        { href: "/equipos-de-la-lidom", texto: "Los 6 equipos" },
      ]}
      introduccion="La LIDOM es el torneo de béisbol invernal de República Dominicana: se juega en los meses de invierno, cuando terminan las Grandes Ligas, y es una de las ligas más seguidas del Caribe. El torneo tiene varias etapas, y aquí te explicamos cómo funcionan desde el primer juego hasta la final."
      encabezadoJuegos="Las etapas del torneo"
      juegos={[
        {
          nombre: "1. Los 6 equipos",
          texto: "Participan seis equipos: Tigres del Licey, Leones del Escogido, Águilas Cibaeñas, Estrellas Orientales, Toros del Este y Gigantes del Cibao.",
        },
        {
          nombre: "2. La serie regular",
          texto: "Cada equipo juega 50 juegos: diez veces contra cada uno de sus cinco rivales, cinco de local y cinco de visitante. Al terminar, los cuatro equipos con más victorias avanzan a la siguiente etapa y los otros dos quedan eliminados.",
        },
        {
          nombre: "3. El round robin",
          texto: "Los cuatro clasificados se enfrentan todos contra todos: seis veces contra cada uno de los otros tres equipos, para un total de 18 juegos por equipo. Los dos que terminan con mejor récord pasan a la final.",
        },
        {
          nombre: "4. La serie final",
          texto: "Los dos mejores equipos del round robin se enfrentan en una serie por el campeonato. En las últimas temporadas se ha jugado al mejor de siete juegos (antes era al mejor de nueve, y se acortó por los aplazamientos por lluvia). El formato puede ajustarse de una temporada a otra.",
        },
        {
          nombre: "5. El campeón y la Serie del Caribe",
          texto: "El ganador de la serie final es el campeón de la LIDOM y representa a República Dominicana en la Serie del Caribe, el torneo donde se enfrentan los campeones de las ligas invernales de varios países del Caribe, a comienzos del año siguiente.",
        },
        {
          nombre: "¿Cuándo se juega?",
          texto: "La temporada va aproximadamente de octubre a enero. Por ejemplo, la de 2024-25 comenzó el 16 de octubre y terminó a finales de diciembre. Las fechas exactas cambian cada año.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿Cuántos equipos tiene la LIDOM?",
          respuesta: "Seis: Licey, Escogido, Águilas Cibaeñas, Estrellas Orientales, Toros del Este y Gigantes del Cibao.",
        },
        {
          pregunta: "¿Cuántos juegos juega cada equipo en la serie regular?",
          respuesta: "50 juegos: diez contra cada rival, cinco de local y cinco de visitante.",
        },
        {
          pregunta: "¿Cuántos equipos pasan al round robin?",
          respuesta: "Los cuatro con más victorias en la serie regular. Después del round robin, los dos mejores juegan la final.",
        },
        {
          pregunta: "¿Quién va a la Serie del Caribe?",
          respuesta: "El campeón de la LIDOM, es decir, el ganador de la serie final.",
        },
      ]}
      notaFinal="Esta guía es informativa y no oficial. El calendario y el formato del torneo los define la LIDOM y pueden cambiar de una temporada a otra: consulta los canales oficiales de la liga para la información vigente."
    />
  );
}
