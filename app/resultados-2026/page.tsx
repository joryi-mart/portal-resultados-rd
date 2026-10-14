import { supabase } from "@/lib/supabase";
import { slugSorteo } from "@/lib/slug";
import NavPildoras from "../NavPildoras";
import PreguntasFrecuentes from "../PreguntasFrecuentes";
import { display, body, mono } from "../page";
import { COLOR_AZUL, COLOR_VERDE_PRESIDENTE } from "../componentesResultados";

// Archivo de resultados del ano (como "Resultados Anos Anteriores" de Conectate):
// por cada loteria, cuantos sorteos hay guardados en 2026, desde cuando, y
// enlaces a su historial completo y a cada juego. Crece solo cada dia.
export const revalidate = 3600;

const ANIO = 2026;
const TEXTO = "#2E3B48";
const SORTEOS_DESCONTINUADOS = [73, 78, 119];
const ORDEN = ["nacional", "leidsa", "real", "loteka", "la-primera", "la-suerte", "lotedom", "anguila", "haiti", "new-york", "florida", "loterias-americanas", "sxm", "powerball", "mega-millions"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export const metadata = {
  title: `Resultados de Loterías Dominicanas ${ANIO}: Historial Completo`,
  description: `Archivo de resultados ${ANIO} de la Lotería Nacional, Leidsa, Loteka, Real, La Primera y más: todos los números ganadores guardados, día por día.`,
  openGraph: {
    images: ["/opengraph-image.png"],
    title: `Resultados de Loterías Dominicanas ${ANIO}`,
    description: "Todos los números ganadores del año, por lotería y por juego.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: `https://labankerard.com/resultados-${ANIO}` },
};

type Loteria = { nombre: string; slug: string; sorteos: { id: number; nombre: string; resultados: { fecha: string }[] }[] };

function fechaLarga(fechaISO: string) {
  const [, m, d] = fechaISO.split("-").map(Number);
  return `${d} de ${MESES[m - 1]}`;
}

export default async function Resultados2026() {
  const { data } = await supabase
    .from("loterias")
    .select("nombre, slug, sorteos ( id, nombre, resultados ( fecha ) )")
    .eq("activa", true)
    .gte("sorteos.resultados.fecha", `${ANIO}-01-01`)
    .lte("sorteos.resultados.fecha", `${ANIO}-12-31`);

  const loterias = ((data || []) as unknown as Loteria[])
    .map(function (l) {
      const sorteos = (l.sorteos || []).filter(function (s) { return !SORTEOS_DESCONTINUADOS.includes(s.id); });
      const fechas = sorteos.flatMap(function (s) { return (s.resultados || []).map(function (r) { return r.fecha; }); }).sort();
      const meses = Array.from(new Set(fechas.map(function (f) { return Number(f.slice(5, 7)); })));
      return { ...l, sorteos, total: fechas.length, desde: fechas[0], hasta: fechas[fechas.length - 1], meses };
    })
    .filter(function (l) { return l.total > 0; })
    .sort(function (a, b) {
      const pa = ORDEN.indexOf(a.slug);
      const pb = ORDEN.indexOf(b.slug);
      return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
    });

  const totalGeneral = loterias.reduce(function (t, l) { return t + l.total; }, 0);
  const primerDia = loterias.map(function (l) { return l.desde; }).sort()[0];

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <a href="/loterias" className="font-mono text-sm text-[#E7A63C] hover:underline">← Todas las loterías</a>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Resultados de loterías dominicanas {ANIO}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#D5DEEA]">
            El archivo de todos los números ganadores del año que hemos guardado: {totalGeneral.toLocaleString("es-DO")} resultados
            {primerDia ? ` desde el ${fechaLarga(primerDia)}` : ""}. Crece todos los días.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 sm:px-10">
        <NavPildoras />

        <div className="grid gap-4 sm:grid-cols-2">
          {loterias.map(function (l) {
            return (
              <section key={l.slug} className="rounded-xl border border-[#10203A]/15 bg-white p-5">
                <h2 className="mb-1">
                  <a href={`/${l.slug}/historial`} className="inline-block rounded-lg px-2.5 py-1 font-[family-name:var(--font-display)] text-lg font-bold text-white hover:opacity-90" style={{ backgroundColor: COLOR_VERDE_PRESIDENTE }}>
                    {l.nombre} {ANIO}
                  </a>
                </h2>
                <p className="mt-2 text-base" style={{ color: TEXTO }}>
                  <strong>{l.total.toLocaleString("es-DO")}</strong> resultados guardados, del {fechaLarga(l.desde)} al {fechaLarga(l.hasta)}.
                </p>
                <p className="mt-1 text-sm" style={{ color: TEXTO }}>
                  Meses: {l.meses.map(function (m) { return MESES[m - 1]; }).join(", ")}
                </p>
                <p className="mt-3 text-sm font-semibold" style={{ color: TEXTO }}>Juegos:</p>
                <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  {l.sorteos.map(function (s) {
                    return (
                      <li key={s.id}>
                        <a href={`/${l.slug}/sorteo/${slugSorteo(s.nombre)}`} className="text-base underline" style={{ color: COLOR_AZUL }}>{s.nombre}</a>
                      </li>
                    );
                  })}
                </ul>
                <a href={`/${l.slug}/historial`} className="mt-4 inline-block font-mono text-sm font-semibold hover:underline" style={{ color: COLOR_AZUL }}>
                  Ver historial completo de {l.nombre} →
                </a>
              </section>
            );
          })}
        </div>

        <section className="mt-10">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-bold">Estadísticas del año</h2>
          <p className="text-base leading-relaxed" style={{ color: TEXTO }}>
            ¿Qué números han salido más en {ANIO}? Consulta los <a href="/numeros-mas-salidos" className="underline" style={{ color: COLOR_AZUL }}>números más salidos</a>,
            busca cuándo salió un número en el <a href="/buscador" className="underline" style={{ color: COLOR_AZUL }}>buscador</a> o mira los
            resultados de hoy <a href="/en-directo" className="underline" style={{ color: COLOR_AZUL }}>en directo</a>.
          </p>
        </section>
      </main>

      <PreguntasFrecuentes
        preguntas={[
          {
            pregunta: `¿Dónde veo los resultados de la lotería de un día de ${ANIO}?`,
            respuesta: "Entra al historial de la lotería que buscas: los resultados están organizados por mes y por día. Cada día tiene su propia página con todos los sorteos.",
          },
          {
            pregunta: "¿Desde cuándo hay resultados guardados?",
            respuesta: primerDia
              ? `La Bankera RD guarda los resultados desde el ${fechaLarga(primerDia)} de ${ANIO}, y se agregan solos todos los días.`
              : "Los resultados se agregan solos todos los días.",
          },
          {
            pregunta: "¿Estos resultados son oficiales?",
            respuesta: "No. La Bankera RD es un sitio informativo independiente. Confirma siempre en los canales oficiales de cada lotería.",
          },
        ]}
      />
    </div>
  );
}
