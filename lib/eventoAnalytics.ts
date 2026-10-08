"use client";

import { useEffect, useRef } from "react";

// Manda un evento propio a Google Analytics (ej. "calculadora_uso"). Si
// Analytics no cargo (bloqueador, /admin), no hace nada.
export function enviarEvento(nombre: string, parametros?: Record<string, string | number>) {
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (gtag) gtag("event", nombre, parametros);
}

// Cuenta un uso de la calculadora la primera vez que el resultado queda en
// pantalla al menos 1.5 s (para no contar cada tecla mientras se escribe el
// sueldo). Solo una vez por visita a la pagina.
export function useEventoAlCalcular(hayResultado: boolean, calculadora: string) {
  const yaContado = useRef(false);
  useEffect(function () {
    if (!hayResultado || yaContado.current) return;
    const temporizador = setTimeout(function () {
      yaContado.current = true;
      enviarEvento("calculadora_uso", { calculadora });
    }, 1500);
    return function () { clearTimeout(temporizador); };
  }, [hayResultado, calculadora]);
}
