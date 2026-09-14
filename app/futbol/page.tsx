import FutbolCliente from "./FutbolCliente";
import NoticiasDeporte from "../NoticiasDeporte";
import PreguntasFrecuentes from "../PreguntasFrecuentes";
import { obtenerNoticiasFutbol } from "@/lib/noticiasDeportes";

const PREGUNTAS_FUTBOL = [
  {
    pregunta: "¿Qué ligas puedo consultar?",
    respuesta:
      "LaLiga española, la Premier League inglesa y la Champions League, cambiando la liga con los botones de arriba.",
  },
  {
    pregunta: "¿Cómo veo los resultados de ayer?",
    respuesta:
      "Usa el botón \"Ayer\" para consultar los marcadores y goleadores de la fecha anterior.",
  },
  {
    pregunta: "¿Dónde está la tabla de posiciones?",
    respuesta: "Más abajo en esta página, organizada según la liga que hayas seleccionado.",
  },
];

export const revalidate = 900;

export const metadata = {
  title: "Fútbol Hoy: Resultados de LaLiga, Premier League y Champions League",
  description:
    "Resultados en vivo de fútbol: LaLiga española, Premier League inglesa y Champions League. Marcadores, goleadores de cada partido y tabla de posiciones.",
  openGraph: {
    title: "Fútbol Hoy: Resultados de LaLiga, Premier League y Champions League",
    description: "Marcadores en vivo, goleadores y tabla de posiciones de las principales ligas de fútbol.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/futbol" },
};

export default async function FutbolPage() {
  let noticias: any[] = [];
  try {
    noticias = await obtenerNoticiasFutbol("esp.1");
  } catch {
    noticias = [];
  }

  return (
    <>
      <FutbolCliente />
      <NoticiasDeporte titulo="Fútbol" noticias={noticias} />
      <PreguntasFrecuentes preguntas={PREGUNTAS_FUTBOL} />
    </>
  );
}
