"use client";

import { enviarEvento } from "@/lib/eventoAnalytics";

// Franja de temporada (hasta el 20 de diciembre, fecha limite para pagar la
// regalia) arriba de las paginas de loteria. La calculadora casi no recibe
// visitas desde Google ni desde Facebook (9 vistas en octubre), asi que se la
// mostramos a quien ya esta en el sitio. Los dias que faltan se calculan en el
// servidor y llegan como "diasParaPago"; si es null, no se muestra.
export default function AvisoRegalia(props: { diasParaPago: number | null; pagina: string }) {
  if (props.diasParaPago === null) return null;
  const faltan = props.diasParaPago === 0 ? "Se paga hoy" : props.diasParaPago === 1 ? "Falta 1 día" : `Faltan ${props.diasParaPago} días`;
  return (
    <a
      href="/calculadora-regalia-pascual"
      onClick={function () { enviarEvento("aviso_regalia_click", { pagina: props.pagina }); }}
      className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[#1F8F4E]/30 bg-[#EAF6EE] px-4 py-3 hover:bg-[#DDF0E3]"
    >
      <span className="flex flex-col">
        <span className="text-base font-bold text-[#10203A]">🎄 ¿Cuánto te toca de regalía este año?</span>
        <span className="text-sm font-semibold text-[#2E3B48]">Calcúlalo en 10 segundos. {faltan} para el 20 de diciembre.</span>
      </span>
      <span className="shrink-0 font-mono text-base font-bold text-[#007A33]">→</span>
    </a>
  );
}
