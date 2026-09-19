import BeisbolCliente from "./BeisbolCliente";
import NoticiasDeporte from "../NoticiasDeporte";
import PreguntasFrecuentes from "../PreguntasFrecuentes";
import { obtenerNoticiasMLB } from "@/lib/noticiasDeportes";

const PREGUNTAS_BEISBOL = [
  {
    pregunta: "¿Cómo sé qué pasó ayer en la MLB?",
    respuesta:
      "Usa el botón \"Ayer\" arriba para ver los resultados del día anterior, con el marcador final y el pícher ganador de cada juego.",
  },
  {
    pregunta: "¿Dónde veo el picheo del día?",
    respuesta:
      "Toca \"Ver picheo del día\" para consultar los lanzadores probables de cada juego de hoy en la MLB.",
  },
  {
    pregunta: "¿Cómo van los peloteros dominicanos en las Grandes Ligas?",
    respuesta:
      "Más abajo en esta página puedes ver el desempeño reciente de los jugadores dominicanos activos en la MLB.",
  },
];

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
      <PreguntasFrecuentes preguntas={PREGUNTAS_BEISBOL} />
      <div className="bg-[#FBF7EE] px-4 pb-10 sm:px-8">
        <div className="mx-auto max-w-6xl border-t border-[#10203A]/10 pt-6">
          <p className="mb-2 text-sm font-bold text-[#10203A]">Guías de béisbol</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a href="/reglas-basicas-del-beisbol" className="underline" style={{ color: "#1E4D8C" }}>
              Reglas básicas del béisbol
            </a>
            <a href="/como-funciona-la-lidom" className="underline" style={{ color: "#1E4D8C" }}>
              Cómo funciona la LIDOM
            </a>
            <a href="/equipos-de-la-lidom" className="underline" style={{ color: "#1E4D8C" }}>
              Los 6 equipos de la LIDOM
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
