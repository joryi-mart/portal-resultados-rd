import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { inicioSorteoISO } from "@/lib/eventoSorteo";
import { migaDePan } from "@/lib/breadcrumb";
import { supabase } from "@/lib/supabase";
import { slugSorteo } from "@/lib/slug";
import { COLOR_POR_POSICION_SORTEOS } from "@/app/componentesResultados";
import { notFound } from "next/navigation";
import PreguntasFrecuentes from "@/app/PreguntasFrecuentes";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

type Resultado = { numeros: string; fecha: string; creado_en: string };
type Sorteo = { id: number; nombre: string; hora_sorteo: string; dias_semana: string; resultados: Resultado[] };
type Loteria = { id: number; nombre: string; slug: string; activa: boolean; sorteos: Sorteo[] };

export const revalidate = 3600;

function hoyISO() {
  // Republica Dominicana esta fijo en UTC-4 (no usa horario de verano),
  // asi que restamos 4 horas sin importar en que zona horaria corra el servidor.
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return ahoraRD.toISOString().slice(0, 10);
}

function nombreDia(letra: string) {
  const mapa: Record<string, string> = { L: "Lun", M: "Mar", X: "Mié", J: "Jue", V: "Vie", S: "Sáb", D: "Dom" };
  return mapa[letra] || letra;
}

function formatearDias(diasSemana: string) {
  if (!diasSemana) return "Todos los días";
  const letras = diasSemana.split(",").map(function (l) { return l.trim(); });
  if (letras.length === 7) return "Todos los días";
  return letras.map(nombreDia).join(", ");
}

const NOMBRES_DIAS: Record<string, string> = { L: "lunes", M: "martes", X: "miércoles", J: "jueves", V: "viernes", S: "sábado", D: "domingo" };

