// Imagen de vista previa (WhatsApp, Facebook) para cada lotería, generada al
// vuelo con los números ganadores de hoy. Antes todas las loterías
// compartían la misma imagen genérica (public/opengraph-image.png); esta
// reemplaza esa imagen fija solo para /[slug], mostrando los números reales.
import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";

export const alt = "Resultados de hoy en La Bankera RD";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#E7A63C";
const NAVY = "#0B1F3A";
const DIM = "#9FB2CC";

// Sorteos descontinuados (la fuente ya no los ofrece) y sorteos con muchos
// números (ej. Super Kino TV, 20 números): se omiten para que la imagen no
// se vea apretada. Mismo criterio que ya usa app/[slug]/[fecha]/page.tsx.
const SORTEOS_OCULTOS = [73, 78, 119];

function hoyISO() {
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return ahoraRD.toISOString().slice(0, 10);
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fuenteExtraBold = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-ExtraBold.ttf"));
  const fuenteRegular = readFileSync(path.join(process.cwd(), "lib/fuentes/Manrope-Regular.ttf"));

  const { data } = await supabase
    .from("loterias")
    .select("nombre, sorteos ( id, nombre, resultados ( numeros, fecha ) )")
    .eq("slug", slug)
    .maybeSingle();

  const hoy = hoyISO();
  const loteria = data as unknown as { nombre: string; sorteos: { id: number; nombre: string; resultados: { numeros: string; fecha: string }[] }[] } | null;
  const lineas = (loteria?.sorteos || [])
    .filter(function (s) { return !SORTEOS_OCULTOS.includes(s.id); })
    .map(function (s) {
      const r = (s.resultados || []).find(function (x) { return x.fecha === hoy; });
      return r && r.numeros.split("-").length <= 8 ? { nombre: s.nombre, numeros: r.numeros } : null;
    })
    .filter(function (l): l is { nombre: string; numeros: string } { return !!l; })
    .slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: NAVY,
          border: "4px solid #E7A63C",
          fontFamily: "Manrope",
          padding: "70px 90px",
        }}
      >
        <div style={{ display: "flex", fontSize: "30px", fontWeight: 800, color: GOLD, letterSpacing: "3px" }}>
          {(loteria?.nombre || "LA BANKERA RD").toUpperCase()}
        </div>
        <div style={{ display: "flex", width: "100%", height: "3px", background: "#1E4D8C", marginTop: "18px", marginBottom: "40px" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
          {lineas.length > 0 ? (
            lineas.map(function (l) {
              return (
                <div key={l.nombre} style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: "24px", color: DIM }}>{l.nombre}</div>
                  <div style={{ display: "flex", fontSize: "52px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "2px" }}>{l.numeros}</div>
                </div>
              );
            })
          ) : (
            <div style={{ display: "flex", fontSize: "44px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.3 }}>
              Resultados en vivo, al instante
            </div>
          )}
        </div>

        <div style={{ display: "flex", flex: 1 }} />
        <div style={{ display: "flex", fontSize: "30px", fontWeight: 800, color: "#4A90E2" }}>labankerard.com</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Manrope", data: fuenteRegular, weight: 400, style: "normal" },
        { name: "Manrope", data: fuenteExtraBold, weight: 800, style: "normal" },
      ],
    }
  );
}
