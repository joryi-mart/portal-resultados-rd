// Imagen del bracket de la postemporada de MLB (Serie Divisional, Campeonato y
// Serie Mundial) para Facebook, 1080x1350. Datos reales de la API oficial de MLB.
// Calidad "de diseñador": fondo de estadio (foto de Pixabay ya difuminada en
// lib/fondos/bracket-mlb.jpg), letras con brillo y equipos en circulos con sus
// colores y siglas. Sin logos oficiales de los equipos.
import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import path from "path";
import { MLB_EN_ESPANOL } from "./resultadosDeportes";

const leer = (archivo: string) => readFileSync(path.join(process.cwd(), archivo));
const fuenteRegular = leer("lib/fuentes/Manrope-Regular.ttf");
const fuenteExtraBold = leer("lib/fuentes/Manrope-ExtraBold.ttf");
const fuenteFirma = leer("lib/fuentes/KaushanScript-Regular.ttf");
const fuenteGruesa = leer("lib/fuentes/Anton-Regular.ttf");
const fondo = `data:image/jpeg;base64,${leer("lib/fondos/bracket-mlb.jpg").toString("base64")}`;

const ANCHO = 1080;
const ALTO = 1350;
const GOLD = "#E7A63C";
const GOLD_CLARO = "#FFD27A";
const BLANCO = "#FFFFFF";
const LINEA = "rgba(231,166,60,0.75)";

// Siglas y colores (principal, secundario) de cada equipo.
const EQUIPOS: Record<string, [string, string, string]> = {
  "Arizona Diamondbacks": ["ARI", "#A71930", "#E3D4AD"],
  "Atlanta Braves": ["ATL", "#CE1141", "#13274F"],
  "Athletics": ["ATH", "#003831", "#EFB21E"],
  "Baltimore Orioles": ["BAL", "#DF4601", "#000000"],
  "Boston Red Sox": ["BOS", "#BD3039", "#0C2340"],
  "Chicago Cubs": ["CHC", "#0E3386", "#CC3433"],
  "Chicago White Sox": ["CWS", "#27251F", "#C4CED4"],
  "Cincinnati Reds": ["CIN", "#C6011F", "#000000"],
  "Cleveland Guardians": ["CLE", "#00385D", "#E50022"],
  "Colorado Rockies": ["COL", "#33006F", "#C4CED4"],
  "Detroit Tigers": ["DET", "#0C2340", "#FA4616"],
  "Houston Astros": ["HOU", "#002D62", "#EB6E1F"],
  "Kansas City Royals": ["KC", "#004687", "#BD9B60"],
  "Los Angeles Angels": ["LAA", "#BA0021", "#003263"],
  "Los Angeles Dodgers": ["LAD", "#005A9C", "#EF3E42"],
  "Miami Marlins": ["MIA", "#00A3E0", "#EF3340"],
  "Milwaukee Brewers": ["MIL", "#12284B", "#FFC52F"],
  "Minnesota Twins": ["MIN", "#002B5C", "#D31145"],
  "New York Mets": ["NYM", "#002D72", "#FF5910"],
  "New York Yankees": ["NYY", "#0C2340", "#C4CED4"],
  "Philadelphia Phillies": ["PHI", "#E81828", "#002D72"],
  "Pittsburgh Pirates": ["PIT", "#27251F", "#FDB827"],
  "San Diego Padres": ["SD", "#2F241D", "#FFC425"],
  "San Francisco Giants": ["SF", "#FD5A1E", "#27251F"],
  "Seattle Mariners": ["SEA", "#0C2C56", "#005C5C"],
  "St. Louis Cardinals": ["STL", "#C41E3A", "#0C2340"],
  "Tampa Bay Rays": ["TB", "#092C5C", "#8FBCE6"],
  "Texas Rangers": ["TEX", "#003278", "#C0111F"],
  "Toronto Blue Jays": ["TOR", "#134A8E", "#1D2D5C"],
  "Washington Nationals": ["WSH", "#AB0003", "#14225A"],
};

