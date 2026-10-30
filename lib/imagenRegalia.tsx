// lib/imagenRegalia.tsx
// Imagen para las publicaciones de la regalia pascual en Facebook. Las de
// octubre eran solo un enlace con texto y trajeron 3 visitas en 3 semanas;
// esta lleva un ejemplo con numeros concretos en grande, para que la persona
// se vea reflejada ("yo entre en mayo...") y quiera calcular el suyo.
// Mismo estilo azul y dorado que las demas imagenes (lib/imagenDato.tsx).

import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import path from "path";

const fuenteRegular = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-Regular.ttf"));
const fuenteExtraBold = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-ExtraBold.ttf"));

const ANCHO = 1080;
const ALTO = 1080;
const GOLD = "#E7A63C";
const VERDE = "#3FCB7E";
const DIM = "#A9B8CC";

export type EjemploRegalia = {
  gancho: string; // pregunta de arriba
  sueldo: number; // sueldo mensual
  situacion: string; // "Entraste a trabajar en mayo"
  meses: number; // meses trabajados en el ano
  caption: string; // primera linea del texto de Facebook
};

// La regalia es la doceava parte de lo ganado en el ano (art. 219 del
// Codigo de Trabajo): sueldo x meses trabajados / 12.
export const EJEMPLOS_REGALIA: EjemploRegalia[] = [
  { gancho: "¿Entraste a trabajar este año?", sueldo: 25000, situacion: "Entraste a trabajar en mayo", meses: 8, caption: "¿Entraste a trabajar este año? Igual te toca regalía, aunque no tengas el año completo 👇" },
  { gancho: "¿Te botaron o renunciaste?", sueldo: 30000, situacion: "Saliste de la empresa a final de julio", meses: 7, caption: "¿Te botaron o renunciaste este año? La regalía de esos meses te la tienen que pagar igual 👇" },
  { gancho: "¿Cuánto te toca si trabajaste todo el año?", sueldo: 20000, situacion: "Trabajaste de enero a diciembre", meses: 12, caption: "¿Trabajaste todo el año? Te toca un sueldo completo, y sin descuentos de ISR ni TSS 👇" },
  { gancho: "¿Empezaste a trabajar en septiembre?", sueldo: 18000, situacion: "Entraste a trabajar en septiembre", meses: 4, caption: "¿Empezaste a trabajar hace poco? Mira cuánto te toca de regalía con solo 4 meses 👇" },
];

export function montoRegalia(e: EjemploRegalia) {
  return Math.round((e.sueldo * e.meses) / 12);
}

function pesos(n: number) {
  return "RD$ " + n.toLocaleString("en-US");
}

export async function generarImagenRegalia(e: EjemploRegalia, diasParaPago: number) {
  const faltan = diasParaPago === 1 ? "Falta 1 día" : `Faltan ${diasParaPago} días`;
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "84px" }}>
          <div style={{ display: "flex", fontSize: "30px", fontWeight: 800, color: GOLD, letterSpacing: "3px" }}>🎄 REGALÍA PASCUAL 2026</div>
          <div style={{ display: "flex", fontSize: "58px", fontWeight: 800, color: "#FFFFFF", textAlign: "center", padding: "0 70px", marginTop: "26px", lineHeight: 1.2 }}>
            {e.gancho}
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#132C4F", borderRadius: "28px", padding: "40px 70px", border: "2px solid #1E4D8C" }}>
            <div style={{ display: "flex", fontSize: "34px", color: DIM }}>Si ganas {pesos(e.sueldo)} al mes</div>
            <div style={{ display: "flex", fontSize: "34px", color: DIM, marginTop: "8px" }}>y {e.situacion.charAt(0).toLowerCase() + e.situacion.slice(1)}</div>
            <div style={{ display: "flex", fontSize: "36px", fontWeight: 800, color: "#FFFFFF", marginTop: "30px" }}>te tocan</div>
            <div style={{ display: "flex", fontSize: "104px", fontWeight: 800, color: VERDE, lineHeight: 1.1 }}>{pesos(montoRegalia(e))}</div>
            <div style={{ display: "flex", fontSize: "28px", color: DIM, marginTop: "10px" }}>Sin descuentos de ISR ni TSS</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "64px", gap: "14px" }}>
          <div style={{ display: "flex", fontSize: "34px", fontWeight: 800, color: "#FFFFFF" }}>Calcula el tuyo gratis en 10 segundos</div>
          <div style={{ display: "flex", fontSize: "38px", fontWeight: 800, color: GOLD }}>labankerard.com</div>
          <div style={{ display: "flex", fontSize: "24px", color: DIM }}>{faltan} para el 20 de diciembre, fecha límite para pagarla</div>
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
