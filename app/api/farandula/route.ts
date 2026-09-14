import { NextResponse } from "next/server";
import { obtenerNoticiasFarandula } from "@/lib/noticiasEntretenimiento";

export async function GET() {
  try {
    const noticias = await obtenerNoticiasFarandula();
    return NextResponse.json({ actualizado: new Date().toISOString(), noticias });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error obteniendo noticias de farándula", detalle: error.message },
      { status: 500 }
    );
  }
}
