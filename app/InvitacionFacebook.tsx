"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Tarjeta "Síguenos en Facebook" que aparece abajo cuando la persona ya lleva un
// rato en la página (bajó a la mitad o pasaron 15 segundos). Objetivo: convertir
// visitantes de la web en seguidores de la página de Facebook (meta de 10,000
// para la monetización). Si la cierra o toca "Seguir", no vuelve a salir en 7 días.
// No sale mientras el aviso de cookies esté abierto, para no amontonar cosas.

const ENLACE_FACEBOOK = "https://www.facebook.com/profile.php?id=1315560834976047";
const CLAVE_CERRADA = "invitacion-facebook-cerrada";
const CLAVE_COOKIES = "aviso-cookies-aceptado";
const DIAS_SIN_MOSTRAR = 7;

function leer(clave: string) {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

export default function InvitacionFacebook() {
  const ruta = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(
    function () {
      if (ruta?.startsWith("/admin")) return;
      const cerradaEn = Number(leer(CLAVE_CERRADA) || "0");
      if (Date.now() - cerradaEn < DIAS_SIN_MOSTRAR * 24 * 60 * 60 * 1000) return;

      let mostrada = false;
      function mostrar() {
        if (mostrada || leer(CLAVE_COOKIES) !== "1") return;
        mostrada = true;
        setVisible(true);
        quitar();
      }
      function alBajar() {
        const alto = document.documentElement.scrollHeight - window.innerHeight;
        if (alto > 0 && window.scrollY / alto > 0.5) mostrar();
      }
      const temporizador = window.setTimeout(mostrar, 15000);
      window.addEventListener("scroll", alBajar, { passive: true });
      function quitar() {
        window.clearTimeout(temporizador);
        window.removeEventListener("scroll", alBajar);
      }
      return quitar;
    },
    [ruta]
  );

  function cerrar(motivo: "cerrar" | "seguir") {
    try {
      localStorage.setItem(CLAVE_CERRADA, String(Date.now()));
    } catch {
      // Sin localStorage la tarjeta puede volver a salir en otra visita; no es grave.
    }
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (gtag) gtag("event", motivo === "seguir" ? "invitacion_facebook_seguir" : "invitacion_facebook_cerrar");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[55] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[360px]">
      <div className="relative rounded-2xl border border-white/10 bg-[#10203A] p-4 pr-10 shadow-2xl">
        <button
          onClick={function () { cerrar("cerrar"); }}
          aria-label="Cerrar"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-lg text-[#8FA3BF] hover:bg-white/10 hover:text-white"
        >
          ×
        </button>
        <p className="text-base font-bold leading-snug text-[#FBF7EE]">
          📲 Los resultados te llegan solos a Facebook
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[#D5DEEA]">
          Loterías, MLB, LIDOM y NBA todas las mañanas, con resumen y video. Gratis.
        </p>
        <a
          href={ENLACE_FACEBOOK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={function () { cerrar("seguir"); }}
          className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#1464D8] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0F55B8]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.7V13h2.7v8h3.1z" />
          </svg>
          Seguir a La Bankera RD
        </a>
      </div>
    </div>
  );
}
