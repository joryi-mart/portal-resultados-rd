export async function GET() {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const idFoto = "122105185491476013"; // publicacion de hoy de Loteria Real

  const res = await fetch(`https://graph.facebook.com/v19.0/${idFoto}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ caption: "Prueba de diagnostico, se corrige enseguida", access_token: token || "" }),
  });
  const data = await res.json();
  return Response.json({ status: res.status, data });
}
