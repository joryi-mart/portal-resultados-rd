import { supabase } from "@/lib/supabase";
import NavPildoras from "../NavPildoras";
import PreguntasFrecuentes from "../PreguntasFrecuentes";
import { display, body, mono } from "../page";
import { COLOR_AZUL, COLOR_PRIMERA_POSICION, hoyISO, formatearFechaTitulo, formatearHora12, horaSorteoEfectiva } from "../componentesResultados";
import Refrescar from "./Refrescar";

// "En directo": los resultados de hoy en el orden en que se van publicando
// (el mas nuevo arriba) y los sorteos que faltan por salir hoy. Se refresca
// sola cada minuto. Inspirada en la seccion "En Directo" de Conectate.
export const revalidate = 60;

const TEXTO = "#2E3B48";

export const metadata = {
  title: "Loterías Dominicanas en Directo: Resultados al Instante",
  description:
    "Resultados de las loterías dominicanas en directo: Nacional, Leidsa, Loteka, Real y más, en el orden en que salen, y los próximos sorteos de hoy.",
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Loterías Dominicanas en Directo 🔴",
    description: "Los números de hoy en el orden en que van saliendo, y los próximos sorteos.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/en-directo" },
};

// Solo sitios oficiales comprobados (existen y son de la loteria).
const SITIOS_OFICIALES = [
  { nombre: "Leidsa", url: "https://www.leidsa.com" },
  { nombre: "Lotería Nacional", url: "https://loterianacional.gob.do" },
  { nombre: "Loteka", url: "https://loteka.com.do" },
  { nombre: "Lotedom", url: "https://lotedom.com" },
];

const SORTEOS_DESCONTINUADOS = [73, 78, 119];
const LETRA_DIA = ["D", "L", "M", "X", "J", "V", "S"];

type FilaResultado = {
  numeros: string;
  creado_en: string;
  sorteos: { id: number; nombre: string; hora_sorteo: string; loterias: { nombre: string; slug: string } };
};
type SorteoDia = { id: number; nombre: string; hora_sorteo: string; dias_semana: string; loterias: { nombre: string; slug: string } };

function horaPublicada(creadoEn: string) {
  const fecha = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(creadoEn) ? creadoEn : creadoEn + "Z");
  return fecha.toLocaleTimeString("es-DO", { timeZone: "America/Santo_Domingo", hour: "numeric", minute: "2-digit", hour12: true });
}

