import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import Image from "next/image";
import { Suspense } from "react";

export const revalidate = 60;

export const metadata = {
  title: "La Bankera RD | Resultados de Loterías Dominicanas en Vivo",
  description: "Consulta los resultados de Leidsa, Lotería Nacional, Loteka, Lotería Real y más loterías dominicanas e internacionales, actualizados en vivo. Tipo de cambio del dólar y euro incluido.",
  openGraph: {
    title: "La Bankera RD 🇩🇴 | Resultados de Loterías Dominicanas en Vivo",
    description: "Consulta los resultados de las principales loterías dominicanas e internacionales, actualizados en vivo.",
    siteName: "La Bankera RD",
    locale: "es_DO",
    type: "website",
  },
};
import { supabase } from "@/lib/supabase";
import NavPildoras from "./NavPildoras";
import NotificacionesPush from "./NotificacionesPush";
import { PildoraEstado, PanelSuperiorConFecha, ResultadosPortada } from "./PortadaCliente";
import {
  hoyISO,
  formatearFechaTitulo,
  etiquetaFechaResumen,
  COLOR_AZUL,
  COLOR_TEXTO_SECUNDARIO,
  COLOR_VERDE_RD,
  PanelSuperior,
  PizarronDelDia,
  TablaResultadosDelDia,
  type Loteria,
  type UltimoResultado,
} from "./componentesResultados";

export const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});
export const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
});

