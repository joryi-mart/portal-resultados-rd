// Frase de gancho del dia para cada publicacion automatica (ver el comentario
// de lib/ganchos.json). Misma cuenta que scripts/ganchos.py: si cambia una,
// cambiar la otra.
import datos from "./ganchos.json";

type Publicacion = { grupo: string; puestos: number[]; nombre: string };

const frases = datos.frases as Record<string, string>;
const grupos = datos.grupos as Record<string, number[]>;
export const PUBLICACIONES_CON_GANCHO = datos.publicaciones as Record<string, Publicacion>;

// Dias desde el 1-ene-1970 de una fecha AAAA-MM-DD (fecha de publicacion, hora RD).
function numeroDeDia(fechaISO: string) {
  return Math.floor(Date.parse(fechaISO + "T00:00:00Z") / 86400000);
}

// "salida" es la publicacion numero 1, 2, 3... de ese tipo en el dia (solo
// importa para las que salen varias veces, como cada loteria).
export function ganchoDelDia(tipo: string, fechaISO: string, salida = 1) {
  const p = PUBLICACIONES_CON_GANCHO[tipo];
  if (!p) throw new Error(`Publicacion sin gancho en lib/ganchos.json: ${tipo}`);
  const grupo = grupos[p.grupo];
  const puesto = p.puestos[(salida - 1) % p.puestos.length];
  return frases[String(grupo[(numeroDeDia(fechaISO) + puesto) % grupo.length])];
}

// Gancho para lo que se publica ahora mismo (Republica Dominicana, UTC-4 fijo).
export function ganchoDeHoy(tipo: string, salida = 1) {
  return ganchoDelDia(tipo, new Date(Date.now() - 4 * 3600000).toISOString().slice(0, 10), salida);
}
