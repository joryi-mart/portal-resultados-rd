import GuiaJuegos from "../GuiaJuegos";

const GUIAS_ENTRETENIMIENTO = [
  { href: "/como-leer-calificaciones-de-peliculas", titulo: "Cómo leer las calificaciones de películas y series" },
  { href: "/clasificacion-de-videojuegos-esrb", titulo: "Qué significan las clasificaciones de los videojuegos" },
  { href: "/cine", titulo: "Cine: estrenos y películas" },
  { href: "/series", titulo: "Series" },
];

export const metadata = {
  title: "Cómo Leer las Calificaciones de Películas y Series: IMDb, Rotten Tomatoes y Metacritic",
  description:
    "Qué significan las calificaciones de IMDb, el Tomatometer de Rotten Tomatoes y el Metascore de Metacritic, cómo se calcula cada una y cuál conviene mirar.",
  openGraph: {
    title: "Cómo Leer las Calificaciones de Películas y Series",
    description: "IMDb, Rotten Tomatoes y Metacritic: qué mide cada una y cómo interpretarlas.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/como-leer-calificaciones-de-peliculas" },
};

export default function ComoLeerCalificacionesPage() {
  return (
    <GuiaJuegos
      hrefActual="/como-leer-calificaciones-de-peliculas"
      titulo="Cómo leer las calificaciones de películas y series"
      subtitulo="IMDb, Rotten Tomatoes y Metacritic: qué mide cada una."
      descripcion="Qué significan las calificaciones de IMDb, Rotten Tomatoes y Metacritic."
      aviso="Guía informativa no oficial de cine y series"
      icono="🎬"
      mostrarComoJugar={false}
      tituloGuias="Más sobre entretenimiento"
      guiasRelacionadas={GUIAS_ENTRETENIMIENTO}
      botones={[
        { href: "/cine", texto: "Ver cine" },
        { href: "/series", texto: "Ver series" },
      ]}
      introduccion="Cuando buscas una película o una serie, casi siempre te encuentras con tres calificaciones distintas: IMDb, Rotten Tomatoes y Metacritic. Parecen lo mismo, pero miden cosas diferentes, y por eso a veces dan resultados muy distintos para la misma película."
      encabezadoJuegos="Qué mide cada una"
      juegos={[
        {
          nombre: "IMDb (nota del público, de 1 a 10)",
          texto: "Es un promedio de las votaciones de los usuarios, en una escala del 1 al 10. No es un promedio simple: usa un cálculo ponderado para reducir el efecto de votos manipulados. Refleja lo que piensa el público general.",
        },
        {
          nombre: "Rotten Tomatoes: el Tomatometer (porcentaje de críticas positivas)",
          texto: "Cuenta qué porcentaje de los críticos dio una opinión favorable. Cada crítica se marca como \"fresca\" (positiva) o \"podrida\" (negativa). Un 60% o más se considera fresco. Ojo: mide cuántos críticos la aprobaron, no qué tan buena la consideraron. Una película que a todos les pareció \"decente\" puede sacar un porcentaje muy alto. Además, Rotten Tomatoes tiene una puntuación aparte para el público.",
        },
        {
          nombre: "Metacritic: el Metascore (0 a 100)",
          texto: "Convierte la crítica de cada publicación a una nota de 0 a 100 y calcula un promedio ponderado, es decir, no todas las críticas pesan igual. A diferencia del Tomatometer, sí toma en cuenta qué tan alta fue cada nota, no solo si fue positiva o negativa.",
        },
        {
          nombre: "Entonces, ¿cuál mirar?",
          texto: "Ninguna es perfecta. Si quieres saber qué opina el público, mira IMDb. Si quieres saber qué proporción de críticos la recomienda, el Tomatometer. Si quieres una nota que refleje mejor qué tan buena la consideran los críticos, el Metascore. Lo más útil es comparar las tres y leer alguna reseña.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿Qué significa el porcentaje de Rotten Tomatoes?",
          respuesta:
            "Es el porcentaje de críticos que dieron una opinión positiva. No es la nota de la película: un 90% significa que 9 de cada 10 críticos la recomendaron.",
        },
        {
          pregunta: "¿Cuál es la diferencia entre IMDb y Metacritic?",
          respuesta:
            "IMDb refleja la nota que le pone el público (del 1 al 10), mientras que el Metascore es un promedio de las notas de los críticos profesionales (de 0 a 100).",
        },
        {
          pregunta: "¿Por qué una película puede tener nota alta en un sitio y baja en otro?",
          respuesta:
            "Porque cada sitio mide algo distinto: el público y los críticos no siempre coinciden, y cada calificación se calcula de una forma diferente.",
        },
      ]}
      notaFinal="Esta guía es informativa y no oficial. Los sitios de calificaciones pueden cambiar su forma de calcular los puntajes: consulta cada sitio para más detalles."
    />
  );
}
