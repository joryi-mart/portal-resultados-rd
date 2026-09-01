"use client";

import { useEffect, useState } from "react";
import NavPildoras from "../NavPildoras";
import Image from "next/image";

type Pelicula = {
  id: number;
  titulo: string;
  sinopsis: string;
  poster: string;
  calificacion: string;
  fechaEstreno: string;
};

type Categoria = "enCartelera" | "proximosEstrenos" | "populares";

const SECCIONES: { id: Categoria; nombre: string }[] = [
  { id: "enCartelera", nombre: "En cartelera" },
  { id: "proximosEstrenos", nombre: "Próximos estrenos" },
  { id: "populares", nombre: "Populares" },
];

export default function CinePage() {
  const [datos, setDatos] = useState<Record<Categoria, Pelicula[]>>({
    enCartelera: [],
    proximosEstrenos: [],
    populares: [],
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(function () {
    fetch("/api/cine")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.detalle || data.error);
          return;
        }
        setDatos({
          enCartelera: data.enCartelera || [],
          proximosEstrenos: data.proximosEstrenos || [],
          populares: data.populares || [],
        });
      })
      .catch(() => setError("No se pudo cargar la información"))
      .finally(() => setCargando(false));
  }, []);

  function formatearFecha(fecha: string) {
    if (!fecha) return "";
    try {
      return new Date(fecha + "T00:00:00").toLocaleDateString("es-DO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return fecha;
    }
  }

  function renderPelicula(pelicula: Pelicula) {
    return (
      <div
        key={pelicula.id}
        className="overflow-hidden rounded-xl border border-[#10203A]/15 bg-white shadow-sm"
      >
        {pelicula.poster ? (
          <div className="relative aspect-[2/3] w-full">
            <Image
              src={pelicula.poster}
              alt={pelicula.titulo}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[2/3] w-full items-center justify-center bg-[#10203A]/5 text-sm text-[#5C6B78]">
            Sin imagen
          </div>
        )}
        <div className="p-3">
          <p className="mb-1 text-sm font-semibold text-[#10203A]">{pelicula.titulo}</p>
          <div className="mb-2 flex items-center gap-2 text-xs text-[#5C6B78]">
            <span>⭐ {pelicula.calificacion}</span>
            {pelicula.fechaEstreno ? <span>· {formatearFecha(pelicula.fechaEstreno)}</span> : null}
          </div>
          <p className="line-clamp-3 text-xs text-[#5C6B78]">{pelicula.sinopsis || "Sin sinopsis disponible."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7EE]">
      <NavPildoras />
      <div className="px-4 py-8 sm:px-8">
        <h1 className="mb-2 text-2xl font-bold text-[#10203A]">🎬 Cine</h1>

        <p className="mb-6 rounded-lg bg-[#1E4D8C]/5 p-3 text-xs text-[#5C6B78]">
          Afiches, sinopsis y calificación de películas en cartelera, próximos estrenos y populares. Todavía no tenemos horarios ni salas específicas de cines dominicanos — esa información no tiene una fuente gratis disponible por ahora.
        </p>

        {cargando && (
          <p className="font-mono text-sm text-[#5C6B78]">Cargando películas...</p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>
        )}

        {!cargando && !error && SECCIONES.map(function (seccion) {
          const peliculas = datos[seccion.id];
          return (
            <section key={seccion.id} className="mb-10">
              <h2 className="mb-4 text-lg font-semibold text-[#10203A]">{seccion.nombre}</h2>
              {peliculas.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {peliculas.map(renderPelicula)}
                </div>
              ) : (
                <p className="text-sm text-[#5C6B78]">No hay películas disponibles en esta sección.</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}