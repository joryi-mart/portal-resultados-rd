import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "@/app/NavPildoras";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
const COLOR_VERDE_RD = "#007A33";

export const metadata = {
  title: "Efemérides Dominicanas: Qué Pasó Hoy en la Historia de RD",
  description:
    "Calendario de efemérides de República Dominicana: nacimientos, batallas y hechos históricos importantes, organizados por día a lo largo del año.",
  alternates: { canonical: "https://labankerard.com/efemerides" },
};

type Efemeride = { mes: number; dia: number; texto: string };

// Lista compilada con fuentes como el Instituto Duartiano, Diario Libre, Hoy,
// El Caribe y Conéctate. No es una lista exhaustiva de los 365 dias del ano
// (varios dias no tienen un hecho suficientemente documentado todavia), pero
// cada fecha aqui esta verificada contra al menos una fuente. Si encuentras
// un error, escribenos desde /contacto y lo corregimos.
const EFEMERIDES: Efemeride[] = [
  { mes: 1, dia: 1, texto: "1866: Se ponen en circulación los primeros sellos postales dominicanos." },
  { mes: 1, dia: 2, texto: "1931: Nace Manolo Tavárez Justo en Monte Cristi." },
  { mes: 1, dia: 11, texto: "1839: Nace Eugenio María de Hostos." },
  { mes: 1, dia: 12, texto: "1972: Asesinato de \"Los Palmeros\" (Amaury Germán Aristy y sus compañeros)." },
  { mes: 1, dia: 24, texto: "1856: Batalla de Sabana Larga, en Dajabón." },
  { mes: 1, dia: 26, texto: "1813: Nace Juan Pablo Duarte en Santo Domingo, Padre de la Patria. Inicia el Mes de la Patria." },
  { mes: 2, dia: 9, texto: "1823: Nace Ulises Francisco Espaillat en Santiago de los Caballeros." },
  { mes: 2, dia: 25, texto: "1816: Nace Matías Ramón Mella en Santo Domingo." },
  { mes: 2, dia: 27, texto: "1844: Independencia Nacional de República Dominicana. Día de la Bandera." },
  { mes: 3, dia: 6, texto: "1937: Nace José Francisco Peña Gómez en Santa Cruz de Mao." },
  { mes: 3, dia: 9, texto: "1817: Nace Francisco del Rosario Sánchez en Santo Domingo." },
  { mes: 3, dia: 14, texto: "1772: Nace José Núñez de Cáceres en Santo Domingo." },
  { mes: 3, dia: 19, texto: "1844: Batalla de Azua." },
  { mes: 3, dia: 30, texto: "1844: Batalla de Santiago." },
  { mes: 4, dia: 8, texto: "1928: Se inaugura HIX, la primera radioemisora oficial del país." },
  { mes: 4, dia: 18, texto: "Día Nacional del Locutor, en conmemoración del primer examen oficial de locutores en 1938." },
  { mes: 4, dia: 24, texto: "1965: Inicia la Revolución de Abril (Guerra Civil Dominicana de 1965)." },
  { mes: 4, dia: 28, texto: "1965: Intervención militar de Estados Unidos en República Dominicana." },
  { mes: 5, dia: 5, texto: "Día Nacional del Árbol, instituido en 1957." },
  { mes: 5, dia: 15, texto: "Día Nacional del Agricultor." },
  { mes: 5, dia: 16, texto: "1942: Las dominicanas votan oficialmente por primera vez." },
  { mes: 5, dia: 30, texto: "1961: Ajusticiamiento de Rafael Leónidas Trujillo en la carretera Santo Domingo–San Cristóbal." },
  { mes: 6, dia: 3, texto: "1913: Nace Pedro Mir en San Pedro de Macorís, Poeta Nacional." },
  { mes: 6, dia: 6, texto: "1912: Nace María Montez en Barahona, \"la reina del Technicolor\"." },
  { mes: 6, dia: 11, texto: "1845: Se crea por ley la Suprema Corte de Justicia." },
  { mes: 6, dia: 14, texto: "1959: Desembarco de Constanza, Maimón y Estero Hondo contra la tiranía de Trujillo." },
  { mes: 6, dia: 30, texto: "1909: Nace Juan Bosch, escritor y expresidente de la República." },
  { mes: 7, dia: 2, texto: "Día de Concepción Bona, quien confeccionó la primera Bandera Nacional junto a María Trinidad Sánchez." },
  { mes: 7, dia: 3, texto: "1917: Batalla de la Barranquita, en Mao." },
  { mes: 7, dia: 4, texto: "1861: Fusilamiento del prócer Francisco del Rosario Sánchez." },
  { mes: 7, dia: 12, texto: "1924: Fin de la ocupación militar de Estados Unidos (1916-1924), inicio de la Tercera República." },
  { mes: 7, dia: 16, texto: "1838: Juan Pablo Duarte funda La Trinitaria, sociedad secreta gestora de la independencia." },
  { mes: 8, dia: 4, texto: "1496: Bartolomé Colón funda la ciudad de Santo Domingo, primera ciudad europea permanente de América." },
  { mes: 8, dia: 16, texto: "1863: Grito de Capotillo, inicio de la Guerra de la Restauración." },
  { mes: 9, dia: 25, texto: "1963: Derrocamiento del presidente Juan Bosch, primer presidente electo democráticamente." },
  { mes: 10, dia: 9, texto: "1947: Se crea el Banco Central de la República Dominicana." },
  { mes: 10, dia: 12, texto: "1492: Cristóbal Colón llega a América. 1927: Se crea la Academia Dominicana de la Lengua." },
  { mes: 10, dia: 15, texto: "1936: Nace María Teresa Mirabal en Salcedo." },
  { mes: 10, dia: 21, texto: "1850: Nace Salomé Ureña de Henríquez en Santo Domingo. Día de los Poetas." },
  { mes: 11, dia: 6, texto: "1844: Se proclama la primera Constitución de la República Dominicana." },
  { mes: 11, dia: 25, texto: "1960: Asesinato de las hermanas Mirabal (Patria, Minerva y María Teresa), por orden de Trujillo." },
  { mes: 11, dia: 26, texto: "Día Nacional del Merengue." },
  { mes: 12, dia: 5, texto: "1492: Cristóbal Colón llega a la isla de La Española." },
  { mes: 12, dia: 17, texto: "1955: Se inaugura el puente Duarte sobre el río Ozama, en Santo Domingo." },
];

