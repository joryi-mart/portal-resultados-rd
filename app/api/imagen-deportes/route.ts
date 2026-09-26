import { NextResponse } from "next/server";
import { generarImagenMarcadores } from "@/lib/imagenDeportes";
import { DEPORTES, esTipoDeporte, ayerRD, fechaLarga } from "@/lib/publicacionDeportes";

// Vista previa de la imagen de marcadores (no publica nada, solo muestra la imagen).
// Uso: /api/imagen-deportes?tipo=beisbol|nba  (opcional: &fecha=AAAA-MM-DD)
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const tipo = params.get("tipo");
  if (!esTipoDeporte(tipo)) return NextResponse.json({ error: "tipo debe ser beisbol o nba" }, { status: 400 });

  const fechaPedida = params.get("fecha");
  if (fechaPedida && !/^\d{4}-\d{2}-\d{2}$/.test(fechaPedida)) {
    return NextResponse.json({ error: "fecha debe verse como 2026-09-25" }, { status: 400 });
  }
  const fecha = fechaPedida || ayerRD();
  const config = DEPORTES[tipo];

  const juegos = await config.obtenerJuegos(fecha);
  if (juegos.length === 0) return NextResponse.json({ mensaje: "No hubo juegos terminados ese día", fecha }, { status: 404 });

  const imagen = await generarImagenMarcadores(config.titulo, `Resultados del ${fechaLarga(fecha)}`, config.enlaceTexto, juegos);
  return new Response(new Uint8Array(imagen), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
}
