// lib/imagenDato.tsx
// Imagen para las publicaciones "¿Sabías qué...?" (datos curiosos que no son de
// lotería del día, para variar el contenido de Facebook). Mismo estilo azul y dorado.

import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import path from "path";

const fuenteRegular = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-Regular.ttf"));
const fuenteExtraBold = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-ExtraBold.ttf"));

const ANCHO = 1080;
const ALTO = 1080;
const GOLD = "#E7A63C";
const DIM = "#8FA3BF";

export async function generarImagenDato(texto: string, pie: string, titulo = "¿SABÍAS QUÉ...?") {
  const imagen = new ImageResponse(
    (
      <div
        style={{
          width: `${ANCHO}px`,
          height: `${ALTO}px`,
          display: "flex",
          flexDirection: "column",
          background: "#0B1F3A",
          border: "3px solid #E7A63C",
          fontFamily: "Manrope",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "108px" }}>
          <div style={{ display: "flex", fontSize: "50px", fontWeight: 800, color: GOLD, textAlign: "center", padding: "0 60px" }}>{titulo}</div>
          <div style={{ display: "flex", width: "480px", height: "3px", background: "#1E4D8C", marginTop: "22px" }} />
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", padding: "0 100px" }}>
          <div style={{ display: "flex", fontSize: "46px", fontWeight: 800, color: "#FFFFFF", textAlign: "center", lineHeight: 1.35 }}>
            {texto}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "70px", gap: "18px" }}>
          <div style={{ display: "flex", fontSize: "28px", color: DIM, textAlign: "center", padding: "0 100px" }}>{pie}</div>
          <div style={{ display: "flex", fontSize: "34px", fontWeight: 800, color: GOLD }}>labankerard.com</div>
          <div style={{ display: "flex", fontSize: "22px", color: DIM }}>Página informativa · La Bankera RD</div>
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
