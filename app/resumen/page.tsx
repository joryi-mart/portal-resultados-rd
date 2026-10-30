import { supabase } from "@/lib/supabase";
import { inicioSorteoISO } from "@/lib/eventoSorteo";
import { slugSorteo } from "@/lib/slug";
import NavPildoras from "../NavPildoras";
import { display, body, mono } from "../page";
import {
  COLOR_TEXTO_SECUNDARIO,
  hoyISO,
  TablaResultadosDelDia,
  type Loteria,
  type UltimoResultado,
} from "../componentesResultados";

// Ordenado por horario (mediodia, tarde, noche) en vez de por loteria: en
// Google Trends (oct-2026) crecen "sorteos de loterias de hoy" (+300%) y
// "todas las loterias de hoy noche" (+130%), y son las mismas 3 tandas que se
// publican en Facebook.
export const metadata = {
  title: "Todas las Loterías de Hoy: Mediodía, Tarde y Noche",
  description: "Todos los sorteos de las loterías de hoy ordenados por horario: mediodía, tarde y noche. Leidsa, Nacional, Real, Loteka, Anguila, americanas y más.",
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Todas las Loterías de Hoy: Mediodía, Tarde y Noche",
    description: "Todos los sorteos de las loterías de hoy ordenados por horario: mediodía, tarde y noche.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/resumen" },
};

export const revalidate: number = 300;

// Casi los mismos cortes que las 3 publicaciones diarias de Facebook
// (app/api/publicar-facebook/route.ts), pero la noche empieza a las 7:00 p.m.
// para que "La Suerte Tarde" (6:00) o "Georgia Tarde" (6:59) no aparezcan
// bajo "Loterías de esta noche".
const TANDAS = [
  { id: "mediodia", hasta: "14:00", titulo: "Loterías de hoy al mediodía", tituloOtroDia: "Loterías del mediodía" },
  { id: "tarde", hasta: "19:00", titulo: "Loterías de hoy en la tarde", tituloOtroDia: "Loterías de la tarde" },
  { id: "noche", hasta: "24:00", titulo: "Loterías de esta noche", tituloOtroDia: "Loterías de la noche" },
];
const LETRAS_DIA = ["D", "L", "M", "X", "J", "V", "S"];

