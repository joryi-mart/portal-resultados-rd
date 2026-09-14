import NBACliente from "./NBACliente";
import NoticiasDeporte from "../NoticiasDeporte";
import PreguntasFrecuentes from "../PreguntasFrecuentes";
import { obtenerNoticiasBaloncesto } from "@/lib/noticiasDeportes";

const PREGUNTAS_NBA = [
  {
    pregunta: "¿Cómo veo los juegos de ayer?",
    respuesta:
      "Usa el botón \"Ayer\" arriba para consultar los resultados y el máximo anotador de cada partido.",
  },
  {
    pregunta: "¿Hay jugadores dominicanos en la NBA?",
    respuesta: "Sí, más abajo en esta página puedes ver su desempeño reciente en la liga.",
  },
  {
    pregunta: "¿Dónde está la tabla de posiciones?",
    respuesta: "Más abajo en esta página, con las posiciones actualizadas de la NBA.",
  },
];

export const revalidate = 900;

export const metadata = {
  title: "NBA Hoy: Resultados, Marcadores y Jugadores Dominicanos",
  description:
    "Resultados en vivo de la NBA: marcadores de hoy y de ayer, máximo anotador de cada partido, tabla de posiciones y los jugadores dominicanos en la NBA.",
  openGraph: {
    title: "NBA Hoy: Resultados y Jugadores Dominicanos",
    description: "Marcadores en vivo de la NBA, máximo anotador de cada partido y jugadores dominicanos.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/nba" },
};

export default async function NBAPage() {
  let noticias: any[] = [];
  try {
    noticias = await obtenerNoticiasBaloncesto();
  } catch {
    noticias = [];
  }

  return (
    <>
      <NBACliente />
      <NoticiasDeporte titulo="Baloncesto y NBA" noticias={noticias} />
      <PreguntasFrecuentes preguntas={PREGUNTAS_NBA} />
    </>
  );
}
