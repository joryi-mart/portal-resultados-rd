import VideojuegosCliente from "./VideojuegosCliente";
import NoticiasDeporte from "../NoticiasDeporte";
import PreguntasFrecuentes from "../PreguntasFrecuentes";
import { obtenerNoticiasVideojuegos } from "@/lib/noticiasEntretenimiento";

export const revalidate = 900;

export const metadata = {
  title: "Noticias de Videojuegos: Consolas, Lanzamientos y Esports",
  description:
    "Últimas noticias del mundo de los videojuegos: PlayStation, Xbox, Nintendo, PC gaming, lanzamientos y esports.",
  openGraph: {
    title: "Noticias de Videojuegos: Consolas, Lanzamientos y Esports",
    description: "Últimas noticias de videojuegos, consolas y esports.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/videojuegos" },
};

const PREGUNTAS_VIDEOJUEGOS = [
  {
    pregunta: "¿Qué consolas y plataformas cubre esta página?",
    respuesta: "PlayStation, Xbox, Nintendo y PC gaming, además de noticias de esports.",
  },
  {
    pregunta: "¿Con qué frecuencia se actualiza?",
    respuesta: "Esta página se actualiza automáticamente cada pocos minutos con lo más reciente.",
  },
];

export default async function VideojuegosPage() {
  let noticias: any[] = [];
  try {
    const resultado = await obtenerNoticiasVideojuegos();
    noticias = resultado.news || [];
  } catch {
    noticias = [];
  }

  return (
    <>
      <VideojuegosCliente />
      <NoticiasDeporte titulo="Videojuegos" noticias={noticias} />
      <PreguntasFrecuentes preguntas={PREGUNTAS_VIDEOJUEGOS} />
    </>
  );
}
