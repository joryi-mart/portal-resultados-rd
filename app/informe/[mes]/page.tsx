import { notFound } from "next/navigation";
import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { Bolita } from "@/app/componentesResultados";
import NavPildoras from "../../NavPildoras";
import PreguntasFrecuentes from "../../PreguntasFrecuentes";
import { leerSlugMes, mesValido, nombreMes, obtenerInforme, slugMes, vecinos, type Mes } from "@/lib/informeMensual";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO = "#2E3B48";

// Un mes cerrado no cambia: basta con recalcular una vez al dia.
export const revalidate = 86400;

function mesDesdeParams(slug: string): Mes {
  const m = leerSlugMes(slug);
  if (!m || !mesValido(m)) notFound();
  return m;
}

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export async function generateMetadata(props: { params: Promise<{ mes: string }> }) {
  const { mes } = await props.params;
  const m = leerSlugMes(mes);
  if (!m || !mesValido(m)) return { title: "Informe no encontrado" };
  const nombre = nombreMes(m);
  const titulo = `Números más salidos en ${nombre}: Nacional, Leidsa, Loteka y Real`;
  const descripcion = `Informe de ${nombre}: los números que más salieron, los que no salieron ni una vez y cuántos se repitieron en la Lotería Nacional, Leidsa, Loteka y Lotería Real.`;
  return {
    title: titulo,
    description: descripcion,
    openGraph: { images: ["/opengraph-image.png"], title: `${titulo} | La Bankera RD`, description: descripcion, locale: "es_DO", type: "article" },
    alternates: { canonical: `https://labankerard.com/informe/${slugMes(m)}` },
  };
}

