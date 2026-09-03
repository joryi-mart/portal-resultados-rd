"use client";

import { useState } from "react";
import { Space_Grotesk } from "next/font/google";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"] });

function IconoTicket() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4Z" />
      <path d="M9 9v6" strokeDasharray="1 2" />
    </svg>
  );
}
function IconoBeisbol() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M6 6c2 2 2 4 0 6s-2 4 0 6" />
      <path d="M18 6c-2 2-2 4 0 6s2 4 0 6" />
    </svg>
  );
}
function IconoBasquet() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18" />
      <path d="M5.5 5.5c3.5 3 3.5 10 0 13M18.5 5.5c-3.5 3-3.5 10 0 13" />
    </svg>
  );
}
function IconoFutbol() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8l3 2.2-1.1 3.5H10.1L9 10.2 12 8Z" />
      <path d="M12 3.5V8M4.5 9l1.6 4.4M19.5 9l-1.6 4.4M8 20l2-4M16 20l-2-4" />
    </svg>
  );
}
function IconoVariedades() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}
function IconoFlecha() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

type LoteriaResumen = { nombre: string; slug: string };
type ItemMenu = { etiqueta: string; href?: string };

function ItemLoteria(props: { loteria: LoteriaResumen }) {
  const l = props.loteria;
  return (
    <a href={"/" + l.slug} className="block px-4 py-2.5 font-mono text-sm text-white/90 hover:bg-white/10">
      {l.nombre}
    </a>
  );
}

function ItemDesplegable(props: { item: ItemMenu }) {
  const item = props.item;
  if (item.href) {
    return (
      <a href={item.href} className="block px-4 py-2.5 font-mono text-sm text-white/90 hover:bg-white/10">
        {item.etiqueta}
      </a>
    );
  }
  return (
    <span className="block cursor-default px-4 py-2.5 font-mono text-sm text-white/40">
      {item.etiqueta} <span className="text-[10px] italic">(próximamente)</span>
    </span>
  );
}

type MenuId = "loterias" | "beisbol" | "nba" | "futbol" | "variedades" | null;

/**
 * Un pill con dos zonas clicables:
 * - la parte con ícono + texto es un link que va directo a la página principal de esa categoría
 * - la flechita abre/cierra el desplegable con las opciones extra (sin navegar)
 */
