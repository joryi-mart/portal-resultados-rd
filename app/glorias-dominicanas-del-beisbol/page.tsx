import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import NavPildoras from "../NavPildoras";
import PreguntasFrecuentes from "../PreguntasFrecuentes";
import TarjetaJugadorDominicano, { type JugadorDominicano } from "../TarjetaJugadorDominicano";
import { obtenerJugadoresDominicanosConEquipo } from "@/lib/beisbolDominicanos";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#5C6B78";
const COLOR_VERDE_PRESIDENTE = "#0A5C36";
const COLOR_DORADO = "#B97F16";

// Se revisa cada 6 horas: el mismo ritmo con el que se guarda en cache la
// lista de jugadores activos (equipos actuales cambian por trades, no todos los dias).
export const revalidate = 21600;

export const metadata = {
  title: "Glorias Dominicanas del Béisbol: leyendas y estrellas",
  description:
    "Las historias y logros en MLB y LIDOM de los grandes del béisbol dominicano: del Salón de la Fama (Marichal, Pedro Martínez, Guerrero, Ortiz, Beltré) a las leyendas históricas, los pioneros y las estrellas activas de hoy.",
  openGraph: {
    title: "Glorias Dominicanas del Béisbol",
    description: "Del Salón de la Fama a las estrellas activas: la historia completa del béisbol dominicano en la MLB.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/glorias-dominicanas-del-beisbol" },
};

type Jugador = { nombre: string; dato: string; texto: string };

const SALON_DE_LA_FAMA: Jugador[] = [
  {
    nombre: "Juan Marichal",
    dato: "\"El Dandy Dominicano\" · HOF 1983",
    texto:
      "Nacido en 1937 en Laguna Verde, fue el primer dominicano en llegar al Salón de la Fama de Cooperstown, en 1983. En 16 temporadas, la mayoría con los Gigantes de San Francisco, ganó 243 juegos y fue convocado a nueve Juegos de Estrellas, siempre reconocible por su llamativa patada alta al lanzar. En la LIDOM jugó con los Leones del Escogido de 1957 a 1973: fue Novato del Año en 1958-1959, Jugador Más Valioso en 1960-1961 y ganó tres campeonatos con el equipo.",
  },
  {
    nombre: "Pedro Martínez",
    dato: "El as de Manoguayabo · HOF 2015",
    texto:
      "Nacido en 1971 en Manoguayabo, es considerado uno de los mejores lanzadores de la historia. Ganó tres premios Cy Young, fue convocado a ocho Juegos de Estrellas y se coronó campeón de la Serie Mundial con los Medias Rojas de Boston en 2004. Cerró su carrera con 219 victorias, efectividad de 2.93 y 3,154 ponches. Entró al Salón de la Fama en 2015 con el 91.1% de los votos. En la LIDOM jugó con los Tigres del Licey, equipo que retiró su número 45 en su honor.",
  },
  {
    nombre: "Vladimir Guerrero Sr.",
    dato: "\"Vladi\" · HOF 2018",
    texto:
      "Nacido en 1975 en Nizao, Baní, jugó 16 temporadas en Grandes Ligas, la mayoría con los Expos de Montreal y los Angelinos. Terminó con un promedio de bateo de .318, el más alto entre todos los dominicanos en la historia de las Grandes Ligas, además de 449 jonrones y 2,590 hits. Entró al Salón de la Fama en 2018 con el 92.9% de los votos. En sus inicios jugó en la LIDOM con las Águilas Cibaeñas.",
  },
  {
    nombre: "David Ortiz",
    dato: "\"Big Papi\" · HOF 2022",
    texto:
      "Nacido en 1975 en Santo Domingo, se convirtió en el corazón de los Medias Rojas de Boston: tres títulos de Serie Mundial (2004, 2007 y 2013), diez Juegos de Estrellas y 541 jonrones en toda su carrera. En 2022 entró al Salón de la Fama siendo el único candidato elegido ese año. En la LIDOM jugó doce temporadas con los Leones del Escogido, de 1994 a 2006, y fue el Jugador Más Valioso de la liga en 1999-2000.",
  },
  {
    nombre: "Adrián Beltré",
    dato: "\"Don Adrián\" · HOF 2024",
    texto:
      "Nacido en 1979 en Santo Domingo, jugó 21 temporadas con los Dodgers, los Marineros, los Medias Rojas y los Rangers, acumulando más de 3,000 hits y más de 450 jonrones. En 2024 entró al Salón de la Fama con el 95.1% de los votos. En la LIDOM jugó con las Águilas Cibaeñas, las Estrellas Orientales y los Toros del Este; él mismo ha contado que, de poder elegir, se pondría la gorra del Licey para entrar a Cooperstown, por ser fanático del equipo desde niño, aunque nunca jugó ahí.",
  },
];

