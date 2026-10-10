// lib/imagenJuegosHoy.tsx
// Imagen para "Juegos de hoy en MLB": una tarjeta por juego con la hora en
// hora de RD y debajo la serie (playoffs), abridores y TV. Mismo estilo azul
// oscuro y dorado que las demás publicaciones.

import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import path from "path";
import type { JuegoDeHoy } from "./juegosDeHoy";

const fuenteRegular = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-Regular.ttf"));
const fuenteExtraBold = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-ExtraBold.ttf"));

const ANCHO = 1080;
const ALTO_CABECERA = 250;
const ALTO_PIE = 160;
const DORADO = "#E7A63C";
const GRIS = "#8FA3BF";
const ROJO = "#CE1126";

function detalles(j: JuegoDeHoy) {
  return [
    j.serie ? `${j.serie}${j.estadoSerie ? ` · ${j.estadoSerie}` : ""}` : null,
    j.abridores ? `Abridores: ${j.abridores}` : null,
    j.tv ? `TV: ${j.tv}` : null,
  ].filter(Boolean) as string[];
}

function altoTarjeta(j: JuegoDeHoy) {
  const n = detalles(j).length;
  return 96 + (j.decisivo ? 50 : 0) + n * 36 + (n ? 14 : 0);
}

export async function generarImagenJuegosHoy(titulo: string, fechaTexto: string, enlaceTexto: string, juegos: JuegoDeHoy[]) {
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
            const lineas = detalles(j);
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
                {j.decisivo ? (
                  <div style={{ display: "flex", marginBottom: "10px" }}>
                    <div style={{ display: "flex", background: ROJO, color: "#FFFFFF", fontSize: "24px", fontWeight: 800, padding: "4px 18px", borderRadius: "20px" }}>
                      ¡JUEGO DECISIVO!
                    </div>
                  </div>
                ) : null}
                <div style={{ display: "flex", alignItems: "center", height: "50px" }}>
                  <div style={{ display: "flex", flex: 1, fontSize: "36px", fontWeight: 800, color: "#FFFFFF" }}>
                    {`${j.visitante} vs ${j.local}`}
                  </div>
                  <div style={{ display: "flex", fontSize: "40px", fontWeight: 800, color: DORADO }}>{j.hora}</div>
                </div>
                {lineas.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", marginTop: "12px", borderTop: "2px solid #1E4D8C", paddingTop: "10px" }}>
                    {lineas.map(function (d, k) {
                      return (
                        <div key={k} style={{ display: "flex", fontSize: "26px", lineHeight: "36px", color: k === 0 && j.serie ? DORADO : "#D6E0EE" }}>
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
          <div style={{ display: "flex", fontSize: "24px", color: GRIS, marginTop: "16px" }}>Horas de República Dominicana · La Bankera RD</div>
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
