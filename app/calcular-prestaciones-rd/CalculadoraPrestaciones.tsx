"use client";

import { useState } from "react";
import { useEventoAlCalcular } from "@/lib/eventoAnalytics";

// Calculadora de prestaciones laborales según el Código de Trabajo de RD (Ley 16-92).
// Reglas usadas (verificar si se promulga la reforma laboral; a junio de 2026 seguía
// pendiente y no tocaba la cesantía):
// - Salario diario = salario mensual ÷ 23.83
// - Preaviso (art. 76): +3 a 6 meses 7 días; +6 meses a 1 año 14 días; +1 año 28 días
// - Cesantía (art. 80): +3 a 6 meses 6 días; +6 meses a 1 año 13 días; 1 a 5 años
//   21 días por año; 5 años o más 23 días por año. La fracción de año de más de
//   3 meses suma 6 días (hasta 6 meses) o 13 días (más de 6 meses).
// - Vacaciones (arts. 177 y 180): 14 días por año (18 desde 5 años); con menos de un
//   año y más de 5 meses, escala de 6 a 12 días.
// - Regalía (art. 219): parte proporcional del año en curso.
// - Despido injustificado o dimisión justificada (art. 95): además, hasta 6 meses de salario.

const COLOR_TEXTO_SECUNDARIO = "#2E3B48";
const COLOR_VERDE_RD = "#007A33";
const DIVISOR_DIARIO = 23.83;
const DIA_MS = 24 * 60 * 60 * 1000;

type Salida = "desahucio" | "despido" | "renuncia" | "dimision";

const OPCIONES_SALIDA: { valor: Salida; etiqueta: string; ayuda: string }[] = [
  { valor: "desahucio", etiqueta: "Me botaron sin decir ninguna falta (desahucio)", ayuda: "La empresa terminó el contrato sin acusarte de nada." },
  { valor: "despido", etiqueta: "Me despidieron acusándome de una falta (despido)", ayuda: "La empresa dice que cometiste una falta grave." },
  { valor: "renuncia", etiqueta: "Renuncié por mi cuenta", ayuda: "Te fuiste porque quisiste, sin culpa de la empresa." },
  { valor: "dimision", etiqueta: "Renuncié por culpa de la empresa (dimisión)", ayuda: "Ej.: no te pagaban, no te inscribieron en la TSS, maltrato." },
];

function aFecha(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return Date.UTC(a, m - 1, d);
}

// Meses completos y días sobrantes entre dos fechas.
function tiempoTrabajado(desde: string, hasta: string) {
  const [a1, m1, d1] = desde.split("-").map(Number);
  const [a2, m2, d2] = hasta.split("-").map(Number);
  let meses = (a2 - a1) * 12 + (m2 - m1);
  if (d2 < d1) meses -= 1;
  return Math.max(0, meses);
}

function diasPreaviso(meses: number) {
  if (meses < 3) return 0;
  if (meses < 6) return 7;
  if (meses < 12) return 14;
  return 28;
}

function diasCesantia(meses: number) {
  if (meses < 3) return 0;
  if (meses < 6) return 6;
  if (meses < 12) return 13;
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  const porAnio = anios >= 5 ? 23 : 21;
  const fraccion = resto >= 6 ? 13 : resto >= 3 ? 6 : 0;
  return anios * porAnio + fraccion;
}

function diasVacaciones(meses: number, yaLasTomo: boolean) {
  if (meses < 5) return 0;
  if (meses < 12) return Math.min(12, meses + 1); // 5 meses = 6 días ... 11 meses = 12 días
  if (yaLasTomo) return 0;
  return meses >= 60 ? 18 : 14;
}

