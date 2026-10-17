import { supabase } from "@/lib/supabase";
import NavPildoras from "../NavPildoras";
import PreguntasFrecuentes from "../PreguntasFrecuentes";
import { Bolita, hoyISO, COLOR_AZUL, COLOR_TEXTO_SECUNDARIO, COLOR_VERDE_PRESIDENTE } from "../componentesResultados";

export const revalidate = 21600; // 6 horas: no hace falta recalcular en cada visita

export const metadata = {
  title: "Última Vez que Ganó Cada Número (00 al 99)",
  description:
    "Consulta en una sola tabla cuándo fue la última vez que salió cada número, del 00 al 99, en qué lotería y en qué posición, en República Dominicana.",
  alternates: { canonical: "https://labankerard.com/ultima-vez-que-gano-un-numero" },
};

type Fila = {
  loteria: string;
  loteriaSlug: string;
  sorteo: string;
  fecha: string;
  posicion: number;
};

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

export default async function UltimaVezQueGanoPage() {
  const hoy = hoyISO();

  const { data: loterias, error } = await supabase
    .from("loterias")
    .select("nombre, slug, sorteos ( nombre, resultados ( numeros, fecha, creado_en ) )")
    .eq("activa", true);

  // Por cada numero del 00 al 99, se guarda solo la ocurrencia mas reciente
  // (se recorre todo el historial una sola vez, comparando fecha/hora de
  // creacion para quedarse con la mas nueva de cada numero).
  const ultimaVez = new Map<string, Fila & { creadoEn: string }>();
  (loterias || []).forEach(function (loteria) {
    (loteria.sorteos || []).forEach(function (sorteo) {
      (sorteo.resultados || []).forEach(function (r) {
        r.numeros.split("-").forEach(function (n: string, i: number) {
          const limpio = n.trim().padStart(2, "0");
          if (!/^\d{2}$/.test(limpio)) return; // se ignoran numeros de 3+ cifras
          const actual = ultimaVez.get(limpio);
          const esMasNueva =
            !actual || r.fecha > actual.fecha || (r.fecha === actual.fecha && r.creado_en > actual.creadoEn);
          if (esMasNueva) {
            ultimaVez.set(limpio, {
              loteria: loteria.nombre,
              loteriaSlug: loteria.slug,
              sorteo: sorteo.nombre,
              fecha: r.fecha,
              posicion: i + 1,
              creadoEn: r.creado_en,
            });
          }
        });
      });
    });
  });

  const filas = Array.from({ length: 100 }, function (_, n) {
    const numero = String(n).padStart(2, "0");
    return { numero, dato: ultimaVez.get(numero) || null };
  });

  return (
    <div className="min-h-screen bg-[#FBF7EE] text-[#10203A]">
      <NavPildoras />

      <main className="mx-auto max-w-4xl px-4 pb-10 pt-3 sm:px-8 sm:pt-4">
        <a href="/" className="mb-4 inline-block font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a la portada</a>

        <h1 className="mb-2 text-2xl font-bold text-[#10203A]">Última vez que ganó cada número</h1>
        <p className="mb-6 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Del 00 al 99: en qué lotería, en qué sorteo y hace cuántos días salió cada número por última vez, en un
          solo vistazo.
        </p>

        {error ? (
          <div className="mb-6 rounded-lg border border-[#E4573D]/40 bg-[#E4573D]/5 p-4 text-sm text-[#B23B26]">No pudimos cargar los datos: {error.message}</div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-[#10203A]/15 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#10203A]/10 bg-[#FBF7EE]" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                <th className="px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wide">Número</th>
                <th className="px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wide">Lotería / sorteo</th>
                <th className="px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wide">Fecha</th>
                <th className="px-3 py-2.5 text-right font-mono text-xs font-bold uppercase tracking-wide">Hace</th>
              </tr>
            </thead>
            <tbody>
              {filas.map(function (f) {
                if (!f.dato) {
                  return (
                    <tr key={f.numero} className="border-t border-[#10203A]/6">
                      <td className="px-3 py-2.5"><Bolita tamano="h-9 w-9 text-sm">{f.numero}</Bolita></td>
                      <td colSpan={3} className="px-3 py-2.5 font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Todavía no registrado</td>
                    </tr>
                  );
                }
                const dias = diasDesde(f.dato.fecha, hoy);
                const etiquetaDias = dias === 0 ? "Hoy" : dias === 1 ? "Ayer" : `${dias} días`;
                return (
                  <tr key={f.numero} className="border-t border-[#10203A]/6 hover:bg-[#FBF7EE]">
                    <td className="px-3 py-2.5"><Bolita tamano="h-9 w-9 text-sm" primera={dias <= 1}>{f.numero}</Bolita></td>
                    <td className="px-3 py-2.5">
                      <a href={"/" + f.dato.loteriaSlug + "/" + f.dato.fecha} className="hover:underline">
                        <span className="font-semibold">{f.dato.loteria}</span>
                        <span className="block font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                          {f.dato.sorteo} · {nombrePosicion(f.dato.posicion - 1)} posición
                        </span>
                      </a>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{f.dato.fecha}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span
                        className="inline-block rounded-full px-2.5 py-1 font-mono text-xs font-bold text-white"
                        style={{ backgroundColor: dias <= 1 ? COLOR_VERDE_PRESIDENTE : "#9AA5AF" }}
                      >
                        {etiquetaDias}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Calculado con nuestro propio historial de resultados guardados día a día. Entre más tiempo pase, más
          completa se vuelve esta tabla.
        </p>

        <p className="mt-4 text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          ¿Buscas un número en específico con todo su historial, no solo la última vez? Entra a{" "}
          <a href="/buscador" className="underline" style={{ color: COLOR_AZUL }}>
            nuestro buscador de números
          </a>.
        </p>

        <PreguntasFrecuentes
          preguntas={[
            {
              pregunta: "¿Cómo sé cuándo fue la última vez que salió un número?",
              respuesta:
                "En la tabla de arriba, cada número del 00 al 99 muestra la lotería, el sorteo, la fecha y hace cuántos días salió por última vez.",
            },
            {
              pregunta: "¿Qué significa 'Todavía no registrado'?",
              respuesta:
                "Que ese número no ha salido desde que empezamos a guardar resultados. No significa que nunca haya salido, solo que no está en nuestro historial todavía.",
            },
            {
              pregunta: "¿Esto sirve para predecir el próximo número ganador?",
              respuesta:
                "No. Cada sorteo es independiente y aleatorio — esta tabla solo muestra el historial de cuándo salió cada número, no predice resultados futuros.",
            },
          ]}
        />
      </main>
    </div>
  );
}
