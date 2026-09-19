import GuiaJuegos from "../GuiaJuegos";

const GUIAS_DEPORTES = [
  { href: "/como-funciona-la-nba", titulo: "Cómo funciona la NBA" },
  { href: "/como-funcionan-los-torneos-de-futbol", titulo: "Cómo funcionan los torneos de fútbol más seguidos" },
  { href: "/reglas-basicas-del-beisbol", titulo: "Reglas básicas del béisbol" },
  { href: "/como-funciona-la-lidom", titulo: "Cómo funciona la LIDOM" },
];

export const metadata = {
  title: "Cómo Funcionan los Torneos de Fútbol: Ligas, Champions League y Mundial",
  description:
    "Explicación sencilla de cómo funcionan las ligas de fútbol, la Champions League y el Mundial de 48 selecciones: puntos, fases, clasificación y eliminatorias.",
  openGraph: {
    title: "Cómo Funcionan los Torneos de Fútbol",
    description: "Ligas, Champions League y Mundial, explicados fácil.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/como-funcionan-los-torneos-de-futbol" },
};

export default function ComoFuncionanLosTorneosDeFutbolPage() {
  return (
    <GuiaJuegos
      hrefActual="/como-funcionan-los-torneos-de-futbol"
      titulo="Cómo funcionan los torneos de fútbol más seguidos"
      subtitulo="Ligas, Champions League y Mundial, explicados fácil."
      descripcion="Cómo funcionan las ligas de fútbol, la Champions League y el Mundial."
      aviso="Guía informativa no oficial de fútbol"
      icono="⚽"
      mostrarComoJugar={false}
      tituloGuias="Más guías de deportes"
      guiasRelacionadas={GUIAS_DEPORTES}
      botones={[{ href: "/futbol", texto: "Ver el fútbol hoy" }]}
      introduccion="Cada torneo de fútbol funciona de una manera distinta: en unos gana el que más puntos suma, y en otros se eliminan los equipos hasta quedar uno. Aquí te explicamos los formatos de los torneos más seguidos."
      encabezadoJuegos="Los formatos"
      juegos={[
        {
          nombre: "Lo básico de un partido",
          texto: "Cada equipo juega con 11 jugadores. Un partido tiene dos tiempos de 45 minutos, más el tiempo añadido que decide el árbitro. En las ligas, ganar da 3 puntos, empatar da 1 y perder no da puntos.",
        },
        {
          nombre: "Las ligas nacionales (LaLiga, Premier League, etc.)",
          texto: "Todos los equipos se enfrentan entre sí, en partidos de ida y vuelta (uno en cada estadio). Al final, el equipo con más puntos es el campeón. En muchas ligas, los mejores clasifican a torneos internacionales y los últimos descienden a una división inferior.",
        },
        {
          nombre: "La Champions League",
          texto: "Desde la temporada 2024-25 participan 36 equipos en una sola tabla, llamada fase de liga. Cada uno juega 8 partidos contra 8 rivales distintos. Los 8 primeros pasan directo a los octavos de final; los puestos del 9 al 24 juegan una ronda de desempate a ida y vuelta; y del 25 en adelante quedan eliminados. Después siguen los octavos, cuartos, semifinales y la final.",
        },
        {
          nombre: "El Mundial",
          texto: "El Mundial de 2026 fue el primero con 48 selecciones y 104 partidos. Se dividieron en 12 grupos de cuatro equipos. Pasaron a la fase eliminatoria los dos primeros de cada grupo y los ocho mejores terceros. Luego vinieron cinco rondas de eliminación directa: dieciseisavos, octavos, cuartos, semifinales y final.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿Cuántos puntos da ganar un partido en una liga de fútbol?",
          respuesta: "Tres puntos por victoria, uno por empate y ninguno por derrota.",
        },
        {
          pregunta: "¿Cuántos equipos tiene la Champions League?",
          respuesta: "36 equipos en la fase de liga, desde la temporada 2024-25.",
        },
        {
          pregunta: "¿Cuántas selecciones jugaron el Mundial 2026?",
          respuesta: "48 selecciones, en 12 grupos de cuatro equipos.",
        },
        {
          pregunta: "¿Cuánto dura un partido de fútbol?",
          respuesta: "Dos tiempos de 45 minutos, más el tiempo añadido que marca el árbitro.",
        },
      ]}
      notaFinal="Esta guía es informativa y no oficial. Los formatos de los torneos pueden cambiar de una temporada a otra: consulta los canales oficiales de cada competencia para la información vigente."
    />
  );
}
