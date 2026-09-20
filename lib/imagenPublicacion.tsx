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

// Algunos sorteos traen muchos numeros (ej. Super Kino TV, hasta 20), que no
// caben en una sola linea de texto. Por eso cada numero se dibuja como una
// "bolita" propia (igual que en la pagina web) dentro de una fila que puede
// pasar a varias lineas, en vez de un texto largo que se corta.
const ANCHO_IMAGEN = 1080;
const PADDING_LATERAL = 80;
const PADDING_FILA_LATERAL = 32;
const ANCHO_CHIPS = ANCHO_IMAGEN - PADDING_LATERAL * 2 - PADDING_FILA_LATERAL * 2;
const ESPACIO_CHIP = 14;

// Las bolitas son grandes y de alto contraste (blancas con numero azul oscuro)
// para que se lean bien en el celular. Solo se achican cuando un sorteo trae
// muchos numeros (ej. Super Kino TV con 20), para que quepan en 2 lineas.
function tamanoChip(cantidadNumeros: number) {
  if (cantidadNumeros <= 6) return 118;
  if (cantidadNumeros <= 8) return 84;
  if (cantidadNumeros <= 12) return 80;
  return 72;
}

function chipsPorLinea(ancho: number) {
  return Math.max(1, Math.floor((ANCHO_CHIPS + ESPACIO_CHIP) / (ancho + ESPACIO_CHIP)));
}

const ALTO_ETIQUETA = 62; // nombre del sorteo + espacio antes de las bolitas
const ESPACIO_ENTRE_LINEAS_CHIPS = 12;
const PADDING_FILA_VERTICAL = 52; // 26px arriba y abajo
const ESPACIO_ENTRE_FILAS = 20;
const ALTO_CABECERA = 345; // logo + nombre de loteria + fecha
const ALTO_PIE = 155;

function alturaFila(cantidadNumeros: number) {
  const ancho = tamanoChip(cantidadNumeros);
  const lineas = Math.max(1, Math.ceil(cantidadNumeros / chipsPorLinea(ancho)));
  return PADDING_FILA_VERTICAL + ALTO_ETIQUETA + lineas * ancho + (lineas - 1) * ESPACIO_ENTRE_LINEAS_CHIPS;
}

export async function generarImagenResultados(loteriaNombre: string, fechaTexto: string, resultados: Resultado[]) {
  const alturaFilas = resultados.reduce(function (acc, r) { return acc + alturaFila(r.numeros.split("-").length); }, 0);
  const alturaTotal =
    ALTO_CABECERA + alturaFilas + Math.max(0, resultados.length - 1) * ESPACIO_ENTRE_FILAS + ALTO_PIE;

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

        <div style={{ display: "flex", fontSize: "72px", fontWeight: 800, color: "#FFFFFF", marginTop: "48px" }}>
          {loteriaNombre}
        </div>
        <div style={{ display: "flex", fontSize: "34px", color: "#C9D6E8", marginTop: "8px" }}>
          {fechaTexto}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: `${ESPACIO_ENTRE_FILAS}px`, marginTop: "36px" }}>
          {resultados.map(function (r, i) {
            const numeros = r.numeros.split("-");
            const ancho = tamanoChip(numeros.length);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  background: "rgba(255,255,255,0.09)",
                  borderRadius: "18px",
                  padding: "26px 32px",
                }}
              >
                <div style={{ display: "flex", fontSize: "38px", fontWeight: 800, color: "#F2C065" }}>{r.sorteoNombre}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: `${ESPACIO_CHIP}px` }}>
                  {numeros.map(function (n, ni) {
                    return (
                      <div
                        key={ni}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: `${ancho}px`,
                          height: `${ancho}px`,
                          padding: "0 6px",
                          borderRadius: "999px",
                          background: "#FFFFFF",
                          border: `${Math.round(ancho / 16)}px solid #E7A63C`,
                          fontSize: `${Math.round(ancho * 0.5)}px`,
                          fontWeight: 800,
                          color: "#0A1830",
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
        </div>

        <div style={{ display: "flex", fontSize: "32px", fontWeight: 800, color: "#F2C065", marginTop: "56px" }}>
          labankerard.com
        </div>
      </div>
    ),
    {
      width: ANCHO_IMAGEN,
      height: alturaTotal,
      fonts: [
        { name: "Manrope", data: fuenteRegular, weight: 400, style: "normal" },
        { name: "Manrope", data: fuenteExtraBold, weight: 800, style: "normal" },
      ],
    }
  );

  const arrayBuffer = await imagen.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
