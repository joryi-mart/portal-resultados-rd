import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

type Resultado = { numeros: string; fecha: string; creado_en: string };
type Sorteo = { id: number; nombre: string; hora_sorteo: string; resultados: Resultado[] };
type Loteria = { id: number; nombre: string; slug: string; activa: boolean; sorteos: Sorteo[] };

export const revalidate = 3600;

function hoyISO() {
  // Republica Dominicana esta fijo en UTC-4 (no usa horario de verano),
  // asi que restamos 4 horas sin importar en que zona horaria corra el servidor.
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return ahoraRD.toISOString().slice(0, 10);
}

function fechaValida(fecha: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha);
}

function sumarDias(fechaISO: string, dias: number) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const f = new Date(y, m - 1, d);
  f.setDate(f.getDate() + dias);
  const yy = f.getFullYear();
  const mm = String(f.getMonth() + 1).padStart(2, "0");
  const dd = String(f.getDate()).padStart(2, "0");
  return yy + "-" + mm + "-" + dd;
}

function formatearFechaLarga(fechaISO: string) {
  const d = new Date(fechaISO + "T00:00:00");
  return d.toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatearFechaBreve(fechaISO: string) {
  const d = new Date(fechaISO + "T00:00:00");
  return d.toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long" });
}

function formatearHora12(hora24: string) {
  if (!hora24) return "";
  const partes = hora24.split(":");
  let h = parseInt(partes[0], 10);
  const m = partes[1] || "00";
  const sufijo = h >= 12 ? "p.m." : "a.m.";
  h = h % 12;
  if (h === 0) h = 12;
  return h + ":" + m + " " + sufijo;
}

// Algunos sorteos cambian de hora los domingos (confirmado con la fuente oficial):
// Leidsa sortea Quiniela Pale, Pega 3 Mas, Loto Pool y Super Kino TV a las 3:55pm
// los domingos (no 8:55pm), y Lotería Nacional sortea la Quiniela Nacional de la
// Noche a las 6:00pm los domingos (no 9:00pm).
const HORA_DOMINGO_SORTEOS: Record<number, string> = {
  65: "15:55", // Quiniela Palé (Leidsa)
  66: "15:55", // Pega 3 Más (Leidsa)
  67: "15:55", // Loto Pool (Leidsa)
  68: "15:55", // Super Kino TV (Leidsa)
  63: "18:00", // Quiniela Nacional (Noche)
};

// Horario especial de Navidad y Año Nuevo (24, 25 y 31 de diciembre, 1 de enero),
// confirmado en la página oficial de horarios festivos de loteriasdominicanas.com.
// Nacional, Leidsa y Anguila directamente no sortean esos días (por eso no están
// aquí: la página ya muestra "Pendiente" y es lo correcto). Los que sí sortean
// pero a otra hora son estos:
const HORA_FERIADO_DICIEMBRE: Record<number, { fechas: string[]; hora: string }> = {
  70: { fechas: ["12-24", "12-31"], hora: "17:00" }, // Quiniela Loteka (no sortea 25 dic ni 1 ene)
  72: { fechas: ["12-24", "12-31"], hora: "17:00" }, // Mega Chances
  74: { fechas: ["12-24", "12-31"], hora: "17:00" }, // Toca 3
  125: { fechas: ["12-24", "12-31"], hora: "17:00" }, // La Repartidera
  79: { fechas: ["12-24", "12-25", "12-31", "01-01"], hora: "14:55" }, // Quiniela Lotedom
  80: { fechas: ["12-24", "12-25", "12-31", "01-01"], hora: "14:55" }, // Quemaito
  82: { fechas: ["12-24", "12-25", "12-31", "01-01"], hora: "14:55" }, // Lotedom Super Palé
  83: { fechas: ["12-24", "12-25", "12-31", "01-01"], hora: "14:55" }, // Agarra 4
  114: { fechas: ["12-24", "12-25", "12-31", "01-01"], hora: "21:45" }, // Florida Noche
};

function horaSorteoEfectiva(sorteoId: number, hora24: string, fechaISO: string) {
  const mesDia = fechaISO.slice(5);
  const feriado = HORA_FERIADO_DICIEMBRE[sorteoId];
  if (feriado && feriado.fechas.includes(mesDia)) return feriado.hora;
  const esDomingo = new Date(fechaISO + "T00:00:00").getDay() === 0;
  if (esDomingo && HORA_DOMINGO_SORTEOS[sorteoId]) return HORA_DOMINGO_SORTEOS[sorteoId];
  return hora24;
}

function tamanoBolita(cantidad: number) {
  if (cantidad >= 6) return "h-10 w-10 text-sm";
  if (cantidad >= 5) return "h-11 w-11 text-base";
  return "h-12 w-12 text-lg";
}

function Bolita(props: { children: React.ReactNode; tamano: string }) {
  return (
    <div className={"relative flex shrink-0 items-center justify-center rounded-full font-mono font-bold text-white " + props.tamano} style={{ backgroundColor: COLOR_AZUL }}>
      {props.children}
    </div>
  );
}

export async function generateMetadata(props: { params: Promise<{ slug: string; fecha: string }> }) {
  const params = await props.params;

  if (!fechaValida(params.fecha)) {
    return { title: "Fecha no válida" };
  }

  const { data: loteriaCompleta } = await supabase
    .from("loterias")
    .select("nombre, sorteos ( id, nombre, resultados ( numeros, fecha ) )")
    .eq("slug", params.slug)
    .maybeSingle();
  if (!loteriaCompleta) return { title: "Lotería no encontrada" };
  const loteria = loteriaCompleta as unknown as {
    nombre: string;
    sorteos: { id: number; nombre: string; resultados: { numeros: string; fecha: string }[] }[];
  };

  const fechaLarga = formatearFechaLarga(params.fecha);
  const esHoy = params.fecha === hoyISO();
  // Titulo corto (sin dia de la semana) para que Google no lo corte.
  const fechaCorta = new Date(params.fecha + "T00:00:00").toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" });
  const titulo = esHoy
    ? `Resultados de ${loteria.nombre} hoy, ${fechaCorta}`
    : `Resultados de ${loteria.nombre} del ${fechaCorta}`;

  // Los numeros van en la descripcion para que se vean directo en Google.
  // Se omiten los sorteos con muchos numeros (ej. Super Kino TV, 20) para
  // que la descripcion no se corte.
  const lineasNumeros = (loteria.sorteos || [])
    .filter(function (s) { return ![73, 78, 119].includes(s.id); })
    .map(function (s) {
      const r = (s.resultados || []).find(function (x) { return x.fecha === params.fecha; });
      return r && r.numeros.split("-").length <= 8 ? `${s.nombre}: ${r.numeros}` : null;
    })
    .filter(function (l): l is string { return !!l; })
    .slice(0, 3);

  const descripcion = lineasNumeros.length > 0
    ? `Números ganadores de ${loteria.nombre} del ${fechaLarga}: ${lineasNumeros.join(" · ")}. Información no oficial de La Bankera RD.`
    : `Consulta los números ganadores de ${loteria.nombre} del ${fechaLarga} en República Dominicana. Información no oficial de La Bankera RD.`;

  // Una fecha sin ningun resultado registrado (y que no es hoy) es una pagina
  // vacia: se marca noindex para no llenar Google de paginas sin contenido.
  const hayResultados = (loteria.sorteos || []).some(function (s) {
    return (s.resultados || []).some(function (r) { return r.fecha === params.fecha; });
  });

  return {
    title: titulo,
    description: descripcion,
    ...(!hayResultados && !esHoy ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title: `${titulo} | La Bankera RD`, description: descripcion, locale: "es_DO", type: "website" },
    alternates: { canonical: `https://labankerard.com/${params.slug}/${params.fecha}` },
  };
}

export default async function PaginaResultadoFecha(props: { params: Promise<{ slug: string; fecha: string }> }) {
  const params = await props.params;

  if (!fechaValida(params.fecha)) {
    notFound();
  }

  const hoy = hoyISO();
  const esHoy = params.fecha === hoy;
  const fechaAyer = sumarDias(params.fecha, -1);
  const fechaManana = sumarDias(params.fecha, 1);
  const noMostrarManana = fechaManana > hoy;

  const { data: loteria, error } = await supabase
    .from("loterias")
    .select("id, nombre, slug, activa, sorteos ( id, nombre, hora_sorteo, resultados ( numeros, fecha, creado_en ) )")
    .eq("slug", params.slug)
    .eq("activa", true)
    .maybeSingle();

  if (!loteria || error) {
    notFound();
  }

  const loteriaData = loteria as unknown as Loteria;
  // Sorteos que la fuente de datos ya no ofrece (descontinuados o renombrados).
  const SORTEOS_DESCONTINUADOS = [73, 78, 119];
  const sorteos = (loteriaData.sorteos || []).filter(function (s) { return !SORTEOS_DESCONTINUADOS.includes(s.id); });
  const fechaLarga = formatearFechaLarga(params.fecha);

  // Datos estructurados (schema.org) para que Google entienda que esto es un
  // resultado de sorteo real y con fecha concreta, no solo texto suelto.
  const eventosParaGoogle = sorteos
    .map(function (sorteo) {
      const resultado = sorteo.resultados.find(function (r) { return r.fecha === params.fecha; });
      if (!resultado) return null;
      return {
        "@type": "Event",
        name: `${sorteo.nombre} - ${loteriaData.nombre} - ${params.fecha}`,
        startDate: `${params.fecha}T${horaSorteoEfectiva(sorteo.id, sorteo.hora_sorteo, params.fecha) || "00:00"}:00-04:00`,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        location: { "@type": "VirtualLocation", url: `https://labankerard.com/${params.slug}/${params.fecha}` },
        organizer: { "@type": "Organization", name: loteriaData.nombre },
        additionalProperty: {
          "@type": "PropertyValue",
          name: "Números ganadores",
          value: resultado.numeros,
        },
      };
    })
    .filter(Boolean);

  const datosEstructurados =
    eventosParaGoogle.length > 0
      ? { "@context": "https://schema.org", "@graph": eventosParaGoogle }
      : null;

  // Resumen en texto (con datos reales) y enlaces a otros dias recientes:
  // dan contenido util a la pagina y una red de enlaces internos entre fechas.
  const resumenLineas = sorteos
    .map(function (sorteo) {
      const r = sorteo.resultados.find(function (x) { return x.fecha === params.fecha; });
      if (!r) return null;
      const hora = formatearHora12(horaSorteoEfectiva(sorteo.id, sorteo.hora_sorteo, params.fecha));
      return `${sorteo.nombre}${hora ? " (" + hora + ")" : ""}: ${r.numeros.split("-").join(" - ")}`;
    })
    .filter(function (l): l is string { return !!l; });

  const PRIMER_DIA_DE_DATOS = "2026-08-31";
  const otrosDias: string[] = [];
  for (let i = 1; i <= 7; i++) {
    const f = sumarDias(params.fecha, -i);
    if (f >= PRIMER_DIA_DE_DATOS && f <= hoy) otrosDias.push(f);
  }

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      {datosEstructurados ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }}
        />
      ) : null}
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <a href={"/" + params.slug + "/historial"} className="font-mono text-sm text-[#E7A63C] hover:underline">← Ver historial completo de {loteriaData.nombre}</a>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-[#FBF7EE] sm:text-4xl">
            Resultados de {loteriaData.nombre} {esHoy ? "hoy" : "del " + fechaLarga}
          </h1>
          <p className="mt-2 font-mono text-sm capitalize text-[#D5DEEA]">
            {esHoy ? "Hoy, " : ""}{fechaLarga}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <div className="mb-8 flex items-center justify-between">
          <a
            href={"/" + params.slug + "/" + fechaAyer}
            className="rounded-full border border-[#10203A]/20 px-4 py-1.5 font-mono text-xs font-semibold text-[#10203A] hover:bg-[#10203A]/5"
          >
            ← Día anterior
          </a>
          {!noMostrarManana ? (
            <a
              href={"/" + params.slug + "/" + fechaManana}
              className="rounded-full border border-[#10203A]/20 px-4 py-1.5 font-mono text-xs font-semibold text-[#10203A] hover:bg-[#10203A]/5"
            >
              Día siguiente →
            </a>
          ) : null}
        </div>

        {sorteos.length === 0 ? (
          <p className="text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Todavía no hay productos registrados para esta lotería.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {sorteos.map(function (sorteo) {
              const resultado = sorteo.resultados.find(function (r) { return r.fecha === params.fecha; });
              const numeros = resultado ? resultado.numeros.split("-") : [];
              const tamano = tamanoBolita(numeros.length);

              return (
                <div key={sorteo.id} className="rounded-xl border border-[#10203A]/15 bg-white p-5">
                  <p className="mb-1 font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">
                    {sorteo.nombre}
                  </p>
                  <p className="mb-4 font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Sorteo: {formatearHora12(horaSorteoEfectiva(sorteo.id, sorteo.hora_sorteo, params.fecha))}</p>

                  {numeros.length > 0 ? (
                    sorteo.nombre.toLowerCase().includes("kino") ? (
                      <div className="grid grid-cols-5 gap-2 sm:gap-3">
                        {numeros.map(function (n, i) {
                          return (
                            <div
                              key={i}
                              className="mx-auto flex h-9 w-9 items-center justify-center rounded-full font-mono text-sm font-bold text-white sm:h-10 sm:w-10"
                              style={{ backgroundColor: COLOR_AZUL }}
                            >
                              {n}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        {numeros.map(function (n, i) { return <Bolita key={i} tamano={tamano}>{n}</Bolita>; })}
                      </div>
                    )
                  ) : (
                    <p className="text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                      {esHoy ? "Todavía no hay resultado publicado para hoy." : "No hay resultado registrado para esta fecha."}
                    </p>
                  )}

                  {(function () {
                    const anterior = sorteo.resultados
                      .filter(function (r) { return r.fecha < params.fecha; })
                      .sort(function (a, b) { return b.fecha.localeCompare(a.fecha); })[0];
                    if (!anterior) return null;
                    return (
                      <p className="mt-4 border-t border-[#10203A]/8 pt-3 font-mono text-xs leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                        Sorteo anterior ({formatearFechaBreve(anterior.fecha)}):{" "}
                        <a href={"/" + params.slug + "/" + anterior.fecha} className="underline" style={{ color: COLOR_AZUL }}>
                          {anterior.numeros.split("-").join(" - ")}
                        </a>
                      </p>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}

        {resumenLineas.length > 0 ? (
          <section className="mt-10">
            <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">
              Resumen de {loteriaData.nombre} del {fechaLarga}
            </h2>
            <p className="text-sm leading-relaxed">
              Estos son los números ganadores que se registraron en {loteriaData.nombre} el {fechaLarga} en República Dominicana:{" "}
              {resumenLineas.join("; ")}. Información no oficial: confirma siempre en los canales oficiales de la lotería.
            </p>
          </section>
        ) : null}

        {otrosDias.length > 0 ? (
          <section className="mt-8">
            <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">
              Otros días de {loteriaData.nombre}
            </h2>
            <ul className="flex flex-col gap-1.5 text-sm">
              {otrosDias.map(function (f) {
                return (
                  <li key={f}>
                    <a href={"/" + params.slug + "/" + f} className="underline" style={{ color: COLOR_AZUL }}>
                      Resultados de {loteriaData.nombre} del {formatearFechaBreve(f)}
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href={"/" + params.slug + "/historial"} className="font-mono text-sm text-[#1E4D8C] hover:underline">← Ver historial completo de {loteriaData.nombre}</a>
        <span className="mx-2 text-[#10203A]/20">·</span>
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">Ver todas las loterías</a>
      </footer>
    </div>
  );
}
