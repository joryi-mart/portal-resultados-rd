// Datos reales ("¿qué pasó hoy?") para las tarjetas de "Mas de La Bankera RD":
// se usan tanto para dibujar la imagen (app/api/tarjeta-explorar) como para
// el texto real de abajo de la tarjeta (app/SeccionExplorar.tsx), para que
// Google tambien pueda leer la info de hoy, no solo verla en la imagen.
import { EFEMERIDES } from "@/app/efemerides/page";
import { CIUDADES } from "@/app/turismo/datos";

function hoyRD() {
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return { anio: ahoraRD.getUTCFullYear(), mes: ahoraRD.getUTCMonth() + 1, dia: ahoraRD.getUTCDate() };
}

function fechaISOayer() {
  const ayer = new Date(Date.now() - 4 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000);
  return ayer.toISOString().slice(0, 10);
}

function fechaLarga() {
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000);
  const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${dias[ahoraRD.getUTCDay()]}, ${ahoraRD.getUTCDate()} de ${meses[ahoraRD.getUTCMonth()]}`;
}

async function leerJsonPublico(nombre: string) {
  try {
    const res = await fetch(`https://labankerard.com/${nombre}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function datosEfemerides() {
  const { mes, dia } = hoyRD();
  const deHoy = EFEMERIDES.find((e) => e.mes === mes && e.dia === dia);
  return {
    titulo: deHoy ? deHoy.texto : "Un día como hoy en la historia de RD",
    subtitulo: "¿Sabes qué pasó un día como hoy? Entérate aquí",
  };
}

export async function datosDeporte(slug: "mlb" | "nba") {
  const datos = await leerJsonPublico(`reel-${slug}.json`);
  const hayDatos = datos && datos.fecha === fechaISOayer();
  const etiqueta = slug === "mlb" ? "MLB" : "NBA";
  return {
    titulo: hayDatos ? `Resultados de ${fechaLarga()}` : `Repaso de ${etiqueta}`,
    subtitulo: hayDatos
      ? `¿Quién ganó ayer? Aquí está el resumen`
      : `Vuelve cada mañana para el resumen de ${etiqueta}`,
  };
}

export async function datosTurismo() {
  const reel = await leerJsonPublico("reel-turismo.json");
  const ciudad = reel?.destino ? CIUDADES.find((c) => c.slug === reel.destino) : null;
  return {
    titulo: ciudad ? ciudad.nombre : "Descubre República Dominicana",
    subtitulo: ciudad ? `¿Conoces este lugar? Descúbrelo aquí` : "Un destino dominicano distinto para conocer cada día",
    ciudad,
  };
}
