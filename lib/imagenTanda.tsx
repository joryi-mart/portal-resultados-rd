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
const COLUMNAS = 3;
const ESPACIO = 16;
const ALTO_CABECERA = 176;
const ALTO_PIE = 86;
const ANCHO_CELDA = Math.floor((ANCHO - MARGEN * 2 - ESPACIO * (COLUMNAS - 1)) / COLUMNAS);
const PADDING_CELDA = 16;

// "Quiniela Nacional (Noche)" no cabe en una linea: lo de parentesis sobra,
// porque la imagen ya dice de que tanda es.
function nombreCorto(sorteo: string) {
  return sorteo.replace(/\s*\(.*?\)\s*/g, " ").trim();
}

const ALTO_ANCHA = 132; // celda a lo ancho (Super Kino TV, 20 numeros)

export async function generarImagenTanda(titulo: string, fechaTexto: string, todos: ResultadoTanda[]) {
  // Los sorteos de muchos numeros van al final, cada uno en una celda a lo ancho.
  const resultados = todos.filter(function (r) { return r.numeros.split("-").length <= 6; });
  const anchos = todos.filter(function (r) { return r.numeros.split("-").length > 6; });
  const filas = Math.max(1, Math.ceil(resultados.length / COLUMNAS));
  const altoDisponible = ALTO - ALTO_CABECERA - ALTO_PIE - 36 - anchos.length * (ALTO_ANCHA + ESPACIO);
  const altoCelda = Math.min(240, Math.floor((altoDisponible - ESPACIO * (filas - 1)) / filas));
  // Espacio para las bolitas: lo que queda de la celda tras los dos renglones de texto.
  const altoBolitas = Math.max(40, Math.min(92, altoCelda - PADDING_CELDA * 2 - 70));

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

        <div style={{ display: "flex", flexWrap: "wrap", gap: `${ESPACIO}px`, padding: `0 ${MARGEN}px`, flex: 1, alignContent: "flex-start" }}>
          {resultados.map(function (r, i) {
            const nums = r.numeros.split("-");
            const espacioBolas = 8;
            const porAncho = Math.floor((ANCHO_CELDA - PADDING_CELDA * 2 - espacioBolas * (nums.length - 1)) / nums.length);
            const tam = Math.min(altoBolitas, porAncho);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: `${ANCHO_CELDA}px`,
                  height: `${altoCelda}px`,
                  background: "#FFFFFF",
                  borderRadius: "20px",
                  border: `3px solid ${AZUL}`,
                  padding: `${PADDING_CELDA}px`,
                }}
              >
                <div style={{ display: "flex", fontSize: "24px", fontWeight: 800, color: ROJO, letterSpacing: "1px" }}>{r.loteria.toUpperCase()}</div>
                <div style={{ display: "flex", fontSize: nombreCorto(r.sorteo).length > 17 ? "25px" : "29px", fontWeight: 800, color: AZUL_OSCURO, lineHeight: 1.15, marginBottom: "8px" }}>{nombreCorto(r.sorteo)}</div>
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
