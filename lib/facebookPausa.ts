// Interruptor de las publicaciones automaticas en Facebook.
// true = no se publica NADA en la pagina de Facebook (loterias, deportes,
// reels, historias, efemerides, datos, calculadora, feriados, informe, foto
// de perfil). Lo pidio el dueno el 10-nov-2026. Las notificaciones push de la
// web NO se apagan. Para volver a publicar: poner false y subir el cambio.
export const FACEBOOK_PAUSADO = true;

export function respuestaFacebookPausado() {
  return Response.json({ ok: true, pausado: true, mensaje: "Publicaciones de Facebook en pausa (lib/facebookPausa.ts)" });
}
