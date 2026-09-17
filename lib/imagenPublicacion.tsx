// lib/imagenPublicacion.tsx
// Genera la imagen cuadrada que acompaña cada publicacion de Facebook,
// con el nombre de la loteria y los resultados del dia.
//
// Usa ImageResponse (next/og), la misma herramienta que usa Next.js para
// las imagenes de vista previa (Open Graph) — a diferencia de dibujar el
// SVG a mano con sharp, esta si incrusta bien las fuentes en Vercel.

import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import path from "path";

type Resultado = { sorteoNombre: string; numeros: string };

const fuenteRegular = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-Regular.ttf"));
const fuenteExtraBold = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-ExtraBold.ttf"));

export async function generarImagenResultados(loteriaNombre: string, fechaTexto: string, resultados: Resultado[]) {
  const imagen = new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #173B63 0%, #0A1830 100%)",
          padding: "56px 80px",
          fontFamily: "Manrope",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              width: "68px",
              height: "68px",
              borderRadius: "999px",
              background: "#2E6DA4",
              border: "2px solid #E7A63C",
            }}
          />
          <div style={{ display: "flex", fontSize: "36px", fontWeight: 800, color: "#FBF7EE" }}>
            La Bankera<span style={{ color: "#E7A63C" }}>RD</span>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "56px", fontWeight: 800, color: "#FBF7EE", marginTop: "48px" }}>
          {loteriaNombre}
        </div>
        <div style={{ display: "flex", fontSize: "28px", color: "#9AB0CC", marginTop: "8px" }}>
          {fechaTexto}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "36px" }}>
          {resultados.map(function (r, i) {
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "14px",
                  padding: "22px 32px",
                }}
              >
                <div style={{ display: "flex", fontSize: "30px", color: "#D5DEEA" }}>{r.sorteoNombre}</div>
                <div style={{ display: "flex", fontSize: "34px", fontWeight: 800, color: "#F6D983" }}>{r.numeros}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", fontSize: "26px", color: "#D5DEEA", marginTop: "56px" }}>
          labankerard.com
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 240 + resultados.length * 104 + 160,
      fonts: [
        { name: "Manrope", data: fuenteRegular, weight: 400, style: "normal" },
        { name: "Manrope", data: fuenteExtraBold, weight: 800, style: "normal" },
      ],
    }
  );

  const arrayBuffer = await imagen.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
