import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const secretoEsperado = process.env.CRON_SECRET;
  const autorizacion = request.headers.get("authorization");
  if (secretoEsperado && autorizacion !== `Bearer ${secretoEsperado}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/picture`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      picture: "https://labankerard.com/icon-512.png",
      access_token: token || "",
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.error?.message || "Error actualizando la foto" }, { status: 500 });
  }
  return NextResponse.json(data);
}
