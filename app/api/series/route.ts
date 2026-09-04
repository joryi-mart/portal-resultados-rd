import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";

async function obtenerNoticiasSeries() {
  const cacheado = getCache("noticias-series");
  if (cacheado) return cacheado;

  const apiKey = process.env.CURRENTS_API_KEY;
  if (!apiKey) throw new Error("Falta la clave CURRENTS_API_KEY en .env.local");

  const query = encodeURIComponent(
    'Netflix OR HBO OR "Prime Video" OR "Disney Plus" OR "nueva temporada" OR "serie mas vista" OR series estreno'
  );
  const url = `https://api.currentsapi.services/v1/search?keywords=${query}&language=es`;

  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) throw new Error(`Error Currents API (series): ${res.status}`);
  const data = await res.json();

  const resultado = { ...data, news: data.news || [] };
  setCache("noticias-series", resultado, 30 * 60 * 1000);
  return resultado;
}

export async function GET() {
  try {
    const noticias = await obtenerNoticiasSeries();
    return NextResponse.json({ actualizado: new Date().toISOString(), noticias });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error obteniendo noticias de series", detalle: error.message },
      { status: 500 }
    );
  }
}
