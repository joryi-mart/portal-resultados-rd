import { generarImagenResultados } from "@/lib/imagenPublicacion";

export async function GET(request: Request) {
  const secretoEsperado = process.env.CRON_SECRET;
  const autorizacion = request.headers.get("authorization");
  if (secretoEsperado && autorizacion !== `Bearer ${secretoEsperado}`) {
    return new Response("No autorizado", { status: 401 });
  }
  const imagen = await generarImagenResultados("Lotería Real", "jueves, 17 de septiembre", [
    { sorteoNombre: "Quiniela Real", numeros: "20-85-13" },
    { sorteoNombre: "Tu Fecha", numeros: "12-34" },
    { sorteoNombre: "Loto Pool Real", numeros: "05-23-47-88-19" },
  ]);
  return new Response(new Uint8Array(imagen), { headers: { "Content-Type": "image/png" } });
}