export type EquipoSerie = { nombre: string; corto: string; siglas: string; color1: string; color2: string; victorias: number };
export type Serie = { a: EquipoSerie; b: EquipoSerie; ganador: "a" | "b" | null; necesarias: number; terminada: boolean };
export type BracketMLB = {
  temporada: number;
  divisionalAL: Serie[];
  divisionalNL: Serie[];
  campeonatoAL: Serie | null;
  campeonatoNL: Serie | null;
  mundial: Serie | null;
  fechaMundial: string | null; // primer juego de la Serie Mundial (ISO)
};

function equipo(t: any, victorias: number): EquipoSerie {
  const nombre: string = t.team?.name || "";
  const [siglas, color1, color2] = EQUIPOS[nombre] || [nombre.slice(0, 3).toUpperCase(), "#1E4D8C", "#0B1F3A"];
  return { nombre, corto: MLB_EN_ESPANOL[nombre] || t.team?.teamName || nombre, siglas, color1, color2, victorias };
}

function serie(s: any): Serie {
  const juegos: any[] = s.games || [];
  // Se cuentan los juegos terminados uno por uno: el "leagueRecord" que manda MLB
  // no siempre esta al dia (juegos pospuestos o todavia por jugar).
  const ganados = new Map<string, number>();
  for (const j of juegos) {
    if (j.status?.abstractGameState !== "Final") continue;
    const g = [j.teams.away, j.teams.home].find((t: any) => t.isWinner);
    if (g) ganados.set(g.team.name, (ganados.get(g.team.name) || 0) + 1);
  }
  const primero = juegos[0];
  const a = equipo(primero.teams.away, ganados.get(primero.teams.away.team.name) || 0);
  const b = equipo(primero.teams.home, ganados.get(primero.teams.home.team.name) || 0);
  const necesarias = Math.ceil((primero.gamesInSeries || 7) / 2);
  const ganador = a.victorias >= necesarias ? "a" : b.victorias >= necesarias ? "b" : null;
  return { a, b, ganador, necesarias, terminada: ganador !== null };
}

export async function obtenerBracketMLB(temporada: number): Promise<BracketMLB> {
  const res = await fetch(`https://statsapi.mlb.com/api/v1/schedule/postseason/series?season=${temporada}&sportId=1`, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`MLB respondio ${res.status}`);
  const data = await res.json();
  const todas: any[] = (data.series || []).filter((s: any) => (s.games || []).length > 0);
  const de = (tipo: string, liga: string) =>
    todas
      .filter((s) => s.series?.id?.startsWith(tipo) && String(s.games[0].seriesDescription || "").startsWith(liga))
      .sort((x, y) => String(x.series.id).localeCompare(String(y.series.id)))
      .map(serie);
  const ws = todas.find((s) => s.series?.id?.startsWith("W"));
  // El campeon de la Americana va a la izquierda en la Serie Mundial.
  let mundial = ws ? serie(ws) : null;
  const campeonatoAL = de("L", "AL")[0] || null;
  if (mundial && campeonatoAL?.ganador) {
    const campeonAL = campeonatoAL[campeonatoAL.ganador].nombre;
    if (mundial.b.nombre === campeonAL) {
      mundial = { ...mundial, a: mundial.b, b: mundial.a, ganador: mundial.ganador === "a" ? "b" : mundial.ganador === "b" ? "a" : null };
    }
  }
  return {
    temporada,
    divisionalAL: de("D", "AL"),
    divisionalNL: de("D", "NL"),
    campeonatoAL,
    campeonatoNL: de("L", "NL")[0] || null,
    mundial,
    fechaMundial: ws?.games?.[0]?.gameDate || null,
  };
}

// ---------- Dibujo ----------

