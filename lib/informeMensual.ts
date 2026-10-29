import { supabase } from "@/lib/supabase";

// Informe del mes: los numeros que mas (y menos) salieron en cada loteria
// principal durante un mes completo. Es contenido propio (nadie mas lo tiene)
// pensado para que blogs y periodicos lo citen y enlacen.

export const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// Primer mes completo con resultados guardados (empezamos el 31-ago-2026).
const PRIMER_MES = { anio: 2026, mes: 9 };

export const LOTERIAS_INFORME = [
  { slug: "nacional", nombre: "Lotería Nacional" },
  { slug: "leidsa", nombre: "Leidsa" },
  { slug: "loteka", nombre: "Loteka" },
  { slug: "real", nombre: "Lotería Real" },
];

export type Mes = { anio: number; mes: number };

export function slugMes(m: Mes) {
  return `${MESES[m.mes - 1]}-${m.anio}`;
}

export function nombreMes(m: Mes) {
  return `${MESES[m.mes - 1]} ${m.anio}`;
}

export function leerSlugMes(slug: string): Mes | null {
  const partes = /^([a-z]+)-(\d{4})$/.exec(slug);
  if (!partes) return null;
  const mes = MESES.indexOf(partes[1]) + 1;
  if (mes === 0) return null;
  return { anio: Number(partes[2]), mes };
}

function mesAnterior(m: Mes): Mes {
  return m.mes === 1 ? { anio: m.anio - 1, mes: 12 } : { anio: m.anio, mes: m.mes - 1 };
}

function mesSiguiente(m: Mes): Mes {
  return m.mes === 12 ? { anio: m.anio + 1, mes: 1 } : { anio: m.anio, mes: m.mes + 1 };
}

function antes(a: Mes, b: Mes) {
  return a.anio < b.anio || (a.anio === b.anio && a.mes < b.mes);
}

// El ultimo mes ya terminado, en hora de RD.
export function ultimoMesCompleto(): Mes {
  const ahora = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return mesAnterior({ anio: ahora.getUTCFullYear(), mes: ahora.getUTCMonth() + 1 });
}

// Meses con informe, del mas reciente al mas viejo.
export function mesesDisponibles(): Mes[] {
  const lista: Mes[] = [];
  let m = ultimoMesCompleto();
  while (!antes(m, PRIMER_MES)) {
    lista.push(m);
    m = mesAnterior(m);
  }
  return lista;
}

export function mesValido(m: Mes) {
  return !antes(m, PRIMER_MES) && !antes(ultimoMesCompleto(), m);
}

export function vecinos(m: Mes) {
  const anterior = mesAnterior(m);
  const siguiente = mesSiguiente(m);
  return { anterior: mesValido(anterior) ? anterior : null, siguiente: mesValido(siguiente) ? siguiente : null };
}

export type ConteoNumero = { numero: string; veces: number };
export type InformeLoteria = {
  slug: string;
  nombre: string;
  sorteos: number;
  masSalidos: ConteoNumero[];
  noSalieron: string[];
  repetidos: number;
};

type Fila = { numeros: string; fecha: string; sorteo_id: number; sorteos: { nombre: string; loterias: { slug: string } } };

export async function obtenerInforme(m: Mes): Promise<InformeLoteria[]> {
  const desde = `${m.anio}-${String(m.mes).padStart(2, "0")}-01`;
  const sig = mesSiguiente(m);
  const hasta = `${sig.anio}-${String(sig.mes).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("resultados")
    .select("numeros, fecha, sorteo_id, sorteos!inner(nombre, loterias!inner(slug))")
    .in("sorteos.loterias.slug", LOTERIAS_INFORME.map(function (l) { return l.slug; }))
    .gte("fecha", desde)
    .lt("fecha", hasta)
    .limit(5000);
  if (error) throw new Error(error.message);
  const filas = (data || []) as unknown as Fila[];

  return LOTERIAS_INFORME.map(function (l) {
    // Solo sorteos de pocos numeros de 2 cifras: Super Kino (20 numeros del
    // 01 al 80) inflaria el conteo.
    const propias = filas
      .filter(function (f) { return f.sorteos.loterias.slug === l.slug && !/kino/i.test(f.sorteos.nombre); })
      .filter(function (f) { return f.numeros.split("-").length <= 6; })
      .sort(function (a, b) { return a.fecha.localeCompare(b.fecha); });

    const conteo = new Map<string, number>();
    for (let i = 0; i < 100; i++) conteo.set(String(i).padStart(2, "0"), 0);
    let repetidos = 0;
    const anteriorPorSorteo = new Map<number, string[]>();

    propias.forEach(function (f) {
      const numeros = f.numeros.split("-").map(function (n) { return n.trim().padStart(2, "0"); }).filter(function (n) { return /^\d{2}$/.test(n); });
      numeros.forEach(function (n) { conteo.set(n, (conteo.get(n) || 0) + 1); });
      const previo = anteriorPorSorteo.get(f.sorteo_id);
      if (previo) repetidos += numeros.filter(function (n) { return previo.includes(n); }).length;
      anteriorPorSorteo.set(f.sorteo_id, numeros);
    });

    const ordenados = Array.from(conteo.entries()).map(function ([numero, veces]) { return { numero, veces }; });
    return {
      slug: l.slug,
      nombre: l.nombre,
      sorteos: propias.length,
      masSalidos: ordenados.slice().sort(function (a, b) { return b.veces - a.veces || a.numero.localeCompare(b.numero); }).slice(0, 5),
      noSalieron: ordenados.filter(function (c) { return c.veces === 0; }).map(function (c) { return c.numero; }),
      repetidos,
    };
  });
}
