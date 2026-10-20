import { datosEfemerides, datosDeporte, datosTurismo } from "@/lib/datosTarjetasExplorar";

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

const CARDS = [
  { clave: "efemerides", href: "/efemerides" },
  { clave: "mlb", href: "/beisbol" },
  { clave: "nba", href: "/nba" },
  { clave: "turismo", href: "/turismo" },
] as const;

export default async function SeccionExplorar() {
  // Mismos datos reales que ya usa la imagen de cada tarjeta, para que el
  // texto de abajo (el que Google SÍ puede leer) diga lo mismo que se ve en
  // la foto, no un texto genérico fijo.
  const [efemerides, mlb, nba, turismo] = await Promise.all([
    datosEfemerides(),
    datosDeporte("mlb"),
    datosDeporte("nba"),
    datosTurismo(),
  ]);

  const textos: Record<string, { titulo: string; subtitulo: string }> = { efemerides, mlb, nba, turismo };

  return (
    <section className="mb-8">
      <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">
        Más de La Bankera RD
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {CARDS.map(function (c) {
          const t = textos[c.clave];
          return (
            <a
              key={c.clave}
              href={c.href}
              className="overflow-hidden rounded-xl border border-[#10203A]/12 bg-white shadow-[0_1px_3px_rgba(16,32,58,0.08)] transition hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/tarjeta-explorar/${c.clave}`}
                alt={t.titulo}
                className="aspect-[1.9/1] w-full object-cover"
              />
              <div className="px-4 py-3">
                <p className="font-[family-name:var(--font-display)] text-base font-bold text-[#10203A]">{t.titulo}</p>
                <p className="text-sm leading-snug" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{t.subtitulo}</p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
