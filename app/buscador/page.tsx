import { supabase } from "@/lib/supabase";
import NavPildoras from "../NavPildoras";
import {
  display,
  body,
  mono,
  COLOR_TEXTO_SECUNDARIO,
  COLOR_VERDE_PRESIDENTE,
  COLOR_AZUL,
  hoyISO,
  type Loteria,
} from "../page";

export const metadata = {
  title: "Buscador de Números — ¿Cuándo Salió Tu Número?",
  description: "Busca un número y descubre cuándo fue la última vez que salió, en qué lotería y en qué posición, en República Dominicana.",
  openGraph: {
    title: "Buscador de Números de Lotería",
    description: "Busca un número y descubre cuándo fue la última vez que salió, en qué lotería y en qué posición.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/buscador" },
};

export const revalidate = 3600;

const SORTEOS_DESCONTINUADOS = [73, 78, 119];

// Primera fecha con historial real guardado (antes de esto hubo datos de
// prueba que ya se borraron). Se muestra para ser honestos con lo poco que
// llevamos acumulado todavia.
const INICIO_HISTORIAL = "2026-08-31";

function nombrePosicion(indice: number) {
  const nombres = ["1era", "2da", "3era", "4ta", "5ta", "6ta", "7ma", "8va"];
  return nombres[indice] || indice + 1 + "a";
}

function diasDesde(fechaISO: string, hoy: string) {
  const [y1, m1, d1] = fechaISO.split("-").map(Number);
  const [y2, m2, d2] = hoy.split("-").map(Number);
  const f1 = Date.UTC(y1, m1 - 1, d1);
  const f2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((f2 - f1) / 86400000);
}

