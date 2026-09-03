import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import NavPildoras from "../../NavPildoras";
import { CIUDADES } from "../datos";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
const COLOR_VERDE_RD = "#007A33";
const COLOR_AZUL = "#1E4D8C";
const COLOR_TEAL = "#0D9488";

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

function TarjetaItem(props: { texto: string; icono: string; color: string; indice: number }) {
  const { texto, icono, color, indice } = props;
  const partes = texto.split(" — ");
  const titulo = partes[0];
  const detalle = partes.slice(1).join(" — ");

  return (
    <div className="flex gap-3 rounded-xl border border-[#10203A]/12 bg-white p-4 shadow-sm transition hover:shadow-md">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base"
        style={{ backgroundColor: color + "18" }}
      >
        {icono}
      </span>
      <div>
        <p className="text-sm font-semibold text-[#10203A]">{titulo}</p>
        {detalle ? <p className="mt-0.5 text-xs leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{detalle}</p> : null}
      </div>
      <span className="sr-only">{indice}</span>
    </div>
  );
}

function SeccionTarjetas(props: { titulo: string; items: string[]; icono: string; color: string }) {
  const { titulo, items, icono, color } = props;
  if (items.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-4 flex items-center gap-2 font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">
        <span>{icono}</span> {titulo}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(function (item, i) {
          return <TarjetaItem key={i} texto={item} icono={icono} color={color} indice={i + 1} />;
        })}
      </div>
    </section>
  );
}

export default async function CiudadTurismoPage(props: { params: Promise<{ ciudad: string }> }) {
  const params = await props.params;
  const ciudad = CIUDADES.find(function (c) { return c.slug === params.ciudad; });
  if (!ciudad) notFound();

  const lugaresCercanos = await buscarLugaresCercanos(ciudad.lat, ciudad.lon);

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-8">
        <div className="relative h-72 w-full overflow-hidden rounded-2xl sm:h-[420px]">
          <img src={ciudad.foto.url} alt={ciudad.nombre} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <a
            href="/turismo"
            className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1.5 font-mono text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/60 sm:left-6 sm:top-6"
          >
            ← Todos los destinos
          </a>
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white drop-shadow sm:text-5xl">
              {ciudad.nombre}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/90 drop-shadow sm:text-base">{ciudad.resumen}</p>
          </div>
        </div>
        <p className="mt-1.5 text-right text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Foto: {ciudad.foto.autor} / Wikimedia Commons ({ciudad.foto.licencia})
        </p>
      </div>

      <main className="mx-auto max-w-5xl px-4 pb-14 pt-6 sm:px-8">
        <p className="max-w-3xl text-base leading-relaxed">{ciudad.descripcion}</p>

        {ciudad.galeria.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {ciudad.galeria.map(function (g, i) {
              return (
                <figure key={i}>
                  <img src={g.url} alt={g.alt} className="h-52 w-full rounded-xl object-cover sm:h-64" />
                  <figcaption className="mt-1.5 text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                    {g.alt} · Foto: {g.autor} / Wikimedia Commons ({g.licencia})
                  </figcaption>
                </figure>
              );
            })}
          </div>
        ) : null}

        <SeccionTarjetas titulo="Qué ver y hacer" items={ciudad.atracciones} icono="📍" color={COLOR_VERDE_RD} />
        <SeccionTarjetas titulo="Dónde alojarse" items={ciudad.hoteles} icono="🏨" color={COLOR_AZUL} />
        <SeccionTarjetas titulo="Ecoturismo y naturaleza" items={ciudad.ecoturismo} icono="🌿" color={COLOR_TEAL} />

        {lugaresCercanos.length > 0 ? (
          <section className="mt-10">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">
              Más lugares cerca de {ciudad.nombre}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {lugaresCercanos.map(function (l) {
                return (
                  <a
                    key={l.id}
                    href={`https://www.google.com/maps?q=${l.lat},${l.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#10203A]/12 bg-white p-4 shadow-sm transition hover:shadow-md"
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
          </section>
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
