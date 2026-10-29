"use client";

import NotificacionesPush from "./NotificacionesPush";
import { enviarEvento } from "@/lib/eventoAnalytics";

// Va justo debajo del resultado en las paginas de loteria, sorteo y fecha:
// ahi aterriza la gente que llega desde Google (casi nunca por la portada),
// y en octubre solo 17 de 421 visitantes volvieron. El boton de WhatsApp
// lleva el mensaje ya escrito con los numeros y el link de la pagina.
export default function CompartirYAvisos(props: { mensaje: string; tituloAviso: string; pagina: string }) {
  return (
    <div className="mt-6 flex flex-col gap-3">
      <a
        href={"https://wa.me/?text=" + encodeURIComponent(props.mensaje)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={function () { enviarEvento("compartir_whatsapp", { pagina: props.pagina }); }}
        className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#1F8F4E] px-5 text-base font-bold text-white hover:opacity-90"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3a.4.4 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z" />
        </svg>
        Compartir por WhatsApp
      </a>
      <NotificacionesPush className="m-0" titulo={props.tituloAviso} pagina={props.pagina} />
    </div>
  );
}
