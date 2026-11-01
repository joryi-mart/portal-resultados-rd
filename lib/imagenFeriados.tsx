// Imagenes de dias feriados para Facebook, con nuestro estilo (azul y dorado)
// y letra grande para leerse en el celular. Los datos son los oficiales de
// lib/feriados.ts; no se copia el diseno de nadie ni se usan logos del gobierno.
import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import path from "path";
import { MESES, diaSemana, type Feriado } from "@/lib/feriados";

const fuenteRegular = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-Regular.ttf"));
const fuenteExtraBold = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-ExtraBold.ttf"));

const NAVY = "#0B1F3A";
const GOLD = "#E7A63C";
const DIM = "#A9B8CC";
const AZUL = "#1E4D8C";

const FUENTES = [
  { name: "Manrope", data: fuenteRegular, weight: 400 as const, style: "normal" as const },
  { name: "Manrope", data: fuenteExtraBold, weight: 800 as const, style: "normal" as const },
];

function Pie() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <div style={{ display: "flex", fontSize: "40px", fontWeight: 800, color: GOLD }}>labankerard.com</div>
      <div style={{ display: "flex", fontSize: "24px", color: DIM }}>Fuente: Ministerio de Trabajo · Página informativa</div>
    </div>
  );
}

function partes(fechaISO: string) {
  const [, m, d] = fechaISO.split("-").map(Number);
  return { dia: String(d).padStart(2, "0"), mes: MESES[m - 1], semana: diaSemana(fechaISO) };
}

async function aPng(elemento: React.ReactElement, alto: number) {
  const imagen = new ImageResponse(elemento, { width: 1080, height: alto, fonts: FUENTES });
  return Buffer.from(await imagen.arrayBuffer());
}

