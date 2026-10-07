// Fecha y hora de inicio de un sorteo en formato ISO 8601 con la zona de RD,
// para los datos estructurados (schema.org Event). hora_sorteo viene de la
// base de datos como "HH:MM:SS" (a veces "HH:MM"), asi que se recorta a
// HH:MM antes de agregar los segundos; si no, sale "17:30:00:00", que Google
// marca como fecha invalida.
export function inicioSorteoISO(fecha: string, hora: string | null | undefined) {
  return `${fecha}T${(hora || "00:00").slice(0, 5)}:00-04:00`;
}
