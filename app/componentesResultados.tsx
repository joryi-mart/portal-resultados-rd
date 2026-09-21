import RelojDigital from "./RelojDigital";
import NotificacionesPush from "./NotificacionesPush";

export type Resultado = { numeros: string; fecha: string; creado_en: string };
export type Sorteo = {
  id: number;
  nombre: string;
  hora_sorteo: string;
  dias_semana: string;
  resultados: Resultado[];
};
export type Loteria = {
  id: number;
  nombre: string;
  slug: string;
  activa: boolean;
  sorteos: Sorteo[];
};
export type Cambio = {
  moneda_origen: string;
  tasa_compra: number;
  tasa_venta: number;
  fuente: string;
};
export type UltimoResultado = {
  loteriaNombre: string;
  loteriaSlug: string;
  sorteoId: number;
  sorteoNombre: string;
  horaSorteo: string;
  numeros: string;
  fecha: string;
  creadoEn: string;
};

export const COLOR_AZUL = "#1E4D8C";
export const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
export const COLOR_VERDE_RD = "#007A33";
export const COLOR_VERDE_PRESIDENTE = "#0A5C36";
export const COLOR_PRIMERA_POSICION = "#E7A63C";

// Sorteos que llevan un color de bolita distinto al azul estándar.
// El "Loto" de Leidsa (id 69) sale solo miércoles y sábados, así que se
// diferencia visualmente con un beige claro (distinto al beige de fondo de la página).
type ColorBolita = { fondo: string; texto: string };
// Para sorteos donde no todos los numeros son iguales (ej. Loto Mas de Leidsa:
// los primeros 6 son el loto normal, y trae 2 numeros extra de otro sorteo),
// esta funcion decide el color segun la posicion del numero.
export const COLOR_POR_POSICION_SORTEOS: Record<number, (indice: number, total: number) => ColorBolita | null> = {
  69: function (indice) {
    if (indice === 6) return { fondo: "#D4E157", texto: "#3D4B0A" }; // verde amarillo claro
    if (indice === 7) return { fondo: "#0A5C36", texto: "#FFFFFF" }; // verde presidente
    return null; // los primeros 6 quedan en azul, como cualquier otro sorteo
  },
};

// Orden de las loterias por importancia, usado en "¿Que salio hoy?", "Resumen
// de resultados" y "Todos los sorteos de ayer". En movil se pidio un orden
// distinto al de escritorio, asi que hay uno para cada tamano de pantalla.
export const ORDEN_IMPORTANCIA_ESCRITORIO = ["nacional", "loteka", "leidsa", "haiti", "la-primera", "lotedom", "la-suerte", "anguila", "new-york", "real"];
export const ORDEN_IMPORTANCIA_MOVIL = ["nacional", "leidsa", "real", "loteka", "la-primera", "lotedom", "la-suerte", "haiti", "anguila", "new-york"];

