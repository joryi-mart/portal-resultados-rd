import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const secretoEsperado = process.env.CRON_SECRET;
  const autorizacion = request.headers.get("authorization");
  if (secretoEsperado && autorizacion !== `Bearer ${secretoEsperado}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  const resPosts = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,created_time&limit=10&access_token=${token}`
  );
  const dataPosts = await resPosts.json();
  const posts = (dataPosts.data || []) as { id: string; created_time: string }[];

  // Es la publicacion de hoy mas vieja de las que quedan (la primera que se creo, ~18:26 UTC).
  const candidato = posts.find(function (p) { return p.created_time && p.created_time.startsWith("2026-09-17T18:2"); });

  if (!candidato) {
    return NextResponse.json({ error: "No encontre la publicacion", posts });
  }

  const resDelete = await fetch(`https://graph.facebook.com/v19.0/${candidato.id}?access_token=${token}`, { method: "DELETE" });
  const dataDelete = await resDelete.json().catch(function () { return null; });

  if (resDelete.ok) {
    await supabase.from("publicaciones_facebook").delete().eq("id", 7);
  }

  return NextResponse.json({ borradoFacebook: resDelete.ok, detalle: dataDelete });
}