// "todos los días", "de lunes a sábado" o "lunes y jueves", para usar dentro
// de una frase.
function diasEnFrase(diasSemana: string) {
  const letras = (diasSemana || "").split(",").map(function (l) { return l.trim(); }).filter(Boolean);
  if (letras.length === 0 || letras.length === 7) return "todos los días";
  if (letras.length === 6 && !letras.includes("D")) return "de lunes a sábado";
  const nombres = letras.map(function (l) { return NOMBRES_DIAS[l] || l; });
  return nombres.length === 1 ? `los ${nombres[0]}` : `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

// "viernes 23 de octubre" (con año si se pide).
function fechaEnTexto(fechaISO: string, conAno: boolean) {
  return new Date(fechaISO + "T12:00:00Z")
    .toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long", ...(conAno ? { year: "numeric" } : {}), timeZone: "UTC" })
    .replace(",", "");
}

// Explicacion corta de como se juega, segun cuantos numeros salen en el sorteo.
function comoSeJuega(nombreSorteo: string, cantidadNumeros: number) {
  if (/kino/i.test(nombreSorteo)) return "Salen 20 números del 01 al 80. Eliges tus números y ganas según cuántos aciertes.";
  if (cantidadNumeros === 1) return "Sale un solo número del 00 al 99. Ganas si tu número es igual al que sale.";
  if (cantidadNumeros === 2) return "Salen 2 números del 00 al 99. Se juega como un palé: ganas si aciertas los dos.";
  if (cantidadNumeros === 3) return "Salen 3 números del 00 al 99: primer, segundo y tercer premio. Puedes jugar quiniela (un número), palé (dos números) o tripleta (los tres).";
  if (cantidadNumeros > 3) return `Salen ${cantidadNumeros} números. Eliges tus números y, mientras más aciertes, mayor es el premio.`;
  return "";
}

// "10:30 PM", el formato que la gente escribe en Google.
function horaParaTitulo(hora24: string) {
  return formatearHora12(hora24).replace("p.m.", "PM").replace("a.m.", "AM");
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
// los domingos (no 8:55pm), y Loteria Nacional sortea la Quiniela Nacional de la
// Noche a las 6:00pm los domingos (no 9:00pm).
const HORA_DOMINGO_SORTEOS: Record<number, string> = {
  65: "15:55", 66: "15:55", 67: "15:55", 68: "15:55", 63: "18:00",
};
// Dias en que se juega el sorteo. Si tiene hora especial de domingo, se juega
// tambien el domingo aunque dias_semana no lo diga (ej. Quiniela Nacional).
function diasDelSorteo(sorteo: { id: number; dias_semana: string }) {
  const dias = sorteo.dias_semana || "";
  if (HORA_DOMINGO_SORTEOS[sorteo.id] && dias && !dias.split(",").map(function (l) { return l.trim(); }).includes("D")) return dias + ",D";
  return dias;
}

function horaSorteoEfectiva(sorteoId: number, hora24: string, fechaISO: string) {
  const esDomingo = new Date(fechaISO + "T00:00:00").getDay() === 0;
  if (esDomingo && HORA_DOMINGO_SORTEOS[sorteoId]) return HORA_DOMINGO_SORTEOS[sorteoId];
  return hora24;
}

function tamanoBolita(cantidad: number) {
  if (cantidad >= 6) return "h-11 w-11 text-base";
  if (cantidad >= 5) return "h-12 w-12 text-lg";
  return "h-14 w-14 text-xl";
}

function Bolita(props: { children: React.ReactNode; tamano: string; opaca?: boolean; color?: { fondo: string; texto: string } }) {
  const opaca = props.opaca === true;
  return (
    <div
      className={"relative flex shrink-0 items-center justify-center rounded-full font-mono font-bold " + props.tamano + (opaca ? " border-2 border-dashed border-[#9AA5AF] text-[#7B858F]" : " text-white")}
      style={opaca ? { backgroundColor: "#E4E8EB" } : props.color ? { backgroundColor: props.color.fondo, color: props.color.texto } : { backgroundColor: COLOR_AZUL }}
    >
      {props.children}
    </div>
  );
}

function calcularCalientesFrios(resultados: Resultado[]) {
  const conteo: Record<string, number> = {};
  resultados.forEach(function (r) {
    r.numeros.split("-").forEach(function (n) {
      const num = n.trim().padStart(2, "0");
      if (num) conteo[num] = (conteo[num] || 0) + 1;
    });
  });
  const entradas = Object.entries(conteo).sort(function (a, b) { return b[1] - a[1]; });
  return {
    calientes: entradas.slice(0, 5),
    frios: entradas.slice(-5).reverse(),
    sorteosContados: resultados.length,
  };
}

async function buscarLoteriaYSorteo(slugLoteria: string, slugSorteoBuscado: string) {
  const { data: loteria, error } = await supabase
    .from("loterias")
    .select("id, nombre, slug, activa, sorteos ( id, nombre, hora_sorteo, dias_semana, resultados ( numeros, fecha, creado_en ) )")
    .eq("slug", slugLoteria)
    .eq("activa", true)
    .maybeSingle();

  if (!loteria || error) return null;

  const loteriaData = loteria as unknown as Loteria;
  const sorteo = (loteriaData.sorteos || []).find(function (s) { return slugSorteo(s.nombre) === slugSorteoBuscado; });
  if (!sorteo) return null;

  return { loteria: loteriaData, sorteo };
}

export async function generateMetadata(props: { params: Promise<{ slug: string; sorteoSlug: string }> }) {
  const params = await props.params;
  const encontrado = await buscarLoteriaYSorteo(params.slug, params.sorteoSlug);
  if (!encontrado) return { title: "Sorteo no encontrado" };

  const { loteria, sorteo } = encontrado;
  const horaTexto = horaParaTitulo(sorteo.hora_sorteo);
  // El nombre del sorteo a veces ya incluye el de la loteria (ej. "Quiniela
  // Loteka" en Loteka, "Quiniela Real" en Loteria Real): si lo repetimos se
  // ve como "Quiniela Loteka de Loteka", asi que lo omitimos en ese caso.
  // Para las loterias de nombre largo usamos un alias corto en el titulo
  // (si no, el titulo se pasa de los ~580px que Google corta en buscadores).
  const NOMBRE_CORTO_TITULO: Record<string, string> = {
    "la-suerte": "La Suerte",
    sxm: "SXM",
    "loterias-americanas": "Americanas",
  };
  const nombreCortoLoteria = NOMBRE_CORTO_TITULO[loteria.slug] || loteria.nombre.replace(/^Lotería\s+/i, "");
  // Loterias Americanas agrupa sorteos de varios estados (Georgia, New
  // Jersey...); la gente busca por el nombre del estado, nunca por
  // "Americanas", asi que ese nombre nunca debe ir en el titulo (ej. buscan
  // "georgia noche", no "georgia noche americanas").
  const OMITIR_NOMBRE_LOTERIA_EN_TITULO = ["loterias-americanas"];
  const sorteoYaIncluyeLoteria =
    sorteo.nombre.toLowerCase().includes(nombreCortoLoteria.toLowerCase()) ||
    OMITIR_NOMBRE_LOTERIA_EN_TITULO.includes(loteria.slug);
  // Nombres escritos con las palabras exactas que la gente busca en Google
  // (sacadas de Search Console), para los sorteos con muchas impresiones.
  const NOMBRES_ESPECIALES: Record<string, string> = {
    "real/loto-pool-noche": "Loto Pool Real Noche",
  };
  const nombreBuscado = NOMBRES_ESPECIALES[`${params.slug}/${params.sorteoSlug}`]
    || (sorteoYaIncluyeLoteria ? sorteo.nombre : `${sorteo.nombre} (${nombreCortoLoteria})`);
  // El titulo lleva "Hoy" pero NO la fecha: Google guarda el titulo varios
  // dias y una fecha vieja en el buscador haria pensar que la pagina esta
  // atrasada. La fecha va en la descripcion, que Google refresca mas seguido.
  const titulo = `${nombreBuscado} Hoy: Resultados en Vivo (${horaTexto})`;
  const descripcion = `Resultado de ${sorteo.nombre} hoy, ${fechaEnTexto(hoyISO(), true)}. Sorteo de las ${horaTexto}, ${diasEnFrase(diasDelSorteo(sorteo))}. Números ganadores al instante y últimos 7 días.`;

  return {
    title: titulo,
    description: descripcion,
    openGraph: { images: ["/opengraph-image.png"], title: `${titulo} | La Bankera RD`, description: descripcion, locale: "es_DO", type: "website" },
    alternates: { canonical: `https://labankerard.com/${params.slug}/sorteo/${params.sorteoSlug}` },
  };
}

