// Franja al pie de todas las paginas con enlaces a la pagina principal de cada
// loteria. Asi Google ve que /leidsa, /nacional, etc. son las paginas mas
// importantes del sitio (antes solo las enlazaba /loterias).

const LOTERIAS = [
  { slug: "nacional", nombre: "Lotería Nacional" },
  { slug: "leidsa", nombre: "Leidsa" },
  { slug: "loteka", nombre: "Loteka" },
  { slug: "real", nombre: "Lotería Real" },
  { slug: "la-primera", nombre: "La Primera" },
  { slug: "la-suerte", nombre: "La Suerte" },
  { slug: "lotedom", nombre: "Lotedom" },
  { slug: "anguila", nombre: "Anguila" },
  { slug: "florida", nombre: "Florida" },
  { slug: "new-york", nombre: "New York" },
  { slug: "powerball", nombre: "Powerball" },
  { slug: "mega-millions", nombre: "Mega Millions" },
];

export default function PieLoterias() {
  return (
    <nav aria-label="Resultados por lotería" className="mt-auto border-t border-[#10203A]/10 bg-white px-6 py-6 sm:px-10">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-3 text-base font-bold text-[#10203A]">Resultados de loterías de hoy</p>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {LOTERIAS.map(function (l) {
            return (
              <li key={l.slug}>
                <a href={"/" + l.slug} className="text-base font-semibold text-[#1E4D8C] hover:underline">
                  {l.nombre}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
