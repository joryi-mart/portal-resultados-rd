// lib/imagenTanda.tsx
// Imagen UNICA y vertical (1080x1350) para cada tanda de Facebook (mediodia,
// tarde, noche), con todas las loterias juntas. Reemplaza el collage de una
// imagen por loteria, que Facebook recortaba (oct-2026). Inspirada en las
// paginas de resultados con mas interaccion: fondo claro, cuadricula de 3
// columnas, numeros enormes, todo legible sin abrir la foto. Colores del logo
// (azul, rojo, blanco).

import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import path from "path";

export type ResultadoTanda = { loteria: string; sorteo: string; numeros: string };

const fuenteRegular = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-Regular.ttf"));
const fuenteExtraBold = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-ExtraBold.ttf"));
const logo = "data:image/png;base64," + readFileSync(path.join(process.cwd(), "public/logo-icon.png")).toString("base64");

const AZUL = "#123C8C";
const AZUL_OSCURO = "#0B2257";
const ROJO = "#D2151E";
const FONDO = "#FBF7EE";
const ANCHO = 1080;
const ALTO = 1350;
const MARGEN = 40;
const COLUMNAS = 3 as const;
const ESPACIO = 16;
const ALTO_CABECERA = 176;
const ALTO_PIE = 86;
const PADDING_CELDA = 16;

// "Quiniela Nacional (Noche)" no cabe en una linea: lo de parentesis sobra,
// porque la imagen ya dice de que tanda es.
function nombreCorto(sorteo: string) {
  return sorteo.replace(/\s*\(.*?\)\s*/g, " ").trim();
}

const ALTO_ANCHA = 132; // celda a lo ancho (Super Kino TV, 20 numeros)

// Con pocos sorteos (publicacion de una sola loteria, desde nov-2026) la
// cuadricula de 3 columnas dejaba la imagen casi vacia: hasta 4 van en una
// columna y hasta 8 en dos, con letras y bolitas mas grandes, centradas a lo alto.
const DISENO_POR_COLUMNAS = {
  1: { altoMax: 300, bolitasMax: 150, texto: 100, paddingLado: 28, espacioBolas: 20, fuenteLoteria: 30, fuenteSorteo: 46 },
  2: { altoMax: 270, bolitasMax: 116, texto: 84, paddingLado: 22, espacioBolas: 12, fuenteLoteria: 26, fuenteSorteo: 36 },
  3: { altoMax: 240, bolitasMax: 92, texto: 70, paddingLado: PADDING_CELDA, espacioBolas: 8, fuenteLoteria: 24, fuenteSorteo: 29 },
};

