// lib/imagenDeportes.tsx
// Imagen de marcadores (quien gano ayer) para las publicaciones de Facebook de
// béisbol y NBA. Mismo estilo azul oscuro y dorado que las de loterías.

import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import path from "path";
import type { JuegoTerminado } from "./resultadosDeportes";

const fuenteRegular = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-Regular.ttf"));
const fuenteExtraBold = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-ExtraBold.ttf"));

const ANCHO = 1080;
const ALTO_CABECERA = 270;
const ALTO_PIE = 170;
const DORADO = "#E7A63C";
const GRIS = "#8FA3BF";

export async function generarImagenMarcadores(titulo: string, fechaTexto: string, enlaceTexto: string, juegos: JuegoTerminado[]) {
  // Con pocos juegos (NBA) las filas son un poco mas altas; con muchos (béisbol) se compactan.
  const alturaFila = juegos.length <= 12 ? 74 : 62;
  const tamanoNombre = juegos.length <= 12 ? 36 : 31;
  const tamanoPuntos = juegos.length <= 12 ? 40 : 34;
  const alto = ALTO_CABECERA + juegos.length * alturaFila + ALTO_PIE;

  const imagen = new ImageResponse(
    (
      <div style={{ width: `${ANCHO}px`, height: `${alto}px`, display: "flex", flexDirection: "column", background: "#0B1F3A", fontFamily: "Manrope" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: `${ALTO_CABECERA}px`, paddingTop: "42px" }}>
          <div style={{ display: "flex", fontSize: "54px", fontWeight: 800, color: "#FFFFFF" }}>{titulo}</div>
          <div style={{ display: "flex", fontSize: "30px", color: DORADO, marginTop: "10px" }}>{fechaTexto}</div>
          <div style={{ display: "flex", width: "920px", height: "3px", background: "#1E4D8C", marginTop: "26px" }} />
          <div style={{ display: "flex", fontSize: "24px", color: GRIS, marginTop: "22px" }}>Ganador en dorado · Marcador final</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", paddingLeft: "60px", paddingRight: "60px" }}>
          {juegos.map(function (j, i) {
            const gana = j.puntosVisitante > j.puntosLocal;
            const nombreVisitante = j.visitante + (j.etiqueta ? ` (${j.etiqueta})` : "");
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: `${alturaFila - 10}px`,
                  marginBottom: "10px",
                  background: "#132C50",
                  borderRadius: "12px",
                  paddingLeft: "30px",
                  paddingRight: "30px",
                }}
              >
                <div style={{ display: "flex", width: "380px", fontSize: `${tamanoNombre}px`, fontWeight: gana ? 800 : 400, color: gana ? DORADO : GRIS }}>
                  {nombreVisitante}
                </div>
                <div style={{ display: "flex", width: "70px", justifyContent: "center", fontSize: `${tamanoPuntos}px`, fontWeight: 800, color: gana ? DORADO : GRIS }}>
                  {j.puntosVisitante}
                </div>
                <div style={{ display: "flex", width: "70px", justifyContent: "center", fontSize: "32px", color: GRIS }}>-</div>
                <div style={{ display: "flex", width: "70px", justifyContent: "center", fontSize: `${tamanoPuntos}px`, fontWeight: 800, color: gana ? GRIS : DORADO }}>
                  {j.puntosLocal}
                </div>
                <div style={{ display: "flex", flex: 1, justifyContent: "flex-end", fontSize: `${tamanoNombre}px`, fontWeight: gana ? 400 : 800, color: gana ? GRIS : DORADO }}>
                  {j.local}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "14px" }}>
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
