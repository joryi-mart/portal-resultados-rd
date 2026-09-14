import { NextResponse } from "next/server";
import { obtenerNoticiasVideojuegos } from "@/lib/noticiasEntretenimiento";

export async function GET() {
  try {
    const noticias = await obtenerNoticiasVideojuegos();
    return NextResponse.json({
      actualizado: new Date().toISOString(),
      noticias,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error obteniendo datos", detalle: error.message },
      { status: 500 }
    );
  }
}
