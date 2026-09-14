import SeriesCliente from "./SeriesCliente";
import NoticiasDeporte from "../NoticiasDeporte";
import PreguntasFrecuentes from "../PreguntasFrecuentes";
import { obtenerNoticiasSeries } from "@/lib/noticiasEntretenimiento";

export const revalidate = 900;

export const metadata = {
  title: "Series Más Vistas: Netflix, HBO y Estrenos",
  description:
    "Las series más populares y comentadas del momento en Netflix, HBO, Prime Video y Disney+: estrenos, nuevas temporadas y noticias.",
  openGraph: {
    title: "Series Más Vistas: Netflix, HBO y Estrenos",
    description: "Las series más populares del momento y sus últimas noticias.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/series" },
};

const PREGUNTAS_SERIES = [
  {
    pregunta: "¿Qué plataformas cubre esta página?",
    respuesta: "Netflix, HBO, Prime Video y Disney+, con estrenos y noticias de nuevas temporadas.",
  },
  {
    pregunta: "¿Con qué frecuencia se actualiza?",
    respuesta: "Esta página se actualiza automáticamente cada pocos minutos con lo más reciente.",
  },
];

export default async function SeriesPage() {
  let noticias: any[] = [];
  try {
    const resultado = await obtenerNoticiasSeries();
    noticias = resultado.news || [];
  } catch {
    noticias = [];
  }

  return (
    <>
      <SeriesCliente />
      <NoticiasDeporte titulo="Series" noticias={noticias} />
      <PreguntasFrecuentes preguntas={PREGUNTAS_SERIES} />
    </>
  );
}
