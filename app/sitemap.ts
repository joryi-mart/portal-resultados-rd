import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { slugSorteo } from "@/lib/slug";
import { CIUDADES } from "./turismo/datos";

const SITIO = "https://labankerard.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: loterias } = await supabase
    .from("loterias")
    .select("slug, sorteos ( nombre )")
    .eq("activa", true);

  const paginasLoterias: MetadataRoute.Sitemap = (loterias || []).map(function (l) {
    return {
      url: `${SITIO}/${l.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    };
  });

  const paginasSorteos: MetadataRoute.Sitemap = (loterias || []).flatMap(function (l) {
    return (l.sorteos || []).map(function (s: { nombre: string }) {
      return {
        url: `${SITIO}/${l.slug}/sorteo/${slugSorteo(s.nombre)}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.6,
      };
    });
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
      url: `${SITIO}/loterias`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITIO}/politica-de-privacidad`,
      lastModified: new Date("2026-09-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITIO}/nosotros`,
      lastModified: new Date("2026-09-01"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITIO}/contacto`,
      lastModified: new Date("2026-09-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITIO}/resumen`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.7,
    },
    {
      url: `${SITIO}/buscador`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
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
      url: `${SITIO}/lidom`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${SITIO}/farandula`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${SITIO}/series`,
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
      url: `${SITIO}/como-jugar-loteria`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${SITIO}/historia-loteria-nacional`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/juegos-de-leidsa`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/juegos-de-loteria-real`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/que-es-el-super-pale`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/juegos-de-loteka`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/juegos-de-la-primera`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/juegos-de-lotedom`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/juegos-de-la-suerte-dominicana`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/juegos-de-la-loteria-nacional`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${SITIO}/que-es-anguila-lottery`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/que-es-king-lottery-sint-maarten`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/como-funciona-la-nba`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/como-funcionan-los-torneos-de-futbol`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/como-leer-calificaciones-de-peliculas`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/clasificacion-de-videojuegos-esrb`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/reglas-basicas-del-beisbol`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${SITIO}/como-funciona-la-lidom`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${SITIO}/equipos-de-la-lidom`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${SITIO}/que-es-haiti-bolet`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/guia-loterias-americanas`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITIO}/como-jugar-powerball`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
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

  const EQUIPOS_LIDOM = ["672", "667", "671", "669", "668", "670"];
  const paginasLidom: MetadataRoute.Sitemap = EQUIPOS_LIDOM.map(function (id) {
    return {
      url: `${SITIO}/lidom/${id}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    };
  });

  return [...paginasFijas, ...paginasLoterias, ...paginasSorteos, ...paginasHistorial, ...paginasTurismo, ...paginasLidom];
}
