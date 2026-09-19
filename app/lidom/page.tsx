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
  return (
    <>
      <LidomCliente />
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
    </>
  );
}
