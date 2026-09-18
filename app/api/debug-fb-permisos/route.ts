export async function GET() {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  const resultados: Record<string, unknown> = {};

  const infoPagina = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}?fields=id,name&access_token=${token}`
  );
  resultados.infoPagina = await infoPagina.json();

  const debugToken = await fetch(
    `https://graph.facebook.com/v19.0/debug_token?input_token=${token}&access_token=${token}`
  );
  resultados.debugToken = await debugToken.json();

  const permisos = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/permissions?access_token=${token}`
  );
  resultados.permisos = await permisos.json();

  return Response.json(resultados);
}
