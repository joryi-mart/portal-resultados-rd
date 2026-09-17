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

export default function NotificacionesPush() {
  const [estado, setEstado] = useState<"cargando" | "no-soportado" | "puede-activar" | "activado" | "bloqueado">("cargando");

  useEffect(function () {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setEstado("no-soportado");
      return;
    }
    if (Notification.permission === "denied") {
      setEstado("bloqueado");
      return;
    }
    navigator.serviceWorker.ready.then(function (registro) {
      registro.pushManager.getSubscription().then(function (suscripcion) {
        setEstado(suscripcion ? "activado" : "puede-activar");
      });
    });
  }, []);

  async function activarNotificaciones() {
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        setEstado(permiso === "denied" ? "bloqueado" : "puede-activar");
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

      setEstado("activado");
    } catch {
      setEstado("puede-activar");
    }
  }

  if (estado === "cargando" || estado === "no-soportado") return null;

  return (
    <button
      onClick={estado === "puede-activar" ? activarNotificaciones : undefined}
      disabled={estado !== "puede-activar"}
      className="mb-8 flex w-full items-center justify-between rounded-xl border border-[#10203A]/12 bg-white px-5 py-4 text-left shadow-[0_1px_3px_rgba(16,32,58,0.08)] transition hover:shadow-md disabled:cursor-default"
    >
      <div>
        <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">
          {estado === "activado" ? "Ya recibes notificaciones" : estado === "bloqueado" ? "Notificaciones bloqueadas" : "Avísame cuando salga un resultado"}
        </p>
        <p className="font-mono text-xs text-[#5C6B78]">
          {estado === "activado"
            ? "Te avisaremos apenas salga un resultado nuevo"
            : estado === "bloqueado"
              ? "Actívalas desde la configuración de tu navegador"
              : "Recibe un aviso en tu teléfono, sin tener que revisar"}
        </p>
      </div>
      {estado === "puede-activar" ? (
        <span className="font-mono text-sm font-semibold text-[#007A33]">Activar →</span>
      ) : estado === "activado" ? (
        <span className="text-2xl">🔔</span>
      ) : null}
    </button>
  );
}
