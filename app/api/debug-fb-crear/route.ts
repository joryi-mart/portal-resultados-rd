export async function GET() {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  // Imagen minima de 1x1 pixel en PNG, solo para probar si el POST a /photos
  // sigue funcionando en absoluto.
  const pixelPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64"
  );

  const formData = new FormData();
  formData.append("source", new Blob([new Uint8Array(pixelPng)], { type: "image/png" }), "test.png");
  formData.append("caption", "Prueba de diagnostico - se borra enseguida");
  formData.append("published", "false"); // no publicado, solo para probar el permiso
  formData.append("access_token", token || "");

  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return Response.json({ status: res.status, data });
}
