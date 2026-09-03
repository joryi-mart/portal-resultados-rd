import PicheoCliente from "./PicheoCliente";

export const metadata = {
  title: "Hoja de Picheo MLB: Pícheres Probables de Hoy",
  description:
    "Consulta los pícheres probables de cada juego de la MLB para hoy, con sus estadísticas de la temporada actual.",
  openGraph: {
    title: "Hoja de Picheo MLB: Pícheres Probables de Hoy",
    description: "Pícheres probables de cada juego de la MLB para hoy, con sus estadísticas de temporada.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/beisbol/picheo" },
};

export default function PicheoPage() {
  return <PicheoCliente />;
}
