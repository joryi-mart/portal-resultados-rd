import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const secretoEsperado = process.env.CRON_SECRET;
  const autorizacion = request.headers.get("authorization");
  if (secretoEsperado && autorizacion !== `Bearer ${secretoEsperado}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  const intentos: any = {};

  const r1 = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed?fields=id,created_time&limit=25&access_token=${token}`);
  intentos.feed_sin_mensaje = await r1.json();

  const r2 = await fetch(`https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,created_time&limit=25&access_token=${token}`);
  intentos.posts_sin_mensaje = await r2.json();

  const r3 = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=posts.limit(25){id,created_time}&access_token=${token}`);
  intentos.via_pagina = await r3.json();

  return NextResponse.json(intentos);
}
