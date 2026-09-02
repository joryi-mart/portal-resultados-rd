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
  const a = Math.abs((sorteoId * 7 + 3) % 100);
  const b = Math.abs((sorteoId * 13 + 11) % 100);
  const c = Math.abs((sorteoId * 19 + 17) % 100);
  function pad(n: number) { return String(n).padStart(2, "0"); }
  return [pad(a), pad(b), pad(c)];
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

  return (
    <a href={href} className="flex flex-col gap-2 border-t border-[#10203A]/6 py-4 first:border-t-0 hover:bg-[#FBF7EE]">
      {hayResultadoReal ? (
        <div>
          <EtiquetaFecha fechaISO={fechaSeleccionada} />
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="truncate text-xl font-extrabold text-[#10203A]">{sorteo.nombre}</p>
        <p className="font-mono text-base" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{formatearHora12(sorteo.hora_sorteo)}</p>
      </div>
      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto">
        {numeros.map(function (n, i) { return <Bolita key={i} tamano={tamano} opaca={!hayResultadoReal} colorEspecial={colorEspecial} primera={i === 0}>{n}</Bolita>; })}
        {!hayResultadoReal ? (
          <span className="ml-1 whitespace-nowrap font-mono text-[11px] italic" style={{ color: COLOR_TEXTO_SECUNDARIO }}>(vista previa)</span>
        ) : null}
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

function PanelUltimosResultados(props: { items: UltimoResultado[] }) {
  const items = props.items;
  if (items.length === 0) return null;

  return (
    <div className="mb-8 rounded-xl border border-[#10203A]/12 bg-white p-5">
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">Últimos resultados</h2>
      <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        {items.map(function (item, i) {
          const numeros = item.numeros.split("-");
          const tamano = tamanoBolita(numeros.length, false);
          return (
            <a
              key={i}
              href={"/" + item.loteriaSlug + "/" + item.fecha}
              className="flex flex-col gap-2 border-t border-[#10203A]/6 py-3 first:border-t-0 hover:bg-[#FBF7EE] sm:flex-row sm:items-center sm:gap-3"
            >
              <div className="w-full shrink-0 sm:w-36">
                <p className="truncate text-lg font-extrabold text-[#10203A]">{item.sorteoNombre}</p>
                <p className="font-mono text-xs font-bold" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{item.loteriaNombre} · {formatearPublicacion(item.creadoEn)}</p>
              </div>
              <div className="flex flex-nowrap items-center gap-1 overflow-x-auto">
                {numeros.map(function (n, j) { return <Bolita key={j} tamano={tamano} primera={j === 0}>{n}</Bolita>; })}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function TablaHorarios(props: { loterias: Loteria[] }) {
  const loterias = props.loterias;
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
                  return (
                    <div key={sorteo.id} className="flex items-center justify-between gap-2 font-mono text-xs">
                      <span className="truncate text-[#10203A]">{sorteo.nombre}</span>
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

  const filas: { loteria: string; loteriaSlug: string; sorteo: string; sorteoId: number; numeros: string[]; esVistaPrevia: boolean }[] = [];
  for (let i = 0; i < loterias.length; i++) {
    const sorteos = loterias[i].sorteos || [];
    for (let j = 0; j < sorteos.length; j++) {
      const resultado = sorteos[j].resultados.find(function (r) { return r.fecha === fechaSeleccionada; });
      if (resultado) {
        filas.push({
          loteria: loterias[i].nombre,
          loteriaSlug: loterias[i].slug,
          sorteo: sorteos[j].nombre,
          sorteoId: sorteos[j].id,
          numeros: resultado.numeros.split("-"),
          esVistaPrevia: false,
        });
      }
    }
    if (filas.length >= 6) break;
  }

  if (filas.length === 0) {
    for (let i = 0; i < loterias.length && filas.length < 4; i++) {
      const sorteos = loterias[i].sorteos || [];
      if (sorteos.length > 0) {
        filas.push({
          loteria: loterias[i].nombre,
          loteriaSlug: loterias[i].slug,
          sorteo: sorteos[0].nombre,
          sorteoId: sorteos[0].id,
          numeros: numerosVistaPrevia(sorteos[0].id),
          esVistaPrevia: true,
        });
      }
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#10203A] p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(#FBF7EE 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      <div className="relative">
        <p className="mb-1 font-mono text-base font-semibold text-[#FFD166]">● En vivo · {fechaTitulo}</p>
        <h2 className="mb-1 font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
          ¿Qué salió {fechaSeleccionada === hoyISO() ? "hoy" : "ese día"}?
        </h2>
        <p className="mb-6 text-base text-[#E8ECF1]">Toca una lotería abajo para ver más resultados.</p>

        {filas.length === 0 ? (
          <p className="rounded-xl bg-white/10 px-4 py-4 text-base text-white">
            Todavía no hay resultados publicados para este día.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filas.map(function (fila, i) {
              const colorEspecial = COLOR_ESPECIAL_SORTEOS[fila.sorteoId];
              const href = fila.esVistaPrevia ? "/" + fila.loteriaSlug : "/" + fila.loteriaSlug + "/" + fechaSeleccionada;
              return (
                <a key={i} href={href} className="flex flex-col gap-3 rounded-xl bg-white px-5 py-4 hover:bg-[#FBF7EE]">
                  <div className="flex items-center justify-between">
                    {fila.esVistaPrevia ? (
                      <span
                        className="inline-block shrink-0 rounded-md px-2.5 py-1 font-mono text-xs font-bold italic"
                        style={{ backgroundColor: "#E4E8EB", color: "#7B858F" }}
                      >
                        vista previa
                      </span>
                    ) : (
                      <EtiquetaFecha fechaISO={fechaSeleccionada} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-[#10203A]">{fila.loteria}</p>
                    <p className="truncate text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                      {fila.sorteo}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {fila.numeros.map(function (n, j) {
                      const esPrimera = j === 0 && !colorEspecial;
                      const estiloEspecial = !fila.esVistaPrevia && colorEspecial
                        ? { backgroundColor: colorEspecial.fondo, color: colorEspecial.texto }
                        : !fila.esVistaPrevia && esPrimera
                        ? { backgroundColor: COLOR_PRIMERA_POSICION, color: "#10203A" }
                        : undefined;
                      return (
                        <span
                          key={j}
                          className={"flex h-14 w-14 items-center justify-center rounded-full font-mono text-2xl font-bold sm:h-16 sm:w-16 " + (fila.esVistaPrevia ? "border-2 border-dashed border-[#9AA5AF] bg-[#E4E8EB] text-[#7B858F]" : estiloEspecial ? "" : "bg-[#1E4D8C] text-white")}
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

  const listaLoterias = loterias || [];
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
            numeros: r.numeros,
            fecha: r.fecha,
            creadoEn: r.creado_en,
          });
        }
      }
    }
  }
  ultimosResultados.sort(function (a, b) { return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime(); });
  const ultimos8 = ultimosResultados.slice(0, 8);

  const fechaTitulo = new Date(fechaSeleccionada + "T00:00:00").toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div id="top" className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <header className="relative bg-[#10203A] px-6 py-5 sm:px-10 sm:py-6">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#FBF7EE 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
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

        <PanelUltimosResultados items={ultimos8} />

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

        <TablaHorarios loterias={listaLoterias} />

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
              <li>Quiniela Leidsa — 8:55 p.m.</li>
              <li>Pega 3 Más — 8:55 p.m.</li>
              <li>Loto Pool — 8:55 p.m.</li>
              <li>Super Kino TV — 8:55 p.m.</li>
              <li>Loto (martes y sábados) — 8:55 p.m.</li>
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
              <li>MegaLotto — 7:55 p.m.</li>
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
              <li>Anguila — 10:00 a.m.</li>
              <li>PowerBall — lunes, miércoles y sábados, 11:00 p.m.</li>
              <li>Mega Millions — martes y viernes, 11:00 p.m.</li>
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