export function hoyISO() {
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

export function etiquetaFechaResumen(fechaISO: string) {
  const hoy = hoyISO();
  if (fechaISO === hoy) return "Hoy";
  const ayer = sumarDias(hoy, -1);
  if (fechaISO === ayer) return "Ayer";
  const fechaLarga = new Date(fechaISO + "T00:00:00").toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long" });
  return fechaLarga;
}

// Fecha larga para titulos ("jueves, 17 de septiembre"), usada tanto para
// "hoy" (calculada en el servidor) como para cualquier fecha que el usuario
// elija despues, en el navegador (ver PortadaCliente.tsx).
export function formatearFechaTitulo(fechaISO: string) {
  return new Date(fechaISO + "T00:00:00").toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
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

export function formatearHora12(hora24: string) {
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
// los domingos (no 8:55pm), y Lotería Nacional sortea la Quiniela Nacional de la
// Noche a las 6:00pm los domingos (no 9:00pm, entre semana se llama distinto:
// "Billete Domingo" en la fuente).
export const HORA_DOMINGO_SORTEOS: Record<number, string> = {
  65: "15:55", // Quiniela Palé (Leidsa)
  66: "15:55", // Pega 3 Más (Leidsa)
  67: "15:55", // Loto Pool (Leidsa)
  68: "15:55", // Super Kino TV (Leidsa)
  63: "18:00", // Quiniela Nacional (Noche)
};

// Horario especial de Navidad y Año Nuevo (24, 25 y 31 de diciembre, 1 de enero),
// confirmado en la página oficial de horarios festivos de loteriasdominicanas.com.
// Nacional, Leidsa y Anguila directamente no sortean esos días (por eso no están
// aquí: la página ya muestra "Pendiente" y es lo correcto). Los que sí sortean
// pero a otra hora son estos:
const HORA_FERIADO_DICIEMBRE: Record<number, { fechas: string[]; hora: string }> = {
  70: { fechas: ["12-24", "12-31"], hora: "17:00" }, // Quiniela Loteka (no sortea 25 dic ni 1 ene)
  72: { fechas: ["12-24", "12-31"], hora: "17:00" }, // Mega Chances
  74: { fechas: ["12-24", "12-31"], hora: "17:00" }, // Toca 3
  125: { fechas: ["12-24", "12-31"], hora: "17:00" }, // La Repartidera
  79: { fechas: ["12-24", "12-25", "12-31", "01-01"], hora: "14:55" }, // Quiniela Lotedom
  80: { fechas: ["12-24", "12-25", "12-31", "01-01"], hora: "14:55" }, // Quemaito
  82: { fechas: ["12-24", "12-25", "12-31", "01-01"], hora: "14:55" }, // Lotedom Super Palé
  83: { fechas: ["12-24", "12-25", "12-31", "01-01"], hora: "14:55" }, // Agarra 4
  114: { fechas: ["12-24", "12-25", "12-31", "01-01"], hora: "21:45" }, // Florida Noche
};

export function horaSorteoEfectiva(sorteoId: number, hora24: string, fechaISO: string) {
  const mesDia = fechaISO.slice(5);
  const feriado = HORA_FERIADO_DICIEMBRE[sorteoId];
  if (feriado && feriado.fechas.includes(mesDia)) return feriado.hora;
  const esDomingo = new Date(fechaISO + "T00:00:00").getDay() === 0;
  if (esDomingo && HORA_DOMINGO_SORTEOS[sorteoId]) return HORA_DOMINGO_SORTEOS[sorteoId];
  return hora24;
}

export function formatearDias(diasSemana: string) {
  if (!diasSemana) return "Todos los días";
  const letras = diasSemana.split(",").map(function (l) { return l.trim(); });
  if (letras.length === 7) return "Todos los días";
  return letras.map(nombreDia).join(", ");
}

export function tamanoBolita(cantidad: number, chico: boolean) {
  if (chico) return "h-10 w-10 text-base";
  if (cantidad >= 6) return "h-12 w-12 text-lg";
  if (cantidad >= 5) return "h-13 w-13 text-xl";
  if (cantidad === 4) return "h-14 w-14 text-xl";
  return "h-16 w-16 text-2xl";
}

export function numerosVistaPrevia(sorteoId: number) {
  void sorteoId;
  return ["--", "--", "--"];
}

export function Bolita(props: { children: React.ReactNode; tamano: string; opaca?: boolean; colorEspecial?: { fondo: string; texto: string }; primera?: boolean }) {
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

export function EtiquetaFecha(props: { fechaISO: string }) {
  return (
    <span
      className="inline-block shrink-0 rounded-md px-2.5 py-1 font-mono text-xs font-bold"
      style={{ backgroundColor: "#E4E8EB", color: "#5C6B78" }}
    >
      {formatearFechaCorta(props.fechaISO)}
    </span>
  );
}

export function FilaSorteo(props: { sorteo: Sorteo; fechaSeleccionada: string; loteriaSlug: string }) {
  const sorteo = props.sorteo;
  const fechaSeleccionada = props.fechaSeleccionada;
  const resultado = sorteo.resultados.find(function (r) { return r.fecha === fechaSeleccionada; });
  const hayResultadoReal = !!resultado;
  const numeros = resultado ? resultado.numeros.split("-") : numerosVistaPrevia(sorteo.id);
  const tamano = tamanoBolita(numeros.length, false);
  const colorPorPosicion = COLOR_POR_POSICION_SORTEOS[sorteo.id];
  const href = hayResultadoReal ? "/" + props.loteriaSlug + "/" + fechaSeleccionada : "/" + props.loteriaSlug;

  if (!hayResultadoReal) {
    return (
      <a href={href} className="flex items-center justify-between gap-3 border-t border-[#10203A]/6 py-2.5 first:border-t-0 hover:bg-[#FBF7EE]">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-[#10203A]">{sorteo.nombre}</p>
          <p className="truncate font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
            {formatearHora12(horaSorteoEfectiva(sorteo.id, sorteo.hora_sorteo, fechaSeleccionada))}
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
          {formatearHora12(horaSorteoEfectiva(sorteo.id, sorteo.hora_sorteo, fechaSeleccionada))}
          {sorteo.dias_semana && sorteo.dias_semana.split(",").length < 7 ? " · " + formatearDias(sorteo.dias_semana) : ""}
        </p>
      </div>
      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto">
        {numeros.map(function (n, i) { return <Bolita key={i} tamano={tamano} colorEspecial={colorPorPosicion ? colorPorPosicion(i, numeros.length) ?? undefined : undefined} primera={i === 0}>{n}</Bolita>; })}
      </div>
      {resultado && resultado.creado_en ? (
        <p className="font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Publicado: {formatearPublicacion(resultado.creado_en)}</p>
      ) : null}
    </a>
  );
}

function ChipCambio(props: { nombre: string; compra: number; venta: number }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/8 px-2 py-1 sm:gap-3 sm:px-3 sm:py-1.5">
      <span className="font-mono text-xs font-bold text-[#FBF7EE] sm:text-sm">{props.nombre}</span>
      <div className="flex items-baseline gap-1 font-mono text-xs sm:text-sm">
        <span className="hidden text-[10px] uppercase text-white/50 sm:inline">Compra</span>
        <span className="font-bold text-[#8FD19E]">{props.compra.toFixed(2)}</span>
      </div>
      <div className="flex items-baseline gap-1 font-mono text-xs sm:text-sm">
        <span className="hidden text-[10px] uppercase text-white/50 sm:inline">Venta</span>
        <span className="font-bold text-[#E7A63C]">{props.venta.toFixed(2)}</span>
      </div>
    </div>
  );
}

function NavegacionFechaMovil(props: { fechaActual: string }) {
  const fechaActual = props.fechaActual;
  const hoy = hoyISO();
  const esHoy = fechaActual === hoy;
  const ayer = sumarDias(fechaActual, -1);
  const manana = sumarDias(fechaActual, 1);
  const noHayManana = manana > hoy;

  return (
    <div className="mx-5 mb-3 flex items-center gap-1.5 sm:hidden">
      <a href={"/?fecha=" + ayer} aria-label="Día anterior" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white font-mono text-sm font-bold text-[#10203A]">‹</a>
      <form method="GET" className="flex min-w-0 flex-1 items-center gap-1.5">
        <input type="date" name="fecha" defaultValue={fechaActual} max={hoy} className="h-9 w-full min-w-0 rounded-lg border border-white/15 bg-white px-2 font-mono text-xs text-[#10203A]" />
        <button type="submit" aria-label="Ver" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold text-white" style={{ backgroundColor: COLOR_VERDE_RD }}>✓</button>
      </form>
      {noHayManana ? null : (
        <a href={"/?fecha=" + manana} aria-label="Día siguiente" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white font-mono text-sm font-bold text-[#10203A]">›</a>
      )}
      {esHoy ? null : (
        <a href="/" aria-label="Volver a hoy" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 text-sm text-[#E7A63C]">⟲</a>
      )}
    </div>
  );
}

export function PanelSuperior(props: { cambios: Cambio[]; fechaActual: string }) {
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
        <div className="flex flex-nowrap items-center gap-x-2 overflow-x-auto sm:flex-wrap sm:gap-x-5 sm:gap-y-2 sm:overflow-visible">
          <div className="shrink-0"><RelojDigital /></div>
          {(dolar || euro) ? (
            <>
              <span className="hidden font-[family-name:var(--font-display)] text-xs font-bold uppercase tracking-wide text-[#E7A63C] sm:inline">
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

        {/* Computadora: version completa, sin tocar. En celular este control de
            fecha vive mas abajo, dentro de "¿Que salio hoy?" (ver NavegacionFechaMovil). */}
        <div className="hidden flex-wrap items-center gap-2 sm:flex">
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


export function ResumenResultados(props: { items: UltimoResultado[]; fecha: string }) {
  const items = props.items;
  if (items.length === 0) return null;
  const fechaAnterior = sumarDias(props.fecha, -1);
  const esHoy = props.fecha === hoyISO();

  type GrupoLoteria = { loteria: string; loteriaSlug: string; items: UltimoResultado[]; horaMasTemprana: string };
  const porLoteria = new Map<string, GrupoLoteria>();
  items.forEach(function (item) {
    const clave = item.loteriaSlug;
    if (!porLoteria.has(clave)) {
      porLoteria.set(clave, { loteria: item.loteriaNombre, loteriaSlug: clave, items: [], horaMasTemprana: item.horaSorteo || "99:99" });
    }
    const grupo = porLoteria.get(clave)!;
    grupo.items.push(item);
    if ((item.horaSorteo || "99:99") < grupo.horaMasTemprana) grupo.horaMasTemprana = item.horaSorteo || "99:99";
  });
  const gruposBase = Array.from(porLoteria.values());
  gruposBase.forEach(function (g) {
    g.items.sort(function (a, b) { return (a.horaSorteo || "99:99").localeCompare(b.horaSorteo || "99:99"); });
  });

  // Las tarjetas se ordenan por importancia (cuanto se juegan). En movil el
  // orden pedido es distinto al de escritorio, asi que se ordena dos veces.
  function ordenarPor(orden: string[]) {
    return gruposBase.slice().sort(function (a, b) {
      const posA = orden.indexOf(a.loteriaSlug);
      const posB = orden.indexOf(b.loteriaSlug);
      if (posA === -1 && posB === -1) return a.horaMasTemprana.localeCompare(b.horaMasTemprana);
      if (posA === -1) return 1;
      if (posB === -1) return -1;
      return posA - posB;
    });
  }

  function renderGrupo(g: GrupoLoteria, i: number) {
    return (
      <div key={i} className="rounded-xl border border-[#10203A]/10 p-4">
        <p className="mb-2 inline-block truncate rounded px-2 py-0.5 text-base font-bold text-white" style={{ backgroundColor: COLOR_VERDE_PRESIDENTE }}>{g.loteria}</p>
        <div className="flex flex-col gap-2.5">
          {g.items.map(function (item, j) {
            const colorPorPosicion = COLOR_POR_POSICION_SORTEOS[item.sorteoId];
            const numeros = item.numeros.split("-");
            return (
              <a key={j} href={"/" + item.loteriaSlug + "/" + item.fecha} className="flex items-center justify-between gap-2 rounded-lg -mx-1 px-1 py-1 transition hover:bg-[#FBF7EE]">
                <p className="min-w-0 truncate font-mono text-[11px]" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{item.sorteoNombre}</p>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  {numeros.map(function (n, k) {
                    const colorEspecial = colorPorPosicion ? colorPorPosicion(k, numeros.length) : null;
                    const esPrimera = k === 0 && !colorEspecial;
                    const estilo = colorEspecial
                      ? { backgroundColor: colorEspecial.fondo, color: colorEspecial.texto }
                      : esPrimera
                      ? { backgroundColor: COLOR_PRIMERA_POSICION, color: "#10203A" }
                      : undefined;
                    return (
                      <span
                        key={k}
                        className={"flex h-9 w-9 items-center justify-center rounded-full font-mono text-sm font-bold " + (estilo ? "" : esHoy ? "bg-[#1E4D8C] text-white" : "bg-[#E4E8EB] text-[#10203A]")}
                        style={estilo}
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
      </div>
    );
  }

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-[#10203A]/12 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">
          Resumen de resultados de <span className="capitalize">{etiquetaFechaResumen(props.fecha)}</span>
        </h2>
        <a href={"?fecha=" + fechaAnterior} className="font-mono text-xs font-bold text-[#1E4D8C] hover:underline">
          Ver resumen de ayer →
        </a>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {ordenarPor(ORDEN_IMPORTANCIA_MOVIL).map(renderGrupo)}
      </div>
      <div className="hidden gap-3 sm:grid sm:grid-cols-2">
        {ordenarPor(ORDEN_IMPORTANCIA_ESCRITORIO).map(renderGrupo)}
      </div>
    </div>
  );
}

export function TablaHorarios(props: { loterias: Loteria[]; fechaSeleccionada: string }) {
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
                        {formatearHora12(horaSorteoEfectiva(sorteo.id, sorteo.hora_sorteo, fechaSeleccionada))}
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

export function PizarronDelDia(props: { loterias: Loteria[]; fechaSeleccionada: string; fechaTitulo: string }) {
  const loterias = props.loterias;
  const fechaSeleccionada = props.fechaSeleccionada;
  const fechaTitulo = props.fechaTitulo;

  type FilaSorteoResumen = { sorteo: string; sorteoId: number; horaSorteo: string; numeros: string[]; esDeAyer: boolean; fechaMostrada: string };
  type TarjetaLoteria = { loteria: string; loteriaSlug: string; horaMasTemprana: string; filas: FilaSorteoResumen[] };
  const porLoteria = new Map<string, TarjetaLoteria>();

  for (let i = 0; i < loterias.length; i++) {
    const sorteos = loterias[i].sorteos || [];
    for (let j = 0; j < sorteos.length; j++) {
      const sorteo = sorteos[j];
      const resultados = sorteo.resultados || [];
      const deHoy = resultados.find(function (r) { return r.fecha === fechaSeleccionada; });

      let fila: FilaSorteoResumen | null = null;
      if (deHoy) {
        fila = {
          sorteo: sorteo.nombre,
          sorteoId: sorteo.id,
          horaSorteo: sorteo.hora_sorteo,
          numeros: deHoy.numeros.split("-"),
          esDeAyer: false,
          fechaMostrada: deHoy.fecha,
        };
      } else {
        let masReciente: Resultado | null = null;
        for (let k = 0; k < resultados.length; k++) {
          const r = resultados[k];
          if (r.fecha < fechaSeleccionada && (!masReciente || r.fecha > masReciente.fecha)) {
            masReciente = r;
          }
        }
        if (masReciente) {
          fila = {
            sorteo: sorteo.nombre,
            sorteoId: sorteo.id,
            horaSorteo: sorteo.hora_sorteo,
            numeros: masReciente.numeros.split("-"),
            esDeAyer: true,
            fechaMostrada: masReciente.fecha,
          };
        }
      }

      if (!fila) continue;
      const slug = loterias[i].slug;
      if (!porLoteria.has(slug)) {
        porLoteria.set(slug, { loteria: loterias[i].nombre, loteriaSlug: slug, horaMasTemprana: fila.horaSorteo || "99:99", filas: [] });
      }
      const tarjeta = porLoteria.get(slug)!;
      tarjeta.filas.push(fila);
      if ((fila.horaSorteo || "99:99") < tarjeta.horaMasTemprana) {
        tarjeta.horaMasTemprana = fila.horaSorteo || "99:99";
      }
    }
  }

  // Cada tarjeta (loteria) trae sus sorteos ordenados por hora. Las tarjetas
  // en si se ordenan por importancia (cuanto se juegan), no por hora: las
  // loterias mas apostadas ocupan los primeros lugares y el resto va bajando.
  // En movil el orden pedido es distinto al de escritorio, asi que hay dos.
  const tarjetasBase = Array.from(porLoteria.values());
  tarjetasBase.forEach(function (t) {
    t.filas.sort(function (a, b) { return (a.horaSorteo || "99:99").localeCompare(b.horaSorteo || "99:99"); });
  });
  function ordenarPor(orden: string[]) {
    return tarjetasBase.slice().sort(function (a, b) {
      const posA = orden.indexOf(a.loteriaSlug);
      const posB = orden.indexOf(b.loteriaSlug);
      if (posA === -1 && posB === -1) return a.horaMasTemprana.localeCompare(b.horaMasTemprana);
      if (posA === -1) return 1;
      if (posB === -1) return -1;
      return posA - posB;
    });
  }

  function renderTarjeta(t: TarjetaLoteria, i: number) {
    return (
      <div key={i} className="mb-3 break-inside-avoid rounded-xl border border-[#10203A]/10 bg-white p-4">
        <p className="mb-2 inline-block truncate rounded px-2 py-0.5 text-base font-bold text-white" style={{ backgroundColor: COLOR_VERDE_PRESIDENTE }}>{t.loteria}</p>
        <div className="flex flex-col gap-3">
          {t.filas.map(function (fila, j) {
            const colorPorPosicion = COLOR_POR_POSICION_SORTEOS[fila.sorteoId];
            const href = "/" + t.loteriaSlug + "/" + fila.fechaMostrada;
            const bolitas = fila.numeros.map(function (n, k) {
              const colorEspecial = colorPorPosicion ? colorPorPosicion(k, fila.numeros.length) : null;
              const esPrimera = k === 0 && !colorEspecial;
              const estiloEspecial = !fila.esDeAyer && colorEspecial
                ? { backgroundColor: colorEspecial.fondo, color: colorEspecial.texto }
                : !fila.esDeAyer && esPrimera
                ? { backgroundColor: COLOR_PRIMERA_POSICION, color: "#10203A" }
                : undefined;
              return (
                <span
                  key={k}
                  className={"flex h-12 w-12 items-center justify-center rounded-full font-mono text-lg font-bold " + (fila.esDeAyer ? "bg-[#E4E8EB] text-[#7B858F]" : estiloEspecial ? "" : "bg-[#1E4D8C] text-white")}
                  style={estiloEspecial}
                >
                  {n}
                </span>
              );
            });
            const etiqueta = (
              <p className="truncate text-sm font-bold text-[#10203A]">
                {fila.sorteo}
                {fila.esDeAyer ? <span className="font-normal" style={{ color: COLOR_TEXTO_SECUNDARIO }}> · de ayer</span> : ""}
              </p>
            );
            return (
              <a key={j} href={href} className="block rounded-lg -mx-1 px-1 py-1 transition hover:bg-[#FBF7EE]">
                <div className="mb-1.5">{etiqueta}</div>
                <div className="flex flex-wrap items-center gap-1.5">{bolitas}</div>
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  // La tarjeta de avisos va entre las tarjetas de loterias: 4 arriba y el resto debajo.
  function conTarjetaDeAvisos(lista: ReturnType<typeof ordenarPor>) {
    const salida: React.ReactNode[] = [];
    lista.forEach(function (t, ti) {
      salida.push(renderTarjeta(t, ti));
      if (ti === 3) salida.push(<NotificacionesPush key="tarjeta-avisos" className="mb-3 break-inside-avoid" />);
    });
    return salida;
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-[#10203A]">
      <div className="p-5 pb-3 sm:p-6 sm:pb-4">
        <p className="mb-1 font-mono text-xs font-semibold text-[#FFD166]">● En vivo · {fechaTitulo}</p>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white sm:text-3xl">
          ¿Qué salió {fechaSeleccionada === hoyISO() ? "hoy" : "ese día"}?
        </h2>
        <p className="mt-1 text-sm text-white/70">Toca una lotería abajo para ver más resultados.</p>
      </div>

      <NavegacionFechaMovil fechaActual={fechaSeleccionada} />

      {tarjetasBase.length === 0 ? (
        <p className="mx-5 mb-5 rounded-xl bg-white/10 px-4 py-4 text-base text-white sm:mx-6">
          Todavía no hay resultados publicados para este día.
        </p>
      ) : (
        <>
          <div className="mx-3 mb-3 columns-1 gap-3 sm:hidden">
            {conTarjetaDeAvisos(ordenarPor(ORDEN_IMPORTANCIA_MOVIL))}
          </div>
          <div className="mx-3 mb-3 hidden gap-3 sm:mx-4 sm:mb-4 sm:columns-3 sm:block">
            {conTarjetaDeAvisos(ordenarPor(ORDEN_IMPORTANCIA_ESCRITORIO))}
          </div>
        </>
      )}
    </div>
  );
}

// Vista en tabla (una fila por sorteo) de "que salio hoy": empieza mostrando
// el resultado de ayer en gris para los sorteos que todavia no han salido
// hoy, y cada uno se pone azul apenas se publica su numero de hoy.
export function TablaResultadosDelDia(props: { loterias: Loteria[]; fechaSeleccionada: string }) {
  const loterias = props.loterias;
  const fechaSeleccionada = props.fechaSeleccionada;

  type FilaResumen = { sorteo: string; sorteoId: number; loteriaSlug: string; horaSorteo: string; numeros: string[]; esDeAyer: boolean; fechaMostrada: string };
  const porLoteria = new Map<string, { loteriaNombre: string; horaMasTemprana: string; filas: FilaResumen[] }>();

  for (let i = 0; i < loterias.length; i++) {
    const sorteos = loterias[i].sorteos || [];
    for (let j = 0; j < sorteos.length; j++) {
      const sorteo = sorteos[j];
      const resultados = sorteo.resultados || [];
      const deHoy = resultados.find(function (r) { return r.fecha === fechaSeleccionada; });

      let fila: FilaResumen | null = null;
      if (deHoy) {
        fila = { sorteo: sorteo.nombre, sorteoId: sorteo.id, loteriaSlug: loterias[i].slug, horaSorteo: sorteo.hora_sorteo, numeros: deHoy.numeros.split("-"), esDeAyer: false, fechaMostrada: deHoy.fecha };
      } else {
        let masReciente: Resultado | null = null;
        for (let k = 0; k < resultados.length; k++) {
          const r = resultados[k];
          if (r.fecha < fechaSeleccionada && (!masReciente || r.fecha > masReciente.fecha)) masReciente = r;
        }
        if (masReciente) {
          fila = { sorteo: sorteo.nombre, sorteoId: sorteo.id, loteriaSlug: loterias[i].slug, horaSorteo: sorteo.hora_sorteo, numeros: masReciente.numeros.split("-"), esDeAyer: true, fechaMostrada: masReciente.fecha };
        }
      }

      if (!fila) continue;
      const slug = loterias[i].slug;
      if (!porLoteria.has(slug)) porLoteria.set(slug, { loteriaNombre: loterias[i].nombre, horaMasTemprana: fila.horaSorteo || "99:99", filas: [] });
      const grupo = porLoteria.get(slug)!;
      grupo.filas.push(fila);
      if ((fila.horaSorteo || "99:99") < grupo.horaMasTemprana) grupo.horaMasTemprana = fila.horaSorteo || "99:99";
    }
  }

  // Mismo orden de importancia que "¿Que salio hoy?", para que ambas vistas
  // muestren las loterias en el mismo orden. En movil el orden pedido es
  // distinto al de escritorio, asi que hay dos.
  const gruposBase = Array.from(porLoteria.entries());
  gruposBase.forEach(function ([, g]) {
    g.filas.sort(function (a, b) { return (a.horaSorteo || "99:99").localeCompare(b.horaSorteo || "99:99"); });
  });
  function ordenarPor(orden: string[]) {
    return gruposBase.slice().sort(function ([slugA, a], [slugB, b]) {
      const posA = orden.indexOf(slugA);
      const posB = orden.indexOf(slugB);
      if (posA === -1 && posB === -1) return a.horaMasTemprana.localeCompare(b.horaMasTemprana);
      if (posA === -1) return 1;
      if (posB === -1) return -1;
      return posA - posB;
    });
  }

  function renderGrupo([slug, g]: (typeof gruposBase)[number], gi: number) {
    return (
      <div key={slug} className={gi > 0 ? "border-t-4 border-[#10203A]/10" : ""}>
        <p className="mx-5 mt-4 inline-block rounded px-2 py-0.5 text-sm font-bold text-white" style={{ backgroundColor: COLOR_VERDE_PRESIDENTE }}>{g.loteriaNombre}</p>
        <div className="flex flex-col">
          {g.filas.map(function (fila, i) {
            const colorPorPosicion = COLOR_POR_POSICION_SORTEOS[fila.sorteoId];
            const href = "/" + fila.loteriaSlug + "/" + fila.fechaMostrada;
            return (
              <a
                key={i}
                href={href}
                className="flex items-center justify-between gap-3 border-t border-[#10203A]/6 px-5 py-3 hover:bg-[#FBF7EE]"
              >
                <span className="min-w-0 truncate text-base font-semibold text-[#10203A]">{fila.sorteo}</span>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                  {fila.numeros.map(function (n, k) {
                    const colorEspecial = colorPorPosicion ? colorPorPosicion(k, fila.numeros.length) : null;
                    const esPrimera = k === 0 && !colorEspecial;
                    const fondoEspecial = !fila.esDeAyer && colorEspecial
                      ? colorEspecial.fondo
                      : !fila.esDeAyer && esPrimera
                      ? COLOR_PRIMERA_POSICION
                      : undefined;
                    const fondo = fondoEspecial || (fila.esDeAyer ? "#E4E8EB" : "#1E4D8C");
                    // Numero blanco sobre azul; oscuro sobre amarillo y otros colores claros.
                    const colorTexto = fila.esDeAyer
                      ? "#7B858F"
                      : fondoEspecial
                      ? (colorEspecial ? colorEspecial.texto : "#10203A")
                      : "#FFFFFF";
                    return (
                      <span
                        key={k}
                        className="flex h-12 w-12 items-center justify-center rounded-full font-mono text-lg font-bold"
                        style={{ backgroundColor: fondo, color: colorTexto }}
                      >
                        {n}
                      </span>
                    );
                  })}
                </div>
                <span className="shrink-0 font-mono text-xs font-bold" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{formatearFechaCorta(fila.fechaMostrada)}</span>
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  if (gruposBase.length === 0) return null;

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-[#10203A]/12 bg-white">
      <div className="border-b border-[#10203A]/8 p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">Todos los sorteos de ayer</h2>
        <p className="mt-1 font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          En gris, el número de ayer para lo que todavía no ha salido hoy. Se pone azul apenas se publica el número de hoy.
        </p>
      </div>
      <div className="flex flex-col sm:hidden">
        {ordenarPor(ORDEN_IMPORTANCIA_MOVIL).map(renderGrupo)}
      </div>
      <div className="hidden flex-col sm:flex">
        {ordenarPor(ORDEN_IMPORTANCIA_ESCRITORIO).map(renderGrupo)}
      </div>
    </div>
  );
}