const TROFEO = `data:image/svg+xml;base64,${Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260" width="200" height="260">
  <defs>
    <linearGradient id="oro" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#8A5A12"/><stop offset="0.25" stop-color="#FFE29A"/>
      <stop offset="0.5" stop-color="#E7A63C"/><stop offset="0.75" stop-color="#FFF1C4"/><stop offset="1" stop-color="#8A5A12"/>
    </linearGradient>
    <linearGradient id="base" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2A3F5F"/><stop offset="1" stop-color="#0B1F3A"/></linearGradient>
  </defs>
  <path d="M40 20 H160 V60 C160 110 132 140 100 146 C68 140 40 110 40 60 Z" fill="url(#oro)"/>
  <path d="M40 34 C10 34 8 82 46 100 L50 90 C24 76 26 48 42 48 Z" fill="url(#oro)"/>
  <path d="M160 34 C190 34 192 82 154 100 L150 90 C176 76 174 48 158 48 Z" fill="url(#oro)"/>
  <ellipse cx="100" cy="20" rx="60" ry="9" fill="#FFF1C4" opacity="0.9"/>
  <rect x="90" y="144" width="20" height="40" fill="url(#oro)"/>
  <path d="M66 184 H134 L144 204 H56 Z" fill="url(#oro)"/>
  <rect x="44" y="204" width="112" height="44" rx="6" fill="url(#base)" stroke="#E7A63C" stroke-width="3"/>
  <path d="M100 50 L108 72 L131 72 L112 86 L119 108 L100 94 L81 108 L88 86 L69 72 L92 72 Z" fill="#FFF8E1" opacity="0.85"/>
</svg>`).toString("base64")}`;

function Circulo({ eq, x, y, d, perdio, conNombre = true }: { eq: EquipoSerie; x: number; y: number; d: number; perdio: boolean; conNombre?: boolean }) {
  return (
    <div style={{ position: "absolute", left: x - 90, top: y - d / 2, width: 180, display: "flex", flexDirection: "column", alignItems: "center", opacity: perdio ? 0.42 : 1 }}>
      <div
        style={{
          width: d,
          height: d,
          borderRadius: d,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(145deg, ${eq.color1} 0%, ${eq.color1} 55%, ${eq.color2} 100%)`,
          border: `5px solid ${perdio ? "#8FA3BF" : GOLD}`,
          boxShadow: perdio ? "0 6px 18px rgba(0,0,0,0.6)" : `0 0 28px rgba(231,166,60,0.55), 0 8px 22px rgba(0,0,0,0.7)`,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Anton", fontSize: d * 0.36, color: BLANCO, letterSpacing: 1, textShadow: "0 2px 6px rgba(0,0,0,0.8)" }}>{eq.siglas}</div>
        <div
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            width: d * 0.36,
            height: d * 0.36,
            borderRadius: d,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: perdio ? "#3A4A60" : `linear-gradient(180deg, ${GOLD_CLARO}, ${GOLD})`,
            border: "3px solid #0B1F3A",
            fontFamily: "Anton",
            fontSize: d * 0.22,
            color: perdio ? BLANCO : "#0B1F3A",
          }}
        >
          {eq.victorias}
        </div>
      </div>
      {conNombre && (
        <div style={{ display: "flex", marginTop: 6, fontSize: eq.corto.length > 11 ? 21 : 24, fontWeight: 800, color: BLANCO, whiteSpace: "nowrap", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>{eq.corto}</div>
      )}
    </div>
  );
}

// Corchete "]" (o "[" si va del lado derecho) que une dos equipos con el siguiente.
function Corchete({ x, y1, y2, ancho, derecha }: { x: number; y1: number; y2: number; ancho: number; derecha?: boolean }) {
  const lado = derecha ? "borderLeft" : "borderRight";
  return (
    <div style={{ position: "absolute", left: derecha ? x - ancho : x, top: y1, width: ancho, height: y2 - y1, display: "flex", borderTop: `3px solid ${LINEA}`, borderBottom: `3px solid ${LINEA}`, [lado]: `3px solid ${LINEA}`, borderRadius: derecha ? "14px 0 0 14px" : "0 14px 14px 0" }} />
  );
}

