"use client";

import { useEffect, useState } from "react";

function IconoReloj() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export default function RelojDigital() {
  const [hora, setHora] = useState("");

  useEffect(function () {
    function actualizar() {
      const ahora = new Date();
      const texto = ahora.toLocaleTimeString("es-DO", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setHora(texto);
    }
    actualizar();
    const intervalo = setInterval(actualizar, 1000);
    return function () { clearInterval(intervalo); };
  }, []);

  if (!hora) return null;

  return (
    <div className="flex items-center gap-2 rounded-full border border-[#10203A]/15 bg-white px-3 py-1.5 font-mono text-sm font-semibold text-[#10203A]">
      <IconoReloj />
      {hora}
    </div>
  );
}