export default async function EnDirecto() {
  const hoy = hoyISO();
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const horaActual = ahoraRD.toISOString().slice(11, 16);
  const letraHoy = LETRA_DIA[new Date(hoy + "T12:00:00Z").getUTCDay()];

  const [{ data: resultadosData }, { data: sorteosData }] = await Promise.all([
    supabase
      .from("resultados")
      .select("numeros, creado_en, sorteos ( id, nombre, hora_sorteo, loterias ( nombre, slug ) )")
      .eq("fecha", hoy)
      .order("creado_en", { ascending: false }),
    supabase.from("sorteos").select("id, nombre, hora_sorteo, dias_semana, loterias!inner ( nombre, slug, activa )").eq("loterias.activa", true),
  ]);

  const resultados = ((resultadosData || []) as unknown as FilaResultado[]).filter(function (r) {
    return r.sorteos && !SORTEOS_DESCONTINUADOS.includes(r.sorteos.id);
  });
  const yaSalieron = new Set(resultados.map(function (r) { return r.sorteos.id; }));

  // Sorteos de hoy que todavia no tienen resultado, del mas proximo al mas tardio.
  const proximos = ((sorteosData || []) as unknown as SorteoDia[])
    .filter(function (s) {
      if (SORTEOS_DESCONTINUADOS.includes(s.id) || yaSalieron.has(s.id) || !s.hora_sorteo) return false;
      const dias = (s.dias_semana || "").split(",").map(function (d) { return d.trim(); });
      return dias.length === 0 || dias[0] === "" || dias.includes(letraHoy);
    })
    .map(function (s) { return { ...s, hora: horaSorteoEfectiva(s.id, s.hora_sorteo, hoy).slice(0, 5) }; })
    .sort(function (a, b) { return a.hora.localeCompare(b.hora); });
  const pendientes = proximos.filter(function (s) { return s.hora >= horaActual; });
  const atrasados = proximos.filter(function (s) { return s.hora < horaActual; });

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <Refrescar />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="flex items-center gap-2 font-mono text-sm font-semibold text-[#FFD166]">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#E4573D]" /> En directo · {formatearFechaTitulo(hoy)}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Loterías dominicanas en directo
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-[#D5DEEA]">
            Los números de hoy en el orden en que van saliendo, el más nuevo arriba. Esta página se actualiza sola cada minuto.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 sm:px-10">
        <NavPildoras />

        <section>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold">
            Últimos resultados de hoy <span className="font-mono text-base font-semibold" style={{ color: TEXTO }}>({resultados.length})</span>
          </h2>
          {resultados.length === 0 ? (
            <p className="rounded-xl border border-[#10203A]/15 bg-white p-5 text-base" style={{ color: TEXTO }}>
              Todavía no ha salido ningún sorteo hoy. Los primeros resultados llegan en la mañana.
            </p>
          ) : (
            <ol className="flex flex-col gap-3">
              {resultados.map(function (r, i) {
                const numeros = r.numeros.split("-");
                return (
                  <li key={i} className={"rounded-xl border bg-white p-4 " + (i === 0 ? "border-[#E4573D]/50 shadow-md" : "border-[#10203A]/15")}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <a href={"/" + r.sorteos.loterias.slug} className="text-lg font-bold hover:underline" style={{ color: COLOR_AZUL }}>
                        {r.sorteos.nombre}
                      </a>
                      <span className="font-mono text-sm font-semibold" style={{ color: TEXTO }}>
                        {i === 0 ? "🔴 Lo último · " : ""}salió {horaPublicada(r.creado_en)}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: TEXTO }}>{r.sorteos.loterias.nombre}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {numeros.map(function (n, k) {
                        return (
                          <span
                            key={k}
                            className="flex h-12 w-12 items-center justify-center rounded-full font-mono text-lg font-bold"
                            style={k === 0 ? { backgroundColor: COLOR_PRIMERA_POSICION, color: "#10203A" } : { backgroundColor: COLOR_AZUL, color: "#FFFFFF" }}
                          >
                            {n}
                          </span>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className="mt-10">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold">Próximos sorteos de hoy</h2>
          {pendientes.length === 0 && atrasados.length === 0 ? (
            <p className="text-base" style={{ color: TEXTO }}>Ya salieron todos los sorteos de hoy. Mañana temprano empiezan los nuevos.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#10203A]/15 bg-white">
              {[...atrasados, ...pendientes].map(function (s) {
                const esperando = s.hora < horaActual;
                return (
                  <a
                    key={s.id}
                    href={"/" + s.loterias.slug}
                    className="flex items-center justify-between gap-3 border-t border-[#10203A]/8 px-5 py-3 first:border-t-0 hover:bg-[#FBF7EE]"
                  >
                    <span>
                      <span className="block text-base font-semibold">{s.nombre}</span>
                      <span className="block text-sm" style={{ color: TEXTO }}>{s.loterias.nombre}</span>
                    </span>
                    <span className="shrink-0 text-right font-mono text-base font-bold" style={{ color: esperando ? "#B23B26" : COLOR_AZUL }}>
                      {formatearHora12(s.hora)}
                      {esperando ? <span className="block text-xs font-semibold">esperando resultado</span> : null}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-sm" style={{ color: TEXTO }}>
            Horas de República Dominicana. Ver los horarios completos en <a href="/loterias" className="underline" style={{ color: COLOR_AZUL }}>todas las loterías</a>.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-bold">Sitios oficiales de las loterías</h2>
          <p className="mb-3 text-base leading-relaxed" style={{ color: TEXTO }}>
            La Bankera RD es un sitio informativo. Para confirmar un resultado o cobrar un premio, consulta siempre la fuente oficial:
          </p>
          <ul className="flex flex-wrap gap-2">
            {SITIOS_OFICIALES.map(function (s) {
              return (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border border-[#10203A]/20 bg-white px-4 py-2 text-base font-semibold hover:bg-[#10203A]/5" style={{ color: COLOR_AZUL }}>
                    {s.nombre} ↗
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-base" style={{ color: TEXTO }}>
            ¿Buscas días anteriores? Mira los <a href="/resultados-2026" className="underline" style={{ color: COLOR_AZUL }}>resultados de 2026</a> o el{" "}
            <a href="/resumen" className="underline" style={{ color: COLOR_AZUL }}>resumen del día</a>.
          </p>
        </section>
      </main>

      <PreguntasFrecuentes
        preguntas={[
          {
            pregunta: "¿Cada cuánto se actualizan los resultados en directo?",
            respuesta: "Revisamos las fuentes cada pocos minutos y esta página se actualiza sola cada minuto mientras la tengas abierta. No hace falta recargarla.",
          },
          {
            pregunta: "¿Qué sorteo sale ahora?",
            respuesta: "En la sección «Próximos sorteos de hoy» verás el siguiente sorteo con su hora. Si un sorteo ya pasó su hora y dice «esperando resultado», el número llega en unos minutos.",
          },
          {
            pregunta: "¿Estos resultados son oficiales?",
            respuesta: "No. La Bankera RD es un sitio informativo independiente. Confirma siempre el resultado en el sitio oficial de cada lotería antes de cobrar.",
          },
        ]}
      />
    </div>
  );
}
