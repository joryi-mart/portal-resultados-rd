// lib/pushNotificaciones.js
// Envia notificaciones push a todos los que se suscribieron, usando las
// claves VAPID. Si una suscripcion ya no es valida (el navegador la borro,
// el usuario desinstalo la app, etc.), se elimina de la base de datos.

import webpush from "web-push";
import { supabase } from "@/lib/supabase";

function configurarWebPush() {
  webpush.setVapidDetails(
    "mailto:contacto@labankerard.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function enviarNotificacionATodos(payload) {
  configurarWebPush();

  const { data: suscripciones, error } = await supabase
    .from("suscripciones_push")
    .select("id, endpoint, p256dh, auth");

  if (error) throw new Error(error.message);
  if (!suscripciones || suscripciones.length === 0) return { enviadas: 0, eliminadas: 0 };

  let enviadas = 0;
  let eliminadas = 0;

  for (const s of suscripciones) {
    const suscripcion = {
      endpoint: s.endpoint,
      keys: { p256dh: s.p256dh, auth: s.auth },
    };
    try {
      await webpush.sendNotification(suscripcion, JSON.stringify(payload));
      enviadas++;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await supabase.from("suscripciones_push").delete().eq("id", s.id);
        eliminadas++;
      }
    }
  }

  return { enviadas, eliminadas };
}
