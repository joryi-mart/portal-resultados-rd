// Dias que faltan para el 20 de diciembre (fecha limite para pagar la
// regalia pascual), con la hora de RD, o null fuera de temporada (del 21 de
// diciembre al 14 de octubre). Va aparte de AvisoRegalia.tsx porque ese
// archivo corre en el navegador y esto se calcula en el servidor.
export function diasParaRegalia(): number | null {
  const hoy = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const anio = hoy.slice(0, 4);
  if (hoy < `${anio}-10-15` || hoy > `${anio}-12-20`) return null;
  return Math.round((Date.parse(`${anio}-12-20T00:00:00Z`) - Date.parse(hoy + "T00:00:00Z")) / 86400000);
}