function Linea({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return <div style={{ position: "absolute", left: Math.min(x1, x2), top: y - 1, width: Math.abs(x2 - x1), height: 3, display: "flex", background: LINEA }} />;
}

const VACIO: EquipoSerie = { nombre: "", corto: "Por definir", siglas: "?", color1: "#1E2F4A", color2: "#0B1F3A", victorias: 0 };

function Lado({ divisional, campeonato, derecha }: { divisional: Serie[]; campeonato: Serie | null; derecha?: boolean }) {
  // Posiciones (lado izquierdo); el derecho es el espejo.
  const X_DIV = 105;
  const X_CAMP = 280;
  const Y_DIV = [420, 580, 800, 960];
  const Y_CAMP = [500, 880];
  const espejo = (x: number) => (derecha ? ANCHO - x : x);
  const elementos: React.ReactNode[] = [];
  divisional.slice(0, 2).forEach(function (s, i) {
    const [ya, yb] = [Y_DIV[i * 2], Y_DIV[i * 2 + 1]];
    elementos.push(<Corchete key={`c${i}`} x={espejo(X_DIV + 62)} y1={ya} y2={yb} ancho={50} derecha={derecha} />);
    elementos.push(<Linea key={`l${i}`} x1={espejo(X_DIV + 112)} x2={espejo(X_CAMP - 55)} y={Y_CAMP[i]} />);
    elementos.push(<Circulo key={`a${i}`} eq={s.a} x={espejo(X_DIV)} y={ya} d={112} perdio={s.ganador === "b"} />);
    elementos.push(<Circulo key={`b${i}`} eq={s.b} x={espejo(X_DIV)} y={yb} d={112} perdio={s.ganador === "a"} />);
  });
  const ganadoresDiv = divisional.slice(0, 2).map((s) => (s.ganador ? s[s.ganador] : VACIO));
  // En la Serie de Campeonato se usan los equipos y victorias de la serie real (si ya empezo).
  const camp = campeonato ? [campeonato.a, campeonato.b] : ganadoresDiv;
  const ordenCamp = camp[0].nombre === ganadoresDiv[1]?.nombre ? [camp[1], camp[0]] : camp;
  // Une a los dos de la Serie de Campeonato con su equipo en la Serie Mundial (centro, y=690).
  elementos.push(<Corchete key="cc" x={espejo(X_CAMP + 62)} y1={Y_CAMP[0]} y2={Y_CAMP[1]} ancho={26} derecha={derecha} />);
  elementos.push(<Linea key="lc" x1={espejo(X_CAMP + 88)} x2={espejo(380)} y={690} />);
  ordenCamp.forEach(function (eq, i) {
    const perdio = !!campeonato?.ganador && campeonato[campeonato.ganador].nombre !== eq.nombre;
    elementos.push(<Circulo key={`k${i}`} eq={eq} x={espejo(X_CAMP)} y={Y_CAMP[i]} d={120} perdio={perdio} />);
  });
  return <>{elementos}</>;
}

function Etiqueta({ texto, x, y }: { texto: string; x: number; y: number }) {
  return (
    <div style={{ position: "absolute", left: x - 120, top: y, width: 240, display: "flex", justifyContent: "center", fontFamily: "Kaushan", fontSize: 30, color: GOLD_CLARO, textShadow: "0 0 14px rgba(231,166,60,0.6)" }}>
      {texto}
    </div>
  );
}

function fechaCorta(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-DO", { day: "numeric", month: "long", timeZone: "America/Santo_Domingo" });
}

export async function generarImagenBracketMLB(b: BracketMLB) {
  const ws = b.mundial;
  const izq = ws?.a || (b.campeonatoAL?.ganador ? b.campeonatoAL[b.campeonatoAL.ganador] : VACIO);
  const der = ws?.b || (b.campeonatoNL?.ganador ? b.campeonatoNL[b.campeonatoNL.ganador] : VACIO);
  const campeon = ws?.ganador ? ws[ws.ganador] : null;
  const empezo = !!ws && ws.a.victorias + ws.b.victorias > 0;
  const hoy = fechaCorta(new Date().toISOString());
  const leyendaMundial = campeon
    ? `¡${campeon.corto} campeones!`
    : empezo
      ? izq.victorias === der.victorias
        ? `Serie empatada ${izq.victorias}-${der.victorias}`
        : `${(izq.victorias > der.victorias ? izq : der).corto} ganan ${Math.max(izq.victorias, der.victorias)}-${Math.min(izq.victorias, der.victorias)}`
      : b.fechaMundial
        ? fechaCorta(b.fechaMundial) === hoy
          ? "¡Empieza hoy!"
          : `Empieza el ${fechaCorta(b.fechaMundial)}`
        : "Al mejor de 7 juegos";

  const imagen = new ImageResponse(
    (
      <div style={{ width: ANCHO, height: ALTO, display: "flex", position: "relative", fontFamily: "Manrope", backgroundImage: `url(${fondo})`, backgroundSize: "1080px 1350px" }}>
        {/* Titulo */}
        <div style={{ position: "absolute", top: 46, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", padding: "8px 26px", borderRadius: 40, background: `linear-gradient(180deg, ${GOLD_CLARO}, ${GOLD})`, fontSize: 26, fontWeight: 800, color: "#0B1F3A", letterSpacing: 3 }}>
            MLB · POSTEMPORADA
          </div>
          <div style={{ display: "flex", marginTop: -6, fontFamily: "Kaushan", fontSize: 168, color: BLANCO, textShadow: "0 0 18px rgba(255,90,60,0.85), 0 0 46px rgba(231,166,60,0.7), 0 6px 0 #8A1C1C" }}>
            Playoffs
          </div>
          <div style={{ display: "flex", marginTop: -34, fontFamily: "Anton", fontSize: 78, letterSpacing: 10, color: GOLD_CLARO, textShadow: "0 0 22px rgba(231,166,60,0.8), 0 4px 0 #6B4210" }}>
            {String(b.temporada)}
          </div>
        </div>

        {/* Ligas */}
        <div style={{ position: "absolute", top: 322, left: 40, display: "flex", fontSize: 26, fontWeight: 800, color: BLANCO, letterSpacing: 2 }}>LIGA AMERICANA</div>
        <div style={{ position: "absolute", top: 322, right: 40, display: "flex", fontSize: 26, fontWeight: 800, color: BLANCO, letterSpacing: 2 }}>LIGA NACIONAL</div>

        <Lado divisional={b.divisionalAL} campeonato={b.campeonatoAL} />
        <Lado divisional={b.divisionalNL} campeonato={b.campeonatoNL} derecha />

        {/* Centro: Serie Mundial */}
        <div style={{ position: "absolute", top: 410, left: 340, width: 400, display: "flex", justifyContent: "center", fontFamily: "Anton", fontSize: 44, color: BLANCO, letterSpacing: 3, textShadow: "0 0 18px rgba(231,166,60,0.8)" }}>
          SERIE MUNDIAL
        </div>
        {/* Brillo detras del trofeo */}
        <div style={{ position: "absolute", left: 410, top: 450, width: 260, height: 220, display: "flex", borderRadius: 200, background: "radial-gradient(circle, rgba(255,210,122,0.45) 0%, rgba(255,210,122,0.12) 45%, rgba(255,210,122,0) 70%)" }} />
        <img src={TROFEO} width={128} height={166} style={{ position: "absolute", left: 476, top: 476 }} />
        <Circulo eq={izq} x={445} y={690} d={124} perdio={!!campeon && campeon.nombre !== izq.nombre} />
        <Circulo eq={der} x={635} y={690} d={124} perdio={!!campeon && campeon.nombre !== der.nombre} />
        <div style={{ position: "absolute", top: 800, left: 300, width: 480, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", padding: "10px 24px", borderRadius: 14, background: "rgba(11,31,58,0.85)", border: `2px solid ${GOLD}`, fontSize: 27, fontWeight: 800, color: GOLD_CLARO }}>
            {leyendaMundial}
          </div>
        </div>

        {/* Rondas */}
        <Etiqueta texto="Divisional" x={105} y={1068} />
        <Etiqueta texto="Campeonato" x={290} y={1068} />
        <Etiqueta texto="Campeonato" x={ANCHO - 290} y={1068} />
        <Etiqueta texto="Divisional" x={ANCHO - 105} y={1068} />

        {/* Pie */}
        <div style={{ position: "absolute", bottom: 40, left: 0, width: ANCHO, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", fontSize: 22, color: "#D6E0EE" }}>El número dorado = juegos ganados en la serie</div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800, color: GOLD, textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>labankerard.com</div>
          <div style={{ display: "flex", fontSize: 22, color: "#D6E0EE" }}>Página informativa · La Bankera RD</div>
        </div>
      </div>
    ),
    {
      width: ANCHO,
      height: ALTO,
      fonts: [
        { name: "Manrope", data: fuenteRegular, weight: 400, style: "normal" },
        { name: "Manrope", data: fuenteExtraBold, weight: 800, style: "normal" },
        { name: "Kaushan", data: fuenteFirma, weight: 400, style: "normal" },
        { name: "Anton", data: fuenteGruesa, weight: 400, style: "normal" },
      ],
    }
  );
  return Buffer.from(await imagen.arrayBuffer());
}
