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
        "mx-auto mt-4 flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-sm font-semibold transition " +
        (yaDioLike
          ? "border-[#E7A63C] bg-[#E7A63C]/10 text-[#E7A63C]"
          : "border-[#10203A]/20 text-[#10203A] hover:bg-[#10203A]/5")
      }
    >
      <span>{yaDioLike ? "⭐" : "☆"}</span>
      <span>{yaDioLike ? "¡Gracias por tu apoyo!" : "¿Te gusta el sitio?"}</span>
      {total !== null ? <span className="text-xs text-[#5C6B78]">({total})</span> : null}
    </button>
  );
}
