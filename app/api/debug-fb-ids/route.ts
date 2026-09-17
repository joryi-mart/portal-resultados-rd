import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const secretoEsperado = process.env.CRON_SECRET;
  const autorizacion = request.headers.get("authorization");
  if (secretoEsperado && autorizacion !== `Bearer ${secretoEsperado}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  const url = new URL(request.url);
  const confirmar = url.searchParams.get("confirmar") === "si";
  const idsExplicitos = url.searchParams.get("ids");

  const resPosts = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,created_time&limit=25&access_token=${token}`
  );
  const dataPosts = await resPosts.json();
  const todos = (dataPosts.data || []) as { id: string; created_time: string }[];

  const { data: correctas } = await supabase.from("publicaciones_facebook").select("post_id");
  const idsCorrectos = new Set((correctas || []).map(function (p) { return p.post_id; }));

  // Solo se tocan publicaciones de hoy (segun hora RD) que NO esten en la tabla
  // de publicaciones correctas. Nunca se tocan publicaciones de otros dias.
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const hoyRD = ahoraRD.toISOString().slice(0, 10);

  const listaExplicita = idsExplicitos ? new Set(idsExplicitos.split(",")) : null;

  const aBorrar = listaExplicita
    ? todos.filter(function (p) { return listaExplicita.has(p.id) && !idsCorrectos.has(p.id); })
    : todos.filter(function (p) {
        const fechaRD = new Date(new Date(p.created_time).getTime() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
        return fechaRD === hoyRD && !idsCorrectos.has(p.id);
      });

  if (!confirmar) {
    return NextResponse.json({
      modo: "solo_revision",
      totalEncontradas: todos.length,
      correctasQueSeQuedan: [...idsCorrectos],
      duplicadasQueSeBorrarian: aBorrar.map(function (p) { return p.id; }),
    });
  }

  const resultados: { id: string; ok: boolean }[] = [];
  for (const p of aBorrar) {
    const resDelete = await fetch(`https://graph.facebook.com/v19.0/${p.id}?access_token=${token}`, { method: "DELETE" });
    resultados.push({ id: p.id, ok: resDelete.ok });
  }

  return NextResponse.json({ modo: "borrado_real", borradas: resultados });
}
