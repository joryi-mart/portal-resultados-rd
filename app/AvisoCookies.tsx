"use client";

import { useEffect, useState } from "react";

const CLAVE_LOCALSTORAGE = "aviso-cookies-aceptado";

export default function AvisoCookies() {
  const [visible, setVisible] = useState(false);

  useEffect(function () {
    try {
      if (localStorage.getItem(CLAVE_LOCALSTORAGE) !== "1") {
        setVisible(true);
      }
    } catch {
      // Si el navegador bloquea localStorage, mostramos el aviso igual.
      setVisible(true);
    }
  }, []);

  function aceptar() {
    try {
      localStorage.setItem(CLAVE_LOCALSTORAGE, "1");
    } catch {
      // Sin localStorage el aviso volverá a salir en la próxima visita, no es grave.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#10203A]/10 bg-[#10203A] px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-center text-sm leading-relaxed text-[#D5DEEA] sm:text-left">
          Usamos cookies de Google Analytics para medir las visitas y mejorar el sitio. Al seguir navegando,
          aceptas su uso. Más detalles en nuestra{" "}
          <a href="/politica-de-privacidad" className="underline">Política de Privacidad</a>.
        </p>
        <button
          onClick={aceptar}
          className="shrink-0 rounded-lg px-5 py-2.5 font-mono text-sm font-bold text-[#10203A]"
          style={{ backgroundColor: "#E7A63C" }}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
