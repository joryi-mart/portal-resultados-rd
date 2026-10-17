"use client";

import { useMemo, useState } from "react";
import { Bolita } from "../componentesResultados";

type Dato = { numero: number; significa: string };

export default function BuscadorLista({ datos, placeholder }: { datos: Dato[]; placeholder: string }) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(function () {
    const q = busqueda.trim().toLowerCase();
    if (!q) return datos;
    return datos.filter(function (d) {
      return d.significa.toLowerCase().includes(q) || String(d.numero).padStart(2, "0").includes(q);
    });
  }, [busqueda, datos]);

  return (
    <div>
      <input
        type="text"
        value={busqueda}
        onChange={function (e) {
          setBusqueda(e.target.value);
        }}
        placeholder={placeholder}
        className="mb-4 w-full rounded-lg border border-[#10203A]/15 bg-white px-4 py-2.5 text-sm text-[#10203A] outline-none focus:border-[#1E4D8C]"
      />

      {filtrados.length === 0 ? (
        <p className="text-sm text-[#5C6B78]">No encontramos nada con ese nombre.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {filtrados.map(function (d) {
            return (
              <div
                key={d.numero}
                className="flex items-center gap-2.5 rounded-lg border border-[#10203A]/10 bg-white px-3 py-2"
              >
                <Bolita tamano="h-8 w-8 text-xs">{String(d.numero).padStart(2, "0")}</Bolita>
                <span className="text-sm font-medium text-[#10203A]">{d.significa}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
