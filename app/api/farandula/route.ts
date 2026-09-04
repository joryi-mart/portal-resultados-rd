import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";

async function obtenerNoticiasFarandula() {
  const cacheado = getCache("noticias-farandula");
  if (cacheado) return cacheado;

  const apiKey = process.env.CURRENTS_API_KEY;
  if (!apiKey) throw new Error("Falta la clave CURRENTS_API_KEY en .env.local");

  const query = encodeURIComponent(
    'dembow OR "farándula dominicana" OR "farandula dominicana" OR "El Alfa" OR Tokischa OR "Natti Natasha" OR Yailin OR Chimbala OR "Rochy RD" OR "Fernando Villalona" OR "Vicente García" OR "musica urbana dominicana"'
  );
  const url = `https://api.currentsapi.services/v1/search?keywords=${query}&language=es`;

  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) throw new Error(`Error Currents API (farandula): ${res.status}`);
  const data = await res.json();

  const resultado = { ...data, news: data.news || [] };
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
