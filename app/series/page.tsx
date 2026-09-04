import SeriesCliente from "./SeriesCliente";

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

export default function SeriesPage() {
  return <SeriesCliente />;
}
