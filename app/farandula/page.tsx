import FarandulaCliente from "./FarandulaCliente";
import NoticiasDeporte from "../NoticiasDeporte";
import PreguntasFrecuentes from "../PreguntasFrecuentes";
import { obtenerNoticiasFarandula } from "@/lib/noticiasEntretenimiento";

export const revalidate = 900;

export const metadata = {
  title: "Farándula Dominicana y Dembow: Últimas Noticias",
  description:
    "Últimas noticias de la farándula dominicana: artistas, dembow, música urbana y entretenimiento de República Dominicana.",
  openGraph: {
    title: "Farándula Dominicana y Dembow: Últimas Noticias",
    description: "Noticias de farándula dominicana, dembow y música urbana.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/farandula" },
};

const PREGUNTAS_FARANDULA = [
  {
    pregunta: "¿Dónde sacan las noticias de farándula dominicana?",
    respuesta:
      "De Luminarias TV y otras fuentes dedicadas a la farándula y el dembow dominicano, actualizadas varias veces al día.",
  },
  {
    pregunta: "¿Con qué frecuencia se actualizan las noticias?",
    respuesta: "Esta página se actualiza automáticamente cada pocos minutos con lo más reciente.",
  },
];

export default async function FarandulaPage() {
  let noticias: any[] = [];
  try {
    const resultado = await obtenerNoticiasFarandula();
    noticias = resultado.news || [];
  } catch {
    noticias = [];
  }

  return (
    <>
      <FarandulaCliente />
      <NoticiasDeporte titulo="Farándula" noticias={noticias} />
      <PreguntasFrecuentes preguntas={PREGUNTAS_FARANDULA} />
    </>
  );
}
