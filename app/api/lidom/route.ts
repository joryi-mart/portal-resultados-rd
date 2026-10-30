import { NextResponse } from "next/server";
import { obtenerDatosLidom } from "@/lib/lidom";

// La logica vive en lib/lidom.ts (la usa tambien la pagina /lidom en el servidor).
export async function GET() {
  try {
    return NextResponse.json(await obtenerDatosLidom());
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error obteniendo datos de LIDOM", detalle: error.message },
      { status: 500 }
    );
  }
}
