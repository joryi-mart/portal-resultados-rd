import CineCliente from "./CineCliente";

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

export default function CinePage() {
  return <CineCliente />;
}
