// Genera, al vuelo y gratis (sin API externa), la imagen de cada tarjeta de
// "Mas de La Bankera RD" en la portada: efemerides, mlb, nba, turismo.
// Reemplaza el plan anterior con Templated.io (requeria API key + plantillas
// disenadas a mano); esto usa next/og con los mismos datos que ya existen en
// el sitio. Se cachea 6 horas (revalidate) para no recalcular en cada visita.
import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import path from "path";
import { EFEMERIDES } from "@/app/efemerides/page";
import { CIUDADES } from "@/app/turismo/datos";

export const revalidate = 21600; // 6 horas

const fuenteExtraBold = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-ExtraBold.ttf"));
const fuenteRegular = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-Regular.ttf"));

const ANCHO = 1200;
const ALTO = 630;
const GOLD = "#E7A63C";
const NAVY = "#0B1F3A";
const DIM = "#9FB2CC";
const ROJO = "#D94F3D";
const VERDE = "#1E7A4C";

function hoyRD() {
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return { anio: ahoraRD.getUTCFullYear(), mes: ahoraRD.getUTCMonth() + 1, dia: ahoraRD.getUTCDate() };
}

function fechaISOayer() {
  const ayer = new Date(Date.now() - 4 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000);
  return ayer.toISOString().slice(0, 10);
}

function fechaLarga() {
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000);
  const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${dias[ahoraRD.getUTCDay()]}, ${ahoraRD.getUTCDate()} de ${meses[ahoraRD.getUTCMonth()]}`;
}

async function leerJsonPublico(nombre: string) {
  try {
    const res = await fetch(`https://labankerard.com/${nombre}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: `${ANCHO}px`,
        height: `${ALTO}px`,
        display: "flex",
        position: "relative",
        background: NAVY,
        fontFamily: "Manrope",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function Texto({ etiqueta, titulo, subtitulo }: { etiqueta: string; titulo: string; subtitulo: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: "80px", width: "680px", height: "100%" }}>
      <div style={{ display: "flex", fontSize: "28px", fontWeight: 800, color: GOLD, letterSpacing: "3px", marginBottom: "18px" }}>{etiqueta}</div>
      <div style={{ display: "flex", fontSize: "48px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.22, marginBottom: "16px" }}>{titulo}</div>
      <div style={{ display: "flex", fontSize: "24px", color: DIM }}>{subtitulo}</div>
      <div style={{ display: "flex", fontSize: "26px", fontWeight: 800, color: "#4A90E2", marginTop: "36px", textDecoration: "underline" }}>labankerard.com</div>
    </div>
  );
}