export default async function BuscadorPage(props: { searchParams: Promise<{ numero?: string }> }) {
  const hoy = hoyISO();
  const searchParams = await props.searchParams;
  const numeroTexto = (searchParams.numero || "").trim();

  const loteriasResult = await supabase
    .from("loterias")
    .select("id, nombre, slug, activa, sorteos ( id, nombre, hora_sorteo, dias_semana, resultados ( numeros, fecha, creado_en ) )")
    .eq("activa", true)
    .order("id");
  const loterias = loteriasResult.data;
  const error = loteriasResult.error;

  const SORTEOS_DESCONTINUADOS_LOCAL = SORTEOS_DESCONTINUADOS;
  const ORDEN_PRIORIDAD = ["leidsa", "nacional", "real", "la-suerte"];
  const listaLoterias = (loterias || [])
    .map(function (l) {
      return { ...l, sorteos: (l.sorteos || []).filter(function (s) { return !SORTEOS_DESCONTINUADOS_LOCAL.includes(s.id); }) };
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

  type Coincidencia = {
    loteria: string;
    loteriaSlug: string;
    sorteo: string;
    fecha: string;
    posicion: number;
    numeroExacto: string;
    todos: string;
  };

  let coincidencias: Coincidencia[] = [];
  let numeroValido = false;
  const numeroBuscado = numeroTexto === "" ? NaN : parseInt(numeroTexto, 10);

  if (numeroTexto !== "" && !Number.isNaN(numeroBuscado)) {
    numeroValido = true;
    listaLoterias.forEach(function (loteria) {
      (loteria.sorteos || []).forEach(function (sorteo) {
        (sorteo.resultados || []).forEach(function (r) {
          const numeros = r.numeros.split("-");
          numeros.forEach(function (n: string, i: number) {
            if (parseInt(n, 10) === numeroBuscado) {
              coincidencias.push({
                loteria: loteria.nombre,
                loteriaSlug: loteria.slug,
                sorteo: sorteo.nombre,
                fecha: r.fecha,
                posicion: i + 1,
                numeroExacto: n,
                todos: r.numeros,
              });
            }
          });
        });
      });
    });
    coincidencias.sort(function (a, b) { return b.fecha.localeCompare(a.fecha); });
  }

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras
        loterias={listaLoterias.map(function (l: Loteria) {
          return { nombre: l.nombre, slug: l.slug };
        })}
      />

      <main className="mx-auto max-w-3xl px-4 pb-10 pt-3 sm:px-8 sm:pt-4">
        <a href="/" className="mb-4 inline-block font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a la portada</a>

        <h1 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A]">Buscador de números</h1>
        <p className="mb-6 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Escribe un número y te decimos cuándo fue la última vez que salió, en qué lotería y en qué posición.
        </p>

        <form action="/buscador" method="get" className="mb-8 flex gap-2">
          <input
            type="text"
            name="numero"
            defaultValue={numeroTexto}
            inputMode="numeric"
            placeholder="Ej: 23"
            className="w-full rounded-lg border border-[#10203A]/20 bg-white px-4 py-3 font-mono text-lg font-bold text-[#10203A] outline-none focus:border-[#1E4D8C]"
          />
          <button type="submit" className="shrink-0 rounded-lg px-6 py-3 font-mono text-sm font-bold text-white" style={{ backgroundColor: COLOR_AZUL }}>
            Buscar
          </button>
        </form>

        {error ? (
          <div className="mb-6 rounded-lg border border-[#E4573D]/40 bg-[#E4573D]/5 p-4 text-sm text-[#B23B26]">No pudimos cargar los datos: {error.message}</div>
        ) : null}

        {numeroTexto !== "" && !numeroValido ? (
          <p className="rounded-xl border border-dashed border-[#10203A]/20 bg-white/60 p-6 text-center text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
            Escribe solo un número (por ejemplo "23" o "05").
          </p>
        ) : null}

        {numeroValido && coincidencias.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#10203A]/20 bg-white/60 p-6 text-center">
            <p className="font-[family-name:var(--font-display)] text-lg font-bold">
              El {String(numeroBuscado).padStart(2, "0")} no ha salido todavía
            </p>
            <p className="mt-1 text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Al menos no en el historial que llevamos guardado, desde el 31 de agosto de 2026.
            </p>
          </div>
        ) : null}

        {numeroValido && coincidencias.length > 0 ? (
          <div>
            <p className="mb-4 font-mono text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              El <b style={{ color: COLOR_VERDE_PRESIDENTE }}>{String(numeroBuscado).padStart(2, "0")}</b> ha salido {coincidencias.length} {coincidencias.length === 1 ? "vez" : "veces"} desde el 31 de agosto. La más reciente:
            </p>
            <div className="flex flex-col gap-2">
              {coincidencias.map(function (c, i) {
                const dias = diasDesde(c.fecha, hoy);
                const etiquetaDias = dias === 0 ? "Hoy" : dias === 1 ? "Ayer" : `Hace ${dias} días`;
                return (
                  <a
                    key={i}
                    href={"/" + c.loteriaSlug + "/" + c.fecha}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#10203A]/10 bg-white p-3 hover:bg-[#FBF7EE]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-[#10203A]">{c.sorteo}</p>
                      <p className="truncate font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                        {c.loteria} · {nombrePosicion(c.posicion - 1)} posición · {c.todos}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="inline-block rounded-full px-2.5 py-1 font-mono text-xs font-bold text-white" style={{ backgroundColor: i === 0 ? COLOR_VERDE_PRESIDENTE : "#9AA5AF" }}>
                        {etiquetaDias}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        ) : null}

        {numeroTexto === "" ? (
          <div className="rounded-xl border border-dashed border-[#10203A]/20 bg-white/60 p-6 text-center">
            <p className="text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Escribe un número arriba para empezar a buscar.</p>
          </div>
        ) : null}

        <p className="mt-10 text-xs leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Estamos guardando el historial de resultados desde el 31 de agosto de 2026, así que este buscador todavía cubre pocas semanas. Cada día que pasa se vuelve más completo.
        </p>
      </main>
    </div>
  );
}
