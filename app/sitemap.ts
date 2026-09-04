import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { CIUDADES } from "./turismo/datos";

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
    {
      url: `${SITIO}/nba`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITIO}/futbol`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITIO}/cine`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${SITIO}/videojuegos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${SITIO}/dias-feriados`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/codigos-postales`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/precios-combustibles`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITIO}/turismo`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const paginasTurismo: MetadataRoute.Sitemap = CIUDADES.map(function (c) {
    return {
      url: `${SITIO}/turismo/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    };
  });

  return [...paginasFijas, ...paginasLoterias, ...paginasHistorial, ...paginasTurismo];
}
