const DESCRIPCION =
  "🇩🇴 Todos los resultados de las loterías dominicanas en un solo lugar: Leidsa, Nacional, Loteka, Real y más. " +
  "Actualizados en cuanto salen, cada día. Síguenos para no perderte ninguno 👉 labankerard.com\n\n" +
  "Página informativa no oficial.\n\n" +
  "#LoteriaDominicana #ResultadosHoy #Leidsa #LoteriaNacional #Loteka #RepublicaDominicana";

export async function POST(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "";
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const programar = new URL(request.url).searchParams.get("programar");
  const bytes = Buffer.from(await request.arrayBuffer());
  if (bytes.length < 1000) return Response.json({ error: "Video vacio" }, { status: 400 });

  const salida: Record<string, unknown> = { bytes: bytes.length };

  const r1 = await fetch(`https://graph.facebook.com/v19.0/${pageId}/video_reels`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ upload_phase: "start", access_token: token }),
  });
  const d1 = await r1.json();
  salida.paso1_inicio = d1;
  if (!d1.video_id) return Response.json(salida, { status: 500 });

  const r2 = await fetch(d1.upload_url || `https://rupload.facebook.com/video-upload/v19.0/${d1.video_id}`, {
    method: "POST",
    headers: { Authorization: `OAuth ${token}`, offset: "0", file_size: String(bytes.length) },
    body: new Uint8Array(bytes),
  });
  const d2 = await r2.json();
  salida.paso2_subida = d2;
  if (!r2.ok) return Response.json(salida, { status: 500 });

  const parametros: Record<string, string> = {
    upload_phase: "finish",
    video_id: String(d1.video_id),
    description: DESCRIPCION,
    access_token: token,
    video_state: programar ? "SCHEDULED" : "PUBLISHED",
  };
  if (programar) parametros.scheduled_publish_time = programar;
  const r3 = await fetch(`https://graph.facebook.com/v19.0/${pageId}/video_reels`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(parametros),
  });
  salida.paso3_publicar = await r3.json();
  return Response.json(salida, { status: r3.ok ? 200 : 500 });
}
