export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const salida: Record<string, unknown> = {};

  async function pedir(nombre: string, ruta: string) {
    const separador = ruta.includes("?") ? "&" : "?";
    const res = await fetch(`https://graph.facebook.com/v19.0/${ruta}${separador}access_token=${token}`);
    salida[nombre] = await res.json();
  }

  await pedir("pagina", `${pageId}?fields=name,fan_count,followers_count`);
  await pedir(
    "posts",
    `${pageId}/posts?fields=id,created_time,shares,reactions.summary(true).limit(0),comments.summary(true).limit(0)&limit=20`
  );
  await pedir(
    "fotos",
    `${pageId}/photos?type=uploaded&fields=id,created_time,reactions.summary(true).limit(0),comments.summary(true).limit(0)&limit=20`
  );

  return Response.json(salida);
}
