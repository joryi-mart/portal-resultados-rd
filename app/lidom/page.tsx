import LidomCliente from "./LidomCliente";
import VideoDelDia from "../VideoDelDia";
import { obtenerDatosLidom, type DatosLidom } from "@/lib/lidom";

// "LIDOM hoy" es lo que la gente busca: juegos del dia con su marcador y la
// tabla de posiciones, por eso van en el titulo.
export const metadata = {
  title: "LIDOM Hoy: Juegos, Resultados y Tabla de Posiciones",
  description:
    "Juegos de hoy de la LIDOM con su resultado, tabla de posiciones actualizada y noticias del Licey, Águilas, Escogido, Estrellas, Toros y Gigantes.",
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "LIDOM Hoy: Juegos, Resultados y Tabla de Posiciones",
    description: "Juegos de hoy de la LIDOM con su resultado, tabla de posiciones y noticias.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/lidom" },
};

// Se rehace cada 5 minutos: los juegos de hoy cambian de "por jugar" a "en
// juego" y a "final".
export const revalidate = 300;

export default async function LidomPage() {
  let datos: DatosLidom | null = null;
  try {
    datos = await obtenerDatosLidom();
  } catch {
    datos = null;
  }
  return (
    <main>
      <LidomCliente datos={datos} />
      <VideoDelDia slug="lidom" titulo="Resumen narrado de ayer en LIDOM" />
      <div className="bg-[#FBF7EE] px-4 pb-10 sm:px-8">
        <div className="mx-auto max-w-6xl border-t border-[#10203A]/10 pt-6">
          <p className="mb-2 text-sm font-bold text-[#10203A]">Guías de la LIDOM</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a href="/como-funciona-la-lidom" className="underline" style={{ color: "#1E4D8C" }}>
              Cómo funciona la LIDOM
            </a>
            <a href="/equipos-de-la-lidom" className="underline" style={{ color: "#1E4D8C" }}>
              Los 6 equipos de la LIDOM
            </a>
            <a href="/reglas-basicas-del-beisbol" className="underline" style={{ color: "#1E4D8C" }}>
              Reglas básicas del béisbol
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
