"use client";

import { useEffect, useState } from "react";

const CLAVE_LOCAL = "labankera_ya_dio_like";

export default function EstrellaMeGusta() {
  const [total, setTotal] = useState<number | null>(null);
  const [yaDioLike, setYaDioLike] = useState(false);

  useEffect(function () {
    fetch("/api/like")
      .then(function (r) { return r.json(); })
      .then(function (d) { setTotal(d.total); })
      .catch(function () {});

    try {
      setYaDioLike(localStorage.getItem(CLAVE_LOCAL) === "1");
    } catch {
      // localStorage puede no estar disponible; no pasa nada, solo no recordamos el clic.
    }
  }, []);

  function darLike() {
    if (yaDioLike) return;
    setYaDioLike(true);
    setTotal(function (t) { return (t || 0) + 1; });
    try {
      localStorage.setItem(CLAVE_LOCAL, "1");
    } catch {}
    fetch("/api/like", { method: "POST" }).catch(function () {});
  }

  return (
    <button
      onClick={darLike}
      disabled={yaDioLike}
      className={
        "fixed bottom-5 left-5 z-50 flex items-center gap-1.5 rounded-full border px-3 py-2.5 font-mono text-sm font-semibold shadow-lg transition " +
        (yaDioLike
          ? "border-[#E7A63C] bg-[#E7A63C] text-white"
          : "border-[#10203A]/15 bg-white text-[#10203A] hover:bg-[#FBF7EE]")
      }
    >
      <span>{yaDioLike ? "⭐" : "☆"}</span>
      <span className="hidden sm:inline">{yaDioLike ? "¡Gracias!" : "¿Te gusta?"}</span>
      {total !== null ? <span className="text-xs opacity-80">({total})</span> : null}
    </button>
  );
}