export async function generarImagenTanda(titulo: string, fechaTexto: string, todos: ResultadoTanda[]) {
  // Los sorteos de muchos numeros van al final, cada uno en una celda a lo ancho.
  const resultados = todos.filter(function (r) { return r.numeros.split("-").length <= 6; });
  const anchos = todos.filter(function (r) { return r.numeros.split("-").length > 6; });
  const columnas: 1 | 2 | 3 = resultados.length <= 4 ? 1 : resultados.length <= 8 ? 2 : COLUMNAS;
  const d = DISENO_POR_COLUMNAS[columnas];
  // Si el titulo ya es el nombre de la loteria, no se repite en cada celda.
  const conRotulo = todos.some(function (r) { return r.loteria !== titulo; });
  const anchoCelda = Math.floor((ANCHO - MARGEN * 2 - ESPACIO * (columnas - 1)) / columnas);
  const filas = Math.max(1, Math.ceil(resultados.length / columnas));
  const altoDisponible = ALTO - ALTO_CABECERA - ALTO_PIE - 36 - anchos.length * (ALTO_ANCHA + ESPACIO);
  const altoCelda = Math.min(d.altoMax, Math.floor((altoDisponible - ESPACIO * (filas - 1)) / filas));
  // Espacio para las bolitas: lo que queda de la celda tras los renglones de texto.
  const altoTexto = d.texto - (conRotulo ? 0 : d.fuenteLoteria + 6);
  const altoBolitas = Math.max(40, Math.min(d.bolitasMax, altoCelda - PADDING_CELDA * 2 - altoTexto));

  const imagen = new ImageResponse(
    (
      <div style={{ width: `${ANCHO}px`, height: `${ALTO}px`, display: "flex", flexDirection: "column", background: FONDO, fontFamily: "Manrope", position: "relative" }}>
        {/* Logo de marca de agua, muy suave */}
        <img src={logo} width={700} height={700} style={{ position: "absolute", left: "190px", top: "390px", opacity: 0.06 }} />

        <div style={{ display: "flex", alignItems: "center", gap: "24px", height: `${ALTO_CABECERA}px`, padding: `0 ${MARGEN}px` }}>
          <img src={logo} width={124} height={124} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: "64px", fontWeight: 800, color: AZUL_OSCURO, lineHeight: 1.05 }}>{titulo}</div>
            <div style={{ display: "flex", fontSize: "38px", fontWeight: 800, color: ROJO, marginTop: "6px" }}>{fechaTexto}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: `${ESPACIO}px`, padding: `0 ${MARGEN}px`, flex: 1, alignContent: columnas < COLUMNAS ? "center" : "flex-start" }}>
          {resultados.map(function (r, i) {
            const nums = r.numeros.split("-");
            const espacioBolas = d.espacioBolas;
            const porAncho = Math.floor((anchoCelda - d.paddingLado * 2 - 6 - espacioBolas * (nums.length - 1)) / nums.length);
            const tam = Math.min(altoBolitas, porAncho);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: `${anchoCelda}px`,
                  height: `${altoCelda}px`,
                  background: "#FFFFFF",
                  borderRadius: "20px",
                  border: `3px solid ${AZUL}`,
                  padding: `${PADDING_CELDA}px ${d.paddingLado}px`,
                }}
              >
                {conRotulo && <div style={{ display: "flex", fontSize: `${d.fuenteLoteria}px`, fontWeight: 800, color: ROJO, letterSpacing: "1px" }}>{r.loteria.toUpperCase()}</div>}
                <div style={{ display: "flex", fontSize: columnas === COLUMNAS && nombreCorto(r.sorteo).length > 17 ? "25px" : `${d.fuenteSorteo}px`, fontWeight: 800, color: AZUL_OSCURO, lineHeight: 1.15, marginBottom: "8px" }}>{nombreCorto(r.sorteo)}</div>
                <div style={{ display: "flex", flex: 1, alignItems: "center", gap: `${espacioBolas}px` }}>
                    {nums.map(function (n, ni) {
                      return (
                        <div
                          key={ni}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: `${tam}px`,
                            height: `${tam}px`,
                            borderRadius: "999px",
                            background: AZUL,
                            color: "#FFFFFF",
                            fontSize: `${Math.round(tam * 0.52)}px`,
                            fontWeight: 800,
                          }}
                        >
                          {n}
                        </div>
                      );
                    })}
                  </div>
              </div>
            );
          })}
          {anchos.map(function (r, i) {
            const nums = r.numeros.split("-");
            const ancho = ANCHO - MARGEN * 2;
            const tam = Math.min(60, Math.floor((ancho - PADDING_CELDA * 2 - 6 - 6 * (nums.length - 1)) / nums.length));
            return (
              <div
                key={"ancha" + i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: `${ancho}px`,
                  height: `${ALTO_ANCHA}px`,
                  background: "#FFFFFF",
                  borderRadius: "20px",
                  border: `3px solid ${AZUL}`,
                  padding: `12px ${PADDING_CELDA}px`,
                }}
              >
                <div style={{ display: "flex", gap: "14px", alignItems: "baseline" }}>
                  <div style={{ display: "flex", fontSize: "24px", fontWeight: 800, color: ROJO, letterSpacing: "1px" }}>{r.loteria.toUpperCase()}</div>
                  <div style={{ display: "flex", fontSize: "29px", fontWeight: 800, color: AZUL_OSCURO }}>{nombreCorto(r.sorteo)}</div>
                </div>
                <div style={{ display: "flex", flex: 1, alignItems: "center", gap: "6px" }}>
                  {nums.map(function (n, ni) {
                    return (
                      <div key={ni} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: `${tam}px`, height: `${tam}px`, borderRadius: "999px", background: AZUL, color: "#FFFFFF", fontSize: `${Math.round(tam * 0.5)}px`, fontWeight: 800 }}>
                        {n}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "14px", background: AZUL_OSCURO, height: `${ALTO_PIE}px` }}>
          <div style={{ display: "flex", fontSize: "38px", fontWeight: 800, color: "#FFFFFF" }}>Todos los resultados en</div>
          <div style={{ display: "flex", fontSize: "38px", fontWeight: 800, color: "#FFD45C" }}>labankerard.com</div>
        </div>
      </div>
    ),
    {
      width: ANCHO,
      height: ALTO,
      fonts: [
        { name: "Manrope", data: fuenteRegular, weight: 400, style: "normal" },
        { name: "Manrope", data: fuenteExtraBold, weight: 800, style: "normal" },
      ],
    }
  );
  return Buffer.from(await imagen.arrayBuffer());
}