const LEYENDAS_HISTORICAS: Jugador[] = [
  {
    nombre: "Sammy Sosa",
    dato: "\"El Bambino del Caribe\"",
    texto:
      "Nacido en 1968 en San Pedro de Macorís, se convirtió en uno de los toleteros más poderosos del país: 609 jonrones con los Rangers, los Medias Blancas, los Cachorros y los Orioles. Su duelo de jonrones con Mark McGwire en 1998 lo hizo mundialmente famoso. Antes de debutar en Grandes Ligas en 1989, ya jugaba en la LIDOM: debutó con los Leones del Escogido en 1987 y jugó ocho temporadas con el equipo, ganando cuatro campeonatos. Todavía no ha sido elegido al Salón de la Fama de Cooperstown.",
  },
  {
    nombre: "Albert Pujols",
    dato: "703 jonrones",
    texto:
      "Nacido en 1980 en Santo Domingo, se mudó a Estados Unidos a los 16 años. En 22 temporadas con los Cardenales y los Angelinos conectó 703 jonrones, el cuarto máximo de la historia, y ganó tres premios MVP y dos Series Mundiales (2006 y 2011) con San Luis. Ya retirado como jugador, hoy dirige a los Leones del Escogido en la LIDOM, con quienes ganó el campeonato 2024-2025 y la Serie del Caribe 2025. Todavía no es elegible para el Salón de la Fama.",
  },
  {
    nombre: "Alex Rodríguez",
    dato: "696 jonrones",
    texto:
      "Nació en 1975 en Nueva York, hijo de padres dominicanos, y vivió parte de su infancia en República Dominicana antes de establecerse en Miami. En 22 temporadas con los Marineros, los Rangers y los Yankees conectó 696 jonrones y más de 3,115 hits. No ha sido elegido al Salón de la Fama, en parte por su relación con sustancias prohibidas, algo que él mismo reconoció públicamente.",
  },
  {
    nombre: "Manny Ramírez",
    dato: "555 jonrones",
    texto:
      "Nacido en 1972 en Santo Domingo, fue uno de los bateadores más temidos de su generación: 555 jonrones, promedio de .312 y dos títulos de Serie Mundial con Boston (2004 y 2007), siendo el Jugador Más Valioso de la del 2004. Tiene el récord de más jonrones en la historia de la postemporada, con 29. En la LIDOM jugó con las Águilas Cibaeñas en 2012-2013. No está en el Salón de la Fama, también por su relación con sustancias prohibidas.",
  },
];

const PIONEROS: Jugador[] = [
  {
    nombre: "Osvaldo Virgil",
    dato: "El primero, 1956",
    texto:
      "Nacido en 1932 en Monte Cristi, se convirtió el 23 de septiembre de 1956 en el primer dominicano en jugar en las Grandes Ligas, con los Gigantes de Nueva York. Jugó nueve temporadas con cinco equipos. Su debut abrió el camino para que, siete décadas después, más de 900 dominicanos hayan llegado a las Grandes Ligas, la mayor cantidad de cualquier país fuera de Estados Unidos. Falleció en 2024, a los 92 años, en su Monte Cristi natal.",
  },
  {
    nombre: "Felipe Alou",
    dato: "El primer mánager",
    texto:
      "Nacido en 1935 en Bajos de Haina, fue el primer dominicano en jugar de forma regular en las Grandes Ligas: 2,101 hits y tres Juegos de Estrellas en 18 temporadas. En 1992 se convirtió en el primer dirigente dominicano de la historia de la MLB, con los Expos de Montreal, y en 2006 fue el primer mánager latino en llegar a 1,000 victorias.",
  },
  {
    nombre: "Bartolo Colón",
    dato: "247 victorias",
    texto:
      "Nacido en 1973 en Altamira, Puerto Plata, jugó 21 temporadas y acumuló 247 victorias, la mayor cantidad de cualquier lanzador latinoamericano en la historia de la MLB. Ganó el Cy Young en 2005 con los Angelinos. En la LIDOM jugó doce temporadas con las Águilas Cibaeñas, ganando cinco campeonatos.",
  },
  {
    nombre: "Robinson Canó",
    dato: "335 jonrones",
    texto:
      "Nacido en 1982 en San Pedro de Macorís, jugó 17 temporadas con los Yankees, los Marineros, los Mets, los Padres y los Bravos, conectando 335 jonrones, el segundo más alto entre segundas bases en la historia de la MLB. En la LIDOM ha jugado con las Estrellas Orientales, el equipo de su ciudad natal. Fue suspendido dos veces por violar la política antidopaje de la MLB.",
  },
];

