"use client";

import { useEffect } from "react";

export default function RegistrarServiceWorker() {
  useEffect(function () {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(function () {
        // Si falla el registro, el sitio sigue funcionando normal como web.
      });
    }
  }, []);

  return null;
}
