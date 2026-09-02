import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import NavPildoras from "../../NavPildoras";
import { CIUDADES } from "../datos";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
const COLOR_VERDE_RD = "#007A33";

type LugarCercano = { id: number; nombre: string; categoria: string; distanciaKm: number; lat: number; lon: number };

const CATEGORIAS_TOURISM: Record<string, string> = {
  attraction: "Atracción turística",
  museum: "Museo",
  viewpoint: "Mirador",
  zoo: "Zoológico",
  theme_park: "Parque temático",
  gallery: "Galería",
  artwork: "Obra de arte",
  aquarium: "Acuario",
};

function categoriaLegible(tags: Record<string, string>): string {
  if (tags.tourism && CATEGORIAS_TOURISM[tags.tourism]) return CATEGORIAS_TOURISM[tags.tourism];
  if (tags.natural === "beach") return "Playa";
  if (tags.historic) return "Sitio histórico";
  return "Punto de interés";
}

function distanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

async function buscarLugaresCercanos(lat: number, lon: number): Promise<LugarCercano[]> {
  const consulta = `
    [out:json][timeout:20];
    (
      node["tourism"~"attraction|museum|viewpoint|zoo|theme_park|gallery|artwork|aquarium"](around:20000,${lat},${lon});
      node["natural"="beach"](around:20000,${lat},${lon});
      node["historic"](around:20000,${lat},${lon});
    );
    out body 40;
  `;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: "data=" + encodeURIComponent(consulta),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "*/*",
        "User-Agent": "la-bankera-rd/1.0",
      },
      cache: "no-store",
    });
    if (!res.ok) return [];

    const data = await res.json();
    const elementos = data?.elements;
    if (!Array.isArray(elementos)) return [];

    return elementos
      .filter(function (e: any) { return e.tags && (e.tags["name:es"] || e.tags.name); })
      .map(function (e: any) {
        return {
          id: e.id,
          nombre: e.tags["name:es"] || e.tags.name,
          categoria: categoriaLegible(e.tags),
          distanciaKm: distanciaKm(lat, lon, e.lat, e.lon),
          lat: e.lat,
          lon: e.lon,
        };
      })
      .sort(function (a: LugarCercano, b: LugarCercano) { return a.distanciaKm - b.distanciaKm; })
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

      <div className="mx-auto max-w-2xl px-6 pt-6 sm:px-10">
        <img
          src={ciudad.foto.url}
          alt={ciudad.nombre}
          className="h-56 w-full rounded-xl object-cover sm:h-80"
        />
        <p className="mt-1.5 text-right text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Foto: {ciudad.foto.autor} / Wikimedia Commons ({ciudad.foto.licencia})
        </p>
      </div>

      <main className="mx-auto max-w-2xl px-6 pb-10 pt-6 sm:px-10">
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
                  <a
                    key={l.id}
                    href={`https://www.google.com/maps?q=${l.lat},${l.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 border-t border-[#10203A]/8 px-5 py-3 first:border-t-0 hover:bg-[#FBF7EE]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#10203A]">{l.nombre}</p>
                      <p className="font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{l.categoria}</p>
                    </div>
                    <span className="shrink-0 font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                      {l.distanciaKm} km
                    </span>
                  </a>
                );
              })}
            </div>
            <p className="mt-3 text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Datos de ubicación de <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a>, un mapa colaborativo y abierto. Haz clic en un lugar para verlo en el mapa.
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
