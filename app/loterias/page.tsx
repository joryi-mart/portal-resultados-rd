import { supabase } from "@/lib/supabase";
import { inicioSorteoISO } from "@/lib/eventoSorteo";
import NavPildoras from "../NavPildoras";
import { display, body, mono } from "../page";
import {
  COLOR_AZUL,
  COLOR_TEXTO_SECUNDARIO,
  COLOR_VERDE_PRESIDENTE,
  hoyISO,
  FilaSorteo,
  TablaHorarios,
  type Loteria,
} from "../componentesResultados";

export const metadata = {
  title: "Loterías Dominicanas: Resultados de Hoy, Horarios y Juegos",
  description: "Todas las loterías dominicanas y americanas: resultados de hoy de Leidsa, Nacional, Loteka, Real, Lotedom, La Primera y más, con horarios y juegos.",
  openGraph: {
    images: ["/opengraph-image.png"],
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

  // Datos estructurados (schema.org) con los resultados de la fecha seleccionada,
  // mismo patrón que ya usan la portada y las páginas de cada lotería.
  const eventosParaGoogle = listaLoterias.flatMap(function (loteria) {
    return (loteria.sorteos || [])
      .map(function (sorteo) {
        const resultado = sorteo.resultados.find(function (r) { return r.fecha === fechaSeleccionada; });
        if (!resultado) return null;
        return {
          "@type": "Event",
          name: `${sorteo.nombre} - ${loteria.nombre} - ${fechaSeleccionada}`,
          startDate: inicioSorteoISO(fechaSeleccionada, sorteo.hora_sorteo),
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
          location: { "@type": "VirtualLocation", url: `https://labankerard.com/${loteria.slug}/${fechaSeleccionada}` },
          organizer: { "@type": "Organization", name: loteria.nombre },
          description: "Números ganadores: " + resultado.numeros,
        };
      })
      .filter(Boolean);
  });
  const datosEstructurados =
    eventosParaGoogle.length > 0 ? { "@context": "https://schema.org", "@graph": eventosParaGoogle } : null;

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

        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">Loterías dominicanas: resultados, horarios y juegos</h1>
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
          {loteriasDominicanas.map(function (loteria) { return renderTarjetaLoteria(loteria); })}
        </div>

        {loteriasAmericas.length > 0 && (
          <>
            <div className="mb-6 mt-0 flex items-baseline justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">🌎 Loterías Américas</h2>
              <span className="font-mono text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{loteriasAmericas.length} activas</span>
            </div>
            <p className="mb-6 -mt-4 text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Loterías que se juegan fuera de República Dominicana, pero muy seguidas aquí: Haití, Anguila, Sint Maarten y Estados Unidos.
            </p>
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {loteriasAmericas.map(function (loteria) { return renderTarjetaLoteria(loteria); })}
            </div>
          </>
        )}

        <TablaHorarios loterias={listaLoterias} fechaSeleccionada={fechaSeleccionada} />

        {/* Guia como la de Conectate: secciones con lo que mas se busca de las
            loterias. Solo datos ya confirmados en el sitio (horarios especiales
            de componentesResultados.tsx). */}
        <div className="mx-auto mt-10 max-w-3xl space-y-8 text-base leading-relaxed" style={{ color: "#2E3B48" }}>
          <section>
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A]">Resultados de las loterías dominicanas en directo</h2>
            <p>
              Cada día salen más de 50 sorteos entre las loterías dominicanas y las americanas que se juegan en el país. Si quieres verlos
              en el orden en que van saliendo, entra a <a href="/en-directo" className="underline" style={{ color: COLOR_AZUL }}>resultados en directo</a>:
              se actualiza sola cada minuto y te dice cuál es el próximo sorteo.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A]">Quinielas, palés y tripletas</h2>
            <p>
              Son las formas más comunes de jugar en las loterías dominicanas, con números del 00 al 99. En la <strong>quiniela</strong> se juega un
              solo número; en el <strong>palé</strong>, dos números combinados; y en la <strong>tripleta</strong>, tres números juntos. Cada sorteo
              saca tres números: el primero, el segundo y el tercero. Más detalles en{" "}
              <a href="/como-jugar-loteria" className="underline" style={{ color: COLOR_AZUL }}>cómo jugar quiniela, palé y tripleta</a> y{" "}
              <a href="/que-es-el-super-pale" className="underline" style={{ color: COLOR_AZUL }}>qué es el Súper Palé</a>.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A]">Estadísticas y números más calientes</h2>
            <p>
              En la página de cada lotería verás los números <strong>calientes</strong> (los que más han salido) y <strong>fríos</strong> (los que
              menos) de cada juego. También puedes ver los <a href="/numeros-mas-salidos" className="underline" style={{ color: COLOR_AZUL }}>números más salidos</a>,
              buscar cuándo salió un número en el <a href="/buscador" className="underline" style={{ color: COLOR_AZUL }}>buscador</a> o revisar
              todos los <a href="/resultados-2026" className="underline" style={{ color: COLOR_AZUL }}>resultados de 2026</a>. Recuerda que cada sorteo
              es independiente y al azar: las estadísticas son solo información.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A]">Loterías internacionales</h2>
            <p>
              Además de las dominicanas, en el país se siguen mucho loterías de fuera: <a href="/new-york" className="underline" style={{ color: COLOR_AZUL }}>New York</a>,{" "}
              <a href="/florida" className="underline" style={{ color: COLOR_AZUL }}>Florida</a>, Georgia y New Jersey (en{" "}
              <a href="/loterias-americanas" className="underline" style={{ color: COLOR_AZUL }}>loterías americanas</a>),{" "}
              <a href="/anguila" className="underline" style={{ color: COLOR_AZUL }}>Anguila</a>,{" "}
              <a href="/haiti" className="underline" style={{ color: COLOR_AZUL }}>Haití Bolet</a>,{" "}
              <a href="/sxm" className="underline" style={{ color: COLOR_AZUL }}>King Lottery de Sint Maarten</a>,{" "}
              <a href="/powerball" className="underline" style={{ color: COLOR_AZUL }}>Powerball</a> y{" "}
              <a href="/mega-millions" className="underline" style={{ color: COLOR_AZUL }}>Mega Millions</a>.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A]">Sorteos especiales: domingos y Navidad</h2>
            <p>
              Algunos sorteos cambian de hora. Los <strong>domingos</strong>, Leidsa sortea la Quiniela Palé, Pega 3 Más, Loto Pool y Super Kino TV a
              las 3:55 p.m. (no a las 8:55 p.m.), y la Quiniela Nacional de la noche sale a las 6:00 p.m. En <strong>Navidad y Año Nuevo</strong>{" "}
              (24, 25 y 31 de diciembre y 1 de enero) la Lotería Nacional, Leidsa y Anguila no sortean, y Loteka, Lotedom y Florida Noche cambian de
              hora. En los <a href="/dias-feriados" className="underline" style={{ color: COLOR_AZUL }}>días feriados</a> confirma siempre en los
              canales oficiales.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A]">Nota legal</h2>
            <p>
              La Bankera RD es un portal informativo y no representa a ninguna lotería. No vendemos jugadas ni aceptamos apuestas. Los resultados
              se publican tal como salen en las fuentes; confirma siempre en los sitios oficiales antes de cobrar un premio.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
