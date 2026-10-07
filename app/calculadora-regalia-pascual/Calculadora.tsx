"use client";

import { useState } from "react";

const COLOR_TEXTO_SECUNDARIO = "#2E3B48";
const COLOR_VERDE_RD = "#007A33";

// Salario minimo del sector privado no sectorizado, vigente desde el
// 1/feb/2026 (Resolucion CNS-01-2025 del Comite Nacional de Salarios).
// La regalia no puede pasar de 5 salarios minimos (Art. 219 del Codigo de
// Trabajo). Revisar cada año si el Comite aprueba un aumento nuevo.
const SALARIO_MINIMO = {
  grande: 29988.0,
  mediana: 27489.6,
  pequena: 18421.2,
  micro: 16993.2,
};
type TamanoEmpresa = keyof typeof SALARIO_MINIMO;

const OPCIONES_EMPRESA: { valor: TamanoEmpresa; etiqueta: string }[] = [
  { valor: "grande", etiqueta: "Grande (más de 150 empleados) o no sé" },
  { valor: "mediana", etiqueta: "Mediana (51 a 150 empleados)" },
  { valor: "pequena", etiqueta: "Pequeña (11 a 50 empleados)" },
  { valor: "micro", etiqueta: "Micro (1 a 10 empleados)" },
];

// Precios aproximados de colmado/calle, solo para la parte divertida del
// resultado. No tienen que ser exactos.
const COSAS_QUE_ALCANZAN = [
  { emoji: "🍗", nombre: "pica pollos", precio: 250 },
  { emoji: "🍺", nombre: "Presidentes grandes", precio: 225 },
  { emoji: "🍌", nombre: "platos de mangú con los tres golpes", precio: 200 },
  { emoji: "🚕", nombre: "pasajes de concho", precio: 50 },
];

const DIA_MS = 24 * 60 * 60 * 1000;

function aFecha(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return Date.UTC(a, m - 1, d);
}

