import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";

function limpiarHtml(texto: string) {
  return texto
    .replace(/<[^>]*>/g, "")
    .replace(/&#8230;/g, "...")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8217;|&#8216;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

async function obtenerNoticiasLuminarias() {
  const cacheado = getCache("noticias-luminarias");
  if (cacheado) return cacheado;

  const res = await fetch("https://luminariastv.com/feed/", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`Error RSS Luminarias TV: ${res.status}`);
  const xml = await res.text();

  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  return items.slice(0, 15).map(function (item, i) {
    const titulo = (item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
    const link = (item.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || "";
    const fecha = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || "";
    const descripcionCdata = (item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || [])[1] || "";
    const imagenMatch = descripcionCdata.match(/<img[^>]*src="([^"]+)"/) || item.match(/<img[^>]*src="([^"]+)"/);

    return {
      id: "luminarias-" + i,
      title: limpiarHtml(titulo),
      url: link.split("?")[0],
      image: imagenMatch ? imagenMatch[1] : "",
      published: fecha ? new Date(fecha).toISOString() : "",
    };
  });
}

async function obtenerNoticiasCurrents() {
  const apiKey = process.env.CURRENTS_API_KEY;
  if (!apiKey) return [];

  const query = encodeURIComponent(
    'dembow OR "El Alfa" OR Tokischa OR "Natti Natasha" OR Yailin OR Chimbala OR "Rochy RD" OR "musica urbana dominicana"'
  );
  const url = `https://api.currentsapi.services/v1/search?keywords=${query}&language=es`;

  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.news || [];
}

async function obtenerNoticiasFarandula() {
  const cacheado = getCache("noticias-farandula");
  if (cacheado) return cacheado;

  const [luminarias, currents] = await Promise.all([
    obtenerNoticiasLuminarias().catch(() => []),
    obtenerNoticiasCurrents().catch(() => []),
  ]);

  // Luminarias TV primero (fuente dedicada a farandula dominicana), despues
  // lo que traiga Currents API sobre dembow/musica urbana como complemento.
  const news = [...luminarias, ...currents];
  const resultado = { news };
  setCache("noticias-farandula", resultado, 20 * 60 * 1000);
  return resultado;
}

export async function GET() {
  try {
    const noticias = await obtenerNoticiasFarandula();
    return NextResponse.json({ actualizado: new Date().toISOString(), noticias });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error obteniendo noticias de farándula", detalle: error.message },
      { status: 500 }
    );
  }
}