function formatearHora12(hora24: string | null) {
  if (!hora24) return "";
  const [hh, mm] = hora24.split(":");
  let h = parseInt(hh, 10);
  const sufijo = h >= 12 ? "p.m." : "a.m.";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mm || "00"} ${sufijo}`;
}

type FilaTanda = { loteriaNombre: string; loteriaSlug: string; sorteoNombre: string; hora: string | null; numeros: string | null };

// Los sorteos del dia repartidos en las 3 tandas: los que ya salieron con sus
// numeros y, si es hoy, los que se juegan hoy pero aun no salen.
function sorteosPorTanda(loterias: Loteria[], fecha: string, esHoy: boolean) {
  const letraDia = LETRAS_DIA[new Date(fecha + "T12:00:00Z").getUTCDay()];
  const filas: (FilaTanda & { tanda: string })[] = [];
  loterias.forEach(function (l) {
    (l.sorteos || []).forEach(function (s) {
      const r = (s.resultados || []).find(function (x) { return x.fecha === fecha; });
      const dias = (s.dias_semana || "").split(",").map(function (d) { return d.trim(); }).filter(Boolean);
      const seJuega = dias.length === 0 || dias.includes(letraDia);
      if (!r && (!seJuega || !esHoy)) return;
      const hora = (s.hora_sorteo || "23:59").slice(0, 5);
      // Si pasaron mas de 2 horas de la hora del sorteo y no hay resultado,
      // seguramente hoy no se juega (algunos sorteos no tienen dias_semana
      // completo en la base de datos): no se muestra como "Aún no sale".
      if (!r) {
        const [h, m] = hora.split(":").map(Number);
        const ahora = new Date(Date.now() - 4 * 60 * 60 * 1000);
        const minutosAhora = ahora.getUTCHours() * 60 + ahora.getUTCMinutes();
        if (minutosAhora > h * 60 + m + 120) return;
      }
      const tanda = (TANDAS.find(function (t) { return hora < t.hasta; }) || TANDAS[TANDAS.length - 1]).id;
      filas.push({ tanda, loteriaNombre: l.nombre, loteriaSlug: l.slug, sorteoNombre: s.nombre, hora: s.hora_sorteo, numeros: r ? r.numeros : null });
    });
  });
  filas.sort(function (a, b) { return (a.hora || "").localeCompare(b.hora || ""); });
  return filas;
}

export default async function ResumenPage(props: { searchParams: Promise<{ fecha?: string }> }) {
  const hoy = hoyISO();
  const searchParams = await props.searchParams;
  const fechaSeleccionada = (searchParams && searchParams.fecha) || hoy;

  const loteriasResult = await supabase
    .from("loterias")
    .select("id, nombre, slug, activa, sorteos ( id, nombre, hora_sorteo, dias_semana, resultados ( numeros, fecha, creado_en ) )")
    .eq("activa", true)
    .order("id");
  const loterias = loteriasResult.data;
  const error = loteriasResult.error;

  const SORTEOS_DESCONTINUADOS = [73, 78, 119];
  const ORDEN_PRIORIDAD = ["leidsa", "nacional", "real", "la-suerte"];
  const listaLoterias = (loterias || [])
    .map(function (l) {
      return { ...l, sorteos: (l.sorteos || []).filter(function (s) { return !SORTEOS_DESCONTINUADOS.includes(s.id); }) };
    })
    .filter(function (l) { return l.sorteos.length > 0; })
    .sort(function (a, b) {
      const posA = ORDEN_PRIORIDAD.indexOf(a.slug);
      const posB = ORDEN_PRIORIDAD.indexOf(b.slug);
      if (posA === -1 && posB === -1) return 0;
      if (posA === -1) return 1;
      if (posB === -1) return -1;
      return posA - posB;
    });

  const ultimosResultados: UltimoResultado[] = [];
  for (let i = 0; i < listaLoterias.length; i++) {
    const loteria = listaLoterias[i];
    const sorteos = loteria.sorteos || [];
    for (let j = 0; j < sorteos.length; j++) {
      const sorteo = sorteos[j];
      const resultados = sorteo.resultados || [];
      for (let k = 0; k < resultados.length; k++) {
        const r = resultados[k];
        if (r.creado_en) {
          ultimosResultados.push({
            loteriaNombre: loteria.nombre,
            loteriaSlug: loteria.slug,
            sorteoId: sorteo.id,
            sorteoNombre: sorteo.nombre,
            horaSorteo: sorteo.hora_sorteo,
            numeros: r.numeros,
            fecha: r.fecha,
            creadoEn: r.creado_en,
          });
        }
      }
    }
  }
  ultimosResultados.sort(function (a, b) { return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime(); });
  const fechaResumen = ultimosResultados.some(function (r) { return r.fecha === fechaSeleccionada; })
    ? fechaSeleccionada
    : (ultimosResultados[0]?.fecha || fechaSeleccionada);
  const resumenHoy = ultimosResultados.filter(function (r) { return r.fecha === fechaResumen; });

  // Datos estructurados (schema.org) con los resultados mostrados en este resumen,
  // mismo patrón que ya usan la portada y las páginas de cada lotería.
  const eventosParaGoogle = resumenHoy.map(function (r) {
    return {
      "@type": "Event",
      name: `${r.sorteoNombre} - ${r.loteriaNombre} - ${r.fecha}`,
      startDate: inicioSorteoISO(r.fecha, r.horaSorteo),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      location: { "@type": "VirtualLocation", url: `https://labankerard.com/${r.loteriaSlug}/${r.fecha}` },
      organizer: { "@type": "Organization", name: r.loteriaNombre },
      description: "Números ganadores: " + r.numeros,
    };
  });
  const datosEstructurados =
    eventosParaGoogle.length > 0 ? { "@context": "https://schema.org", "@graph": eventosParaGoogle } : null;

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      {datosEstructurados ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }}
        />
      ) : null}
      <NavPildoras
        loterias={listaLoterias.map(function (l: Loteria) {
          return { nombre: l.nombre, slug: l.slug };
        })}
      />

      <main className="mx-auto max-w-7xl px-4 pb-6 pt-3 sm:px-8 sm:pt-4 lg:px-12">
        <a href="/" className="mb-4 inline-block font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a la portada</a>

        <h1 className="mb-2 text-2xl font-bold text-[#10203A] sm:text-3xl">Todas las loterías de hoy: mediodía, tarde y noche</h1>
        <p className="mb-6 text-base text-[#2E3B48]">
          {fechaResumen === hoy ? "Resultados de hoy, " : "Últimos resultados, "}
          <span className="capitalize">{new Date(fechaResumen + "T12:00:00Z").toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })}</span>
          , ordenados por la hora del sorteo. Toca cualquier sorteo para ver su historial.
        </p>

        {error ? (
          <div className="mb-6 rounded-lg border border-[#E4573D]/40 bg-[#E4573D]/5 p-4 text-sm text-[#B23B26]">No pudimos cargar los datos: {error.message}</div>
        ) : null}

        {resumenHoy.length === 0 ? (
          <div className="mb-6 rounded-xl border border-dashed border-[#10203A]/20 bg-white/60 p-8 text-center">
            <p className="font-[family-name:var(--font-display)] text-lg font-bold">Todavía no hay resultados</p>
            <p className="mt-1 text-base text-[#2E3B48]">Vuelve más tarde para ver el resumen del día.</p>
          </div>
        ) : null}

        {(function () {
          const filas = sorteosPorTanda(listaLoterias as Loteria[], fechaResumen, fechaResumen === hoy);
          return (
            <div className="mb-8 grid gap-6 lg:grid-cols-3">
              {TANDAS.map(function (t) {
                const deTanda = filas.filter(function (f) { return f.tanda === t.id; });
                if (deTanda.length === 0) return null;
                return (
                  <section key={t.id} className="rounded-xl border border-[#10203A]/15 bg-white p-5">
                    <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">
                      {fechaResumen === hoy ? t.titulo : t.tituloOtroDia}
                    </h2>
                    <div className="flex flex-col">
                      {deTanda.map(function (f) {
                        return (
                          <a
                            key={f.loteriaSlug + f.sorteoNombre}
                            href={`/${f.loteriaSlug}/sorteo/${slugSorteo(f.sorteoNombre)}`}
                            className="flex items-center justify-between gap-3 border-t border-[#10203A]/8 py-3 first:border-t-0 hover:bg-[#FBF7EE]"
                          >
                            <span className="flex min-w-0 flex-col">
                              <span className="text-base font-bold text-[#10203A] underline decoration-[#1E4D8C]/30 underline-offset-4">{f.sorteoNombre}</span>
                              <span className="text-sm font-semibold text-[#2E3B48]">{f.loteriaNombre}{f.hora ? ` · ${formatearHora12(f.hora)}` : ""}</span>
                            </span>
                            {f.numeros ? (
                              <span className={"shrink-0 text-right font-mono font-bold text-[#10203A] " + (f.numeros.split("-").length > 6 ? "max-w-[55%] text-sm" : "text-lg")}>{f.numeros}</span>
                            ) : (
                              <span className="shrink-0 rounded-full bg-[#E4E8EB] px-3 py-1 text-sm font-bold text-[#2E3B48]">Aún no sale</span>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          );
        })()}

        <TablaResultadosDelDia loterias={listaLoterias} fechaSeleccionada={fechaSeleccionada} />
      </main>
    </div>
  );
}