const ESTRELLAS_ACTIVAS: Jugador[] = [
  { nombre: "Juan Soto", dato: "LF · New York Mets", texto: "Campeón de la Serie Mundial en 2019 con los Nacionales; en 2024 firmó el contrato más grande en la historia del deporte profesional estadounidense." },
  { nombre: "José Ramírez", dato: "3B · Cleveland Guardians", texto: "Uno de los bateadores más completos de su generación, con varias convocatorias al Juego de Estrellas." },
  { nombre: "Vladimir Guerrero Jr.", dato: "1B · Toronto Blue Jays", texto: "Hijo de Vladimir Guerrero Sr.; nació en Montreal mientras su padre jugaba para los Expos. Campeón del Home Run Derby en 2023." },
  { nombre: "Fernando Tatis Jr.", dato: "RF · San Diego Padres", texto: "Una de las figuras más electrizantes de la MLB desde su debut en 2019." },
  { nombre: "Rafael Devers", dato: "1B · San Francisco Giants", texto: "Fue la cara de los Medias Rojas de Boston por casi una década antes de su cambio a San Francisco." },
  { nombre: "Manny Machado", dato: "3B · San Diego Padres", texto: "De ascendencia dominicana, nacido en Miami; una de las mejores terceras bases de su generación." },
  { nombre: "Ketel Marte", dato: "2B · Arizona Diamondbacks", texto: "Pieza clave de los Diamondbacks en su camino a la Serie Mundial de 2023." },
  { nombre: "Elly De La Cruz", dato: "SS · Cincinnati Reds", texto: "Uno de los jugadores más veloces y poderosos de la nueva generación." },
  { nombre: "Julio Rodríguez", dato: "CF · Seattle Mariners", texto: "Ganó el Novato del Año de la Liga Americana en 2022." },
  { nombre: "Willy Adames", dato: "SS · San Francisco Giants", texto: "Uno de los campocortos más consistentes de las Grandes Ligas." },
  { nombre: "Emmanuel Clase", dato: "P (cerrador) · Cleveland Guardians", texto: "Dos veces Relevista del Año de la Liga Americana, en 2022 y 2024." },
  { nombre: "Sandy Alcántara", dato: "P · Miami Marlins", texto: "Ganó el Cy Young de la Liga Nacional en 2022." },
];