function formatoPesos(n: number) {
  return "RD$ " + n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function textoTiempo(meses: number) {
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  const partes: string[] = [];
  if (anios) partes.push(`${anios} año${anios === 1 ? "" : "s"}`);
  if (resto || !anios) partes.push(`${resto} mes${resto === 1 ? "" : "es"}`);
  return partes.join(" y ");
}

export default function CalculadoraPrestaciones({ hoy }: { hoy: string }) {
  const [sueldoTexto, setSueldoTexto] = useState("");
  const [fechaEntrada, setFechaEntrada] = useState("");
  const [fechaSalida, setFechaSalida] = useState(hoy);
  const [salida, setSalida] = useState<Salida>("desahucio");
  const [preavisoTrabajado, setPreavisoTrabajado] = useState(false);
  const [vacacionesTomadas, setVacacionesTomadas] = useState(false);

  const sueldo = Number(sueldoTexto.replace(/[^\d.]/g, ""));
  const fechasValidas = Boolean(fechaEntrada) && fechaSalida >= fechaEntrada;
  const meses = fechasValidas ? tiempoTrabajado(fechaEntrada, fechaSalida) : 0;
  const diario = sueldo / DIVISOR_DIARIO;

  const pagaPreavisoYCesantia = salida === "desahucio";
  const enTribunal = salida === "despido" || salida === "dimision";

  const dPreaviso = pagaPreavisoYCesantia && !preavisoTrabajado ? diasPreaviso(meses) : 0;
  const dCesantia = pagaPreavisoYCesantia ? diasCesantia(meses) : 0;
  const dVacaciones = diasVacaciones(meses, vacacionesTomadas);

  // Regalía: parte del año calendario de la salida que se trabajó.
  const anioSalida = fechaSalida.slice(0, 4);
  const inicioRegalia = fechaEntrada > `${anioSalida}-01-01` ? fechaEntrada : `${anioSalida}-01-01`;
  const diasDelAnio = Math.round((aFecha(`${anioSalida}-12-31`) - aFecha(`${anioSalida}-01-01`)) / DIA_MS) + 1;
  const diasRegalia = fechasValidas ? Math.max(0, Math.round((aFecha(fechaSalida) - aFecha(inicioRegalia)) / DIA_MS) + 1) : 0;
  const regalia = sueldo * Math.min(1, diasRegalia / diasDelAnio);

  const filas = [
    { concepto: "Preaviso", dias: dPreaviso, monto: dPreaviso * diario, nota: pagaPreavisoYCesantia ? (preavisoTrabajado ? "Ya te dieron el aviso y lo trabajaste" : "") : "No aplica en este tipo de salida" },
    { concepto: "Cesantía", dias: dCesantia, monto: dCesantia * diario, nota: pagaPreavisoYCesantia ? "" : "No aplica en este tipo de salida" },
    { concepto: "Vacaciones", dias: dVacaciones, monto: dVacaciones * diario, nota: meses < 5 ? "Hace falta más de 5 meses trabajando" : "" },
    { concepto: "Regalía (doble sueldo)", dias: null as number | null, monto: regalia, nota: "Proporcional al tiempo trabajado este año" },
  ];
  const total = filas.reduce(function (t, f) { return t + f.monto; }, 0);

  // Lo que se podría reclamar si el tribunal le da la razón al trabajador.
  const extraPreaviso = diasPreaviso(meses) * diario;
  const extraCesantia = diasCesantia(meses) * diario;
  const extraArt95 = sueldo * 6;

  const hayResultado = sueldo > 0 && fechasValidas;
  useEventoAlCalcular(hayResultado, "prestaciones");

  return (
    <div>
      <div className="rounded-xl border border-[#10203A]/15 bg-white p-5 sm:p-6">
        <label className="block">
          <span className="mb-1 block font-semibold">¿Cuánto ganabas al mes?</span>
          <div className="flex items-center rounded-lg border border-[#10203A]/25 bg-[#FBF7EE] px-3 focus-within:border-[#1E4D8C]">
            <span className="font-mono font-semibold" style={{ color: COLOR_TEXTO_SECUNDARIO }}>RD$</span>
            <input
              id="sueldo"
              type="text"
              inputMode="decimal"
              placeholder="Ej: 25,000"
              value={sueldoTexto}
              onChange={function (e) { setSueldoTexto(e.target.value); }}
              className="w-full bg-transparent px-2 py-3 font-mono text-lg outline-none"
            />
          </div>
          <span className="mt-1 block text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
            Tu sueldo fijo. Si variaba, pon el promedio del último año.
          </span>
        </label>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block font-semibold">¿Qué día entraste?</span>
            <input
              id="entrada"
              type="date"
              max={fechaSalida}
              value={fechaEntrada}
              onChange={function (e) { setFechaEntrada(e.target.value); }}
              className="w-full rounded-lg border border-[#10203A]/25 bg-[#FBF7EE] px-3 py-2.5 font-mono"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-semibold">¿Qué día saliste?</span>
            <input
              id="salida"
              type="date"
              min={fechaEntrada || undefined}
              value={fechaSalida}
              onChange={function (e) { setFechaSalida(e.target.value); }}
              className="w-full rounded-lg border border-[#10203A]/25 bg-[#FBF7EE] px-3 py-2.5 font-mono"
            />
          </label>
        </div>

        <fieldset className="mt-5">
          <legend className="mb-2 font-semibold">¿Cómo saliste del trabajo?</legend>
          <div className="space-y-2">
            {OPCIONES_SALIDA.map(function (o) {
              const activa = salida === o.valor;
              return (
                <label
                  key={o.valor}
                  className={"flex cursor-pointer gap-3 rounded-lg border px-3 py-2.5 " + (activa ? "border-[#1E4D8C] bg-[#1E4D8C]/5" : "border-[#10203A]/15")}
                >
                  <input
                    type="radio"
                    name="salida"
                    value={o.valor}
                    checked={activa}
                    onChange={function () { setSalida(o.valor); }}
                    className="mt-1 h-4 w-4 accent-[#1E4D8C]"
                  />
                  <span>
                    <span className="block font-semibold">{o.etiqueta}</span>
                    <span className="block text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{o.ayuda}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {salida === "desahucio" ? (
          <label className="mt-4 flex items-center gap-3">
            <input
              id="preaviso-trabajado"
              type="checkbox"
              checked={preavisoTrabajado}
              onChange={function (e) { setPreavisoTrabajado(e.target.checked); }}
              className="h-5 w-5 accent-[#1E4D8C]"
            />
            <span>Me avisaron con tiempo y trabajé esos días de aviso</span>
          </label>
        ) : null}

        {meses >= 12 ? (
          <label className="mt-3 flex items-center gap-3">
            <input
              id="vacaciones-tomadas"
              type="checkbox"
              checked={vacacionesTomadas}
              onChange={function (e) { setVacacionesTomadas(e.target.checked); }}
              className="h-5 w-5 accent-[#1E4D8C]"
            />
            <span>Ya tomé mis vacaciones de este último año</span>
          </label>
        ) : null}
      </div>

      {hayResultado ? (
        <div className="mt-6 rounded-xl border-2 bg-white p-5 sm:p-6" style={{ borderColor: COLOR_VERDE_RD }}>
          <p className="text-center text-base font-semibold uppercase tracking-wider" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
            Te deben pagar
          </p>
          <p className="my-2 text-center font-mono text-4xl font-bold sm:text-5xl" style={{ color: COLOR_VERDE_RD }}>
            {formatoPesos(total)}
          </p>
          <p className="text-center text-base" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
            Por {textoTiempo(meses)} trabajando · salario diario {formatoPesos(diario)}
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="text-left" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                  <th className="py-2 pr-2 font-semibold">Concepto</th>
                  <th className="py-2 pr-2 text-right font-semibold">Días</th>
                  <th className="py-2 text-right font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody>
                {filas.map(function (f) {
                  return (
                    <tr key={f.concepto} className="border-t border-[#10203A]/8 align-top">
                      <td className="py-2 pr-2">
                        <span className="font-semibold">{f.concepto}</span>
                        {f.nota ? <span className="block text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{f.nota}</span> : null}
                      </td>
                      <td className="py-2 pr-2 text-right font-mono">{f.dias === null ? "—" : f.dias}</td>
                      <td className="py-2 text-right font-mono font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>{formatoPesos(f.monto)}</td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-[#10203A]/20">
                  <td className="py-2 font-bold" colSpan={2}>Total</td>
                  <td className="py-2 text-right font-mono font-bold" style={{ color: COLOR_VERDE_RD }}>{formatoPesos(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {enTribunal ? (
            <div className="mt-5 rounded-lg border border-[#E7A63C]/50 bg-[#E7A63C]/10 p-4 text-base">
              <p className="font-bold">⚖️ Si llevas el caso a los tribunales y te dan la razón</p>
              <p className="mt-1 leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                {salida === "despido"
                  ? "Si la empresa no puede probar la falta, el despido se declara injustificado."
                  : "Si pruebas que la empresa tuvo la culpa, la dimisión se declara justificada."}{" "}
                Entonces también te tocarían:
              </p>
              <ul className="mt-2 space-y-1 font-mono">
                <li>Preaviso: {formatoPesos(extraPreaviso)}</li>
                <li>Cesantía: {formatoPesos(extraCesantia)}</li>
                <li>Hasta 6 meses de salario (art. 95): {formatoPesos(extraArt95)}</li>
              </ul>
              <p className="mt-2 text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
                Para esto necesitas un abogado laboral o ir al Ministerio de Trabajo. Tienes plazos cortos para reclamar.
              </p>
            </div>
          ) : null}

          {meses < 3 ? (
            <p className="mt-4 text-base" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              Con menos de 3 meses trabajando todavía no te tocan preaviso ni cesantía.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-6 text-center text-base" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Escribe tu sueldo y la fecha en que entraste. El resultado aparece al instante. 👆
        </p>
      )}
    </div>
  );
}
