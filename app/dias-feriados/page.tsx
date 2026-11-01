import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";
import PreguntasFrecuentes from "../PreguntasFrecuentes";
import { FERIADOS, diasEntre, fechaLarga, hoyRD, proximoFeriado, type Feriado } from "@/lib/feriados";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_TEXTO = "#2E3B48";
const COLOR_VERDE_RD = "#007A33";

// Se recalcula una vez al dia para que el "proximo feriado" este al dia.
export const revalidate = 86400;

// "dias feriados 2027" se busca muchisimo de noviembre a enero: por eso el
// titulo nombra los dos años mientras 2026 no termine.
export const metadata = {
  title: "Días Feriados 2026 y 2027 en República Dominicana: Calendario Oficial",
  description: "Calendario oficial de los días feriados de República Dominicana en 2026 y 2027, con las fechas que se trasladan al lunes según la Ley 139-97. En 2027 se mueven Santos Reyes y Duarte.",
  openGraph: {
    images: ["/opengraph-image.png"],
    title: "Días Feriados 2026 y 2027 en República Dominicana",
    description: "Calendario oficial de feriados dominicanos, con los traslados de ley.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/dias-feriados" },
};

function ListaFeriados(props: { feriados: Feriado[]; hoy: string }) {
  return (
    <div className="rounded-xl border border-[#10203A]/15 bg-white">
      {props.feriados.map(function (f) {
        const yaPaso = f.fecha < props.hoy;
        return (
          <div
            key={f.fecha}
            className={"flex flex-col gap-1 border-t border-[#10203A]/8 px-5 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between " + (yaPaso ? "opacity-50" : "")}
          >
            <div>
              <p className="text-lg font-bold text-[#10203A]">{f.nombre}</p>
              <p className="text-base font-semibold capitalize" style={{ color: COLOR_TEXTO }}>{fechaLarga(f.fecha)}{yaPaso ? " · ya pasó" : ""}</p>
            </div>
            {f.nota ? <p className="text-base italic" style={{ color: COLOR_TEXTO }}>{f.nota}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

export default function DiasFeriadosPage() {
  const hoy = hoyRD();
  const proximo = proximoFeriado(hoy);
  const faltan = proximo ? diasEntre(hoy, proximo.fecha) : 0;

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Días Feriados 2026 y 2027 en República Dominicana
          </h1>
          <p className="mt-2 text-base text-[#E6ECF3]">
            Calendario oficial del Ministerio de Trabajo, con los traslados de ley ya aplicados.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        {proximo ? (
          <div className="mb-8 rounded-xl p-5" style={{ backgroundColor: COLOR_VERDE_RD }}>
            <p className="text-sm font-bold uppercase tracking-wide text-white/80">Próximo feriado</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-white">{proximo.nombre}</p>
            <p className="mt-1 text-lg font-semibold capitalize text-white">
              {fechaLarga(proximo.fecha)} · {faltan === 0 ? "es hoy" : `en ${faltan} día${faltan === 1 ? "" : "s"}`}
            </p>
            {proximo.nota ? <p className="mt-1 text-base text-white/90">{proximo.nota}</p> : null}
          </div>
        ) : null}

        <section className="mb-10">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A]">Días feriados 2027</h2>
          <p className="mb-4 text-base leading-relaxed" style={{ color: COLOR_TEXTO }}>
            El Ministerio de Trabajo publicó el calendario de 2027 el 1 de noviembre de 2026. Son 12 feriados y solo dos se
            mueven al lunes, los dos en enero: <strong className="text-[#10203A]">Santos Reyes</strong> (del miércoles 6 al lunes 4) y{" "}
            <strong className="text-[#10203A]">Duarte</strong> (del martes 26 al lunes 25).
          </p>
          <ListaFeriados feriados={FERIADOS[2027]} hoy={hoy} />
        </section>

        <section className="mb-8">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A]">Días feriados 2026</h2>
          <ListaFeriados feriados={FERIADOS[2026]} hoy={hoy} />
        </section>

        <p className="text-base leading-relaxed" style={{ color: COLOR_TEXTO }}>
          Según la <strong>Ley 139-97</strong>, los feriados que caen entre martes y viernes se trasladan al lunes más
          cercano para formar fines de semana largos. Los de fecha fija (Año Nuevo, Altagracia, Independencia, Viernes
          Santo, Corpus Christi, Restauración, Mercedes y Navidad) no se trasladan aunque caigan entre semana.
        </p>

        <a
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#E7A63C]/40 bg-[#E7A63C]/10 px-4 py-2 text-base font-semibold text-[#10203A] hover:bg-[#E7A63C]/20"
        >
          🎱 ¿Ya viste los resultados de la lotería de hoy? Consulta Nacional, Leidsa, Real y más.
        </a>
      </main>

      <PreguntasFrecuentes
        preguntas={[
          {
            pregunta: "¿Cuántos días feriados hay en República Dominicana en 2027?",
            respuesta: "12 días feriados nacionales. Solo se trasladan al lunes los Santos Reyes (lunes 4 de enero) y el Día de Duarte (lunes 25 de enero).",
          },
          {
            pregunta: "¿Cuál es el próximo día feriado en República Dominicana?",
            respuesta: proximo
              ? `El próximo es ${proximo.nombre}, el ${fechaLarga(proximo.fecha)}${faltan > 0 ? ` (en ${faltan} día${faltan === 1 ? "" : "s"})` : ", hoy"}.`
              : "Puedes ver el calendario completo arriba en esta página.",
          },
          {
            pregunta: "¿Los feriados que caen entre semana se trasladan al lunes?",
            respuesta: "Los que caen entre martes y viernes se trasladan al lunes más cercano, según la Ley 139-97, salvo los de fecha fija como Independencia, Restauración, Mercedes y Navidad.",
          },
          {
            pregunta: "¿Cuántos días feriados hay en República Dominicana en 2026?",
            respuesta: "12 días feriados nacionales, listados arriba con sus fechas ya trasladadas según la Ley 139-97.",
          },
        ]}
      />

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
