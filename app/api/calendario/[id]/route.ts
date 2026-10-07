import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import calendario from "@/lib/calendario.json";

// Ejecuta una publicación del calendario (lib/calendario.json) por su id, ej.
// /api/calendario/que-paso-mlb. La llaman los Cron Jobs de Vercel (vercel.json),
// que mandan solos el encabezado "Authorization: Bearer <CRON_SECRET>", así que
// no hace falta poner ninguna clave en el código. También acepta ?clave=.
// Cada publicador revisa si ya salió, así que llamarla dos veces no repite nada.
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function claveValida(request: Request) {
  const esperada = (process.env.CRON_SECRET || "").trim();
  if (!esperada || esperada.length < 12) return false;
  const encabezado = (request.headers.get("authorization") || "").trim().replace(/^Bearer\s+/i, "");
  const recibida = encabezado || (new URL(request.url).searchParams.get("clave") || "").trim();
  const a = Buffer.from(recibida);
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!claveValida(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await ctx.params;
  const publicacion = calendario.publicaciones.find(function (p) { return p.id === id; });
  if (!publicacion) return NextResponse.json({ error: `No hay ninguna publicación con id ${id}` }, { status: 404 });

  const clave = (process.env.CRON_SECRET || "").trim();
  const separador = publicacion.ruta.includes("?") ? "&" : "?";
  try {
    const res = await fetch(`https://labankerard.com${publicacion.ruta}${separador}clave=${encodeURIComponent(clave)}`, {
      headers: { Authorization: `Bearer ${clave}` },
      cache: "no-store",
    });
    const cuerpo = await res.json().catch(function () { return { error: "respuesta no es JSON" }; });
    return NextResponse.json({ id, nombre: publicacion.nombre, resultado: cuerpo }, { status: res.ok ? 200 : 502 });
  } catch (error: any) {
    return NextResponse.json({ id, error: error.message }, { status: 502 });
  }
}
