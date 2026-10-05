import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Login del panel privado /admin/analytics como una ruta normal (no como
// Server Action de React): un formulario HTML clasico POST que funciona
// siempre, sin depender de que el JavaScript del navegador cargue a tiempo
// (en una conexion de celular lenta, un Server Action puede no dispararse
// y el formulario parece "no hacer nada"). Tambien es mas dificil de
// saltarse para un intento de fuerza bruta con un script, porque es una
// peticion POST normal, igual para un navegador que para un script.
export const dynamic = "force-dynamic";

const COOKIE_NAME = "analytics_auth";
const MAX_INTENTOS = 3;
const MINUTOS_BLOQUEO = 15;

async function intentosRecientes() {
  const desde = new Date(Date.now() - MINUTOS_BLOQUEO * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("intentos_admin")
    .select("id", { count: "exact", head: true })
    .gte("creado_en", desde);
  return count || 0;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const clave = formData.get("clave");
  const url = new URL(request.url);
  const destino = url.origin + "/admin/analytics";

  if ((await intentosRecientes()) >= MAX_INTENTOS) {
    return NextResponse.redirect(destino + "?error=bloqueado", { status: 303 });
  }

  if (clave && typeof clave === "string" && clave === process.env.ANALYTICS_ADMIN_PASSWORD) {
    const respuesta = NextResponse.redirect(destino, { status: 303 });
    respuesta.cookies.set(COOKIE_NAME, clave, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return respuesta;
  }

  await supabase.from("intentos_admin").insert({});
  return NextResponse.redirect(destino + "?error=1", { status: 303 });
}
