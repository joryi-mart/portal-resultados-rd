import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const SITIO = "https://labankerard.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: loterias } = await supabase
    .from("loterias")
    .select("slug")
    .eq("activa", true);

  const paginasLoterias: MetadataRoute.Sitemap = (loterias || []).map(function (l) {
    return {
      url: `${SITIO}/${l.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    };
  });

  const paginasHistorial: MetadataRoute.Sitemap = (loterias || []).map(function (l) {
    return {
      url: `${SITIO}/${l.slug}/historial`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    };
  });

  const paginasFijas: MetadataRoute.Sitemap = [
    {
      url: SITIO,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITIO}/beisbol`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITIO}/beisbol/picheo`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
  ];

  return [...paginasFijas, ...paginasLoterias, ...paginasHistorial];
}
