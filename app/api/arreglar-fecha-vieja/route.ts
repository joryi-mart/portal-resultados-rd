import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const CORRECCIONES = [
  {
    postId: "1315560834976047_122103506805476013",
    slug: "leidsa",
    mensaje:
      "🎱 Leidsa — Resultados del miércoles, 16 de septiembre\n\nQuiniela Palé: 68-54-21\nPega 3 Más: 04-22-22\nLoto Más: 04-08-13-17-19-32-04-04\nSuper Kino TV: 05-11-13-16-21-27-29-32-33-42-43-47-50-53-55-59-60-68-69-74\nLoto Pool: 04-15-16-17-18\n\nVe más resultados en https://labankerard.com/leidsa\n\n#LoteriaDominicana #ResultadosHoy #Leidsa",
  },
  {
    postId: "1315560834976047_122103506877476013",
    slug: "loteka",
    mensaje:
      "🎱 Loteka — Resultados del miércoles, 16 de septiembre\n\nToca 3: 4-4-8\nQuiniela Loteka: 11-42-13\nMega Chances: 02-85-57-30-40\nLa Repartidera: 93\n\nVe más resultados en https://labankerard.com/loteka\n\n#LoteriaDominicana #ResultadosHoy #Loteka",
  },
  {
    postId: "1315560834976047_122103506883476013",
    slug: "nacional",
    mensaje:
      "🎱 Lotería Nacional — Resultados del miércoles, 16 de septiembre\n\nJuega + Pega +: 22-03-06-25-24\nGana Más: 11-11-02\nQuiniela Nacional (Noche): 73-59-08\n\nVe más resultados en https://labankerard.com/nacional\n\n#LoteriaDominicana #ResultadosHoy #LoteriaNacional",
  },
  {
    postId: "1315560834976047_122103506907476013",
    slug: "real",
    mensaje:
      "🎱 Lotería Real — Resultados del miércoles, 16 de septiembre\n\nTu Fecha: 28\nLoto Pool Real: 21-58-34-39\nQuiniela Real: 84-02-55\nNueva Yol Real: 43-91-01\nSúper Palé Real: 84-11\nChance Real: 65-79-74-38-45\nRepartidera Real: 01\nLoto Pool Noche: 77-26-84-93\n\nVe más resultados en https://labankerard.com/real\n\n#LoteriaDominicana #ResultadosHoy #LoteriaReal",
  },
];

export async function GET(request: Request) {
  const secretoEsperado = process.env.CRON_SECRET;
  const autorizacion = request.headers.get("authorization");
  if (secretoEsperado && autorizacion !== `Bearer ${secretoEsperado}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  const resultados: { slug: string; ok: boolean; detalle?: string }[] = [];
  for (const c of CORRECCIONES) {
    const res = await fetch(`https://graph.facebook.com/v19.0/${c.postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ message: c.mensaje, access_token: token || "" }),
    });
    const data = await res.json();
    resultados.push({ slug: c.slug, ok: res.ok, detalle: res.ok ? undefined : JSON.stringify(data) });

    if (res.ok) {
      await supabase
        .from("publicaciones_facebook")
        .update({ mensaje: c.mensaje })
        .eq("loteria_slug", c.slug)
        .eq("fecha", "2026-09-16");
    }
  }

  return NextResponse.json({ resultados });
}