export default async function InformeMes(props: { params: Promise<{ mes: string }> }) {
  const { mes } = await props.params;
  const m = mesDesdeParams(mes);
  const nombre = nombreMes(m);
  const informe = await obtenerInforme(m);
  const { anterior, siguiente } = vecinos(m);
  const url = `https://labankerard.com/informe/${slugMes(m)}`;

  // El numero que mas veces salio en una sola loteria (para el resumen).
  const estrella = informe
    .map(function (l) { return l.masSalidos[0] ? { loteria: l.nombre, ...l.masSalidos[0] } : null; })
    .filter(function (x): x is { loteria: string; numero: string; veces: number } { return !!x && x.veces > 0; })
    .sort(function (a, b) { return b.veces - a.veces; })[0];
  const totalSorteos = informe.reduce(function (s, l) { return s + l.sorteos; }, 0);

  const textoCompartir = encodeURIComponent(`Mira los números que más salieron en ${nombre} en la lotería dominicana: ${url}`);

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-sm font-extrabold uppercase tracking-wide text-[#E7A63C]">Informe del mes</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Números más salidos en {nombre}
          </h1>
          <p className="mt-2 text-base text-[#E6ECF3]">Lotería Nacional, Leidsa, Loteka y Lotería Real</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <p className="mb-6 text-lg leading-relaxed" style={{ color: COLOR_TEXTO }}>
          En {nombre} guardamos {totalSorteos} sorteos de las cuatro loterías principales.
          {estrella ? <> El número que más salió fue el <strong className="text-[#10203A]">{estrella.numero}</strong> en {estrella.loteria}, con {estrella.veces} veces.</> : null}{" "}
          Abajo tienes el detalle de cada lotería, calculado con nuestros propios resultados guardados día a día.
        </p>

        <div className="mb-8 flex flex-wrap gap-2">
          <a href={`https://wa.me/?text=${textoCompartir}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#1F8F4E] px-5 text-base font-bold text-white hover:opacity-90">
            Compartir en WhatsApp
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#1464D8] px-5 text-base font-bold text-white hover:opacity-90">
            Compartir en Facebook
          </a>
        </div>

        <div className="mb-8 flex flex-col gap-6">
          {informe.map(function (l) {
            return (
              <section key={l.slug} className="rounded-xl border border-[#10203A]/15 bg-white p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-bold" style={{ color: COLOR_AZUL }}>{l.nombre}</h2>
                  <a href={`/${l.slug}`} className="text-sm font-bold underline" style={{ color: COLOR_AZUL }}>Resultados de hoy →</a>
                </div>
                {l.sorteos === 0 ? (
                  <p className="text-base" style={{ color: COLOR_TEXTO }}>No tenemos resultados guardados de {l.nombre} en {nombre}.</p>
                ) : (
                  <>
                    <p className="mb-3 text-base font-semibold" style={{ color: COLOR_TEXTO }}>Los 5 que más salieron</p>
                    <div className="flex flex-wrap gap-3">
                      {l.masSalidos.map(function (c, i) {
                        return (
                          <div key={c.numero} className="flex flex-col items-center gap-1">
                            <Bolita tamano="h-14 w-14 text-xl" primera={i === 0}>{c.numero}</Bolita>
                            <span className="text-sm font-semibold" style={{ color: COLOR_TEXTO }}>{c.veces} {c.veces === 1 ? "vez" : "veces"}</span>
                          </div>
                        );
                      })}
                    </div>
                    <ul className="mt-4 flex flex-col gap-1.5 border-t border-[#10203A]/8 pt-4 text-base leading-relaxed" style={{ color: COLOR_TEXTO }}>
                      <li><strong className="text-[#10203A]">Sorteos del mes:</strong> {l.sorteos}</li>
                      <li>
                        <strong className="text-[#10203A]">No salieron ni una vez:</strong>{" "}
                        {l.noSalieron.length === 0 ? "todos los números del 00 al 99 salieron al menos una vez." : `${l.noSalieron.length} números, entre ellos ${l.noSalieron.slice(0, 10).join(", ")}${l.noSalieron.length > 10 ? "…" : ""}.`}
                      </li>
                      <li><strong className="text-[#10203A]">Repeticiones:</strong> {l.repetidos} veces un número volvió a salir en el sorteo siguiente.</li>
                    </ul>
                  </>
                )}
              </section>
            );
          })}
        </div>

        <div className="mb-8 rounded-xl border border-[#10203A]/12 bg-white p-5">
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-bold" style={{ color: COLOR_AZUL }}>¿Esto ayuda a ganar?</h2>
          <p className="text-base leading-relaxed" style={{ color: COLOR_TEXTO }}>
            No. Cada sorteo es completamente al azar y lo que salió antes no cambia lo que salga después. Este informe es
            solo informativo y curioso. La Bankera RD es una página informativa: no vendemos jugadas ni aceptamos apuestas.
          </p>
        </div>

        <nav className="mb-8 flex flex-wrap items-center justify-between gap-3 text-base font-bold">
          {anterior ? <a href={`/informe/${slugMes(anterior)}`} className="underline" style={{ color: COLOR_AZUL }}>← Informe de {nombreMes(anterior)}</a> : <span />}
          <a href="/informe" className="underline" style={{ color: COLOR_AZUL }}>Todos los informes</a>
          {siguiente ? <a href={`/informe/${slugMes(siguiente)}`} className="underline" style={{ color: COLOR_AZUL }}>Informe de {nombreMes(siguiente)} →</a> : <span />}
        </nav>

        <p className="text-base" style={{ color: COLOR_TEXTO }}>
          ¿Quieres el conteo de todos los meses juntos? Mira los{" "}
          <a href="/numeros-mas-salidos" className="underline" style={{ color: COLOR_AZUL }}>números más salidos de siempre</a>.
          {" "}Si usas estos datos en tu blog o periódico, cita como fuente a La Bankera RD con un enlace a esta página.
        </p>
      </main>

      <PreguntasFrecuentes
        preguntas={[
          {
            pregunta: `¿Cuál fue el número que más salió en ${nombre}?`,
            respuesta: estrella
              ? `El ${estrella.numero} en ${estrella.loteria}, que salió ${estrella.veces} veces. Arriba está el top 5 de cada lotería.`
              : `Arriba está el top 5 de cada lotería para ${nombre}.`,
          },
          {
            pregunta: "¿De dónde salen estos datos?",
            respuesta: "De los resultados que guardamos cada día en La Bankera RD. No incluimos Super Kino TV, que saca 20 números del 01 al 80 y desordenaría el conteo.",
          },
          {
            pregunta: `¿Hay informe de otros meses además de ${capitalizar(nombre)}?`,
            respuesta: "Sí. Cada mes publicamos uno nuevo. Los tienes todos en labankerard.com/informe.",
          },
        ]}
      />

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
