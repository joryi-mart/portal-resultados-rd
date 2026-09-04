import LidomCliente from "./LidomCliente";

export const metadata = {
  title: "LIDOM Hoy: Equipos, Posiciones y Noticias del Béisbol Invernal Dominicano",
  description:
    "Sigue la Liga de Béisbol Profesional de la República Dominicana (LIDOM): Licey, Águilas Cibaeñas, Escogido, Estrellas Orientales, Toros del Este y Gigantes del Cibao. Posiciones y noticias.",
  openGraph: {
    title: "LIDOM Hoy: Equipos, Posiciones y Noticias",
    description: "Liga de Béisbol Profesional de la República Dominicana: equipos, posiciones y noticias.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/lidom" },
};

export default function LidomPage() {
  return <LidomCliente />;
}
