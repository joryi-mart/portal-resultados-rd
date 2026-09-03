import NBACliente from "./NBACliente";

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

export default function NBAPage() {
  return <NBACliente />;
}
