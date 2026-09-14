import BeisbolCliente from "./BeisbolCliente";
import NoticiasDeporte from "../NoticiasDeporte";
import { obtenerNoticiasMLB } from "@/lib/noticiasDeportes";

export const revalidate = 900;

export const metadata = {
  title: "Béisbol y MLB Hoy: Resultados, Marcadores y Dominicanos en las Grandes Ligas",
  description:
    "Resultados en vivo de la MLB: marcadores de hoy y de ayer, pícher ganador de cada juego, jugador destacado, y el rendimiento de los peloteros dominicanos en las Grandes Ligas.",
  openGraph: {
    title: "Béisbol y MLB Hoy: Resultados y Dominicanos en las Grandes Ligas",
    description: "Marcadores en vivo de la MLB, pícher ganador de cada juego y peloteros dominicanos.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/beisbol" },
};

export default async function BeisbolPage() {
  let noticias: any[] = [];
  try {
    const resultado = await obtenerNoticiasMLB();
    noticias = resultado.news || [];
  } catch {
    noticias = [];
  }

  return (
    <>
      <BeisbolCliente />
      <NoticiasDeporte titulo="Béisbol y MLB" noticias={noticias} />
    </>
  );
}
