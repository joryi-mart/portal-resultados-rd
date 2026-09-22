// lib/noticiasDeportes.js
// Noticias reales de deportes, para mostrarse ya renderizadas en el HTML
// (no solo del lado del cliente) y que Google pueda indexarlas.

import { getCache, setCache } from "@/lib/cache";

const PALABRAS_DOMINICANAS = [
  "lidom",
  "dominicano",
  "dominicana",
  "república dominicana",
  "quisqueya",
  "quisqueyano",
  "quisqueyana",
  "licey",
  "águilas cibaeñas",
  "aguilas cibaenas",
  "gigantes del cibao",
  "toros del este",
  "estrellas orientales",
  "leones del escogido",
  "santo domingo",
  "san pedro de macorís",
  "las estrellas",
  "criollo",
  "peloteros dominicanos",
  "as dominicano",
];

export function esNoticiaDominicanosEnMLB(articulo) {
  const texto = `${articulo.title || ""} ${articulo.description || ""}`.toLowerCase();
  return PALABRAS_DOMINICANAS.some((palabra) => texto.includes(palabra));
}

// La busqueda de noticias de MLB usa la palabra "beisbol", que es tan generica
// que trae de todo: notas de sucesos que solo mencionan un "campo de beisbol"
// (crimenes, accidentes), o articulos de otros deportes sin relacion real.
// Este filtro exige que la noticia mencione algo especifico de MLB/beisbol Y
// que no sea, evidentemente, una nota de sucesos/crimen.
const PALABRAS_RELEVANTES_MLB = [
  "mlb",
  "serie mundial",
  "jonrón",
  "jonron",
  "home run",
  "pícher",
  "pitcher",
  "picheo",
  "bateador",
  "playoffs",
  "postemporada",
  "novena",
  "entrada",
  "roster",
  "yankees",
  "dodgers",
  "red sox",
  "mets",
  "astros",
  "braves",
  "phillies",
  "cubs",
  "giants",
];
const PALABRAS_SUCESOS = [
  "ataque armado",
  "asesinat",
  "balacera",
  "tiroteo",
  "detuvieron",
  "detenido",
  "secuestro",
  "narco",
  "droga",
  "crimen",
  "muertos",
  "heridos",
  "violencia",
  "atraco",
  "robo a mano armada",
  "incendio",
];

export function esNoticiaRelevanteMLB(articulo) {
  const texto = `${articulo.title || ""} ${articulo.description || ""}`.toLowerCase();
  const esDeSucesos = PALABRAS_SUCESOS.some((palabra) => texto.includes(palabra));
  if (esDeSucesos) return false;
  return PALABRAS_RELEVANTES_MLB.some((palabra) => texto.includes(palabra));
}

export async function obtenerNoticiasMLB() {
  const cacheado = getCache("noticias-mlb");
  if (cacheado) return cacheado;

  const apiKey = process.env.CURRENTS_API_KEY;
  if (!apiKey) throw new Error("Falta la clave CURRENTS_API_KEY en .env.local");

  const query = encodeURIComponent(
    'MLB OR "Grandes Ligas" OR "béisbol" OR "beisbol" OR "Serie Mundial"'
  );
  const url = `https://api.currentsapi.services/v1/search?keywords=${query}&language=es`;

  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) throw new Error(`Error Currents API: ${res.status}`);
  const data = await res.json();

  const noticiasFiltradas = (data.news || []).filter(esNoticiaRelevanteMLB);
  const resultado = { ...data, news: noticiasFiltradas };

  setCache("noticias-mlb", resultado, 15 * 60 * 1000);
  return resultado;
}

export async function obtenerNoticiasDominicanosDeporte() {
  const cacheado = getCache("noticias-dominicanos-deporte");
  if (cacheado) return cacheado;

  const apiKey = process.env.CURRENTS_API_KEY;
  if (!apiKey) throw new Error("Falta la clave CURRENTS_API_KEY en .env.local");

  const query = encodeURIComponent(
    '"Marileidy Paulino" OR "atletismo dominicano" OR "boxeo dominicano" OR "atleta dominicano" OR "atleta dominicana" OR "deporte dominicano"'
  );
  const url = `https://api.currentsapi.services/v1/search?keywords=${query}&language=es`;

  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) throw new Error(`Error Currents API (dominicanos deporte): ${res.status}`);
  const data = await res.json();

  const resultado = { ...data, news: data.news || [] };

  setCache("noticias-dominicanos-deporte", resultado, 30 * 60 * 1000);
  return resultado;
}

export async function obtenerNoticiasFutbol(liga) {
  const claveCache = "futbol-noticias-" + liga;
  const cacheado = getCache(claveCache);
  if (cacheado) return cacheado;

  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/${liga}/news?lang=es`
  );
  if (!res.ok) throw new Error(`Error Fútbol API (noticias): ${res.status}`);
  const data = await res.json();

  const noticias = (data.articles || []).map((a) => ({
    id: String(a.dataSourceIdentifier || a.headline),
    title: a.headline,
    url: a.links?.web?.href || "",
    image: a.images?.[0]?.url || "",
    published: a.published,
  }));

  setCache(claveCache, noticias, 15 * 60 * 1000);
  return noticias;
}

export async function obtenerNoticiasBaloncesto() {
  const cacheado = getCache("noticias-nba");
  if (cacheado) return cacheado;

  const res = await fetch(
    "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news?lang=es"
  );
  if (!res.ok) throw new Error(`Error NBA API (noticias): ${res.status}`);
  const data = await res.json();

  const noticias = (data.articles || []).map((a) => ({
    id: String(a.dataSourceIdentifier || a.headline),
    title: a.headline,
    url: a.links?.web?.href || "",
    image: a.images?.[0]?.url || "",
    published: a.published,
  }));

  setCache("noticias-nba", noticias, 15 * 60 * 1000);
  return noticias;
}
