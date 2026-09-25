// lib/indexnow.ts
// Avisa a Bing (y a otros buscadores que usan IndexNow) cuando una pagina es
// nueva o cambio, en vez de esperar a que la encuentren solos. Google no usa
// IndexNow: para Google sigue valiendo Search Console y el mapa del sitio.
//
// La "llave" NO es secreta: es un archivo publico en /public que demuestra que
// el sitio es nuestro (https://labankerard.com/<llave>.txt).

import { supabase } from "@/lib/supabase";

const HOST = "labankerard.com";
const LLAVE = "4b4f47fa0d56e474d5faa4ed4efc5270";

export async function avisarIndexNow(rutas: string[]) {
  const urls = Array.from(new Set(rutas)).map(function (r) { return "https://" + HOST + r; }).slice(0, 100);
  if (urls.length === 0) return { enviadas: 0, estado: "nada que enviar" };
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: LLAVE, keyLocation: "https://" + HOST + "/" + LLAVE + ".txt", urlList: urls }),
    });
    return { enviadas: urls.length, estado: res.status };
  } catch (error: any) {
    return { enviadas: 0, estado: "error: " + error.message };
  }
}

// Avisa de las paginas de las loterias que recibieron resultados en los
// ultimos minutos (pagina de la loteria + pagina de la fecha del resultado).
export async function avisarResultadosRecientes(minutos: number) {
  try {
    const desde = new Date(Date.now() - minutos * 60 * 1000).toISOString().slice(0, 19);
    const { data, error } = await supabase
      .from("resultados")
      .select("fecha, sorteos ( loterias ( slug ) )")
      .gte("creado_en", desde);
    if (error) return { enviadas: 0, estado: "error: " + error.message };

    const rutas: string[] = [];
    ((data || []) as unknown as { fecha: string; sorteos: { loterias: { slug: string } | null } | null }[]).forEach(function (r) {
      const slug = r.sorteos?.loterias?.slug;
      if (!slug) return;
      rutas.push("/" + slug, "/" + slug + "/" + r.fecha);
    });
    if (rutas.length > 0) rutas.push("/", "/resumen");
    return await avisarIndexNow(rutas);
  } catch (error: any) {
    return { enviadas: 0, estado: "error: " + error.message };
  }
}
