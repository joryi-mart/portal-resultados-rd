import GuiaJuegos from "../GuiaJuegos";

const GUIAS_DEPORTES = [
  { href: "/como-funciona-la-nba", titulo: "Cómo funciona la NBA" },
  { href: "/como-funcionan-los-torneos-de-futbol", titulo: "Cómo funcionan los torneos de fútbol más seguidos" },
  { href: "/reglas-basicas-del-beisbol", titulo: "Reglas básicas del béisbol" },
  { href: "/como-funciona-la-lidom", titulo: "Cómo funciona la LIDOM" },
];

export const metadata = {
  title: "Cómo Funciona la NBA: Temporada Regular, Play-In, Playoffs y Draft",
  description:
    "Explicación sencilla de cómo funciona la NBA: cuántos equipos y juegos hay, qué es el play-in, cómo son los playoffs y cómo funciona el draft y su lotería.",
  openGraph: {
    title: "Cómo Funciona la NBA",
    description: "Temporada regular, play-in, playoffs y draft de la NBA, explicados fácil.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/como-funciona-la-nba" },
};

export default function ComoFuncionaLaNBAPage() {
  return (
    <GuiaJuegos
      hrefActual="/como-funciona-la-nba"
      titulo="Cómo funciona la NBA: de la temporada regular a las Finales"
      subtitulo="Temporada regular, play-in, playoffs y draft, explicados fácil."
      descripcion="Cómo funciona la NBA: temporada regular, play-in, playoffs y draft."
      aviso="Guía informativa no oficial de baloncesto"
      icono="🏀"
      mostrarComoJugar={false}
      tituloGuias="Más guías de deportes"
      guiasRelacionadas={GUIAS_DEPORTES}
      botones={[{ href: "/nba", texto: "Ver la NBA hoy" }]}
      introduccion="La NBA es la liga de baloncesto más importante del mundo, y su forma de definir al campeón tiene varias etapas. Aquí te explicamos cada una, de la primera semana de la temporada hasta las Finales."
      encabezadoJuegos="Las etapas de la temporada"
      juegos={[
        {
          nombre: "Los equipos",
          texto: "Participan 30 equipos, divididos en dos conferencias de 15: la Este y la Oeste.",
        },
        {
          nombre: "La temporada regular",
          texto: "Cada equipo juega 82 juegos, aproximadamente de octubre a abril. Al final, se ordenan los equipos de cada conferencia por su récord de victorias y derrotas.",
        },
        {
          nombre: "La NBA Cup",
          texto: "Desde 2023 hay también un torneo corto de mitad de temporada, la NBA Cup, que se juega entre finales de octubre y diciembre. Parte de sus partidos cuenta para la temporada regular.",
        },
        {
          nombre: "El play-in",
          texto: "Los equipos que terminan del puesto 1 al 6 de cada conferencia clasifican directo a los playoffs. Los que terminan del 7 al 10 juegan un mini torneo, el play-in, para definir los dos últimos puestos (el 7 y el 8) de cada conferencia. Los dos equipos que pierden en el play-in quedan eliminados.",
        },
        {
          nombre: "Los playoffs",
          texto: "Clasifican 16 equipos, 8 por conferencia. Todas las series son al mejor de siete juegos: gana la serie el primero que consiga cuatro victorias. Hay cuatro rondas, hasta que el campeón del Este y el campeón del Oeste se enfrentan en las Finales de la NBA.",
        },
        {
          nombre: "El draft y la lotería",
          texto: "El draft es el evento donde los equipos escogen a los nuevos jugadores, en dos rondas. Los 14 equipos que no llegan a los playoffs entran en una lotería de bolas que decide el orden de la selección: los equipos con peor récord tienen más probabilidad de conseguir las mejores posiciones.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿Cuántos equipos tiene la NBA?",
          respuesta: "Treinta, quince en la Conferencia Este y quince en la Oeste.",
        },
        {
          pregunta: "¿Cuántos juegos tiene la temporada regular?",
          respuesta: "82 juegos por equipo.",
        },
        {
          pregunta: "¿Cuántos equipos llegan a los playoffs?",
          respuesta: "16: ocho de cada conferencia, después del play-in.",
        },
        {
          pregunta: "¿Qué es el play-in?",
          respuesta:
            "Es un mini torneo entre los equipos que terminan del puesto 7 al 10 de cada conferencia, para decidir quiénes ocupan los dos últimos lugares de los playoffs.",
        },
        {
          pregunta: "¿Cómo funcionan las series de playoffs?",
          respuesta: "Son al mejor de siete juegos: gana el primer equipo que consiga cuatro victorias.",
        },
      ]}
      notaFinal="Esta guía es informativa y no oficial. El formato de la liga puede cambiar de una temporada a otra: consulta los canales oficiales de la NBA para la información vigente."
    />
  );
}
