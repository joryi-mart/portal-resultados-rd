"use client";

import { useMemo, useState } from "react";
import NavPildoras from "../NavPildoras";
import datos from "@/lib/codigos-postales.json";

type Localidad = { nombre: string; codigo: string; provincia: string };

const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

export default function Buscador() {
  const [busqueda, setBusqueda] = useState("");

  const resultados = useMemo(function () {
    const termino = busqueda.trim().toLowerCase();
    const lista = datos as Localidad[];
    if (!termino) return lista.slice(0, 40);
    return lista.filter(function (l) {
      return l.nombre.toLowerCase().includes(termino) || l.provincia.toLowerCase().includes(termino);
    }).slice(0, 100);
  }, [busqueda]);

  return (
    <div className="min-h-screen bg-[#FBF7EE]">
      <NavPildoras />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
        <h1 className="mb-2 text-2xl font-bold text-[#10203A]">📍 Códigos Postales de República Dominicana</h1>
        <p className="mb-6 text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Busca tu sector, barrio o localidad para encontrar su código postal de 5 dígitos.
          Datos de INPOSDOM vía{" "}
          <a href="https://github.com/manuelpgs/localidades-postales-rd" target="_blank" rel="noopener noreferrer" className="underline">
            localidades-postales-rd
          </a>.
        </p>

        <input
          type="text"
          value={busqueda}
          onChange={function (e) { setBusqueda(e.target.value); }}
          placeholder="Escribe tu sector o provincia (ej. Piantini, Santiago...)"
          className="mb-6 w-full rounded-lg border border-[#10203A]/20 px-4 py-3 text-base text-[#10203A]"
        />

        <div className="rounded-xl border border-[#10203A]/15 bg-white">
          {resultados.length === 0 ? (
            <p className="p-5 text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>No se encontró ninguna localidad con ese nombre.</p>
          ) : (
            resultados.map(function (l, i) {
              return (
                <div key={i} className="flex items-center justify-between gap-3 border-t border-[#10203A]/6 px-4 py-3 first:border-t-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#10203A]">{l.nombre}</p>
                    <p className="truncate font-mono text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{l.provincia}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-[#1E4D8C]/10 px-2.5 py-1 font-mono text-sm font-bold text-[#1E4D8C]">{l.codigo}</span>
                </div>
              );
            })
          )}
        </div>
        {!busqueda && (
          <p className="mt-3 text-xs" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
            Mostrando los primeros 40 de {(datos as Localidad[]).length} localidades. Escribe arriba para buscar la tuya.
          </p>
        )}
      </div>
    </div>
  );
}
