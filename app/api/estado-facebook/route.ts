import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

// Ruta TEMPORAL de solo lectura para revisar la página de Facebook.
// Solo responde si se abre con ?clave=<CLAVE_REVISION_FB>. Si esa variable no existe en
// Vercel, no responde a nadie. No publica nada y nunca devuelve la llave de Facebook.
// Se borra después de usarla.
export const dynamic = "force-dynamic";

function claveValida(recibida: string | null) {
  const esperada = process.env.CLAVE_REVISION_FB;
  if (!esperada || esperada.length < 12 || !recibida) return false;
  const a = Buffer.from(recibida);
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function leer(ruta: string, token: string) {
  const separador = ruta.includes("?") ? "&" : "?";
  const res = await fetch(`https://graph.facebook.com/v19.0/${ruta}${separador}access_token=${token}`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) return { error: data.error?.message || "Error desconocido" };
  return data;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!claveValida(url.searchParams.get("clave"))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) return NextResponse.json({ error: "Faltan las claves de Facebook" }, { status: 500 });

  const pagina = await leer(`${pageId}?fields=name,fan_count,followers_count,link,category`, token);
  const publicaciones = await leer(
    `${pageId}/posts?limit=40&fields=created_time,message,permalink_url,reactions.summary(true).limit(0),comments.summary(true).limit(0),shares`,
    token
  );
  const alcance = await leer(`${pageId}/insights?metric=page_impressions_unique&period=days_28`, token);
  const vistas = await leer(`${pageId}/insights?metric=page_views_total&period=days_28`, token);

  const lista = Array.isArray(publicaciones?.data)
    ? publicaciones.data.map((p: any) => ({
        fecha: p.created_time,
        texto: String(p.message || "").split("\n")[0].slice(0, 90),
        enlace: p.permalink_url,
        reacciones: p.reactions?.summary?.total_count ?? 0,
        comentarios: p.comments?.summary?.total_count ?? 0,
        compartidos: p.shares?.count ?? 0,
      }))
    : publicaciones;

  return NextResponse.json({
    pagina,
    totalPublicaciones: Array.isArray(lista) ? lista.length : null,
    publicaciones: lista,
    alcance,
    vistas,
  });
}
