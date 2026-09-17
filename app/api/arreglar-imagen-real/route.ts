import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const secretoEsperado = process.env.CRON_SECRET;
  const autorizacion = request.headers.get("authorization");
  if (secretoEsperado && autorizacion !== `Bearer ${secretoEsperado}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const postId = "1315560834976047_122104148499476013";

  const resDelete = await fetch(`https://graph.facebook.com/v19.0/${postId}?access_token=${token}`, { method: "DELETE" });
  const dataDelete = await resDelete.json().catch(function () { return null; });

  if (resDelete.ok) {
    await supabase.from("publicaciones_facebook").delete().eq("id", 7);
  }

  return NextResponse.json({ borradoFacebook: resDelete.ok, detalle: dataDelete });
}
