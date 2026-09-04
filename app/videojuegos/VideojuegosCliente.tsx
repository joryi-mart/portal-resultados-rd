"use client";

import { useEffect, useState } from "react";
import NavPildoras from "../NavPildoras";

type Noticia = {
  id: string;
  title: string;
  url: string;
  image: string;
  published: string;
};

export default function VideojuegosCliente() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(function () {
    fetch("/api/videojuegos")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.detalle || data.error);
          return;
        }
        setNoticias(data.noticias?.news || []);
      })
      .catch(() => setError("No se pudo cargar la información"))
      .finally(() => setCargando(false));
  }, []);

  function renderNoticia(noticia: Noticia) {
    const abrirEnlace = function () {
      window.open(noticia.url, "_blank", "noopener,noreferrer");
    };
    return (
      <div
        key={noticia.id}
        onClick={abrirEnlace}
        className="flex cursor-pointer gap-3 overflow-hidden rounded-xl border border-[#10203A]/15 bg-white p-3 shadow-sm hover:shadow-md"
      >
        {noticia.image ? (
          <img
            src={noticia.image}
            alt=""
            className="h-24 w-24 shrink-0 rounded-lg bg-[#10203A]/5 object-cover"
            onError={function (e) {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
        <div className="min-w-0">
          <p className="line-clamp-3 text-sm font-semibold text-[#10203A]">{noticia.title}</p>
          <p className="mt-1 text-xs text-[#5C6B78]">
            {noticia.published ? new Date(noticia.published).toLocaleDateString("es-DO") : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7EE]">
      <NavPildoras />
      <div className="px-4 py-8 sm:px-8">
        <h1 className="mb-2 text-2xl font-bold text-[#10203A]">🎮 Videojuegos</h1>
        <p className="mb-6 rounded-lg bg-[#1E4D8C]/5 p-3 text-xs text-[#5C6B78]">
          Últimas noticias del mundo de los videojuegos: consolas, lanzamientos y esports.
        </p>

        {cargando && (
          <p className="font-mono text-sm text-[#5C6B78]">Cargando noticias...</p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>
        )}

        {!cargando && !error && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {noticias.map(renderNoticia)}
            {noticias.length === 0 && (
              <p className="text-sm text-[#5C6B78]">No hay noticias disponibles por ahora.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
