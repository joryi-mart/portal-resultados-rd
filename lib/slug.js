// Convierte el nombre de un sorteo (ej. "Quiniela Pale con acento") en una
// direccion amigable para la URL (ej. "quiniela-pale-con-acento"), quitando
// acentos y simbolos. Usa el rango Unicode de marcas diacriticas combinantes
// (U+0300 a U+036F) para quitar los acentos despues de descomponerlos con NFD.
const RANGO_ACENTOS = new RegExp("[̀-ͯ]", "g");

export function slugSorteo(nombre) {
  return nombre
    .normalize("NFD")
    .replace(RANGO_ACENTOS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
