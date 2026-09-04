import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";

async function obtenerNoticiasVideojuegos() {
  const cacheado = getCache("noticias-videojuegos");
  if (cacheado) return cacheado;

  const apiKey = process.env.CURRENTS_API_KEY;
  if (!apiKey) throw new Error("Falta la clave CURRENTS_API_KEY en .env.local");

  const query = encodeURIComponent(
    'videojuegos OR "video juegos" OR gaming OR PlayStation OR Xbox OR Nintendo OR "PC gaming" OR esports'
  );
  const url = `https://api.currentsapi.services/v1/search?keywords=${query}&language=es`;

  const res = await fetch(url, {
    headers: { Authorization: apiKey },
  });
  if (!res.ok) throw new Error(`Error Currents API: ${res.status}`);
  const data = await res.json();

  const resultado = { ...data, news: data.news || [] };

  setCache("noticias-videojuegos", resultado, 20 * 60 * 1000);
  return resultado;
}

export async function GET() {
  try {
    const noticias = await obtenerNoticiasVideojuegos();
    return NextResponse.json({
      actualizado: new Date().toISOString(),
      noticias,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error obteniendo datos", detalle: error.message },
      { status: 500 }
    );
  }
}
