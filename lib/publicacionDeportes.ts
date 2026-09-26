// lib/publicacionDeportes.ts
// Configuración compartida de las publicaciones de Facebook de béisbol y NBA
// ("¿quién ganó ayer?"): qué datos usar, cómo se titula la imagen y cómo se escribe el texto.

import { obtenerJuegosMLB, obtenerJuegosNBA, type JuegoTerminado } from "./resultadosDeportes";

export type TipoDeporte = "beisbol" | "nba";

type Config = {
  slug: string; // se guarda en publicaciones_facebook.loteria_slug para no publicar dos veces el mismo dia
  titulo: string;
  enlaceTexto: string;
  obtenerJuegos: (fechaISO: string) => Promise<JuegoTerminado[]>;
  caption: (fechaTexto: string) => string;
};

export const DEPORTES: Record<TipoDeporte, Config> = {
  beisbol: {
    slug: "mlb",
    titulo: "Béisbol MLB: ¿quién ganó ayer?",
    enlaceTexto: "Más béisbol en labankerard.com/beisbol",
    obtenerJuegos: obtenerJuegosMLB,
    caption: (fechaTexto) =>
      `⚾ Grandes Ligas — Así terminaron los juegos del ${fechaTexto}\n\n` +
      `Ve el béisbol completo en https://labankerard.com/beisbol\n\n` +
      `Página informativa de La Bankera RD.\n\n#MLB #GrandesLigas #BeisbolDominicano`,
  },
  nba: {
    slug: "nba",
    titulo: "NBA: ¿quién ganó anoche?",
    enlaceTexto: "Más NBA en labankerard.com/nba",
    obtenerJuegos: obtenerJuegosNBA,
    caption: (fechaTexto) =>
      `🏀 NBA — Así terminaron los juegos del ${fechaTexto}\n\n` +
      `Ve todo sobre la NBA en https://labankerard.com/nba\n\n` +
      `Página informativa de La Bankera RD.\n\n#NBA #Baloncesto`,
  },
};

export function esTipoDeporte(valor: string | null): valor is TipoDeporte {
  return valor === "beisbol" || valor === "nba";
}

// Fecha de "ayer" en República Dominicana (fijo en UTC-4, sin horario de verano).
// Los juegos de EE. UU. de esa fecha ya terminaron a las 8:00 a.m. de RD.
export function ayerRD() {
  return new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function fechaLarga(fechaISO: string) {
  return new Date(fechaISO + "T12:00:00Z").toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
