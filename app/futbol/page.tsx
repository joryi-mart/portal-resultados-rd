import FutbolCliente from "./FutbolCliente";

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

export default function FutbolPage() {
  return <FutbolCliente />;
}