// Calendario completo del año, en dos columnas (1080 x 1350, formato vertical).
export async function imagenCalendarioFeriados(anio: number, feriados: Feriado[]) {
  const mitad = Math.ceil(feriados.length / 2);
  const columnas = [feriados.slice(0, mitad), feriados.slice(mitad)];
  return aPng(
    <div style={{ width: "1080px", height: "1350px", display: "flex", flexDirection: "column", background: NAVY, border: `4px solid ${GOLD}`, fontFamily: "Manrope", padding: "50px 44px 40px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", fontSize: "66px", fontWeight: 800, color: "#FFFFFF" }}>
          DÍAS FERIADOS <span style={{ color: GOLD, marginLeft: "18px" }}>{anio}</span>
        </div>
        <div style={{ display: "flex", fontSize: "30px", color: DIM, marginTop: "4px" }}>República Dominicana · calendario oficial</div>
      </div>
      <div style={{ display: "flex", flex: 1, gap: "28px", marginTop: "30px", marginBottom: "24px" }}>
        {columnas.map(function (col, c) {
          return (
            <div key={c} style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
              {col.map(function (f) {
                const p = partes(f.fecha);
                return (
                  <div key={f.fecha} style={{ display: "flex", alignItems: "center", gap: "14px", borderBottom: `2px solid ${AZUL}`, paddingBottom: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "138px" }}>
                      <div style={{ display: "flex", fontSize: "62px", fontWeight: 800, color: GOLD, lineHeight: 1 }}>{p.dia}</div>
                      <div style={{ display: "flex", fontSize: p.mes.length > 7 ? "19px" : "22px", fontWeight: 800, color: DIM, textTransform: "uppercase" }}>{p.mes}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                      <div style={{ display: "flex", fontSize: "29px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.15 }}>{f.nombre}</div>
                      <div style={{ display: "flex", fontSize: "24px", color: f.nota ? GOLD : DIM, marginTop: "2px" }}>
                        {f.nota ? `Se pasa al ${p.semana}` : p.semana}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <Pie />
    </div>,
    1350
  );
}

// Un feriado en grande: "¿El lunes 9 es feriado? Sí" o "Faltan 24 días".
export async function imagenProximoFeriado(feriado: Feriado, titulo: string, subtitulo: string) {
  const p = partes(feriado.fecha);
  return aPng(
    <div style={{ width: "1080px", height: "1080px", display: "flex", flexDirection: "column", background: NAVY, border: `4px solid ${GOLD}`, fontFamily: "Manrope", padding: "60px 56px 44px" }}>
      <div style={{ display: "flex", justifyContent: "center", fontSize: "60px", fontWeight: 800, color: "#FFFFFF", textAlign: "center" }}>{titulo}</div>
      <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
        <div style={{ display: "flex", fontSize: "44px", fontWeight: 800, color: DIM, textTransform: "uppercase" }}>{p.semana}</div>
        <div style={{ display: "flex", fontSize: "200px", fontWeight: 800, color: GOLD, lineHeight: 1 }}>{p.dia}</div>
        <div style={{ display: "flex", fontSize: "54px", fontWeight: 800, color: "#FFFFFF", textTransform: "uppercase" }}>de {p.mes}</div>
        <div style={{ display: "flex", fontSize: "52px", fontWeight: 800, color: GOLD, marginTop: "26px", textAlign: "center" }}>{feriado.nombre}</div>
        {feriado.nota ? <div style={{ display: "flex", fontSize: "34px", color: DIM, marginTop: "6px", textAlign: "center" }}>{feriado.nota}</div> : null}
        <div style={{ display: "flex", fontSize: "40px", fontWeight: 800, color: "#FFFFFF", marginTop: "24px", background: AZUL, borderRadius: "999px", padding: "12px 40px" }}>{subtitulo}</div>
      </div>
      <Pie />
    </div>,
    1080
  );
}

// Los feriados de un mes (o, si no hay, el proximo que viene).
export async function imagenFeriadosDelMes(nombreMes: string, feriados: Feriado[], siguiente?: Feriado) {
  // Con 1 o 2 feriados la imagen quedaria vacia: se agrandan.
  const pocos = feriados.length <= 2;
  const tamDia = pocos ? "150px" : "92px";
  const tamNombre = pocos ? "64px" : "46px";
  const tamNota = pocos ? "40px" : "32px";
  return aPng(
    <div style={{ width: "1080px", height: "1080px", display: "flex", flexDirection: "column", background: NAVY, border: `4px solid ${GOLD}`, fontFamily: "Manrope", padding: "60px 56px 44px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", fontSize: "40px", fontWeight: 800, color: DIM }}>FERIADOS DE</div>
        <div style={{ display: "flex", fontSize: "84px", fontWeight: 800, color: GOLD, textTransform: "uppercase", lineHeight: 1.05 }}>{nombreMes}</div>
      </div>
      <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", gap: "22px" }}>
        {feriados.length > 0 ? (
          feriados.map(function (f) {
            const p = partes(f.fecha);
            return (
              <div key={f.fecha} style={{ display: "flex", alignItems: "center", gap: "28px", borderBottom: `2px solid ${AZUL}`, paddingBottom: "16px" }}>
                <div style={{ display: "flex", fontSize: tamDia, fontWeight: 800, color: GOLD, width: pocos ? "220px" : "140px", justifyContent: "center", lineHeight: 1 }}>{p.dia}</div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", fontSize: tamNombre, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.1 }}>{f.nombre}</div>
                  <div style={{ display: "flex", fontSize: tamNota, color: f.nota ? GOLD : DIM, marginTop: "4px" }}>{f.nota || `Cae ${p.semana}`}</div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px", textAlign: "center" }}>
            <div style={{ display: "flex", fontSize: "54px", fontWeight: 800, color: "#FFFFFF" }}>Este mes no hay feriados</div>
            {siguiente ? (
              <div style={{ display: "flex", fontSize: "44px", color: GOLD, textAlign: "center" }}>
                El próximo: {siguiente.nombre}, {partes(siguiente.fecha).semana} {Number(siguiente.fecha.slice(8))} de {partes(siguiente.fecha).mes}
              </div>
            ) : null}
          </div>
        )}
      </div>
      <Pie />
    </div>,
    1080
  );
}
