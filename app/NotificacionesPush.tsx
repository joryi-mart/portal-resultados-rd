"use client";

import { useEffect, useState } from "react";

function base64UrlAUint8Array(base64Url: string) {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const salida = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) salida[i] = raw.charCodeAt(i);
  return salida;
}

const CLAVE_OCULTO = "aviso-notificaciones-oculto-hasta";
const DIAS_OCULTO = 7;

function estaOculto() {
  try {
    const hasta = Number(localStorage.getItem(CLAVE_OCULTO) || 0);
    return hasta > Date.now();
  } catch {
    return false;
  }
}

// Tarjeta que invita a activar los avisos. Solo aparece si el telefono lo permite
// y la persona todavia no los tiene activados; si toca "Ahora no" no vuelve a
// salir por una semana.
export default function NotificacionesPush(props: { className?: string }) {
  const [estado, setEstado] = useState<"cargando" | "oculto" | "puede-activar">("cargando");

  useEffect(function () {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window) || Notification.permission === "denied" || estaOculto()) {
      setEstado("oculto");
      return;
    }
    navigator.serviceWorker.ready.then(function (registro) {
      registro.pushManager.getSubscription().then(function (suscripcion) {
        setEstado(suscripcion ? "oculto" : "puede-activar");
      });
    });
  }, []);

  function ocultarPorUnaSemana() {
    try {
      localStorage.setItem(CLAVE_OCULTO, String(Date.now() + DIAS_OCULTO * 24 * 60 * 60 * 1000));
    } catch {}
    setEstado("oculto");
  }

  async function activarNotificaciones() {
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        ocultarPorUnaSemana();
        return;
      }
      const registro = await navigator.serviceWorker.ready;
      const clavePublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
      const suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlAUint8Array(clavePublica),
      });

      await fetch("/api/push/suscribir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(suscripcion.toJSON()),
      });

      setEstado("oculto");
    } catch {
      setEstado("puede-activar");
    }
  }

  if (estado !== "puede-activar") return null;

  return (
    <div role="region" aria-label="Activar avisos" className={(props.className || "m-4") + " rounded-2xl border border-[#E7A63C]/50 bg-[#0A1830] p-4 shadow-[0_10px_30px_rgba(10,24,48,0.25)]"}>
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none" aria-hidden="true">🔔</span>
        <div className="min-w-0 flex-1">
          <p className="font-[family-name:var(--font-display)] text-base font-bold text-[#FBF7EE]">¿Quieres saber cuándo sale tu lotería?</p>
          <p className="mt-1 text-sm leading-snug text-[#C9D6E8]">Te avisamos apenas salga el resultado, en tu teléfono o en tu computadora. Gratis, y lo puedes quitar cuando quieras.</p>
        </div>
        <button type="button" onClick={ocultarPorUnaSemana} aria-label="Cerrar" className="-mt-1 px-1 text-xl leading-none text-[#C9D6E8] hover:text-white">×</button>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={activarNotificaciones} className="flex-1 rounded-full bg-[#E7A63C] px-4 py-2.5 sm:flex-none sm:px-8 text-sm font-extrabold text-[#0A1830] hover:brightness-110">Sí, avísame</button>
        <button type="button" onClick={ocultarPorUnaSemana} className="rounded-full bg-white/10 px-4 py-2.5 text-sm font-extrabold text-[#FBF7EE] hover:bg-white/20">Ahora no</button>
      </div>
    </div>
  );
}
