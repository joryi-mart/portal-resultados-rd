"use client";

import Image from "next/image";

export type JugadorDominicano = {
  id: number;
  nombre: string;
  posicion: string;
  equipo: string;
};

function iniciales(nombre: string) {
  const partes = nombre.trim().split(" ");
  const primera = partes[0]?.[0] || "";
  const ultima = partes[partes.length - 1]?.[0] || "";
  return (primera + ultima).toUpperCase();
}

export default function TarjetaJugadorDominicano({ jugador }: { jugador: JugadorDominicano }) {
  const urlWikipedia = "https://es.wikipedia.org/wiki/" + encodeURIComponent(jugador.nombre.replace(/ /g, "_"));
  return (
    <a
      href={urlWikipedia}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-[#10203A]/15 bg-white p-3 shadow-sm hover:shadow-md"
    >
      <div className="relative h-12 w-12 shrink-0">
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#1E4D8C]/10 font-mono text-xs font-bold text-[#1E4D8C]">
          {iniciales(jugador.nombre)}
        </div>
        <Image
          src={`https://midfield.mlbstatic.com/v1/people/${jugador.id}/spots/120`}
          alt={jugador.nombre}
          width={48}
          height={48}
          className="absolute inset-0 h-12 w-12 rounded-full object-cover"
          onError={function (e) {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#10203A]">{jugador.nombre}</p>
        <p className="truncate text-xs text-[#5C6B78]">
          {jugador.posicion} · {jugador.equipo}
        </p>
      </div>
    </a>
  );
}
