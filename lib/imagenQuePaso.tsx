// lib/imagenQuePaso.tsx
// Imagen para "¿Qué pasó ayer en...?": una tarjeta por juego con el marcador y
// debajo sus momentos clave. Mismo estilo azul oscuro y dorado que las demás.

import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import path from "path";
import type { JuegoDetallado } from "./quePasoAyer";

const fuenteRegular = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-Regular.ttf"));
const fuenteExtraBold = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-ExtraBold.ttf"));

const ANCHO = 1080;
const ALTO_CABECERA = 250;
const ALTO_PIE = 160;
const DORADO = "#E7A63C";
const GRIS = "#8FA3BF";
const CARACTERES_POR_LINEA = 62; // a 25px en ~900px de ancho

function altoTarjeta(j: JuegoDetallado) {
  const lineas = j.detalles.reduce(function (total, d) { return total + Math.ceil(d.length / CARACTERES_POR_LINEA); }, 0);
  return 86 + lineas * 34 + (lineas ? 14 : 0);
}

export async function generarImagenQuePaso(titulo: string, fechaTexto: string, enlaceTexto: string, juegos: JuegoDetallado[]) {
  const alto = ALTO_CABECERA + juegos.reduce(function (t, j) { return t + altoTarjeta(j) + 14; }, 0) + ALTO_PIE;

  const imagen = new ImageResponse(
    (
      <div style={{ width: `${ANCHO}px`, height: `${alto}px`, display: "flex", flexDirection: "column", background: "#0B1F3A", fontFamily: "Manrope" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: `${ALTO_CABECERA}px`, paddingTop: "44px" }}>
          <div style={{ display: "flex", fontSize: "56px", fontWeight: 800, color: "#FFFFFF" }}>{titulo}</div>
          <div style={{ display: "flex", fontSize: "30px", color: DORADO, marginTop: "10px" }}>{fechaTexto}</div>
          <div style={{ display: "flex", width: "920px", height: "3px", background: "#1E4D8C", marginTop: "28px" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", paddingLeft: "50px", paddingRight: "50px" }}>
          {juegos.map(function (j, i) {
            const ganaVisitante = j.puntosVisitante > j.puntosLocal;
            const empate = j.puntosVisitante === j.puntosLocal;
            const colorV = empate ? "#FFFFFF" : ganaVisitante ? DORADO : GRIS;
            const colorL = empate ? "#FFFFFF" : ganaVisitante ? GRIS : DORADO;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: `${altoTarjeta(j)}px`,
                  marginBottom: "14px",
                  background: "#132C50",
                  borderRadius: "14px",
                  padding: "18px 30px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", height: "50px" }}>
                  <div style={{ display: "flex", flex: 1, fontSize: "36px", fontWeight: 800, color: colorV }}>{j.visitante}</div>
                  <div style={{ display: "flex", fontSize: "40px", fontWeight: 800, color: colorV }}>{j.puntosVisitante}</div>
                  <div style={{ display: "flex", width: "60px", justifyContent: "center", fontSize: "32px", color: GRIS }}>-</div>
                  <div style={{ display: "flex", fontSize: "40px", fontWeight: 800, color: colorL }}>{j.puntosLocal}</div>
                  <div style={{ display: "flex", flex: 1, justifyContent: "flex-end", fontSize: "36px", fontWeight: 800, color: colorL }}>{j.local}</div>
                </div>
                {j.detalles.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", marginTop: "12px", borderTop: "2px solid #1E4D8C", paddingTop: "10px" }}>
                    {j.detalles.map(function (d, k) {
                      return (
                        <div key={k} style={{ display: "flex", fontSize: "25px", lineHeight: "34px", color: "#D6E0EE" }}>
                          {d}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "18px" }}>
          <div style={{ display: "flex", fontSize: "34px", fontWeight: 800, color: "#FFFFFF" }}>{enlaceTexto}</div>
          <div style={{ display: "flex", fontSize: "24px", color: GRIS, marginTop: "16px" }}>Página informativa · La Bankera RD</div>
        </div>
      </div>
    ),
    {
      width: ANCHO,
      height: alto,
      fonts: [
        { name: "Manrope", data: fuenteRegular, weight: 400, style: "normal" },
        { name: "Manrope", data: fuenteExtraBold, weight: 800, style: "normal" },
      ],
    }
  );

  return Buffer.from(await imagen.arrayBuffer());
}
