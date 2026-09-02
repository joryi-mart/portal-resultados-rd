export const dynamic = "force-dynamic";

export async function GET() {
  const lat = 18.5601;
  const lon = -68.3725;
  const consulta = `
    [out:json][timeout:20];
    (
      node["tourism"~"attraction|museum|viewpoint|zoo|theme_park|gallery|artwork|aquarium"](around:20000,${lat},${lon});
      node["natural"="beach"](around:20000,${lat},${lon});
      node["historic"](around:20000,${lat},${lon});
    );
    out body 40;
  `;

  try {
    const inicio = Date.now();
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: "data=" + encodeURIComponent(consulta),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "*/*",
        "User-Agent": "la-bankera-rd/1.0",
      },
    });
    const ms = Date.now() - inicio;
    const texto = await res.text();
    let elementos = null;
    let errorParse = null;
    try {
      const data = JSON.parse(texto);
      elementos = Array.isArray(data.elements) ? data.elements.length : "no-array";
    } catch (e: any) {
      errorParse = String(e);
    }
    return Response.json({ ok: true, status: res.status, ms, elementos, errorParse, preview: texto.slice(0, 800) });
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e), name: e?.name, cause: String(e?.cause) });
  }
}
