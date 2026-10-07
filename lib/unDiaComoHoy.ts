// lib/unDiaComoHoy.ts
// "Un día como hoy" para los días que no tienen efeméride dominicana en la
// lista propia (app/efemerides/page.tsx). Usa el feed "En este día" de Wikipedia
// en español: son hechos con fuente, no se inventa nada. Prioridad:
// 1) algo de República Dominicana, 2) béisbol / Caribe / Latinoamérica,
// 3) el hecho destacado del día que elige la propia Wikipedia.

type Hecho = { year?: number; text: string };

const CLAVES_RD = /dominican|santo domingo|santiago de los caballeros|hispaniola|la española/i;
// En los nacimientos solo vale la pena gente conocida por algo de interés para el público.
const OFICIOS_DESTACADOS = /beisbolista|pelotero|cantante|músic|merenguero|bachatero|compositor|escritor|poeta|president|actor|actriz|boxeador|atleta|baloncestista|futbolista/i;
const CLAVES_CERCANAS = /béisbol|beisbol|grandes ligas|serie mundial|merengue|bachata|salsa|puerto ric|cuba|venezuel|caribe|haití|haiti|méxic|colombi/i;

function limpiar(texto: string) {
  return texto
    .replace(/\s*\((en la imagen|en la foto|imagen)\)/gi, "")
    .replace(/\s*\((n|f)\.\s*\d+\)/g, "")
    .replace(/\s*\(\d+\)/g, "")
    .replace(/[;,:]\s*$/, ".")
    .replace(/\s+/g, " ")
    .trim();
}

// La tarjeta tiene espacio para unas pocas líneas: se corta en una frase completa.
function recortar(texto: string, maximo = 240) {
  if (texto.length <= maximo) return texto;
  const corte = texto.slice(0, maximo);
  const punto = Math.max(corte.lastIndexOf(". "), corte.lastIndexOf("; "));
  if (punto > 80) return corte.slice(0, punto + 1);
  return corte.slice(0, corte.lastIndexOf(" ")) + "…";
}

export async function hechoDeWikipedia(mes: number, dia: number) {
  const mm = String(mes).padStart(2, "0");
  const dd = String(dia).padStart(2, "0");
  // Dos direcciones del mismo feed; a veces una responde 504 y la otra no.
  const direcciones = [
    `https://es.wikipedia.org/api/rest_v1/feed/onthisday/all/${mm}/${dd}`,
    `https://api.wikimedia.org/feed/v1/wikipedia/es/onthisday/all/${mm}/${dd}`,
  ];
  let data: any = null;
  let ultimoError = "";
  for (const direccion of [...direcciones, ...direcciones]) {
    try {
      const res = await fetch(direccion, {
        headers: { "User-Agent": "LaBankeraRD/1.0 (https://labankerard.com)" },
        cache: "no-store",
      });
      if (res.ok) { data = await res.json(); break; }
      ultimoError = `Wikipedia respondio ${res.status}`;
    } catch (e: any) {
      ultimoError = e.message;
    }
  }
  if (!data) throw new Error(ultimoError || "Wikipedia no respondio");

  const conAnio = function (lista: Hecho[] | undefined) {
    return (lista || []).filter(function (h) { return h.year && h.text; });
  };
  const eventos = [...conAnio(data.selected), ...conAnio(data.events)];
  const nacimientos = conAnio(data.births)
    .filter(function (h) { return OFICIOS_DESTACADOS.test(h.text); })
    .map(function (h) { return { year: h.year, text: "Nace " + h.text }; });

  const elegido =
    eventos.find(function (h) { return CLAVES_RD.test(h.text); }) ||
    nacimientos.find(function (h) { return CLAVES_RD.test(h.text); }) ||
    eventos.find(function (h) { return CLAVES_CERCANAS.test(h.text); }) ||
    nacimientos.find(function (h) { return CLAVES_CERCANAS.test(h.text); }) ||
    eventos[0];
  if (!elegido) return null;

  return {
    texto: recortar(`${elegido.year}: ${limpiar(elegido.text)}`).replace(/[;,:]$/, "."),
    esDominicana: CLAVES_RD.test(elegido.text),
  };
}