const NOMBRES_MES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function hoyRD() {
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return { mes: ahoraRD.getUTCMonth() + 1, dia: ahoraRD.getUTCDate() };
}

export default function EfemeridesPage() {
  const { mes: mesHoy, dia: diaHoy } = hoyRD();
  const deHoy = EFEMERIDES.filter(function (e) { return e.mes === mesHoy && e.dia === diaHoy; });

  const porMes = NOMBRES_MES.map(function (nombre, i) {
    const mes = i + 1;
    return {
      nombre,
      mes,
      items: EFEMERIDES.filter(function (e) { return e.mes === mes; }).sort(function (a, b) { return a.dia - b.dia; }),
    };
  });

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <NavPildoras />
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Efemérides Dominicanas
          </h1>
          <p className="mt-2 font-mono text-sm font-extrabold uppercase tracking-wide text-[#E7A63C] sm:text-base">
            Página informativa no oficial
          </p>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            Hechos, nacimientos y batallas que marcaron la historia de República Dominicana
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <div className="mb-8 rounded-xl border p-5" style={{ borderColor: COLOR_VERDE_RD + "40", backgroundColor: COLOR_VERDE_RD + "0D" }}>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold" style={{ color: COLOR_VERDE_RD }}>
            🇩🇴 Hoy en la historia dominicana
          </h2>
          {deHoy.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {deHoy.map(function (e, i) {
                return (
                  <li key={i} className="text-sm leading-relaxed">
                    {e.texto}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Todavía no tenemos un hecho confirmado para el {diaHoy} de {NOMBRES_MES[mesHoy - 1]} en esta lista — abajo
              puedes ver el resto del año.
            </p>
          )}
        </div>

        <p className="mb-8 text-base leading-relaxed">
          Esta es una selección de fechas importantes de la historia dominicana, organizadas por mes: independencia,
          batallas, nacimientos de figuras históricas y hechos que marcaron al país. No es una lista de los 365 días
          del año — solo incluimos fechas que pudimos confirmar en más de una fuente.
        </p>

        <div className="mb-8 flex flex-col gap-6">
          {porMes.map(function (m) {
            if (m.items.length === 0) return null;
            return (
              <div key={m.mes} className="rounded-xl border border-[#10203A]/15 bg-white p-5">
                <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold capitalize" style={{ color: COLOR_AZUL }}>
                  {m.nombre}
                </h2>
                <ul className="flex flex-col gap-2.5">
                  {m.items.map(function (e, i) {
                    return (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed">
                        <span className="shrink-0 font-mono font-bold" style={{ color: COLOR_AZUL }}>
                          {String(e.dia).padStart(2, "0")}
                        </span>
                        <span>{e.texto}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="mb-8 text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          ¿Falta una fecha importante o encontraste un error? Escríbenos desde{" "}
          <a href="/contacto" className="underline" style={{ color: COLOR_AZUL }}>
            contacto
          </a>{" "}
          y lo revisamos.
        </p>

        <p className="text-xs text-[#5C6B78]">
          Escrito por el equipo de{" "}
          <a href="/nosotros" className="underline" style={{ color: COLOR_AZUL }}>
            La Bankera RD
          </a>
          .
        </p>
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
