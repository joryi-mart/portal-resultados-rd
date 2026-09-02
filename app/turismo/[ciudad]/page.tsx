import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import NavPildoras from "../../NavPildoras";
import { CIUDADES } from "../datos";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
const COLOR_VERDE_RD = "#007A33";

type LugarCercano = { xid: string; nombre: string; categoria: string; distanciaKm: number };

const CATEGORIAS_LEGIBLES: Record<string, string> = {
  beaches: "Playa",
  natural: "Naturaleza",
  water: "Cuerpo de agua",
  islands: "Isla",
  historic: "Sitio histórico",
  architecture: "Arquitectura",
  museums: "Museo",
  religion: "Sitio religioso",
  cultural: "Cultural",
  urban_environment: "Zona urbana",
  interesting_places: "Punto de interés",
  tourist_facilities: "Instalación turística",
  amusements: "Entretenimiento",
  sport: "Deporte",
  foods: "Gastronomía",
  fortifications: "Fortaleza",
  parks: "Parque",
};

function categoriaLegible(kinds: string): string {
  const lista = kinds.split(",");
  for (const k of lista) {
    if (CATEGORIAS_LEGIBLES[k]) return CATEGORIAS_LEGIBLES[k];
  }
  return "Punto de interés";
}

async function buscarLugaresCercanos(lat: number, lon: number): Promise<LugarCercano[]> {
  const apiKey = process.env.OPENTRIPMAP_API_KEY;
  if (!apiKey) return [];

  try {
    const url =
      `https://api.opentripmap.com/0.1/es/places/radius?radius=25000&lon=${lon}&lat=${lat}` +
      `&rate=3&format=json&limit=12&apikey=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
      .filter(function (p: any) { return p.name && p.name.trim().length > 0; })
      .map(function (p: any) {
        return {
          xid: p.xid,
          nombre: p.name,
          categoria: categoriaLegible(p.kinds || ""),
          distanciaKm: Math.round((p.dist || 0) / 100) / 10,
        };
      })
      .slice(0, 10);
  } catch {
    return [];
  }
}

export function generateStaticParams() {
  return CIUDADES.map(function (c) { return { ciudad: c.slug }; });
}

export async function generateMetadata(props: { params: Promise<{ ciudad: string }> }) {
  const params = await props.params;
  const ciudad = CIUDADES.find(function (c) { return c.slug === params.ciudad; });
  if (!ciudad) return { title: "Destino no encontrado" };

  const titulo = `Qué hacer en ${ciudad.nombre}, República Dominicana`;
  return {
    title: titulo,
    description: ciudad.resumen,
    openGraph: { title: `${titulo} | La Bankera RD`, description: ciudad.resumen, locale: "es_DO", type: "website" },
    alternates: { canonical: `https://labankerard.com/turismo/${params.ciudad}` },
  };
}

export default async function CiudadTurismoPage(props: { params: Promise<{ ciudad: string }> }) {
  const params = await props.params;
  const ciudad = CIUDADES.find(function (c) { return c.slug === params.ciudad; });
  if (!ciudad) notFound();

  const lugaresCercanos = await buscarLugaresCercanos(ciudad.lat, ciudad.lon);

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <a href="/turismo" className="font-mono text-sm text-[#E7A63C] hover:underline">← Ver todos los destinos</a>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            {ciudad.nombre}
          </h1>
          <p className="mt-2 text-sm text-[#D5DEEA]">{ciudad.resumen}</p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
        <p className="mb-8 text-base leading-relaxed">{ciudad.descripcion}</p>

        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">
          Qué ver y hacer
        </h2>
        <div className="rounded-xl border border-[#10203A]/15 bg-white">
          {ciudad.atracciones.map(function (a, i) {
            return (
              <div key={i} className="flex items-start gap-3 border-t border-[#10203A]/8 px-5 py-4 first:border-t-0">
                <span className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 font-mono text-xs font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed">{a}</p>
              </div>
            );
          })}
        </div>

        {lugaresCercanos.length > 0 ? (
          <>
            <h2 className="mb-4 mt-10 font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">
              Más lugares cerca de {ciudad.nombre}
            </h2>
            <div className="rounded-xl border border-[#10203A]/15 bg-white">
              {lugaresCercanos.map(function (l) {
                return (
                  <div key={l.xid} className="flex items-center justify-between gap-3 border-t border-[#10203A]/8 px-5 py-3 first:border-t-0">
                    <div>
                      <p className="text-sm font-semibold text-[#10203A]">{l.nombre}</p>
                      <p className="font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{l.categoria}</p>
                    </div>
                    <span className="shrink-0 font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                      {l.distanciaKm} km
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Datos de ubicación de <a href="https://opentripmap.com" target="_blank" rel="noopener noreferrer" className="underline">OpenTripMap</a> (OpenStreetMap / Wikidata).
            </p>
          </>
        ) : null}
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/turismo" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Ver todos los destinos</a>
        <span className="mx-2 text-[#10203A]/20">·</span>
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">Ver todas las loterías</a>
      </footer>
    </div>
  );
}
