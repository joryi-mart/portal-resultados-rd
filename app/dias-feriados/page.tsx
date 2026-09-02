import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
const COLOR_VERDE_RD = "#007A33";

export const metadata = {
  title: "Días Feriados en República Dominicana 2026",
  description: "Calendario completo de los 12 días feriados oficiales de República Dominicana en 2026, con las fechas trasladadas al lunes según la Ley 139-97.",
  openGraph: {
    title: "Días Feriados en República Dominicana 2026",
    description: "Calendario oficial de feriados dominicanos 2026, actualizado con los traslados de ley.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/dias-feriados" },
};

type Feriado = { nombre: string; fecha: string; nota?: string };

// Fuente: Ministerio de Trabajo de Rep. Dominicana, contrastado con El Caribe,
// Diario Libre y El Día (noviembre 2025). Las fechas ya incluyen los traslados
// de la Ley 139-97 (feriados que caen martes-viernes se mueven al lunes).
const FERIADOS_2026: Feriado[] = [
  { nombre: "Año Nuevo", fecha: "2026-01-01" },
  { nombre: "Día de los Santos Reyes", fecha: "2026-01-05", nota: "Trasladado del martes 6 al lunes 5" },
  { nombre: "Día de la Altagracia", fecha: "2026-01-21" },
  { nombre: "Día de Duarte", fecha: "2026-01-26" },
  { nombre: "Día de la Independencia", fecha: "2026-02-27" },
  { nombre: "Viernes Santo", fecha: "2026-04-03" },
  { nombre: "Día del Trabajo", fecha: "2026-05-04", nota: "Trasladado del viernes 1 al lunes 4" },
  { nombre: "Corpus Christi", fecha: "2026-06-04" },
  { nombre: "Día de la Restauración", fecha: "2026-08-16", nota: "Cae domingo — no genera día libre extra" },
  { nombre: "Día de las Mercedes", fecha: "2026-09-24" },
  { nombre: "Día de la Constitución", fecha: "2026-11-09", nota: "Trasladado del viernes 6 al lunes 9" },
  { nombre: "Navidad", fecha: "2026-12-25" },
];

const DIAS_SEMANA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function formatearFechaLarga(fechaISO: string) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  return `${DIAS_SEMANA[fecha.getDay()]}, ${d} de ${MESES[m - 1]}`;
}

function hoyISO() {
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return ahoraRD.toISOString().slice(0, 10);
}

function diasHasta(fechaISO: string, hoy: string) {
  const a = new Date(hoy + "T00:00:00");
  const b = new Date(fechaISO + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DiasFeriadosPage() {
  const hoy = hoyISO();
  const proximo = FERIADOS_2026.find(function (f) { return f.fecha >= hoy; });

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Días Feriados en República Dominicana 2026
          </h1>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            Calendario oficial, con los traslados de ley ya aplicados.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        {proximo ? (
          <div className="mb-8 rounded-xl p-5" style={{ backgroundColor: COLOR_VERDE_RD }}>
            <p className="font-mono text-xs font-bold uppercase tracking-wide text-white/70">Próximo feriado</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold capitalize text-white">
              {proximo.nombre}
            </p>
            <p className="mt-1 font-mono text-sm capitalize text-white/90">
              {formatearFechaLarga(proximo.fecha)} · en {diasHasta(proximo.fecha, hoy)} día{diasHasta(proximo.fecha, hoy) === 1 ? "" : "s"}
            </p>
          </div>
        ) : null}

        <div className="rounded-xl border border-[#10203A]/15 bg-white">
          {FERIADOS_2026.map(function (f, i) {
            const yaPaso = f.fecha < hoy;
            return (
              <div
                key={f.fecha}
                className={"flex flex-col gap-1 border-t border-[#10203A]/8 px-5 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between " + (yaPaso ? "opacity-50" : "")}
              >
                <div>
                  <p className="font-semibold text-[#10203A]">{f.nombre}</p>
                  <p className="font-mono text-xs capitalize" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{formatearFechaLarga(f.fecha)}</p>
                </div>
                {f.nota ? (
                  <p className="font-mono text-xs italic" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{f.nota}</p>
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          En 2026, República Dominicana tiene 12 días feriados nacionales. Algunos feriados que caen entre martes
          y viernes se trasladan al lunes más cercano según la <strong>Ley 139-97</strong>, para formar fines de
          semana largos. Los feriados de fecha fija (como Independencia, Restauración, Mercedes y Navidad) no se
          trasladan aunque caigan entre semana.
        </p>
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