export default async function PaginaSorteo(props: { params: Promise<{ slug: string; sorteoSlug: string }> }) {
  const params = await props.params;
  const hoy = hoyISO();

  const encontrado = await buscarLoteriaYSorteo(params.slug, params.sorteoSlug);
  if (!encontrado) notFound();
  const { loteria, sorteo } = encontrado;

  const resultadoHoy = sorteo.resultados.find(function (r) { return r.fecha === hoy; });
  const numeros = resultadoHoy ? resultadoHoy.numeros.split("-") : [];
  const tamano = tamanoBolita(numeros.length || 3);
  const { calientes, frios, sorteosContados } = calcularCalientesFrios(sorteo.resultados);
  const hayDatosSuficientes = sorteosContados >= 5;

  const ultimosResultados = sorteo.resultados
    .slice()
    .sort(function (a, b) { return b.fecha.localeCompare(a.fecha); })
    .slice(0, 7);
  const cantidadNumeros = ultimosResultados.length > 0 ? ultimosResultados[0].numeros.split("-").length : 0;
  const textoComoSeJuega = comoSeJuega(sorteo.nombre, cantidadNumeros);

  const datosEstructurados = resultadoHoy
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: `${sorteo.nombre} - ${loteria.nombre} - ${hoy}`,
        startDate: inicioSorteoISO(hoy, horaSorteoEfectiva(sorteo.id, sorteo.hora_sorteo, hoy)),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        location: { "@type": "VirtualLocation", url: `https://labankerard.com/${params.slug}/sorteo/${params.sorteoSlug}` },
        organizer: { "@type": "Organization", name: loteria.nombre },
        description: "Números ganadores: " + resultadoHoy.numeros,
      }
    : null;

  const migas = migaDePan([
    { nombre: "Inicio", url: "https://labankerard.com/" },
    { nombre: "Loterías", url: "https://labankerard.com/loterias" },
    { nombre: loteria.nombre, url: `https://labankerard.com/${params.slug}` },
    { nombre: sorteo.nombre, url: `https://labankerard.com/${params.slug}/sorteo/${params.sorteoSlug}` },
  ]);

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      {datosEstructurados ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }} />
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(migas) }} />

      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <a href={"/" + params.slug} className="font-mono text-sm text-[#E7A63C] hover:underline">← Volver a {loteria.nombre}</a>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            {sorteo.nombre}
          </h1>
          <p className="mt-2 font-mono text-sm text-[#D5DEEA]">
            {loteria.nombre} · {sorteo.hora_sorteo ? formatearHora12(horaSorteoEfectiva(sorteo.id, sorteo.hora_sorteo, hoy)) : "Hora por confirmar"} · {formatearDias(sorteo.dias_semana)}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <div className="rounded-xl border border-[#10203A]/15 bg-white p-5">
          <p className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">Resultado de hoy, {fechaEnTexto(hoy, false)}</p>
          {numeros.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {numeros.map(function (n, i) {
                const colorPorPosicion = COLOR_POR_POSICION_SORTEOS[sorteo.id];
                return <Bolita key={i} tamano={tamano} color={colorPorPosicion ? colorPorPosicion(i, numeros.length) ?? undefined : undefined}>{n}</Bolita>;
              })}
            </div>
          ) : (
            <span className="inline-block rounded-full px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide" style={{ backgroundColor: "#E4E8EB", color: "#7B858F" }}>
              Pendiente
            </span>
          )}

          {hayDatosSuficientes ? (
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#10203A]/8 pt-4">
              <div>
                <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wide" style={{ color: COLOR_TEXTO_SECUNDARIO }}>🔥 Más calientes</p>
                <div className="flex flex-wrap gap-1">
                  {calientes.map(function ([num, veces]) {
                    return (
                      <span key={num} className="rounded-full bg-[#E4573D]/10 px-2 py-1 font-mono text-xs font-bold text-[#B23B26]">
                        {num} <span className="font-normal opacity-70">({veces})</span>
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wide" style={{ color: COLOR_TEXTO_SECUNDARIO }}>❄️ Más fríos</p>
                <div className="flex flex-wrap gap-1">
                  {frios.map(function ([num, veces]) {
                    return (
                      <span key={num} className="rounded-full bg-[#1E4D8C]/8 px-2 py-1 font-mono text-xs font-bold text-[#1E4D8C]">
                        {num} <span className="font-normal opacity-70">({veces})</span>
                      </span>
                    );
                  })}
                </div>
              </div>
              <p className="col-span-2 font-mono text-[10px]" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                Basado en {sorteosContados} sorteos guardados.
              </p>
            </div>
          ) : null}
        </div>

        {ultimosResultados.length > 0 ? (
          <div className="mt-8 rounded-xl border border-[#10203A]/15 bg-white p-5">
            <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">{sorteo.nombre}: últimos 7 días</h2>
            <div className="flex flex-col">
              {ultimosResultados.map(function (r, i) {
                const fechaTexto = fechaEnTexto(r.fecha, false);
                return (
                  <a
                    key={i}
                    href={"/" + params.slug + "/" + r.fecha}
                    title={`Resultados de ${loteria.nombre} del ${fechaTexto}`}
                    className="flex items-center justify-between gap-3 border-t border-[#10203A]/6 py-3 first:border-t-0 hover:bg-[#FBF7EE]"
                  >
                    <span className="text-base font-semibold capitalize text-[#2E3B48] underline decoration-[#1E4D8C]/30 underline-offset-4">{fechaTexto}</span>
                    <span className="shrink-0 font-mono text-base font-bold text-[#10203A]">{r.numeros}</span>
                  </a>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-8 rounded-xl border border-[#10203A]/15 bg-white p-5">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">Sobre {sorteo.nombre}</h2>
          <ul className="flex flex-col gap-2.5 text-base leading-relaxed text-[#2E3B48]">
            {sorteo.hora_sorteo ? (
              <li>
                <strong>🕗 Hora:</strong> {formatearHora12(sorteo.hora_sorteo)} (hora de República Dominicana)
                {HORA_DOMINGO_SORTEOS[sorteo.id] ? `; los domingos a las ${formatearHora12(HORA_DOMINGO_SORTEOS[sorteo.id])}` : ""}.
              </li>
            ) : null}
            <li><strong>📅 Días:</strong> se juega {diasEnFrase(diasDelSorteo(sorteo))}.</li>
            {textoComoSeJuega ? <li><strong>🎯 Cómo se juega:</strong> {textoComoSeJuega}</li> : null}
            <li>Las jugadas se hacen en las bancas de lotería autorizadas. La Bankera RD solo informa los resultados.</li>
          </ul>
        </div>
      </main>

      <PreguntasFrecuentes
        preguntas={[
          {
            pregunta: `¿Qué número salió hoy en ${sorteo.nombre}?`,
            respuesta: numeros.length > 0
              ? `El resultado de hoy de ${sorteo.nombre} fue ${resultadoHoy!.numeros}. Lo puedes ver arriba en esta página, se actualiza automáticamente.`
              : `Todavía no ha salido el resultado de hoy de ${sorteo.nombre}. En cuanto se publique, aparece arriba en esta página sin necesidad de recargarla.`,
          },
          {
            pregunta: `¿A qué hora es el sorteo de ${sorteo.nombre}?`,
            respuesta: sorteo.hora_sorteo
              ? `${sorteo.nombre} sortea a las ${formatearHora12(horaSorteoEfectiva(sorteo.id, sorteo.hora_sorteo, hoy))} (hora de República Dominicana), ${formatearDias(sorteo.dias_semana).toLowerCase()}.`
              : `Consulta el horario de ${sorteo.nombre} en la página de ${loteria.nombre}.`,
          },
          {
            pregunta: `¿Dónde veo el resultado de ${sorteo.nombre} en vivo?`,
            respuesta: `Aquí mismo: esta página se actualiza sola apenas se publica el resultado de ${sorteo.nombre}, no hace falta recargarla.`,
          },
        ]}
      />

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href={"/" + params.slug} className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a {loteria.nombre}</a>
        <span className="mx-2 text-[#10203A]/20">·</span>
        <a href={"/" + params.slug + "/historial"} className="font-mono text-sm text-[#1E4D8C] hover:underline">Ver historial completo</a>
      </footer>
    </div>
  );
}