function Pelota() {
  return (
    <svg width="400" height="400" viewBox="0 0 24 24" style={{ position: "absolute", right: "60px", top: "115px", transform: "rotate(18deg)" }}>
      <circle cx="12" cy="12" r="11.3" fill="#F5F1E6" stroke="#CFC9B8" strokeWidth="0.3" />
      <path d="M5.5 2.5C7.5 6 7.5 18 5.5 21.5" stroke={ROJO} strokeWidth="0.9" strokeLinecap="round" fill="none" />
      <path d="M18.5 2.5C16.5 6 16.5 18 18.5 21.5" stroke={ROJO} strokeWidth="0.9" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function Balon() {
  return (
    <svg width="400" height="400" viewBox="0 0 24 24" style={{ position: "absolute", right: "60px", top: "115px" }}>
      <circle cx="12" cy="12" r="11.3" fill="none" stroke={GOLD} strokeWidth="0.6" />
      <line x1="12" y1="0.7" x2="12" y2="23.3" stroke={GOLD} strokeWidth="0.5" />
      <line x1="0.7" y1="12" x2="23.3" y2="12" stroke={GOLD} strokeWidth="0.5" />
      <path d="M3 6.5C7 9.5 17 9.5 21 6.5" stroke={GOLD} strokeWidth="0.5" fill="none" />
      <path d="M3 17.5C7 14.5 17 14.5 21 17.5" stroke={GOLD} strokeWidth="0.5" fill="none" />
    </svg>
  );
}

function Calendario() {
  return (
    <svg width="400" height="400" viewBox="0 0 24 24" style={{ position: "absolute", right: "60px", top: "115px" }}>
      <rect x="2.5" y="4" width="19" height="17" rx="2" fill="#13294D" stroke={GOLD} strokeWidth="0.5" />
      <line x1="2.5" y1="9" x2="21.5" y2="9" stroke={GOLD} strokeWidth="0.5" />
      <line x1="7" y1="1.8" x2="7" y2="6.2" stroke={GOLD} strokeWidth="0.7" strokeLinecap="round" />
      <line x1="17" y1="1.8" x2="17" y2="6.2" stroke={GOLD} strokeWidth="0.7" strokeLinecap="round" />
      <rect x="6.5" y="12" width="3.6" height="3.6" rx="0.6" fill={VERDE} />
    </svg>
  );
}

async function renderEfemerides() {
  const { mes, dia } = hoyRD();
  const de_hoy = EFEMERIDES.find((e) => e.mes === mes && e.dia === dia);
  return (
    <Marco>
      <Calendario />
      <Texto
        etiqueta="EFEMÉRIDES"
        titulo={de_hoy ? de_hoy.texto : "Un día como hoy en la historia de RD"}
        subtitulo="Qué pasó un día como hoy en la historia de República Dominicana"
      />
    </Marco>
  );
}

async function renderDeporte(slug: "mlb" | "nba") {
  const datos = await leerJsonPublico(`reel-${slug}.json`);
  const hayDatos = datos && datos.fecha === fechaISOayer();
  const etiqueta = slug === "mlb" ? "MLB" : "NBA";
  const titulo = hayDatos ? `Resultados de ${fechaLarga()}` : `Repaso de ${etiqueta}`;
  const subtitulo = hayDatos
    ? `Resumen de ayer en ${slug === "mlb" ? "las Grandes Ligas" : "la NBA"}`
    : `Vuelve cada mañana para el resumen de ${etiqueta}`;
  return (
    <Marco>
      {slug === "mlb" ? <Pelota /> : <Balon />}
      <Texto etiqueta={etiqueta} titulo={titulo} subtitulo={subtitulo} />
    </Marco>
  );
}

async function renderTurismo() {
  const reel = await leerJsonPublico("reel-turismo.json");
  const ciudad = reel?.destino ? CIUDADES.find((c) => c.slug === reel.destino) : null;
  return (
    <Marco>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: "80px", width: "680px", height: "100%" }}>
        <div style={{ display: "flex", fontSize: "28px", fontWeight: 800, color: GOLD, letterSpacing: "3px", marginBottom: "18px" }}>TURISMO RD</div>
        <div style={{ display: "flex", fontSize: "48px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.22, marginBottom: "16px" }}>
          {ciudad ? ciudad.nombre : "Descubre República Dominicana"}
        </div>
        <div style={{ display: "flex", fontSize: "24px", color: DIM }}>Un destino dominicano distinto para conocer cada día</div>
        <div style={{ display: "flex", fontSize: "26px", fontWeight: 800, color: "#4A90E2", marginTop: "36px", textDecoration: "underline" }}>labankerard.com</div>
      </div>
      {ciudad ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ciudad.foto.url}
          alt=""
          style={{ position: "absolute", right: 0, top: 0, width: "440px", height: `${ALTO}px`, objectFit: "cover" }}
        />
      ) : (
        <svg width="400" height="400" viewBox="0 0 24 24" style={{ position: "absolute", right: "60px", top: "115px" }}>
          <circle cx="17" cy="6" r="2.6" fill={GOLD} />
          <path d="M2.5 18C7 12.5 8.5 10.5 11 10.5C12.6 10.5 13 11.8 12 12.8C10.7 14.1 9 13 10.5 11.3C12.5 9 16 8.5 20.5 13" stroke={VERDE} strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <line x1="2" y1="20.5" x2="22" y2="20.5" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
    </Marco>
  );
}

export async function GET(_request: Request, props: { params: Promise<{ clave: string }> }) {
  const { clave } = await props.params;
  const fuentes = [
    { name: "Manrope", data: fuenteRegular, weight: 400 as const, style: "normal" as const },
    { name: "Manrope", data: fuenteExtraBold, weight: 800 as const, style: "normal" as const },
  ];

  let elemento: React.ReactElement;
  if (clave === "efemerides") elemento = await renderEfemerides();
  else if (clave === "mlb" || clave === "nba") elemento = await renderDeporte(clave);
  else if (clave === "turismo") elemento = await renderTurismo();
  else return new Response("No encontrado", { status: 404 });

  return new ImageResponse(elemento, { width: ANCHO, height: ALTO, fonts: fuentes });
}