function formatoPesos(n: number) {
  return "RD$ " + n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatoEntero(n: number) {
  return Math.floor(n).toLocaleString("es-DO");
}

export default function Calculadora({ hoy }: { hoy: string }) {
  const anio = Number(hoy.slice(0, 4));
  const inicioAnio = `${anio}-01-01`;
  const finAnio = `${anio}-12-31`;

  const [sueldoTexto, setSueldoTexto] = useState("");
  const [entroEsteAnio, setEntroEsteAnio] = useState(false);
  const [fechaEntrada, setFechaEntrada] = useState(inicioAnio);
  const [yaSalio, setYaSalio] = useState(false);
  const [fechaSalida, setFechaSalida] = useState(hoy);
  const [tamano, setTamano] = useState<TamanoEmpresa>("grande");

  const sueldo = Number(sueldoTexto.replace(/[^\d.]/g, ""));
  const desde = entroEsteAnio && fechaEntrada > inicioAnio ? fechaEntrada : inicioAnio;
  const hasta = yaSalio && fechaSalida < finAnio ? fechaSalida : finAnio;
  const diasDelAnio = Math.round((aFecha(finAnio) - aFecha(inicioAnio)) / DIA_MS) + 1;
  const diasTrabajados = Math.max(0, Math.round((aFecha(hasta) - aFecha(desde)) / DIA_MS) + 1);
  const proporcion = Math.min(1, diasTrabajados / diasDelAnio);

  // Art. 219: la regalia es la doceava parte de lo ganado en el año. Con un
  // sueldo fijo eso equivale al sueldo de un mes por la parte del año trabajada.
  const montoSinTope = sueldo * proporcion;
  const tope = SALARIO_MINIMO[tamano] * 5;
  const monto = Math.min(montoSinTope, tope);
  const llegoAlTope = montoSinTope > tope;
  const hayResultado = sueldo > 0 && diasTrabajados > 0;

  const diasParaPago = Math.round((aFecha(`${anio}-12-20`) - aFecha(hoy)) / DIA_MS);

  const cosaParaCompartir = COSAS_QUE_ALCANZAN[0];
  const mensajeWhatsApp =
    `🎄 Con mi regalía pascual me alcanzan para ${formatoEntero(monto / cosaParaCompartir.precio)} ${cosaParaCompartir.nombre} ${cosaParaCompartir.emoji}😂\n\n` +
    `Calcula cuánto te toca a ti 👉 https://labankerard.com/calculadora-regalia-pascual`;

  return (
    <div>
      <div className="mb-6 rounded-xl border border-[#E7A63C]/40 bg-[#E7A63C]/10 px-5 py-4 text-center">
        {diasParaPago > 0 ? (
          <p className="font-semibold text-[#10203A]">
            🎄 Faltan <span className="font-mono text-xl font-bold">{diasParaPago}</span> días para el 20 de diciembre, fecha límite para pagar la regalía
          </p>
        ) : diasParaPago === 0 ? (
          <p className="font-semibold text-[#10203A]">🎄 ¡Hoy es el último día para que te paguen la regalía!</p>
        ) : (
          <p className="font-semibold text-[#10203A]">🎄 La regalía de {anio} ya debió pagarse a más tardar el 20 de diciembre</p>
        )}
      </div>

      <div className="rounded-xl border border-[#10203A]/15 bg-white p-5 sm:p-6">
        <label className="block">
          <span className="mb-1 block font-semibold">¿Cuánto ganas al mes?</span>
          <div className="flex items-center rounded-lg border border-[#10203A]/25 bg-[#FBF7EE] px-3 focus-within:border-[#1E4D8C]">
            <span className="font-mono font-semibold" style={{ color: COLOR_TEXTO_SECUNDARIO }}>RD$</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ej: 25,000"
              value={sueldoTexto}
              onChange={function (e) { setSueldoTexto(e.target.value); }}
              className="w-full bg-transparent px-2 py-3 font-mono text-lg outline-none"
            />
          </div>
          <span className="mt-1 block text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
            Tu sueldo fijo, sin contar horas extras.
          </span>
        </label>

        <label className="mt-5 flex items-center gap-3">
          <input
            type="checkbox"
            checked={entroEsteAnio}
            onChange={function (e) { setEntroEsteAnio(e.target.checked); }}
            className="h-5 w-5 accent-[#1E4D8C]"
          />
          <span className="font-semibold">Empecé a trabajar en {anio}</span>
        </label>
        {entroEsteAnio ? (
          <label className="mt-2 block pl-8">
            <span className="mb-1 block text-base" style={{ color: COLOR_TEXTO_SECUNDARIO }}>¿Qué día entraste?</span>
            <input
              type="date"
              min={inicioAnio}
              max={finAnio}
              value={fechaEntrada}
              onChange={function (e) { setFechaEntrada(e.target.value); }}
              className="rounded-lg border border-[#10203A]/25 bg-[#FBF7EE] px-3 py-2 font-mono"
            />
          </label>
        ) : null}

        <label className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            checked={yaSalio}
            onChange={function (e) { setYaSalio(e.target.checked); }}
            className="h-5 w-5 accent-[#1E4D8C]"
          />
          <span className="font-semibold">Ya salí de la empresa (renuncia o despido)</span>
        </label>
        {yaSalio ? (
          <label className="mt-2 block pl-8">
            <span className="mb-1 block text-base" style={{ color: COLOR_TEXTO_SECUNDARIO }}>¿Qué día saliste?</span>
            <input
              type="date"
              min={inicioAnio}
              max={finAnio}
              value={fechaSalida}
              onChange={function (e) { setFechaSalida(e.target.value); }}
              className="rounded-lg border border-[#10203A]/25 bg-[#FBF7EE] px-3 py-2 font-mono"
            />
          </label>
        ) : null}

        <label className="mt-5 block">
          <span className="mb-1 block font-semibold">Tamaño de la empresa</span>
          <select
            value={tamano}
            onChange={function (e) { setTamano(e.target.value as TamanoEmpresa); }}
            className="w-full rounded-lg border border-[#10203A]/25 bg-[#FBF7EE] px-3 py-3"
          >
            {OPCIONES_EMPRESA.map(function (o) {
              return <option key={o.valor} value={o.valor}>{o.etiqueta}</option>;
            })}
          </select>
          <span className="mt-1 block text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
            Solo importa si ganas mucho: la ley pone un tope a la regalía según el salario mínimo.
          </span>
        </label>
      </div>

      {hayResultado ? (
        <div className="mt-6 rounded-xl border-2 bg-white p-5 text-center sm:p-6" style={{ borderColor: COLOR_VERDE_RD }}>
          <p className="text-base font-semibold uppercase tracking-wider" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Te toca de regalía</p>
          <p className="my-2 font-mono text-4xl font-bold sm:text-5xl" style={{ color: COLOR_VERDE_RD }}>{formatoPesos(monto)}</p>
          <p className="text-base" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
            {proporcion >= 1
              ? "Trabajaste el año completo: te toca un mes de sueldo."
              : `Por ${diasTrabajados} días trabajados en ${anio} (${Math.round(proporcion * 100)}% del año).`}
            {" "}Libre de descuentos: no paga ISR ni TSS.
          </p>
          {llegoAlTope ? (
            <p className="mt-2 text-base font-semibold text-[#B23B26]">
              Tu regalía llegó al tope de ley: 5 salarios mínimos ({formatoPesos(tope)}).
            </p>
          ) : null}

          <div className="mt-6 rounded-lg bg-[#FBF7EE] p-4 text-left">
            <p className="mb-2 text-center font-[family-name:var(--font-display)] font-bold">🎉 Con tu regalía te alcanzan para:</p>
            <ul className="space-y-1">
              {COSAS_QUE_ALCANZAN.map(function (c) {
                return (
                  <li key={c.nombre} className="flex items-baseline gap-2">
                    <span className="text-xl">{c.emoji}</span>
                    <span className="font-mono text-lg font-bold">{formatoEntero(monto / c.precio)}</span>
                    <span>{c.nombre}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-center text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>Precios aproximados, solo para reír un rato 😄</p>
          </div>

          <a
            href={"https://wa.me/?text=" + encodeURIComponent(mensajeWhatsApp)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white"
            style={{ backgroundColor: "#25D366" }}
          >
            Compartir por WhatsApp
          </a>
        </div>
      ) : (
        <p className="mt-6 text-center text-base" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Escribe tu sueldo y el resultado aparece al instante. 👆
        </p>
      )}
    </div>
  );
}
