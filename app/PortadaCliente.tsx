"use client";

import { useSearchParams } from "next/navigation";
import {
  PanelSuperior,
  PizarronDelDia,
  etiquetaFechaResumen,
  formatearFechaTitulo,
  COLOR_TEXTO_SECUNDARIO,
  type Cambio,
  type Loteria,
  type UltimoResultado,
} from "./componentesResultados";

// Lee "?fecha=" de la barra de direcciones en el navegador (no en el servidor),
// para que la portada pueda guardarse en caché y cargar rápido para el caso de
// "hoy" (el más común), mientras que navegar a un día anterior se sigue
// actualizando al instante, sin recargar toda la página.
function usarFechaSeleccionada(hoy: string): string {
  const searchParams = useSearchParams();
  return searchParams.get("fecha") || hoy;
}

export function PildoraEstado(props: { hoy: string }) {
  const fechaSeleccionada = usarFechaSeleccionada(props.hoy);
  const fechaTitulo = formatearFechaTitulo(fechaSeleccionada);
  return (
    <div className="hidden items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#E7A63C] sm:mr-24 sm:flex sm:self-auto lg:mr-40">
      <span className="h-2 w-2 animate-pulse rounded-full bg-[#E4573D]" />
      {fechaSeleccionada === props.hoy ? "En vivo" : "Consultando"} · {fechaTitulo}
    </div>
  );
}

export function PanelSuperiorConFecha(props: { cambios: Cambio[]; hoy: string }) {
  const fechaSeleccionada = usarFechaSeleccionada(props.hoy);
  return <PanelSuperior cambios={props.cambios} fechaActual={fechaSeleccionada} />;
}

// Resultados de un dia sacados de las mismas loterias que usa el pizarron (antes
// llegaba una segunda lista con todos los resultados de 15 dias solo para esto,
// y duplicaba el peso de la portada). Por loteria, el sorteo mas tardio primero.
function resultadosDelDia(loterias: Loteria[], fecha: string): UltimoResultado[] {
  const salida: UltimoResultado[] = [];
  loterias.forEach(function (l) {
    l.sorteos.slice().sort(function (a, b) { return (b.hora_sorteo || "").localeCompare(a.hora_sorteo || ""); }).forEach(function (s) {
      const r = s.resultados.find(function (x) { return x.fecha === fecha; });
      if (r) salida.push({ loteriaNombre: l.nombre, loteriaSlug: l.slug, sorteoId: s.id, sorteoNombre: s.nombre, horaSorteo: s.hora_sorteo, numeros: r.numeros, fecha: r.fecha, creadoEn: r.creado_en });
    });
  });
  return salida;
}

export function ResultadosPortada(props: { loterias: Loteria[]; fechaMasReciente: string; hoy: string }) {
  const fechaSeleccionada = usarFechaSeleccionada(props.hoy);

  // Si el dia elegido todavia no tiene resultados (ej. madrugada, nada ha salido
  // hoy), mostramos el dia mas reciente que si tenga, en vez de dejar el resumen vacio.
  const delDiaElegido = resultadosDelDia(props.loterias, fechaSeleccionada);
  const fechaResumen = delDiaElegido.length > 0 ? fechaSeleccionada : (props.fechaMasReciente || fechaSeleccionada);
  const resumenHoy = delDiaElegido.length > 0 ? delDiaElegido : resultadosDelDia(props.loterias, fechaResumen);
  const fechaTitulo = formatearFechaTitulo(fechaSeleccionada);

  // Mensaje listo para compartir por WhatsApp: unos pocos resultados destacados
  // (para dar un adelanto) más el link, así la gente igual entra al sitio a ver
  // el resto en vez de que el mensaje ya traiga todo.
  const LOTERIAS_DESTACADAS_WHATSAPP = ["nacional", "leidsa", "real", "loteka"];
  const destacadosWhatsapp = LOTERIAS_DESTACADAS_WHATSAPP
    .map(function (slug) { return resumenHoy.find(function (r) { return r.loteriaSlug === slug; }); })
    .filter(function (r): r is UltimoResultado { return !!r; });
  const lineasWhatsapp = destacadosWhatsapp
    .map(function (r) { return `${r.loteriaNombre} (${r.sorteoNombre}): ${r.numeros}`; })
    .join("\n");
  const mensajeWhatsapp =
    `🎯 Resultados de hoy ${fechaTitulo} — La Bankera RD\n\n` +
    (lineasWhatsapp ? lineasWhatsapp + "\n\n" : "") +
    `Ver todos los resultados 👉 https://labankerard.com`;
  const linkWhatsapp = "https://wa.me/?text=" + encodeURIComponent(mensajeWhatsapp);

  return (
    <>
      <div className="mb-8">
        <PizarronDelDia loterias={props.loterias} fechaSeleccionada={fechaSeleccionada} fechaTitulo={fechaTitulo} />
      </div>

      <a
        href={"/resumen" + (fechaSeleccionada !== props.hoy ? "?fecha=" + fechaSeleccionada : "")}
        className="mb-8 flex items-center justify-between rounded-xl border border-[#10203A]/12 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(16,32,58,0.08)] transition hover:shadow-md"
      >
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">Resumen de resultados de {etiquetaFechaResumen(fechaResumen).toLowerCase()}</p>
          <p className="font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{resumenHoy.length} resultados publicados, agrupados por lotería</p>
        </div>
        <span className="font-mono text-sm font-semibold text-[#1E4D8C]">Ver resumen →</span>
      </a>

      <a
        href={linkWhatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-8 flex items-center justify-between rounded-xl border border-[#10203A]/12 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(16,32,58,0.08)] transition hover:shadow-md"
      >
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">Compartir resultados de hoy por WhatsApp</p>
          <p className="font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Abre WhatsApp con el mensaje ya escrito, listo para enviar</p>
        </div>
        <span className="font-mono text-sm font-semibold text-[#007A33]">Compartir →</span>
      </a>
    </>
  );
}
