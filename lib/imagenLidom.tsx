// Imagenes para las publicaciones diarias de LIDOM en Facebook: tabla de
// posiciones y juegos de hoy. Mismo estilo azul/dorado que el resto del
// sitio, con datos reales de la API oficial de MLB (sportId=17, liga 131),
// sin copiar el diseno ni los logos del canal de TV.
import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import path from "path";

const fuenteRegular = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-Regular.ttf"));
const fuenteExtraBold = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-ExtraBold.ttf"));

const ANCHO = 1080;
const ALTO = 1080;
const NAVY = "#0B1F3A";
const GOLD = "#E7A63C";
const DIM = "#8FA3BF";
const AZUL = "#1E4D8C";

export const NOMBRE_CORTO_LIDOM: Record<number, string> = {
  667: "Águilas",
  668: "Toros",
  669: "Estrellas",
  670: "Gigantes",
  671: "Escogido",
  672: "Licey",
};

function Marco({
  titulo,
  fecha,
  children,
  tamFecha = "26px",
  tamPie = "32px",
  tamPieChico = "20px",
}: {
  titulo: string;
  fecha: string;
  children: React.ReactNode;
  tamFecha?: string;
  tamPie?: string;
  tamPieChico?: string;
}) {
  return (
    <div
      style={{
        width: `${ANCHO}px`,
        height: `${ALTO}px`,
        display: "flex",
        flexDirection: "column",
        background: NAVY,
        border: "3px solid #E7A63C",
        fontFamily: "Manrope",
        padding: "70px 70px 60px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", fontSize: "46px", fontWeight: 800, color: GOLD, letterSpacing: "3px" }}>{titulo}</div>
        <div style={{ display: "flex", fontSize: tamFecha, color: DIM, marginTop: "8px" }}>{fecha}</div>
        <div style={{ display: "flex", width: "480px", height: "3px", background: AZUL, marginTop: "22px" }} />
      </div>
      <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>{children}</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <div style={{ display: "flex", fontSize: tamPie, fontWeight: 800, color: GOLD }}>labankerard.com</div>
        <div style={{ display: "flex", fontSize: tamPieChico, color: DIM }}>Página informativa · La Bankera RD</div>
      </div>
    </div>
  );
}

type FilaPosicion = { equipoId: number; nombre: string; juegosJugados: number; victorias: number; derrotas: number; porcentaje: string; diferencia: string };

export async function generarImagenPosicionesLidom(posiciones: FilaPosicion[], fecha: string) {
  const anchoCol = ["42%", "14.5%", "14.5%", "14.5%", "14.5%"];
  const encabezados = ["EQUIPO", "JJ", "G", "P", "PCT"];
  const imagen = new ImageResponse(
    (
      <Marco titulo="LIDOM · TABLA DE POSICIONES" fecha={fecha}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", borderBottom: `2px solid ${AZUL}`, paddingBottom: "12px", marginBottom: "6px" }}>
            {encabezados.map(function (h, i) {
              return (
                <div key={h} style={{ display: "flex", width: anchoCol[i], fontSize: "20px", fontWeight: 800, color: DIM, justifyContent: i === 0 ? "flex-start" : "center" }}>
                  {h}
                </div>
              );
            })}
          </div>
          {posiciones.map(function (p, i) {
            return (
              <div
                key={p.equipoId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "16px 0",
                  borderBottom: i < posiciones.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}
              >
                <div style={{ display: "flex", width: anchoCol[0], fontSize: "28px", fontWeight: 800, color: "#FFFFFF" }}>
                  {NOMBRE_CORTO_LIDOM[p.equipoId] || p.nombre}
                </div>
                <div style={{ display: "flex", width: anchoCol[1], fontSize: "26px", color: "#FFFFFF", justifyContent: "center" }}>{p.juegosJugados}</div>
                <div style={{ display: "flex", width: anchoCol[2], fontSize: "26px", fontWeight: 800, color: GOLD, justifyContent: "center" }}>{p.victorias}</div>
                <div style={{ display: "flex", width: anchoCol[3], fontSize: "26px", color: "#FFFFFF", justifyContent: "center" }}>{p.derrotas}</div>
                <div style={{ display: "flex", width: anchoCol[4], fontSize: "26px", color: "#FFFFFF", justifyContent: "center" }}>{p.porcentaje}</div>
              </div>
            );
          })}
        </div>
      </Marco>
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

type Juego = { visitante: string; local: string; venue: string; hora: string };

export async function generarImagenJuegosLidom(juegos: Juego[], fecha: string) {
  const TAM = "34px";
  const imagen = new ImageResponse(
    (
      <Marco titulo="LIDOM · JUEGOS DE HOY" fecha={fecha} tamFecha="28px" tamPie="30px" tamPieChico="22px">
        {juegos.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {juegos.map(function (j, i) {
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "18px",
                    border: `1px solid ${AZUL}`,
                    padding: "16px 26px",
                    gap: "4px",
                  }}
                >
                  <div style={{ display: "flex", fontSize: TAM, fontWeight: 800, color: "#FFFFFF" }}>
                    {j.visitante} <span style={{ color: DIM, margin: "0 12px" }}>@</span> {j.local}
                  </div>
                  <div style={{ display: "flex", fontSize: TAM, color: DIM }}>{j.venue}</div>
                  <div style={{ display: "flex", fontSize: TAM, fontWeight: 800, color: GOLD }}>{j.hora}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", fontSize: TAM, fontWeight: 800, color: "#FFFFFF", textAlign: "center", justifyContent: "center" }}>
            Hoy no hay juegos programados
          </div>
        )}
      </Marco>
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
