import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";

export const metadata = {
  title: "La Bankera RD | Resultados de Loterías Dominicanas en Vivo",
  description: "Consulta los resultados de Leidsa, Lotería Nacional, Loteka, Lotería Real y más loterías dominicanas e internacionales, actualizados en vivo. Tipo de cambio del dólar y euro incluido.",
  openGraph: {
    title: "La Bankera RD | Resultados de Loterías Dominicanas en Vivo",
    description: "Consulta los resultados de las principales loterías dominicanas e internacionales, actualizados en vivo.",
    siteName: "La Bankera RD",
    locale: "es_DO",
    type: "website",
  },
};
import { supabase } from "@/lib/supabase";
import NavPildoras from "./NavPildoras";
import RelojDigital from "./RelojDigital";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});
const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
});

type Resultado = { numeros: string; fecha: string; creado_en: string };
type Sorteo = {
  id: number;
  nombre: string;
  hora_sorteo: string;
  dias_semana: string;
  resultados: Resultado[];
};
type Loteria = {
  id: number;
  nombre: string;
  slug: string;
  activa: boolean;
  sorteos: Sorteo[];
};
type Cambio = {
  moneda_origen: string;
  tasa_compra: number;
  tasa_venta: number;
  fuente: string;
};
type UltimoResultado = {
  loteriaNombre: string;
  loteriaSlug: string;
  sorteoNombre: string;
  horaSorteo: string;
  numeros: string;
  fecha: string;
  creadoEn: string;
};

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
const COLOR_VERDE_RD = "#007A33";
const COLOR_PRIMERA_POSICION = "#E7A63C";

// Sorteos que llevan un color de bolita distinto al azul estándar.
// El "Loto" de Leidsa (id 69) sale solo miércoles y sábados, así que se
// diferencia visualmente con un beige claro (distinto al beige de fondo de la página).
const COLOR_ESPECIAL_SORTEOS: Record<number, { fondo: string; texto: string }> = {
  69: { fondo: "#C9B896", texto: "#3A2E1A" },
};

function hoyISO() {
  // Republica Dominicana esta fijo en UTC-4 (no usa horario de verano),
  // asi que restamos 4 horas sin importar en que zona horaria corra el servidor.
  const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return ahoraRD.toISOString().slice(0, 10);
}

function sumarDias(fechaISO: string, dias: number) {
  const partes = fechaISO.split("-").map(Number);
  const y = partes[0];
  const m = partes[1];
  const d = partes[2];
  const fecha = new Date(y, m - 1, d);
  fecha.setDate(fecha.getDate() + dias);
  const yy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return yy + "-" + mm + "-" + dd;
}

function formatearFechaCorta(fechaISO: string) {
  const partes = fechaISO.split("-");
  if (partes.length !== 3) return fechaISO;
  return partes[2] + "-" + partes[1];
}