function Categoria(props: { titulo: string; nota?: string; jugadores: Jugador[]; columnas?: string }) {
  return (
    <section className="mb-12">
      <h2 className="mb-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A] sm:text-3xl">
        {props.titulo}
      </h2>
      {props.nota ? <p className="mb-5 text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{props.nota}</p> : <div className="mb-5" />}
      <div className={"grid grid-cols-1 gap-4 " + (props.columnas || "md:grid-cols-2 xl:grid-cols-3")}>
        {props.jugadores.map(function (j) {
          return (
            <div key={j.nombre} className="rounded-xl border border-[#10203A]/15 bg-white p-5">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">{j.nombre}</h3>
              <p className="mb-2 font-mono text-xs font-bold uppercase tracking-wide" style={{ color: COLOR_DORADO }}>{j.dato}</p>
              <p className="text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{j.texto}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default async function GloriasDominicanasPage() {
  let jugadoresActivos: JugadorDominicano[] = [];
  try {
    jugadoresActivos = await obtenerJugadoresDominicanosConEquipo();
  } catch {
    jugadoresActivos = [];
  }

  const datosEstructurados = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: metadata.title,
    description: metadata.description,
    inLanguage: "es-DO",
    publisher: { "@type": "Organization", name: "La Bankera RD" },
  };

  return (
    <div className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }} />
      <NavPildoras />
      <header className="bg-[#10203A] px-4 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-5xl">
            Glorias Dominicanas del Béisbol
          </h1>
          <p className="mt-2 font-mono text-sm font-extrabold uppercase tracking-wide text-[#E7A63C] sm:text-base">
            Página informativa no oficial de béisbol
          </p>
          <p className="mt-3 max-w-3xl text-sm text-[#D5DEEA] sm:text-base">
            Del Salón de la Fama a las estrellas que hoy están haciendo historia: el legado dominicano en las Grandes Ligas.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className="mb-10 flex flex-wrap gap-3">
          <a href="/beisbol" className="inline-flex items-center gap-2 rounded-full border border-[#E7A63C]/40 bg-[#E7A63C]/10 px-4 py-2 text-sm font-semibold text-[#10203A] hover:bg-[#E7A63C]/20">⚾ Ver la MLB de hoy</a>
          <a href="/lidom" className="inline-flex items-center gap-2 rounded-full border border-[#E7A63C]/40 bg-[#E7A63C]/10 px-4 py-2 text-sm font-semibold text-[#10203A] hover:bg-[#E7A63C]/20">⚾ LIDOM en vivo</a>
        </div>

        <p className="mb-12 max-w-4xl text-base leading-relaxed">
          República Dominicana, con apenas unos 11 millones de habitantes, es una de las naciones que más peloteros de élite ha dado a las Grandes Ligas: más de 900 desde el debut de Osvaldo Virgil en 1956. Muchos empezaron jugando pelota invernal en la LIDOM antes de convertirse en estrellas en Estados Unidos. Estas son sus historias, organizadas del Salón de la Fama a la nueva generación que juega hoy.
        </p>

        <Categoria
          titulo="Miembros del Salón de la Fama"
          nota="Los cinco dominicanos exaltados a Cooperstown, en orden de su ingreso."
          jugadores={SALON_DE_LA_FAMA}
        />

        <Categoria
          titulo="Leyendas Históricas"
          nota="Números de Salón de la Fama, sin estar (todavía o nunca) exaltados a Cooperstown."
          jugadores={LEYENDAS_HISTORICAS}
        />

        <Categoria
          titulo="Pioneros y Menciones de Honor"
          nota="Los que abrieron camino, dentro y fuera del terreno."
          jugadores={PIONEROS}
        />

        <Categoria
          titulo="Estrellas Activas: haciendo historia hoy"
          nota="La generación que hoy es noticia en las Grandes Ligas."
          jugadores={ESTRELLAS_ACTIVAS}
          columnas="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        />

        {jugadoresActivos.length > 0 ? (
          <section className="mb-12">
            <h2 className="mb-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A] sm:text-3xl">
              La nueva generación: todos los dominicanos activos
            </h2>
            <p className="mb-5 text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
              {jugadoresActivos.length} jugadores dominicanos activos en la MLB esta temporada.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {jugadoresActivos.map(function (j) {
                return <TarjetaJugadorDominicano key={j.id} jugador={j} />;
              })}
            </div>
          </section>
        ) : null}

        <div className="mb-12 rounded-xl p-5" style={{ backgroundColor: COLOR_VERDE_PRESIDENTE }}>
          <p className="text-sm leading-relaxed text-white/90">
            Esta es una guía informativa sobre la historia del béisbol dominicano, no oficial de la MLB, la LIDOM ni de ningún equipo. Las estadísticas corresponden a la carrera completa de cada pelotero en Grandes Ligas hasta la fecha, y pueden variar levemente según la fuente consultada.
          </p>
        </div>
      </main>

      <PreguntasFrecuentes
        preguntas={[
          {
            pregunta: "¿Cuántos dominicanos hay en el Salón de la Fama del Béisbol?",
            respuesta: "Hasta ahora, cinco: Juan Marichal (1983), Pedro Martínez (2015), Vladimir Guerrero Sr. (2018), David Ortiz (2022) y Adrián Beltré (2024).",
          },
          {
            pregunta: "¿Por qué Sammy Sosa, Manny Ramírez y Alex Rodríguez no están en el Salón de la Fama?",
            respuesta: "Aunque tienen números de Salón de la Fama, su relación con sustancias prohibidas ha hecho que los electores del Salón de la Fama no los hayan elegido hasta ahora.",
          },
          {
            pregunta: "¿Quién fue el primer dominicano en jugar en las Grandes Ligas?",
            respuesta: "Osvaldo Virgil, que debutó con los Gigantes de Nueva York el 23 de septiembre de 1956.",
          },
          {
            pregunta: "¿Todos jugaron en la LIDOM?",
            respuesta: "La gran mayoría sí, en algún momento de su carrera, antes o durante su paso por las Grandes Ligas. Algunos con raíces dominicanas pero nacidos en Estados Unidos o Canadá, como Alex Rodríguez o Vladimir Guerrero Jr., tuvieron un camino distinto.",
          },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-8">
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-bold text-[#10203A]">Más de béisbol</h2>
        <ul className="flex flex-col gap-1.5 text-sm">
          <li><a href="/beisbol" className="underline" style={{ color: COLOR_AZUL }}>Béisbol y MLB hoy</a></li>
          <li><a href="/como-funciona-la-lidom" className="underline" style={{ color: COLOR_AZUL }}>Cómo funciona la LIDOM</a></li>
          <li><a href="/equipos-de-la-lidom" className="underline" style={{ color: COLOR_AZUL }}>Los 6 equipos de la LIDOM</a></li>
          <li><a href="/reglas-basicas-del-beisbol" className="underline" style={{ color: COLOR_AZUL }}>Reglas básicas del béisbol</a></li>
        </ul>
      </section>

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <a href="/" className="font-mono text-sm text-[#1E4D8C] hover:underline">← Volver a La Bankera RD</a>
      </footer>
    </div>
  );
}
