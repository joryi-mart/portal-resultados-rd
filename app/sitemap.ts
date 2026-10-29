import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { slugSorteo } from "@/lib/slug";
import { CIUDADES } from "./turismo/datos";
import { mesesDisponibles, slugMes } from "@/lib/informeMensual";

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
      url: `${SITIO}/en-directo`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${SITIO}/resultados-2026`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITIO}/fr/haiti`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
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
      url: `${SITIO}/aviso-legal`,
      lastModified: new Date("2026-10-06"),
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
      url: `${SITIO}/calculadora-regalia-pascual`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITIO}/calcular-prestaciones-rd`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
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
      url: `${SITIO}/numeros-por-suenos`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${SITIO}/ultima-vez-que-gano-un-numero`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${SITIO}/numeros-mas-salidos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${SITIO}/informe`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // Un informe por cada mes ya terminado (lib/informeMensual.ts).
    ...mesesDisponibles().map(function (m) {
      return {
        url: `${SITIO}/informe/${slugMes(m)}`,
        lastModified: new Date(Date.UTC(m.anio, m.mes, 1)),
        changeFrequency: "yearly" as const,
        priority: 0.6,
      };
    }),
    {
      url: `${SITIO}/numero`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITIO}/efemerides`,
      lastModified: new Date(),
      changeFrequency: "monthly",
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
      url: `${SITIO}/glorias-dominicanas-del-beisbol`,
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

  // Paginas por fecha de los ultimos 60 dias, solo las fechas que tienen
  // resultados reales (evita listar paginas vacias). Son las que hoy traen
  // visitas desde Google, y hasta ahora solo se descubrian siguiendo enlaces.
  // (Antes eran 14 dias; se amplio para que el mes completo este en el mapa.)
  const DIAS_FECHAS_EN_SITEMAP = 60;
  const hoyRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const hoyISOSitemap = hoyRD.toISOString().slice(0, 10);
  const desdeISO = new Date(hoyRD.getTime() - DIAS_FECHAS_EN_SITEMAP * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const { data: loteriasConFechas } = await supabase
    .from("loterias")
    .select("slug, sorteos ( resultados ( fecha ) )")
    .eq("activa", true)
    .gte("sorteos.resultados.fecha", desdeISO);
  const paginasFechas: MetadataRoute.Sitemap = ((loteriasConFechas || []) as unknown as { slug: string; sorteos: { resultados: { fecha: string }[] }[] }[]).flatMap(function (l) {
    // La fecha de hoy tambien se manda (solo si ya tiene resultados): es la
    // que la gente busca esa misma noche ("loteria nacional sabado 19 de...").
    const fechas = new Set<string>();
    (l.sorteos || []).forEach(function (s) {
      (s.resultados || []).forEach(function (r) {
        if (r.fecha >= desdeISO) fechas.add(r.fecha);
      });
    });
    return Array.from(fechas).sort().reverse().map(function (f) {
      const esHoy = f === hoyISOSitemap;
      return {
        url: `${SITIO}/${l.slug}/${f}`,
        lastModified: esHoy ? new Date() : new Date(f + "T12:00:00-04:00"),
        changeFrequency: esHoy ? ("hourly" as const) : ("monthly" as const),
        priority: esHoy ? 0.8 : 0.5,
      };
    });
  });

  const paginasNumeros: MetadataRoute.Sitemap = Array.from({ length: 100 }, function (_, i) {
    return {
      url: `${SITIO}/numero/${String(i).padStart(2, "0")}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.4,
    };
  });

  return [...paginasFijas, ...paginasLoterias, ...paginasSorteos, ...paginasHistorial, ...paginasFechas, ...paginasTurismo, ...paginasLidom, ...paginasNumeros];
}
