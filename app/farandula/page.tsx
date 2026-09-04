import FarandulaCliente from "./FarandulaCliente";

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

export default function FarandulaPage() {
  return <FarandulaCliente />;
}
