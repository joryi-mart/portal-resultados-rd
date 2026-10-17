const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

export function IconoCalculadora() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <rect x="4.5" y="2.5" width="15" height="19" rx="2.2" stroke="#007A33" strokeWidth="1.8" fill="#FBF7EE" />
      <rect x="7" y="5" width="10" height="3.5" rx="0.6" fill="#007A33" />
      {[0, 1, 2].map(function (fila) {
        return [0, 1, 2].map(function (col) {
          return (
            <rect
              key={fila + "-" + col}
              x={7 + col * 3.6}
              y={11 + fila * 3}
              width="2.2"
              height="2"
              rx="0.4"
              fill="#007A33"
            />
          );
        });
      })}
    </svg>
  );
}

export function IconoRegalo() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="9.5" width="17" height="10.5" rx="1.2" stroke="#B23B26" strokeWidth="1.8" fill="#FBF7EE" />
      <rect x="2.5" y="6" width="19" height="4" rx="1" stroke="#B23B26" strokeWidth="1.8" fill="#FBF7EE" />
      <line x1="12" y1="6" x2="12" y2="20" stroke="#B23B26" strokeWidth="1.8" />
      <path d="M12 6C12 6 9.5 1.5 7 3C5 4.2 7 6 12 6Z" stroke="#B23B26" strokeWidth="1.6" fill="#FBF7EE" />
      <path d="M12 6C12 6 14.5 1.5 17 3C19 4.2 17 6 12 6Z" stroke="#B23B26" strokeWidth="1.6" fill="#FBF7EE" />
    </svg>
  );
}

export function IconoBalanza() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <line x1="12" y1="3" x2="12" y2="19" stroke="#1E4D8C" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="5" y1="6.5" x2="19" y2="6.5" stroke="#1E4D8C" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="9" y1="19" x2="15" y2="19" stroke="#1E4D8C" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 6.5L2.5 11.5C2.5 13 4.1 14 5.5 14C6.9 14 8.5 13 8.5 11.5L5 6.5Z" stroke="#1E4D8C" strokeWidth="1.6" fill="#FBF7EE" />
      <path d="M19 6.5L16.5 11.5C16.5 13 18.1 14 19.5 14C20.9 14 22.5 13 22.5 11.5L19 6.5Z" stroke="#1E4D8C" strokeWidth="1.6" fill="#FBF7EE" />
    </svg>
  );
}

const TARJETAS = [
  { clave: "efemerides", href: "/efemerides", titulo: "Efeméride de hoy", descripcion: "Qué pasó un día como hoy en la historia de RD y el mundo" },
  { clave: "mlb", href: "/beisbol", titulo: "Béisbol MLB", descripcion: "Resultados y resumen de ayer en las Grandes Ligas" },
  { clave: "nba", href: "/nba", titulo: "Baloncesto NBA", descripcion: "Resultados y resumen de ayer en la NBA" },
  { clave: "turismo", href: "/turismo", titulo: "Turismo en RD", descripcion: "Un destino dominicano distinto para conocer cada día" },
];

export default function SeccionExplorar() {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">
        Más de La Bankera RD
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {TARJETAS.map(function (t) {
          return (
            <a
              key={t.clave}
              href={t.href}
              className="overflow-hidden rounded-xl border border-[#10203A]/12 bg-white shadow-[0_1px_3px_rgba(16,32,58,0.08)] transition hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/tarjeta-explorar/${t.clave}`}
                alt={t.titulo}
                className="aspect-[1.9/1] w-full object-cover"
              />
              <div className="px-4 py-3">
                <p className="font-[family-name:var(--font-display)] text-base font-bold text-[#10203A]">{t.titulo}</p>
                <p className="text-sm leading-snug" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{t.descripcion}</p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
