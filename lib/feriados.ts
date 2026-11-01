// Dias feriados oficiales de Republica Dominicana. Los usan la pagina
// /dias-feriados y las publicaciones automaticas de Facebook
// (/api/publicar-feriados), asi que siempre dicen lo mismo.
//
// "fecha" es el dia que de verdad no se trabaja (ya con los traslados de la
// Ley 139-97: los que caen martes-viernes y no son de fecha fija se mueven al
// lunes). Fuentes: Ministerio de Trabajo (mt.gob.do).
//   2026: contrastado con El Caribe, Diario Libre y El Dia (noviembre 2025).
//   2027: calendario publicado el 1-nov-2026, contrastado con Revista Mercado,
//         Noticias SIN y 7 Dias. Solo se trasladan Santos Reyes y Duarte.

export type Feriado = { nombre: string; fecha: string; nota?: string };

export const FERIADOS: Record<number, Feriado[]> = {
  2026: [
    { nombre: "Año Nuevo", fecha: "2026-01-01" },
    { nombre: "Día de los Santos Reyes", fecha: "2026-01-05", nota: "Trasladado del martes 6 al lunes 5" },
    { nombre: "Día de la Altagracia", fecha: "2026-01-21" },
    { nombre: "Día de Duarte", fecha: "2026-01-26" },
    { nombre: "Día de la Independencia", fecha: "2026-02-27" },
    { nombre: "Viernes Santo", fecha: "2026-04-03" },
    { nombre: "Día del Trabajo", fecha: "2026-05-04", nota: "Trasladado del viernes 1 al lunes 4" },
    { nombre: "Corpus Christi", fecha: "2026-06-04" },
    { nombre: "Día de la Restauración", fecha: "2026-08-16", nota: "Cae domingo: no genera día libre extra" },
    { nombre: "Día de las Mercedes", fecha: "2026-09-24" },
    { nombre: "Día de la Constitución", fecha: "2026-11-09", nota: "Trasladado del viernes 6 al lunes 9" },
    { nombre: "Navidad", fecha: "2026-12-25" },
  ],
  2027: [
    { nombre: "Año Nuevo", fecha: "2027-01-01" },
    { nombre: "Día de los Santos Reyes", fecha: "2027-01-04", nota: "Trasladado del miércoles 6 al lunes 4" },
    { nombre: "Día de la Altagracia", fecha: "2027-01-21" },
    { nombre: "Día de Duarte", fecha: "2027-01-25", nota: "Trasladado del martes 26 al lunes 25" },
    { nombre: "Día de la Independencia", fecha: "2027-02-27" },
    { nombre: "Viernes Santo", fecha: "2027-03-26" },
    { nombre: "Día del Trabajo", fecha: "2027-05-01" },
    { nombre: "Corpus Christi", fecha: "2027-05-27" },
    { nombre: "Día de la Restauración", fecha: "2027-08-16" },
    { nombre: "Día de las Mercedes", fecha: "2027-09-24" },
    { nombre: "Día de la Constitución", fecha: "2027-11-06" },
    { nombre: "Navidad", fecha: "2027-12-25" },
  ],
};

export const DIAS_SEMANA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
export const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function todosLosFeriados(): Feriado[] {
  return Object.keys(FERIADOS).sort().flatMap(function (a) { return FERIADOS[Number(a)]; });
}

export function aniosConFeriados(): number[] {
  return Object.keys(FERIADOS).map(Number).sort();
}

export function hoyRD() {
  return new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function fechaUTC(fechaISO: string) {
  return new Date(fechaISO + "T12:00:00Z");
}

export function diaSemana(fechaISO: string) {
  return DIAS_SEMANA[fechaUTC(fechaISO).getUTCDay()];
}

// "lunes, 9 de noviembre"
export function fechaLarga(fechaISO: string) {
  const d = fechaUTC(fechaISO);
  return `${DIAS_SEMANA[d.getUTCDay()]}, ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`;
}

export function sumarDias(fechaISO: string, dias: number) {
  const d = fechaUTC(fechaISO);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function diasEntre(desdeISO: string, hastaISO: string) {
  return Math.round((fechaUTC(hastaISO).getTime() - fechaUTC(desdeISO).getTime()) / 86400000);
}

export function proximoFeriado(desdeISO: string): Feriado | undefined {
  return todosLosFeriados().find(function (f) { return f.fecha >= desdeISO; });
}

// Feriados de un mes ("2026-12").
export function feriadosDelMes(anioMes: string): Feriado[] {
  return todosLosFeriados().filter(function (f) { return f.fecha.slice(0, 7) === anioMes; });
}
