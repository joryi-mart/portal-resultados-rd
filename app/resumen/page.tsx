import { supabase } from "@/lib/supabase";
import NavPildoras from "../NavPildoras";
import {
  display,
  body,
  mono,
  COLOR_TEXTO_SECUNDARIO,
  hoyISO,
  ResumenResultados,
  type Loteria,
  type UltimoResultado,
} from "../page";

export const metadata = {
  title: "Resumen de Resultados de Loterías Dominicanas",
  description: "Resumen de todos los resultados de lotería publicados hoy en República Dominicana, agrupados por lotería: Leidsa, Nacional, Real, Loteka y más.",
  openGraph: {
    title: "Resumen de Resultados de Loterías Dominicanas",
    description: "Resumen de todos los resultados de lotería publicados hoy, agrupados por lotería.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/resumen" },
};

export const revalidate: number = 300;

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

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras
        loterias={listaLoterias.map(function (l: Loteria) {
          return { nombre: l.nombre, slug: l.slug };
        })}
      />

      <main className="mx-auto max-w-7xl px-4 pb-6 pt-3 sm:px-8 sm:pt-4 lg:px-12">
        <a href="/" className="mb-4 inline-block font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a la portada</a>

        {error ? (
          <div className="mb-6 rounded-lg border border-[#E4573D]/40 bg-[#E4573D]/5 p-4 text-sm text-[#B23B26]">No pudimos cargar los datos: {error.message}</div>
        ) : null}

        {resumenHoy.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#10203A]/20 bg-white/60 p-8 text-center">
            <p className="font-[family-name:var(--font-display)] text-lg font-bold">Todavía no hay resultados</p>
            <p className="mt-1 text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Vuelve más tarde para ver el resumen del día.</p>
          </div>
        ) : (
          <ResumenResultados items={resumenHoy} fecha={fechaResumen} />
        )}
      </main>
    </div>
  );
}
