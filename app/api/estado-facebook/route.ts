import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

// Ruta TEMPORAL de solo lectura para revisar la página de Facebook.
// Solo responde si se abre con ?clave=<CLAVE_REVISION_FB o CRON_SECRET>. Si ninguna existe en
// Vercel, no responde a nadie. No publica nada y nunca devuelve la llave de Facebook.
// Se borra después de usarla.
export const dynamic = "force-dynamic";

function claveValida(recibida: string | null) {
  if (!recibida) return false;
  const b = Buffer.from(recibida);
  // Acepta la clave propia de esta revisión o la clave del cron (ya guardada en Vercel).
  return [process.env.CLAVE_REVISION_FB, process.env.CRON_SECRET].some(function (esperada) {
    if (!esperada || esperada.length < 12) return false;
    const a = Buffer.from(esperada);
    return a.length === b.length && timingSafeEqual(a, b);
  });
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

  // Diagnostico: "me" dice a quien pertenece de verdad el token guardado (deberia
  // ser la pagina "la bankera RD", no una cuenta personal). No revela el token.
  const quienSoy = await leer(`me?fields=id,name`, token);
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

  return NextResponse.json(
    {
      // Sello de hora real del servidor: si esto no cambia entre dos aperturas,
      // el navegador esta mostrando una respuesta guardada de antes, no una nueva.
      generadoAhora: new Date().toISOString(),
      quienSoy,
      pagina,
      totalPublicaciones: Array.isArray(lista) ? lista.length : null,
      publicaciones: lista,
      alcance,
      vistas,
    },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
  );
}
