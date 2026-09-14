import CineCliente from "./CineCliente";
import PreguntasFrecuentes from "../PreguntasFrecuentes";

export const metadata = {
  title: "Cartelera de Cine: Estrenos y Películas Populares",
  description:
    "Qué películas están en cartelera, los próximos estrenos y las más populares del momento, con sinopsis, calificación y fecha de estreno actualizadas.",
  openGraph: {
    title: "Cartelera de Cine: Estrenos y Películas Populares",
    description: "Películas en cartelera, próximos estrenos y las más populares, con sinopsis y calificación.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/cine" },
};

const PREGUNTAS_CINE = [
  {
    pregunta: "¿Tienen horarios de cines dominicanos?",
    respuesta:
      "Todavía no — por ahora esta página muestra afiches, sinopsis y calificación de películas en cartelera, próximos estrenos y populares.",
  },
  {
    pregunta: "¿Con qué frecuencia se actualiza la cartelera?",
    respuesta: "Se actualiza automáticamente varias veces al día.",
  },
];

export default function CinePage() {
  return (
    <>
      <CineCliente />
      <PreguntasFrecuentes preguntas={PREGUNTAS_CINE} />
    </>
  );
}