function PillCategoria(props: {
  href?: string;
  icono: React.ReactNode;
  etiqueta: string;
  activo: boolean;
  onAlternar: () => void;
  children: React.ReactNode;
  alinearDerecha?: boolean;
}) {
  const { href, icono, etiqueta, activo, onAlternar, children, alinearDerecha } = props;

  return (
    <div className="relative shrink-0">
      <div
        className={
          "flex items-stretch overflow-hidden whitespace-nowrap rounded-lg text-base font-bold text-white " +
          (activo ? "bg-[#00994A]" : "bg-[#007A33]")
        }
      >
        {href ? (
          <a href={href} className="flex items-center gap-2 py-2.5 pl-5 pr-2 hover:bg-[#00994A]">
            {icono}
            {etiqueta}
          </a>
        ) : (
          <span className="flex items-center gap-2 py-2.5 pl-5 pr-2 text-white/50">
            {icono}
            {etiqueta}
          </span>
        )}
        <button
          onClick={onAlternar}
          aria-label={"Ver más opciones de " + etiqueta}
          className="flex items-center border-l border-white/20 px-2.5 hover:bg-[#00994A]"
        >
          <IconoFlecha />
        </button>
      </div>

      {activo ? (
        <>
          <div className="fixed inset-0 z-40" onClick={onAlternar} />
          <div
            className={
              "absolute top-full z-50 mt-2 w-60 overflow-hidden rounded-xl bg-[#10203A] py-2 shadow-2xl " +
              (alinearDerecha ? "right-0" : "left-0")
            }
          >
            {children}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function NavPildoras(props: { loterias?: LoteriaResumen[] }) {
  const loterias = props.loterias || [];
  const [menuAbierto, setMenuAbierto] = useState<MenuId>(null);

  function alternar(menu: MenuId) {
    setMenuAbierto(menuAbierto === menu ? null : menu);
  }

  const itemsBeisbol: ItemMenu[] = [
    { etiqueta: "Ver todo (resumen)", href: "/beisbol" },
    { etiqueta: "Hoja de picheo", href: "/beisbol/picheo" },
    { etiqueta: "Jonrones del día", href: "/beisbol#jonrones" },
    { etiqueta: "Mejores pitchers", href: "/beisbol#pitchers" },
    { etiqueta: "LIDOM", href: "/beisbol#lidom" },
  ];

  const itemsNBA: ItemMenu[] = [
    { etiqueta: "Ver todo (resumen)", href: "/nba" },
    { etiqueta: "Juegos de hoy", href: "/nba#juegos" },
    { etiqueta: "Tabla de posiciones", href: "/nba#posiciones" },
  ];

  const itemsFutbol: ItemMenu[] = [
    { etiqueta: "Ver todo (resumen)", href: "/futbol" },
    { etiqueta: "Juegos de hoy", href: "/futbol#juegos" },
    { etiqueta: "Tabla de posiciones", href: "/futbol#posiciones" },
  ];

  const itemsVariedades: ItemMenu[] = [
    { etiqueta: "🎬 Cine", href: "/cine" },
    { etiqueta: "🏝️ Turismo", href: "/turismo" },
    { etiqueta: "⛽ Precio del combustible", href: "/precios-combustibles" },
    { etiqueta: "📍 Códigos postales", href: "/codigos-postales" },
    { etiqueta: "📅 Días feriados 2026", href: "/dias-feriados" },
  ];

  return (
    <div className={display.className + " relative z-40 mb-8"}>
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
        <PillCategoria
          href="/"
          icono={<IconoTicket />}
          etiqueta="Loterías"
          activo={menuAbierto === "loterias"}
          onAlternar={function () { alternar("loterias"); }}
        >
          <a href="/" className="block px-4 py-2.5 font-mono text-sm font-semibold text-white hover:bg-white/10">
            Ver todas (resumen)
          </a>
          {loterias.length > 0 ? <div className="my-1 border-t border-white/10" /> : null}
          {loterias.map(function (l) {
            return <ItemLoteria key={l.slug} loteria={l} />;
          })}
        </PillCategoria>

        <PillCategoria
          href="/beisbol"
          icono={<IconoBeisbol />}
          etiqueta="Béisbol"
          activo={menuAbierto === "beisbol"}
          onAlternar={function () { alternar("beisbol"); }}
        >
          {itemsBeisbol.map(function (item, i) {
            return <ItemDesplegable key={i} item={item} />;
          })}
        </PillCategoria>

        <PillCategoria
          href="/nba"
          icono={<IconoBasquet />}
          etiqueta="NBA"
          activo={menuAbierto === "nba"}
          onAlternar={function () { alternar("nba"); }}
        >
          {itemsNBA.map(function (item, i) {
            return <ItemDesplegable key={i} item={item} />;
          })}
        </PillCategoria>

        <PillCategoria
          href="/futbol"
          icono={<IconoFutbol />}
          etiqueta="Fútbol"
          activo={menuAbierto === "futbol"}
          onAlternar={function () { alternar("futbol"); }}
        >
          {itemsFutbol.map(function (item, i) {
            return <ItemDesplegable key={i} item={item} />;
          })}
        </PillCategoria>

        <PillCategoria
          href="/cine"
          icono={<IconoVariedades />}
          etiqueta="Variedades"
          activo={menuAbierto === "variedades"}
          onAlternar={function () { alternar("variedades"); }}
          alinearDerecha
        >
          {itemsVariedades.map(function (item, i) {
            return <ItemDesplegable key={i} item={item} />;
          })}
        </PillCategoria>
      </div>
    </div>
  );
}