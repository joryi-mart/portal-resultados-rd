import { NextResponse } from "next/server";
import { obtenerNoticiasSeries } from "@/lib/noticiasEntretenimiento";

export async function GET() {
  try {
    const noticias = await obtenerNoticiasSeries();
    return NextResponse.json({ actualizado: new Date().toISOString(), noticias });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error obteniendo noticias de series", detalle: error.message },
      { status: 500 }
    );
  }
}
