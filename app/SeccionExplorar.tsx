const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";

function IconoFondo({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: color + "1A" }}
    >
      {children}
    </div>
  );
}

function IconoEfemerides() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="#1E4D8C" strokeWidth="1.8" />
      <line x1="3" y1="9.5" x2="21" y2="9.5" stroke="#1E4D8C" strokeWidth="1.8" />
      <line x1="7.5" y1="2.5" x2="7.5" y2="6.5" stroke="#E7A63C" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="16.5" y1="2.5" x2="16.5" y2="6.5" stroke="#E7A63C" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="7" y="12.5" width="4" height="4" rx="0.8" fill="#E7A63C" />
    </svg>
  );
}

function IconoBeisbol() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#B23B26" strokeWidth="1.8" fill="#FBF7EE" />
      <path d="M7 4.5C8.5 7 8.5 17 7 19.5" stroke="#B23B26" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M17 4.5C15.5 7 15.5 17 17 19.5" stroke="#B23B26" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconoBaloncesto() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#E7A63C" strokeWidth="1.8" fill="#FBF7EE" />
      <line x1="12" y1="3" x2="12" y2="21" stroke="#E7A63C" strokeWidth="1.3" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="#E7A63C" strokeWidth="1.3" />
      <path d="M4.5 6.5C7.5 9 16.5 9 19.5 6.5" stroke="#E7A63C" strokeWidth="1.3" />
      <path d="M4.5 17.5C7.5 15 16.5 15 19.5 17.5" stroke="#E7A63C" strokeWidth="1.3" />
    </svg>
  );
}

function IconoTurismo() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <circle cx="17" cy="6" r="2.6" fill="#E7A63C" />
      <path d="M2.5 18C7 12.5 8.5 10.5 11 10.5C12.6 10.5 13 11.8 12 12.8C10.7 14.1 9 13 10.5 11.3C12.5 9 16 8.5 20.5 13" stroke="#007A33" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <line x1="2" y1="20.5" x2="22" y2="20.5" stroke="#1E4D8C" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

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
  {
    clave: "efemerides",
    href: "/efemerides",
    color: COLOR_AZUL,
    icono: <IconoEfemerides />,
    titulo: "Efeméride de hoy",
    descripcion: "Qué pasó un día como hoy en la historia de RD y el mundo",
  },
  {
    clave: "mlb",
    href: "/beisbol",
    color: "#B23B26",
    icono: <IconoBeisbol />,
    titulo: "Béisbol MLB",
    descripcion: "Resultados y resumen de ayer en las Grandes Ligas",
  },
  {
    clave: "nba",
    href: "/nba",
    color: "#E7A63C",
    icono: <IconoBaloncesto />,
    titulo: "Baloncesto NBA",
    descripcion: "Resultados y resumen de ayer en la NBA",
  },
  {
    clave: "turismo",
    href: "/turismo",
    color: "#007A33",
    icono: <IconoTurismo />,
    titulo: "Turismo en RD",
    descripcion: "Un destino dominicano distinto para conocer cada día",
  },
];

type TarjetasGeneradas = Record<string, { url?: string } | string | undefined>;

async function leerTarjetasGeneradas(): Promise<TarjetasGeneradas> {
  try {
    const res = await fetch("https://labankerard.com/tarjetas-explorar.json", { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

function diasDesde(fechaISO: string) {
  const hoyRD = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const a = new Date(hoyRD + "T00:00:00");
  const b = new Date(fechaISO + "T00:00:00");
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function SeccionExplorar() {
  const generadas = await leerTarjetasGeneradas();
  const fecha = typeof generadas.fecha === "string" ? generadas.fecha : null;
  // Imagen generada solo si es de hoy o ayer; si no, se usa el icono normal
  // (evita mostrar, por ejemplo, el destino de turismo de hace una semana).
  const vigente = fecha !== null && diasDesde(fecha) <= 1;

  return (
    <section className="mb-8">
      <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">
        Más de La Bankera RD
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {TARJETAS.map(function (t) {
          const dato = generadas[t.clave];
          const urlImagen = vigente && dato && typeof dato === "object" ? dato.url : null;
          return (
            <a
              key={t.clave}
              href={t.href}
              className="flex items-center gap-4 rounded-xl border border-[#10203A]/12 bg-white px-4 py-4 shadow-[0_1px_3px_rgba(16,32,58,0.08)] transition hover:shadow-md"
            >
              {urlImagen ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={urlImagen}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <IconoFondo color={t.color}>{t.icono}</IconoFondo>
              )}
              <div className="min-w-0">
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
