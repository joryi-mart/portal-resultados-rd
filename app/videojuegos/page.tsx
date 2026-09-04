import VideojuegosCliente from "./VideojuegosCliente";

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

export default function VideojuegosPage() {
  return <VideojuegosCliente />;
}
