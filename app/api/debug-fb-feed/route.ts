import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const secretoEsperado = process.env.CRON_SECRET;
  const autorizacion = request.headers.get("authorization");
  if (secretoEsperado && autorizacion !== `Bearer ${secretoEsperado}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/feed?fields=id,message,created_time&limit=25&access_token=${token}`
  );
  const data = await res.json();
  return NextResponse.json(data);
}