function formatearPublicacion(creadoEn: string) {
  const fecha = new Date(creadoEn);
  return fecha.toLocaleString("es-DO", {
    timeZone: "America/Santo_Domingo",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function nombreDia(letra: string) {
  const mapa: Record<string, string> = {
    L: "Lun", M: "Mar", X: "Mié", J: "Jue", V: "Vie", S: "Sáb", D: "Dom",
  };
  return mapa[letra] || letra;
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

function formatearDias(diasSemana: string) {
  if (!diasSemana) return "Todos los días";
  const letras = diasSemana.split(",").map(function (l) { return l.trim(); });
  if (letras.length === 7) return "Todos los días";
  return letras.map(nombreDia).join(", ");
}

function tamanoBolita(cantidad: number, chico: boolean) {
  if (chico) return "h-10 w-10 text-base";
  if (cantidad >= 6) return "h-12 w-12 text-lg";
  if (cantidad >= 5) return "h-13 w-13 text-xl";
  if (cantidad === 4) return "h-14 w-14 text-xl";
  return "h-16 w-16 text-2xl";
}

function numerosVistaPrevia(sorteoId: number) {
  void sorteoId;
  return ["--", "--", "--"];
}

function Bolita(props: { children: React.ReactNode; tamano: string; opaca?: boolean; colorEspecial?: { fondo: string; texto: string }; primera?: boolean }) {
  const opaca = props.opaca === true;
  const especial = props.colorEspecial;
  const primera = props.primera === true && !especial;
  return (
    <div
      className={"relative flex shrink-0 items-center justify-center rounded-full font-mono font-bold " + props.tamano + (opaca ? " border-2 border-dashed border-[#9AA5AF] text-[#7B858F]" : especial || primera ? "" : " text-white")}
      style={opaca ? { backgroundColor: "#E4E8EB" } : especial ? { backgroundColor: especial.fondo, color: especial.texto } : primera ? { backgroundColor: COLOR_PRIMERA_POSICION, color: "#10203A" } : { backgroundColor: COLOR_AZUL }}
    >
      {props.children}
    </div>
  );
}

function EtiquetaFecha(props: { fechaISO: string }) {
  return (
    <span
      className="inline-block shrink-0 rounded-md px-2.5 py-1 font-mono text-xs font-bold"
      style={{ backgroundColor: "#E4E8EB", color: "#5C6B78" }}
    >
      {formatearFechaCorta(props.fechaISO)}
    </span>
  );
}

function FilaSorteo(props: { sorteo: Sorteo; fechaSeleccionada: string; loteriaSlug: string }) {
  const sorteo = props.sorteo;
  const fechaSeleccionada = props.fechaSeleccionada;
  const resultado = sorteo.resultados.find(function (r) { return r.fecha === fechaSeleccionada; });
  const hayResultadoReal = !!resultado;
  const numeros = resultado ? resultado.numeros.split("-") : numerosVistaPrevia(sorteo.id);
  const tamano = tamanoBolita(numeros.length, false);
  const colorEspecial = COLOR_ESPECIAL_SORTEOS[sorteo.id];
  const href = hayResultadoReal ? "/" + props.loteriaSlug + "/" + fechaSeleccionada : "/" + props.loteriaSlug;

  if (!hayResultadoReal) {
    return (
      <a href={href} className="flex items-center justify-between gap-3 border-t border-[#10203A]/6 py-2.5 first:border-t-0 hover:bg-[#FBF7EE]">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-[#10203A]">{sorteo.nombre}</p>
          <p className="truncate font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
            {formatearHora12(sorteo.hora_sorteo)}
            {sorteo.dias_semana && sorteo.dias_semana.split(",").length < 7 ? " · " + formatearDias(sorteo.dias_semana) : ""}
          </p>
        </div>
        <span className="shrink-0 rounded-full px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide" style={{ backgroundColor: "#E4E8EB", color: "#7B858F" }}>
          Pendiente
        </span>
      </a>
    );
  }

  return (
    <a href={href} className="flex flex-col gap-2 border-t border-[#10203A]/6 py-4 first:border-t-0 hover:bg-[#FBF7EE]">
      <div>
        <EtiquetaFecha fechaISO={fechaSeleccionada} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xl font-extrabold text-[#10203A]">{sorteo.nombre}</p>
        <p className="font-mono text-base" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          {formatearHora12(sorteo.hora_sorteo)}
          {sorteo.dias_semana && sorteo.dias_semana.split(",").length < 7 ? " · " + formatearDias(sorteo.dias_semana) : ""}
        </p>
      </div>
      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto">
        {numeros.map(function (n, i) { return <Bolita key={i} tamano={tamano} colorEspecial={colorEspecial} primera={i === 0}>{n}</Bolita>; })}
      </div>
      {resultado && resultado.creado_en ? (
        <p className="font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Publicado: {formatearPublicacion(resultado.creado_en)}</p>
      ) : null}
    </a>
  );
}

function ChipCambio(props: { nombre: string; compra: number; venta: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white/8 px-3 py-1.5">
      <span className="font-mono text-sm font-bold text-[#FBF7EE]">{props.nombre}</span>
      <div className="flex items-baseline gap-1 font-mono text-sm">
        <span className="text-[10px] uppercase text-white/50">Compra</span>
        <span className="font-bold text-[#8FD19E]">{props.compra.toFixed(2)}</span>
      </div>
      <div className="flex items-baseline gap-1 font-mono text-sm">
        <span className="text-[10px] uppercase text-white/50">Venta</span>
        <span className="font-bold text-[#E7A63C]">{props.venta.toFixed(2)}</span>
      </div>
    </div>
  );
}

function PanelSuperior(props: { cambios: Cambio[]; fechaActual: string }) {
  const cambios = props.cambios;
  const fechaActual = props.fechaActual;
  const dolar = cambios.find(function (c) { return c.moneda_origen === "USD"; });
  const euro = cambios.find(function (c) { return c.moneda_origen === "EUR"; });

  const hoy = hoyISO();
  const esHoy = fechaActual === hoy;
  const ayer = sumarDias(fechaActual, -1);
  const manana = sumarDias(fechaActual, 1);
  const noHayManana = manana > hoy;

  return (
    <div className="border-t border-white/10 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <RelojDigital />
          {(dolar || euro) ? (
            <>
              <span className="font-[family-name:var(--font-display)] text-xs font-bold uppercase tracking-wide text-[#E7A63C]">
                Cambio hoy
              </span>
              {dolar ? (
                <ChipCambio nombre="USD" compra={Number(dolar.tasa_compra)} venta={Number(dolar.tasa_venta)} />
              ) : null}
              {euro ? (
                <ChipCambio nombre="EUR" compra={Number(euro.tasa_compra)} venta={Number(euro.tasa_venta)} />
              ) : null}
            </>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a href={"/?fecha=" + ayer} className="rounded-lg border border-white/15 bg-white px-3 py-2 text-center font-mono text-sm font-semibold text-[#10203A] hover:bg-[#FBF7EE]">← Anterior</a>
          {noHayManana ? null : (
            <a href={"/?fecha=" + manana} className="rounded-lg border border-white/15 bg-white px-3 py-2 text-center font-mono text-sm font-semibold text-[#10203A] hover:bg-[#FBF7EE]">Siguiente →</a>
          )}
          <form method="GET" className="flex items-center gap-2">
            <input type="date" name="fecha" defaultValue={fechaActual} max={hoy} className="rounded-lg border border-white/15 bg-white px-3 py-2 font-mono text-sm text-[#10203A]" />
            <button type="submit" className="shrink-0 rounded-lg px-3 py-2 font-mono text-sm font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>Ver</button>
          </form>
          {esHoy ? null : (
            <a href="/" className="rounded-lg px-2 py-2 text-center font-mono text-sm font-bold underline text-[#E7A63C]">Volver a hoy</a>
          )}
        </div>
      </div>
    </div>
  );
}

function periodoDelDia(hora: string) {
  if (!hora) return "Otros horarios";
  const h = parseInt(hora.split(":")[0], 10);
  if (h < 12) return "Mañana";
  if (h < 19) return "Tarde";
  return "Noche";
}

const ICONO_PERIODO: Record<string, string> = { "Mañana": "🌅", "Tarde": "☀️", "Noche": "🌙", "Otros horarios": "🕓" };
const ORDEN_PERIODO = ["Mañana", "Tarde", "Noche", "Otros horarios"];

function ResumenResultados(props: { items: UltimoResultado[]; fecha: string }) {
  const items = props.items;
  if (items.length === 0) return null;
  const fechaAnterior = sumarDias(props.fecha, -1);

  const grupos: Record<string, UltimoResultado[]> = {};
  items.forEach(function (item) {
    const periodo = periodoDelDia(item.horaSorteo);
    if (!grupos[periodo]) grupos[periodo] = [];
    grupos[periodo].push(item);
  });
  const periodosPresentes = ORDEN_PERIODO.filter(function (p) { return grupos[p] && grupos[p].length > 0; });

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-[#10203A]/12 bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pb-1 pt-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">
          Resumen de resultados <span className="font-mono text-sm font-normal" style={{ color: COLOR_TEXTO_SECUNDARIO }}>· {formatearFechaCorta(props.fecha)}</span>
        </h2>
        <a href={"/?fecha=" + fechaAnterior} className="font-mono text-xs font-bold text-[#1E4D8C] hover:underline">
          Ver resumen de ayer →
        </a>
      </div>
      {periodosPresentes.map(function (periodo) {
        return (
          <div key={periodo} className="pt-4">
            <p className="px-5 pb-1.5 font-mono text-xs font-bold uppercase tracking-wide" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              {ICONO_PERIODO[periodo]} {periodo}
            </p>
            {grupos[periodo].map(function (item, i) {
              const numeros = item.numeros.split("-");
              return (
                <a
                  key={i}
                  href={"/" + item.loteriaSlug + "/" + item.fecha}
                  className="flex items-center gap-3 border-t border-[#10203A]/6 px-5 py-3 transition hover:bg-[#FBF7EE]"
                >
                  <span className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: COLOR_VERDE_RD }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-[#10203A]">{item.sorteoNombre}</p>
                    <p className="truncate font-mono text-[11px]" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                      {item.loteriaNombre} · {formatearHora12(item.horaSorteo)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                    {numeros.map(function (n, j) {
                      return (
                        <span key={j} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E4E8EB] font-mono text-sm font-bold text-[#10203A]">
                          {n}
                        </span>
                      );
                    })}
                  </div>
                </a>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function TablaHorarios(props: { loterias: Loteria[]; fechaSeleccionada: string }) {
  const loterias = props.loterias;
  const fechaSeleccionada = props.fechaSeleccionada;
  return (
    <div className="mt-8 rounded-xl border border-[#10203A]/12 bg-white p-5">
      <h2 className="mb-1 font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">Horarios de sorteos</h2>
      <p className="mb-4 font-mono text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Todas las loterías y sus productos.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loterias.map(function (loteria) {
          const sorteos = loteria.sorteos || [];
          if (sorteos.length === 0) return null;
          return (
            <div key={loteria.id} className="rounded-lg border border-[#10203A]/8 p-3">
              <p className="mb-1.5 font-[family-name:var(--font-display)] text-sm font-bold text-[#10203A]">{loteria.nombre}</p>
              <div className="flex flex-col gap-1">
                {sorteos.map(function (sorteo) {
                  const yaSalioHoy = (sorteo.resultados || []).some(function (r) { return r.fecha === fechaSeleccionada; });
                  return (
                    <div key={sorteo.id} className="flex items-center justify-between gap-2 font-mono text-xs">
                      <span className={"truncate text-[#10203A] " + (yaSalioHoy ? "font-bold" : "")}>
                        {yaSalioHoy ? "✓ " : ""}{sorteo.nombre}
                      </span>
                      <span className="shrink-0 whitespace-nowrap" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                        {formatearHora12(sorteo.hora_sorteo)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PizarronDelDia(props: { loterias: Loteria[]; fechaSeleccionada: string; fechaTitulo: string }) {
  const loterias = props.loterias;
  const fechaSeleccionada = props.fechaSeleccionada;
  const fechaTitulo = props.fechaTitulo;

  type Tarjeta = { loteria: string; loteriaSlug: string; sorteo: string; sorteoId: number; horaSorteo: string; numeros: string[]; esDeAyer: boolean; fechaMostrada: string };
  const tarjetas: Tarjeta[] = [];

  for (let i = 0; i < loterias.length; i++) {
    const sorteos = loterias[i].sorteos || [];
    for (let j = 0; j < sorteos.length; j++) {
      const sorteo = sorteos[j];
      const resultados = sorteo.resultados || [];
      const deHoy = resultados.find(function (r) { return r.fecha === fechaSeleccionada; });
      if (deHoy) {
        tarjetas.push({
          loteria: loterias[i].nombre,
          loteriaSlug: loterias[i].slug,
          sorteo: sorteo.nombre,
          sorteoId: sorteo.id,
          horaSorteo: sorteo.hora_sorteo,
          numeros: deHoy.numeros.split("-"),
          esDeAyer: false,
          fechaMostrada: deHoy.fecha,
        });
        continue;
      }
      let masReciente: Resultado | null = null;
      for (let k = 0; k < resultados.length; k++) {
        const r = resultados[k];
        if (r.fecha < fechaSeleccionada && (!masReciente || r.fecha > masReciente.fecha)) {
          masReciente = r;
        }
      }
      if (masReciente) {
        tarjetas.push({
          loteria: loterias[i].nombre,
          loteriaSlug: loterias[i].slug,
          sorteo: sorteo.nombre,
          sorteoId: sorteo.id,
          horaSorteo: sorteo.hora_sorteo,
          numeros: masReciente.numeros.split("-"),
          esDeAyer: true,
          fechaMostrada: masReciente.fecha,
        });
      }
    }
  }

  // Ordenamos por la hora real del sorteo, para que las tarjetas se lean
  // en el mismo orden en que van saliendo los resultados durante el dia.
  tarjetas.sort(function (a, b) { return (a.horaSorteo || "99:99").localeCompare(b.horaSorteo || "99:99"); });

  return (
    <div className="overflow-hidden rounded-2xl bg-[#10203A]">
      <div className="p-5 pb-3 sm:p-6 sm:pb-4">
        <p className="mb-1 font-mono text-xs font-semibold text-[#FFD166]">● En vivo · {fechaTitulo}</p>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white sm:text-3xl">
          ¿Qué salió {fechaSeleccionada === hoyISO() ? "hoy" : "ese día"}?
        </h2>
        <p className="mt-1 text-sm text-white/70">Toca una lotería abajo para ver más resultados.</p>
      </div>

      {tarjetas.length === 0 ? (
        <p className="mx-5 mb-5 rounded-xl bg-white/10 px-4 py-4 text-base text-white sm:mx-6">
          Todavía no hay resultados publicados para este día.
        </p>
      ) : (
        <div className="mx-3 mb-3 grid grid-cols-1 gap-3 sm:mx-4 sm:mb-4 sm:grid-cols-2">
          {tarjetas.map(function (t, i) {
            const colorEspecial = COLOR_ESPECIAL_SORTEOS[t.sorteoId];
            const href = "/" + t.loteriaSlug + "/" + t.fechaMostrada;
            return (
              <a
                key={i}
                href={href}
                className="relative rounded-xl border border-[#10203A]/10 bg-white p-4 transition hover:shadow-md"
              >
                {t.esDeAyer && (
                  <span className="absolute right-3 top-3 rounded-full bg-[#E4E8EB] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-[#7B858F]">
                    de ayer
                  </span>
                )}
                <p className="truncate pr-16 text-base font-bold text-[#10203A]">{t.loteria}</p>
                <p className="mb-3 truncate font-mono text-[11px]" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{t.sorteo}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {t.numeros.map(function (n, j) {
                    const esPrimera = j === 0 && !colorEspecial;
                    const estiloEspecial = !t.esDeAyer && colorEspecial
                      ? { backgroundColor: colorEspecial.fondo, color: colorEspecial.texto }
                      : !t.esDeAyer && esPrimera
                      ? { backgroundColor: COLOR_PRIMERA_POSICION, color: "#10203A" }
                      : undefined;
                    return (
                      <span
                        key={j}
                        className={"flex h-11 w-11 items-center justify-center rounded-full font-mono text-base font-bold " + (t.esDeAyer ? "bg-[#E4E8EB] text-[#7B858F]" : estiloEspecial ? "" : "bg-[#1E4D8C] text-white")}
                        style={estiloEspecial}
                      >
                        {n}
                      </span>
                    );
                  })}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default async function Home(props: { searchParams: Promise<{ fecha?: string }> }) {
  const hoy = hoyISO();
  const searchParams = await props.searchParams;
  const fechaSeleccionada = (searchParams && searchParams.fecha) || hoy;

  const loteriasResult = await supabase
    .from("loterias")
    .select("id, nombre, slug, activa, sorteos ( id, nombre, hora_sorteo, dias_semana, resultados ( numeros, fecha, creado_en ) )")
    .eq("activa", true)
    .order("id");
  const loterias = loteriasResult.data;
  const error = loteriasResult.error;

  const cambiosResult = await supabase
    .from("tipo_cambio")
    .select("*")
    .in("moneda_origen", ["USD", "EUR"])
    .eq("moneda_destino", "DOP")
    .order("fecha", { ascending: false })
    .limit(2);
  const cambios = cambiosResult.data || [];

  // Sorteos que la fuente de datos ya no ofrece (descontinuados o renombrados).
  // Se ocultan aquí en vez de borrarlos de la base de datos, para no perder el historial.
  const SORTEOS_DESCONTINUADOS = [73, 78, 119];
  const listaLoterias = (loterias || [])
    .map(function (l) {
      return { ...l, sorteos: (l.sorteos || []).filter(function (s) { return !SORTEOS_DESCONTINUADOS.includes(s.id); }) };
    })
    .filter(function (l) { return l.sorteos.length > 0; });
  const ultimosResultados: UltimoResultado[] = [];
  for (let i = 0; i < listaLoterias.length; i++) {
    const loteria = listaLoterias[i];
    const sorteos = loteria.sorteos || [];
    for (let j = 0; j < sorteos.length; j++) {
      const sorteo = sorteos[j];
      const resultados = sorteo.resultados || [];
      for (let k = 0; k < resultados.length; k++) {
        const r = resultados[k];
        if (r.creado_en) {
          ultimosResultados.push({
            loteriaNombre: loteria.nombre,
            loteriaSlug: loteria.slug,
            sorteoNombre: sorteo.nombre,
            horaSorteo: sorteo.hora_sorteo,
            numeros: r.numeros,
            fecha: r.fecha,
            creadoEn: r.creado_en,
          });
        }
      }
    }
  }
  ultimosResultados.sort(function (a, b) { return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime(); });
  // Si el dia elegido todavia no tiene resultados (ej. madrugada, nada ha salido
  // hoy), mostramos el dia mas reciente que si tenga, en vez de dejar el resumen vacio.
  const fechaResumen = ultimosResultados.some(function (r) { return r.fecha === fechaSeleccionada; })
    ? fechaSeleccionada
    : (ultimosResultados[0]?.fecha || fechaSeleccionada);
  const resumenHoy = ultimosResultados.filter(function (r) { return r.fecha === fechaResumen; });

  const fechaTitulo = new Date(fechaSeleccionada + "T00:00:00").toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Datos estructurados (schema.org) con los resultados del día que se muestra,
  // para que Google pueda leer los números ganadores directamente, no solo el texto.
  const eventosParaGoogle = resumenHoy.map(function (r) {
    return {
      "@type": "Event",
      name: `${r.sorteoNombre} - ${r.loteriaNombre} - ${r.fecha}`,
      startDate: `${r.fecha}T${r.horaSorteo || "00:00"}:00-04:00`,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      location: { "@type": "VirtualLocation", url: `https://labankerard.com/${r.loteriaSlug}/${r.fecha}` },
      organizer: { "@type": "Organization", name: r.loteriaNombre },
      additionalProperty: {
        "@type": "PropertyValue",
        name: "Números ganadores",
        value: r.numeros,
      },
    };
  });
  const datosEstructurados =
    eventosParaGoogle.length > 0 ? { "@context": "https://schema.org", "@graph": eventosParaGoogle } : null;

  return (
    <div id="top" className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      {datosEstructurados ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }}
        />
      ) : null}
      <header className="relative overflow-hidden bg-[#10203A] px-6 py-5 sm:px-10 sm:py-6">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#FBF7EE 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
        <img
          src="/tambora.png"
          alt=""
          className="pointer-events-none absolute right-3 -top-1 h-16 w-16 object-contain sm:-top-1 sm:h-28 sm:w-28 lg:right-11 lg:h-36 lg:w-36"
          style={{ transform: "rotate(-30deg)", filter: "drop-shadow(0 0 1.5px #9AA5AF) drop-shadow(0 0 1.5px #9AA5AF) drop-shadow(0 4px 8px rgba(0,0,0,0.35))" }}
        />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-3 flex flex-col gap-3 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <a href="/" className="flex shrink-0 items-center gap-2.5">
              <img
                src="/logo-icon.svg"
                alt=""
                className="h-9 w-9 sm:h-10 sm:w-10"
              />
              <span className="font-[family-name:var(--font-display)] text-xl font-bold leading-none text-[#FBF7EE] sm:text-2xl">
                La Bankera<span className="text-[#E7A63C]">RD</span>
              </span>
            </a>
            <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#E7A63C] sm:self-auto">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#E4573D]" />
              {fechaSeleccionada === hoy ? "En vivo" : "Consultando"} · {fechaTitulo}
            </div>
          </div>
          <p className="mb-3 text-center text-sm font-semibold leading-relaxed text-[#FBF7EE] sm:text-left sm:text-base">
            ¡Resultados de Loterías Dominicanas en Vivo! Consulta Leidsa, Nacional, Loteka y más.
          </p>
          <PanelSuperior cambios={cambios} fechaActual={fechaSeleccionada} />
        </div>
      </header>

      <NavPildoras
        loterias={listaLoterias.map(function (l: Loteria) {
          return { nombre: l.nombre, slug: l.slug };
        })}
      />

      <main className="mx-auto max-w-7xl px-4 pb-6 pt-3 sm:px-8 sm:pt-4 lg:px-12">
        <div className="mb-8">
          <PizarronDelDia loterias={listaLoterias} fechaSeleccionada={fechaSeleccionada} fechaTitulo={fechaTitulo} />
        </div>

        <ResumenResultados items={resumenHoy} fecha={fechaResumen} />

        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">Loterías</h2>
          <span className="font-mono text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{listaLoterias.length} activas</span>
        </div>

        {error ? (
          <div className="rounded-lg border border-[#E4573D]/40 bg-[#E4573D]/5 p-4 text-sm text-[#B23B26]">No pudimos cargar los datos: {error.message}</div>
        ) : null}

        {listaLoterias.length === 0 && !error ? (
          <div className="rounded-xl border border-dashed border-[#10203A]/20 bg-white/60 p-8 text-center">
            <p className="font-[family-name:var(--font-display)] text-lg font-bold">El tablón está vacío</p>
            <p className="mt-1 text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Todavía no hay loterías registradas.</p>
          </div>
        ) : null}

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {listaLoterias.map(function (loteria: Loteria) {
            const sorteos = loteria.sorteos || [];
            return (
              <div key={loteria.id} className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-[#10203A]/12 bg-white shadow-[0_1px_3px_rgba(16,32,58,0.08)]">
                <div className="h-2 w-full" style={{ backgroundColor: COLOR_AZUL }} />
                <div className="px-5 py-4">
                  <div className="mb-1 flex items-center justify-between">
                    <a href={"/" + loteria.slug} className="inline-block rounded-lg px-2.5 py-1 font-[family-name:var(--font-display)] text-base font-bold text-white hover:opacity-90" style={{ backgroundColor: COLOR_VERDE_RD }}>{loteria.nombre}</a>
                    <span className="font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{sorteos.length} producto{sorteos.length === 1 ? "" : "s"}</span>
                  </div>

                  {sorteos.length > 0 ? (
                    <div className="mt-2">
                      {sorteos.map(function (sorteo) {
                        return <FilaSorteo key={sorteo.id} sorteo={sorteo} fechaSeleccionada={fechaSeleccionada} loteriaSlug={loteria.slug} />;
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 font-mono text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Sin productos registrados aún.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <TablaHorarios loterias={listaLoterias} fechaSeleccionada={fechaSeleccionada} />

        <section className="mt-8 rounded-xl border border-[#10203A]/12 bg-white p-5 sm:p-8">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A]">
            Guía de las Loterías Dominicanas
          </h2>
          <p className="mb-8 text-base leading-relaxed">
            En La Bankera RD reunimos cada día los resultados de las principales loterías de República Dominicana en
            un solo lugar, para que consultarlos sea rápido y sencillo. Aquí te explicamos qué lotería es cada una,
            qué productos ofrece y a qué hora se juega, para que sepas exactamente cuándo revisar tu número.
          </p>

          <div className="mb-6">
            <h3 className="mb-3 inline-block rounded-lg px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>Leidsa</h3>
            <p className="mb-2 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Una de las loterías más jugadas del país, con varios sorteos seguidos cada noche.
            </p>
            <ul className="ml-5 list-disc text-base">
              <li>Quiniela Palé — 8:55 p.m.</li>
              <li>Pega 3 Más — 8:55 p.m.</li>
              <li>Loto Pool — 8:55 p.m.</li>
              <li>Super Kino TV — 8:55 p.m.</li>
              <li>Loto Más (miércoles y sábados) — 8:55 p.m.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 inline-block rounded-lg px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>Lotería Nacional</h3>
            <p className="mb-2 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Una de las loterías con más historia en el país, con sorteo de tarde y de noche.
            </p>
            <ul className="ml-5 list-disc text-base">
              <li>Gana Más — 2:30 p.m.</li>
              <li>Juega + Pega + — 2:30 p.m.</li>
              <li>Quiniela Nacional (Noche) — 9:00 p.m., de lunes a sábado</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 inline-block rounded-lg px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>Loteka</h3>
            <p className="mb-2 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Todos sus sorteos corren a la misma hora, por la noche.
            </p>
            <ul className="ml-5 list-disc text-base">
              <li>Quiniela Loteka — 7:55 p.m.</li>
              <li>Mega Lotto (lunes y jueves) — 7:55 p.m.</li>
              <li>Mega Chances — 7:55 p.m.</li>
              <li>El Extra — 7:55 p.m.</li>
              <li>Toca 3 — 7:55 p.m.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 inline-block rounded-lg px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>Lotería Real</h3>
            <p className="mb-2 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Sortea al mediodía, antes que la mayoría de las demás loterías.
            </p>
            <ul className="ml-5 list-disc text-base">
              <li>Quiniela Real — 12:55 p.m.</li>
              <li>Loto Real — 12:55 p.m.</li>
              <li>Tu Fecha — 12:55 p.m.</li>
              <li>Pega 4 — 12:55 p.m.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 inline-block rounded-lg px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>LoteDom</h3>
            <ul className="ml-5 list-disc text-base">
              <li>Quiniela Lotedom — 2:55 p.m.</li>
              <li>Quemaito — 2:55 p.m.</li>
              <li>Lotedom Super Palé — 2:55 p.m.</li>
              <li>Agarra 4 — 2:55 p.m.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 inline-block rounded-lg px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>La Primera y La Suerte Dominicana</h3>
            <ul className="ml-5 list-disc text-base">
              <li>Quiniela La Primera — 12:00 p.m.</li>
              <li>Quiniela La Suerte — 12:30 p.m.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 inline-block rounded-lg px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>Loterías internacionales</h3>
            <p className="mb-2 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Además de las loterías dominicanas, en La Bankera RD también puedes consultar resultados de sorteos que
              se juegan en Estados Unidos y el Caribe.
            </p>
            <ul className="ml-5 list-disc text-base">
              <li>New York — tarde (2:30 p.m.) y noche (10:30 p.m.)</li>
              <li>Florida — día (1:30 p.m.) y noche (10:00 p.m.)</li>
              <li>Anguila — mediodía, tarde y noche</li>
              <li>PowerBall — lunes, miércoles y sábado (11:00 p.m.)</li>
              <li>Mega Millions — martes y viernes (11:00 p.m.)</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 inline-block rounded-lg px-3 py-1.5 font-[family-name:var(--font-display)] text-lg font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>¿Qué es una Quiniela, un Palé y una Tripleta?</h3>
            <p className="text-base leading-relaxed">
              Son las formas más comunes de jugar en las loterías dominicanas, usando números del 00 al 99. En una
              <strong> quiniela</strong> se juega un solo número; en un <strong>palé</strong>, dos números combinados;
              y en una <strong>tripleta</strong>, tres números juntos. Cada lotería tiene sus propias reglas de premios
              según cuántos números aciertes y en qué posición salgan.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <p className="font-mono text-base text-[#10203A]">La Bankera RD — labankerard.com</p>
        <a href="/dias-feriados" className="mt-2 inline-block font-mono text-sm text-[#1E4D8C] hover:underline">
          Días feriados en República Dominicana 2026
        </a>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#10203A]">
          Aviso: Labankerard.com es un portal estrictamente informativo y no representa de manera oficial a la Lotería Nacional Dominicana ni a ninguna otra institución de juegos de azar. Para consultar reglamentos, premios vigentes, resultados definitivos y demás información institucional, le sugerimos visitar los canales oficiales autorizados de las respectivas loterías.
        </p>
      </footer>

      <a
        href="#top"
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg"
        style={{ backgroundColor: COLOR_AZUL }}
        aria-label="Volver arriba"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </a>
    </div>
  );
}