export default async function Home() {
  const hoy = hoyISO();

  const loteriasResult = await supabase
    .from("loterias")
    .select("id, nombre, slug, activa, sorteos ( id, nombre, hora_sorteo, dias_semana, resultados ( numeros, fecha, creado_en ) )")
    .eq("activa", true)
    .order("id");
  const loterias = loteriasResult.data;
  const error = loteriasResult.error;

  const cambiosResult = await supabase
    .from("tipo_cambio")
    .select("*")
    .in("moneda_origen", ["USD", "EUR"])
    .eq("moneda_destino", "DOP")
    .order("fecha", { ascending: false })
    .limit(2);
  const cambios = cambiosResult.data || [];

  // Sorteos que la fuente de datos ya no ofrece (descontinuados o renombrados).
  // Se ocultan aquí en vez de borrarlos de la base de datos, para no perder el historial.
  const SORTEOS_DESCONTINUADOS = [73, 78, 119];
  // Las loterias mas jugadas van primero; el resto mantiene su orden habitual.
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

  const fechaTitulo = formatearFechaTitulo(hoy);

  // Datos estructurados (schema.org) con los resultados de hoy, para que Google
  // pueda leer los números ganadores directamente, no solo el texto. Se calculan
  // siempre a partir de "hoy" (no de la fecha que esté mirando cada visitante),
  // para que esta parte de la página se pueda guardar en caché.
  const resultadosDeHoyEstricto = ultimosResultados.filter(function (r) { return r.fecha === hoy; });
  const eventosParaGoogle = resultadosDeHoyEstricto.map(function (r) {
    return {
      "@type": "Event",
      name: `${r.sorteoNombre} - ${r.loteriaNombre} - ${r.fecha}`,
      startDate: `${r.fecha}T${r.horaSorteo || "00:00"}:00-04:00`,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      location: { "@type": "VirtualLocation", url: `https://labankerard.com/${r.loteriaSlug}/${r.fecha}` },
      organizer: { "@type": "Organization", name: r.loteriaNombre },
      additionalProperty: {
        "@type": "PropertyValue",
        name: "Números ganadores",
        value: r.numeros,
      },
    };
  });
  const datosEstructurados =
    eventosParaGoogle.length > 0 ? { "@context": "https://schema.org", "@graph": eventosParaGoogle } : null;

  // Mismo relleno que usa ResultadosPortada para "hoy": si todavía no hay nada
  // publicado hoy (ej. madrugada), se usa el día más reciente que sí tenga algo.
  // Esto es lo que se muestra en el instante antes de que el navegador confirme
  // qué fecha está mirando el visitante (ver PortadaCliente.tsx).
  const fechaResumenRelleno = ultimosResultados.some(function (r) { return r.fecha === hoy; })
    ? hoy
    : (ultimosResultados[0]?.fecha || hoy);
  const resumenRelleno = ultimosResultados.filter(function (r) { return r.fecha === fechaResumenRelleno; });

  return (
    <div id="top" className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      {datosEstructurados ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }}
        />
      ) : null}
      <header className="relative overflow-hidden bg-[#10203A] px-6 py-5 sm:px-10 sm:py-6">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#FBF7EE 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
        <Image
          src="/tambora.png"
          alt=""
          width={144}
          height={144}
          priority
          className="pointer-events-none absolute right-3 -top-1 hidden h-28 w-28 object-contain sm:block lg:right-11 lg:h-36 lg:w-36"
          style={{ transform: "rotate(-30deg)", filter: "drop-shadow(0 0 1.5px #9AA5AF) drop-shadow(0 0 1.5px #9AA5AF) drop-shadow(0 4px 8px rgba(0,0,0,0.35))" }}
        />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-3 flex flex-col gap-3 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <a href="/" className="flex shrink-0 items-center gap-2.5">
              <Image
                src="/logo-icon.svg"
                alt=""
                width={40}
                height={40}
                priority
                className="h-9 w-9 sm:h-10 sm:w-10"
              />
              <span className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none text-[#FBF7EE] sm:text-2xl">
                La Bankera<span className="text-[#E7A63C]">RD</span>
              </span>
              <Image src="/bandera-rd.svg" alt="Bandera de República Dominicana" width={30} height={20} className="h-5 w-[30px]" />
              <Image
                src="/tambora.png"
                alt=""
                width={64}
                height={64}
                priority
                className="h-11 w-11 object-contain sm:hidden"
                style={{ transform: "rotate(-30deg)", filter: "drop-shadow(0 0 1.5px #9AA5AF) drop-shadow(0 2px 4px rgba(0,0,0,0.35))" }}
              />
            </a>
            <Suspense
              fallback={
                <div className="hidden items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#E7A63C] sm:flex sm:self-auto">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#E4573D]" />
                  En vivo · {fechaTitulo}
                </div>
              }
            >
              <PildoraEstado hoy={hoy} />
            </Suspense>
          </div>
          <p className="mb-3 text-center text-sm font-semibold leading-relaxed text-[#FBF7EE] sm:text-left sm:text-base">
            ¡Resultados de Loterías Dominicanas en Vivo! Consulta Leidsa, Nacional, Loteka y más.
          </p>
          <Suspense fallback={<PanelSuperior cambios={cambios} fechaActual={hoy} />}>
            <PanelSuperiorConFecha cambios={cambios} hoy={hoy} />
          </Suspense>
        </div>
      </header>

      <NavPildoras
        loterias={listaLoterias.map(function (l: Loteria) {
          return { nombre: l.nombre, slug: l.slug };
        })}
      />

      <main className="mx-auto max-w-7xl px-4 pb-6 pt-3 sm:px-8 sm:pt-4 lg:px-12">
        <NotificacionesPush />

        <Suspense
          fallback={
            <>
              <div className="mb-8">
                <PizarronDelDia loterias={listaLoterias} fechaSeleccionada={hoy} fechaTitulo={fechaTitulo} />
              </div>

              <a
                href="/resumen"
                className="mb-8 flex items-center justify-between rounded-xl border border-[#10203A]/12 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(16,32,58,0.08)] transition hover:shadow-md"
              >
                <div>
                  <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">Resumen de resultados de {etiquetaFechaResumen(fechaResumenRelleno).toLowerCase()}</p>
                  <p className="font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{resumenRelleno.length} resultados publicados, agrupados por lotería</p>
                </div>
                <span className="font-mono text-sm font-semibold text-[#1E4D8C]">Ver resumen →</span>
              </a>

              <a
                href={"https://wa.me/?text=" + encodeURIComponent(`🎯 Resultados de hoy ${fechaTitulo} — La Bankera RD\n\nVer todos los resultados 👉 https://labankerard.com`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-8 flex items-center justify-between rounded-xl border border-[#10203A]/12 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(16,32,58,0.08)] transition hover:shadow-md"
              >
                <div>
                  <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">Compartir resultados de hoy por WhatsApp</p>
                  <p className="font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Abre WhatsApp con el mensaje ya escrito, listo para enviar</p>
                </div>
                <span className="font-mono text-sm font-semibold text-[#007A33]">Compartir →</span>
              </a>

              <TablaResultadosDelDia loterias={listaLoterias} fechaSeleccionada={hoy} />
            </>
          }
        >
          <ResultadosPortada loterias={listaLoterias} ultimosResultados={ultimosResultados} hoy={hoy} />
        </Suspense>

        {error ? (
          <div className="mb-6 rounded-lg border border-[#E4573D]/40 bg-[#E4573D]/5 p-4 text-sm text-[#B23B26]">No pudimos cargar los datos: {error.message}</div>
        ) : null}

        <a
          href="/loterias"
          className="mb-8 flex items-center justify-between rounded-xl border border-[#10203A]/12 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(16,32,58,0.08)] transition hover:shadow-md"
        >
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">Ver todas las loterías</p>
            <p className="font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{listaLoterias.length} loterías activas y sus horarios</p>
          </div>
          <span className="font-mono text-sm font-semibold text-[#1E4D8C]">Ver todas →</span>
        </a>

        <a
          href="/buscador"
          className="mb-8 flex items-center justify-between rounded-xl border border-[#10203A]/12 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(16,32,58,0.08)] transition hover:shadow-md"
        >
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">Buscador de números</p>
            <p className="font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>¿Cuándo salió tu número por última vez?</p>
          </div>
          <span className="font-mono text-sm font-semibold text-[#1E4D8C]">Buscar →</span>
        </a>

        <section className="mt-8 rounded-xl border border-[#10203A]/12 bg-white p-5 sm:p-8">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A]">
            Guía de las Loterías Dominicanas
          </h2>
          <p className="mb-8 text-base leading-relaxed">
            En La Bankera RD reunimos cada día los resultados de las principales loterías de República Dominicana en
            un solo lugar, para que consultarlos sea rápido y sencillo. Aquí te explicamos qué lotería es cada una,
            qué productos ofrece y a qué hora se juega, para que sepas exactamente cuándo revisar tu número.
          </p>

          <div className="mb-6">
            <h3 className="mb-3 inline-block rounded-lg px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>Leidsa</h3>
            <p className="mb-2 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Una de las loterías más jugadas del país, con varios sorteos seguidos cada noche. Los domingos el
              sorteo se adelanta a las 3:55 p.m.
            </p>
            <ul className="ml-5 list-disc text-base">
              <li>Quiniela Palé — 8:55 p.m. (3:55 p.m. los domingos)</li>
              <li>Pega 3 Más — 8:55 p.m. (3:55 p.m. los domingos)</li>
              <li>Loto Pool — 8:55 p.m. (3:55 p.m. los domingos)</li>
              <li>Super Kino TV — 8:55 p.m. (3:55 p.m. los domingos)</li>
              <li>Loto Más (miércoles y sábados) — 8:55 p.m.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 inline-block rounded-lg px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>Lotería Nacional</h3>
            <p className="mb-2 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Una de las loterías con más historia en el país, con sorteo de tarde y de noche.
            </p>
            <ul className="ml-5 list-disc text-base">
              <li>Gana Más — 2:30 p.m.</li>
              <li>Juega + Pega + — 2:30 p.m.</li>
              <li>Quiniela Nacional (Noche) — 9:00 p.m. de lunes a sábado, 6:00 p.m. los domingos</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 inline-block rounded-lg px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>Loteka</h3>
            <p className="mb-2 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Todos sus sorteos corren a la misma hora, por la noche.
            </p>
            <ul className="ml-5 list-disc text-base">
              <li>Quiniela Loteka — 7:55 p.m.</li>
              <li>Mega Lotto (lunes y jueves) — 7:55 p.m.</li>
              <li>Mega Chances — 7:55 p.m.</li>
              <li>La Repartidera — 7:55 p.m.</li>
              <li>Toca 3 — 7:55 p.m.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 inline-block rounded-lg px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>Lotería Real</h3>
            <p className="mb-2 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Sortea al mediodía, antes que la mayoría de las demás loterías.
            </p>
            <ul className="ml-5 list-disc text-base">
              <li>Quiniela Real — 12:55 p.m.</li>
              <li>Tu Fecha — 12:55 p.m.</li>
              <li>Loto Pool Real — 12:55 p.m.</li>
              <li>Nueva Yol Real — 12:55 p.m.</li>
              <li>Repartidera Real — 1:00 p.m.</li>
              <li>Loto Real (martes y viernes) — 12:55 p.m.</li>
              <li>Chance Real — 8:00 p.m.</li>
              <li>Súper Palé Real — 8:00 p.m.</li>
              <li>Loto Pool Noche — 8:00 p.m.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 inline-block rounded-lg px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>LoteDom</h3>
            <ul className="ml-5 list-disc text-base">
              <li>Quiniela Lotedom — 12:00 p.m.</li>
              <li>Quemaito — 12:00 p.m.</li>
              <li>Lotedom Super Palé — 12:00 p.m.</li>
              <li>Agarra 4 — 12:00 p.m.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 inline-block rounded-lg px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>La Primera y La Suerte Dominicana</h3>
            <ul className="ml-5 list-disc text-base">
              <li>Quiniela La Primera — 12:00 p.m.</li>
              <li>Quinielón Día — 12:00 p.m.</li>
              <li>La Primera Noche — 8:00 p.m.</li>
              <li>Quinielón Noche — 8:00 p.m.</li>
              <li>Loto 5 — 8:00 p.m.</li>
              <li>Quiniela La Suerte — 12:30 p.m.</li>
              <li>La Suerte Tarde — 6:00 p.m.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 inline-block rounded-lg px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>Loterías internacionales</h3>
            <p className="mb-2 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Además de las loterías dominicanas, en La Bankera RD también puedes consultar resultados de sorteos que
              se juegan en Estados Unidos y el Caribe.
            </p>
            <ul className="ml-5 list-disc text-base">
              <li>New York — tarde (2:30 p.m.) y noche (10:30 p.m.)</li>
              <li>Florida — día (1:30 p.m.) y noche (10:00 p.m.)</li>
              <li>Anguila — 10:00 a.m., mediodía (1:00 p.m.), tarde (6:00 p.m.) y noche (9:00 p.m.)</li>
              <li>Haití Bolet — seis sorteos al día, de 9:30 a.m. a 7:30 p.m.</li>
              <li>Sint Maarten (King Lottery) — mediodía (12:30 p.m.) y noche (7:30 p.m.)</li>
              <li>Loterías Americanas — New Jersey y Georgia, varios sorteos al día</li>
              <li>PowerBall — lunes, miércoles y sábado (11:00 p.m.)</li>
              <li>Mega Millions — martes y viernes (11:00 p.m.)</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 inline-block rounded-lg px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>¿Qué es una Quiniela, un Palé y una Tripleta?</h3>
            <p className="text-base leading-relaxed">
              Son las formas más comunes de jugar en las loterías dominicanas, usando números del 00 al 99. En una
              <strong> quiniela</strong> se juega un solo número; en un <strong>palé</strong>, dos números combinados;
              y en una <strong>tripleta</strong>, tres números juntos. Cada lotería tiene sus propias reglas de premios
              según cuántos números aciertes y en qué posición salgan.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <p className="font-mono text-base text-[#10203A]">La Bankera RD — labankerard.com</p>
        <a href="/dias-feriados" className="mt-2 inline-block font-mono text-sm text-[#1E4D8C] hover:underline">
          Días feriados en República Dominicana 2026
        </a>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#10203A]">
          Aviso: Labankerard.com es un portal estrictamente informativo y no representa de manera oficial a la Lotería Nacional Dominicana ni a ninguna otra institución de juegos de azar. Para consultar reglamentos, premios vigentes, resultados definitivos y demás información institucional, le sugerimos visitar los canales oficiales autorizados de las respectivas loterías.
        </p>
      </footer>

      <a
        href="#top"
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg"
        style={{ backgroundColor: COLOR_AZUL }}
        aria-label="Volver arriba"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </a>
    </div>
  );
}
