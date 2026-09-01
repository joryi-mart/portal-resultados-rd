import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";

const BASE_IMAGEN = "https://image.tmdb.org/t/p/w500";

function mapearPelicula(p: any) {
  return {
    id: p.id,
    titulo: p.title,
    sinopsis: p.overview,
    poster: p.poster_path ? BASE_IMAGEN + p.poster_path : "",
    calificacion: p.vote_average ? p.vote_average.toFixed(1) : "-",
    fechaEstreno: p.release_date || "",
  };
}

async function obtenerListado(categoria: string, apiKey: string, region: string | null) {
  const claveCache = "cine-" + categoria + "-" + (region || "global");
  const cacheado = getCache(claveCache);
  if (cacheado) return cacheado;

  const parametroRegion = region ? `&region=${region}` : "";
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${categoria}?api_key=${apiKey}&language=es-ES${parametroRegion}&page=1`
  );
  if (!res.ok) throw new Error(`Error TMDB API (${categoria}): ${res.status}`);
  const data = await res.json();

  const peliculas = (data.results || []).map(mapearPelicula);

  setCache(claveCache, peliculas, 6 * 60 * 60 * 1000);
  return peliculas;
}

export async function GET() {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta la clave TMDB_API_KEY en .env.local" },
        { status: 500 }
      );
    }

    const [enCartelera, proximosEstrenos, populares] = await Promise.all([
      obtenerListado("now_playing", apiKey, null),
      obtenerListado("upcoming", apiKey, null),
      obtenerListado("popular", apiKey, null),
    ]);

    return NextResponse.json({
      actualizado: new Date().toISOString(),
      enCartelera,
      proximosEstrenos,
      populares,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error obteniendo datos de cine", detalle: error.message },
      { status: 500 }
    );
  }
}