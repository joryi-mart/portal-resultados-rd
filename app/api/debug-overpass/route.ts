export const dynamic = "force-dynamic";

export async function GET() {
  const consulta = `
    [out:json][timeout:20];
    (
      node["tourism"~"attraction|museum|viewpoint|zoo|theme_park|gallery|artwork|aquarium"](around:20000,18.5601,-68.3725);
      node["natural"="beach"](around:20000,18.5601,-68.3725);
    );
    out body 5;
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
    return Response.json({ ok: true, status: res.status, ms, preview: texto.slice(0, 500) });
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e), name: e?.name, cause: String(e?.cause) });
  }
}
