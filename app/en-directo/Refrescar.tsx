"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Vuelve a pedir la pagina cada minuto (sin recargar todo) para que los
// resultados nuevos aparezcan solos mientras la persona la tiene abierta.
export default function Refrescar() {
  const router = useRouter();
  useEffect(function () {
    const id = setInterval(function () {
      if (document.visibilityState === "visible") router.refresh();
    }, 60 * 1000);
    return function () { clearInterval(id); };
  }, [router]);
  return null;
}
