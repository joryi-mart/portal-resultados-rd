import FutbolCliente from "./FutbolCliente";
import NoticiasDeporte from "../NoticiasDeporte";
import { obtenerNoticiasFutbol } from "@/lib/noticiasDeportes";

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
    </>
  );
}
