import { supabase } from "@/lib/supabase";
import NavPildoras from "../NavPildoras";
import {
  display,
  body,
  mono,
  COLOR_AZUL,
  COLOR_TEXTO_SECUNDARIO,
  COLOR_VERDE_PRESIDENTE,
  hoyISO,
  FilaSorteo,
  TablaHorarios,
  type Loteria,
} from "../page";

export const metadata = {
  title: "Todas las Loterías Dominicanas y Américas",
  description: "Lista completa de loterías y sus productos: Leidsa, Nacional, Loteka, Real, Lotedom, La Primera, La Suerte, y las internacionales Haití, Anguila, Sint Maarten, New York, Florida, PowerBall y Mega Millions.",
  openGraph: {
    title: "Todas las Loterías Dominicanas y Américas",
    description: "Lista completa de loterías dominicanas e internacionales y sus productos.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/loterias" },
};

export const revalidate = 3600;

export default async function LoteriasPage(props: { searchParams: Promise<{ fecha?: string }> }) {
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

  const SLUGS_AMERICAS = ["haiti", "powerball", "mega-millions", "sxm", "new-york", "florida", "loterias-americanas", "anguila"];
  const loteriasDominicanas = listaLoterias.filter(function (l) { return !SLUGS_AMERICAS.includes(l.slug); });
  const loteriasAmericas = listaLoterias.filter(function (l) { return SLUGS_AMERICAS.includes(l.slug); });

  function renderTarjetaLoteria(loteria: Loteria) {
    const sorteos = loteria.sorteos || [];
    return (
      <div key={loteria.id} className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-[#10203A]/12 bg-white shadow-[0_1px_3px_rgba(16,32,58,0.08)]">
        <div className="h-2 w-full" style={{ backgroundColor: COLOR_AZUL }} />
        <div className="px-5 py-4">
          <div className="mb-1 flex items-center justify-between">
            <a href={"/" + loteria.slug} className="inline-block rounded-lg px-2.5 py-1 font-[family-name:var(--font-display)] text-base font-bold text-white hover:opacity-90" style={{ backgroundColor: COLOR_VERDE_PRESIDENTE }}>{loteria.nombre}</a>
            <span className="font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{sorteos.length} producto{sorteos.length === 1 ? "" : "s"}</span>
          </div>

          {sorteos.length > 0 ? (
            <div className="mt-2">
              {sorteos.map(function (sorteo) {
                return <FilaSorteo key={sorteo.id} sorteo={sorteo} fechaSeleccionada={fechaSeleccionada} loteriaSlug={loteria.slug} />;
              })}
            </div>
          ) : (
            <p className="mt-2 font-mono text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Sin productos registrados aún.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras
        loterias={listaLoterias.map(function (l: Loteria) {
          return { nombre: l.nombre, slug: l.slug };
        })}
      />

      <main className="mx-auto max-w-7xl px-4 pb-6 pt-3 sm:px-8 sm:pt-4 lg:px-12">
        <a href="/" className="mb-4 inline-block font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a la portada</a>

        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">Loterías</h1>
          <span className="font-mono text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{listaLoterias.length} activas</span>
        </div>

        {error ? (
          <div className="rounded-lg border border-[#E4573D]/40 bg-[#E4573D]/5 p-4 text-sm text-[#B23B26]">No pudimos cargar los datos: {error.message}</div>
        ) : null}

        {listaLoterias.length === 0 && !error ? (
          <div className="rounded-xl border border-dashed border-[#10203A]/20 bg-white/60 p-8 text-center">
            <p className="font-[family-name:var(--font-display)] text-lg font-bold">El tablón está vacío</p>
            <p className="mt-1 text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Todavía no hay loterías registradas.</p>
          </div>
        ) : null}

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {loteriasDominicanas.map(renderTarjetaLoteria)}
        </div>

        {loteriasAmericas.length > 0 && (
          <>
            <div className="mb-6 mt-10 flex items-baseline justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">🌎 Loterías Américas</h2>
              <span className="font-mono text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{loteriasAmericas.length} activas</span>
            </div>
            <p className="mb-6 -mt-4 text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Loterías que se juegan fuera de República Dominicana, pero muy seguidas aquí: Haití, Anguila, Sint Maarten y Estados Unidos.
            </p>
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {loteriasAmericas.map(renderTarjetaLoteria)}
            </div>
          </>
        )}

        <TablaHorarios loterias={listaLoterias} fechaSeleccionada={fechaSeleccionada} />
      </main>
    </div>
  );
}
