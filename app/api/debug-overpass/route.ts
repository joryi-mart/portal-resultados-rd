export const dynamic = "force-dynamic";

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat") || "19.7808");
  const lon = Number(url.searchParams.get("lon") || "-70.6871");

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
    const inicio = Date.now();
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
    const ms = Date.now() - inicio;
    if (!res.ok) return Response.json({ etapa: "fetch", ok: false, status: res.status, ms });

    const data = await res.json();
    const elementos = data?.elements;
    if (!Array.isArray(elementos)) return Response.json({ etapa: "parse", ok: false, ms, tipoElementos: typeof elementos });

    let procesados;
    try {
      procesados = elementos
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
        .sort(function (a: any, b: any) { return a.distanciaKm - b.distanciaKm; })
        .slice(0, 10);
    } catch (e: any) {
      return Response.json({ etapa: "procesar", ok: false, error: String(e), stack: e?.stack, totalElementos: elementos.length });
    }

    return Response.json({ etapa: "listo", ok: true, ms, totalElementos: elementos.length, procesados });
  } catch (e: any) {
    return Response.json({ etapa: "excepcion", ok: false, error: String(e), name: e?.name, cause: String(e?.cause) });
  }
}
