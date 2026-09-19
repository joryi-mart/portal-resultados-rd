import GuiaJuegos from "../GuiaJuegos";

const GUIAS_ENTRETENIMIENTO = [
  { href: "/como-leer-calificaciones-de-peliculas", titulo: "Cómo leer las calificaciones de películas y series" },
  { href: "/clasificacion-de-videojuegos-esrb", titulo: "Qué significan las clasificaciones de los videojuegos" },
  { href: "/cine", titulo: "Cine: estrenos y películas" },
  { href: "/videojuegos", titulo: "Videojuegos" },
];

export const metadata = {
  title: "Qué Significan las Clasificaciones de los Videojuegos (ESRB): E, E10+, T, M y AO",
  description:
    "Guía para padres y jugadores: qué significan las letras E, E10+, T, M y AO que aparecen en las cajas de los videojuegos y cómo usarlas para escoger juegos adecuados.",
  openGraph: {
    title: "Qué Significan las Clasificaciones de los Videojuegos (ESRB)",
    description: "E, E10+, T, M y AO: qué edad recomienda cada clasificación.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/clasificacion-de-videojuegos-esrb" },
};

export default function ClasificacionVideojuegosPage() {
  return (
    <GuiaJuegos
      hrefActual="/clasificacion-de-videojuegos-esrb"
      titulo="Qué significan las clasificaciones de los videojuegos (ESRB)"
      subtitulo="E, E10+, T, M y AO: qué edad recomienda cada una."
      descripcion="Qué significan las clasificaciones ESRB de los videojuegos."
      aviso="Guía informativa no oficial de videojuegos"
      icono="🎮"
      mostrarComoJugar={false}
      tituloGuias="Más sobre entretenimiento"
      guiasRelacionadas={GUIAS_ENTRETENIMIENTO}
      botones={[{ href: "/videojuegos", texto: "Ver videojuegos" }]}
      introduccion="Si compras videojuegos para tus hijos, o simplemente quieres saber qué tan fuerte es un juego, fíjate en la letra que aparece en la caja o en la tienda digital. Es la clasificación de la ESRB, el sistema que se usa en Estados Unidos y Canadá, y sirve como guía de qué edad es apropiada para cada juego."
      encabezadoJuegos="Las clasificaciones"
      juegos={[
        {
          nombre: "E (Everyone / Para todos)",
          texto: "Contenido que puede ser apropiado para todas las edades. Puede tener violencia caricaturesca o de fantasía leve y, de vez en cuando, lenguaje suave.",
        },
        {
          nombre: "E10+ (Todos, de 10 años en adelante)",
          texto: "Apropiado para mayores de 10 años. Puede tener un poco más de violencia caricaturesca o de fantasía, lenguaje leve o temas ligeramente sugestivos.",
        },
        {
          nombre: "T (Teen / Adolescentes)",
          texto: "Pensado para mayores de 13 años. Puede incluir humor crudo, sangre, temas sugestivos, lenguaje fuerte y más violencia que un juego E10+.",
        },
        {
          nombre: "M (Mature 17+ / Maduro)",
          texto: "Pensado para mayores de 17 años. Tiene contenido más intenso que los juegos para adolescentes.",
        },
        {
          nombre: "AO (Adults Only 18+ / Solo adultos)",
          texto: "Solo para mayores de 18 años. Puede incluir escenas prolongadas de violencia intensa, contenido sexual explícito o apuestas con dinero real.",
        },
        {
          nombre: "RP (Rating Pending / Clasificación pendiente)",
          texto: "Aparece en la publicidad de un juego que todavía no tiene su clasificación final.",
        },
        {
          nombre: "Los descriptores de contenido",
          texto: "Junto a la letra suele aparecer una lista de descriptores (violencia, sangre, lenguaje, contenido sexual, sustancias, etc.) que explican por qué el juego recibió esa clasificación. Leerlos ayuda más que fijarse solo en la letra.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿Qué significa la M en un videojuego?",
          respuesta: "Mature 17+: está pensado para mayores de 17 años y tiene contenido más intenso que los juegos para adolescentes.",
        },
        {
          pregunta: "¿A partir de qué edad es un juego T?",
          respuesta: "Los juegos con clasificación T (Teen) están pensados para mayores de 13 años.",
        },
        {
          pregunta: "¿Qué es la ESRB?",
          respuesta:
            "Es el sistema de clasificación de videojuegos que se usa en Estados Unidos y Canadá. En Europa se usa otro sistema, llamado PEGI.",
        },
        {
          pregunta: "¿Las clasificaciones son una ley?",
          respuesta:
            "No, son una guía. Los padres y tutores deben revisar el juego y decidir si es apropiado para sus hijos.",
        },
      ]}
      notaFinal="Esta guía es informativa y no oficial. Las clasificaciones son una orientación general: consulta el sitio oficial de la ESRB para la información vigente."
    />
  );
}
