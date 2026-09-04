export type JugadorFamoso = { nombre: string; bio: string };

export type HistoriaEquipo = {
  fundado: string;
  estadio: string;
  titulos: string;
  resumen: string;
  famosos: JugadorFamoso[];
  instagram: string;
  x: string;
  foto: { url: string; autor: string; licencia: string } | null;
  color: string;
};

export const HISTORIAS_LIDOM: Record<string, HistoriaEquipo> = {
  "672": {
    fundado: "7 de noviembre de 1907",
    estadio: "Quisqueya Juan Marichal (Santo Domingo, compartido con Escogido)",
    titulos: "23 títulos nacionales · 11 Series del Caribe",
    resumen:
      "Conocidos como \"El Glorioso\", los Tigres del Licey son el equipo más laureado de la LIDOM y uno de los más ganadores del béisbol mundial. Fueron el primer campeón de la liga en 1951 y el primer representante dominicano en ganar una Serie del Caribe, en 1971.",
    famosos: [
      { nombre: "Pedro Martínez", bio: "Uno de los mejores pitchers de la historia de las Grandes Ligas, ganador de 3 premios Cy Young e inducido al Salón de la Fama en 2015." },
      { nombre: "Vladimir Guerrero", bio: "Jardinero derecho legendario, MVP de la Liga Americana en 2004, famoso por su swing libre y su brazo de cañón. Salón de la Fama en 2018." },
      { nombre: "Manny Mota", bio: "El mejor bateador emergente de su época, retirado como el líder histórico de hits de emergente en Grandes Ligas, con más de 20 temporadas en el béisbol." },
      { nombre: "Julio Franco", bio: "Infielder conocido por su carrera extraordinariamente larga, jugando en Grandes Ligas hasta los 48 años. Campeón de bateo en 1991." },
    ],
    instagram: "tigresdellicey",
    x: "TigresdelLicey",
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Estadio_quisqueya_santo_domingo_dominican_republic_1.jpg",
      autor: "Calt2001",
      licencia: "CC0",
    },
    color: "#0047AB",
  },
  "667": {
    fundado: "2 de enero de 1933",
    estadio: "Estadio Cibao (Santiago), el más grande del país",
    titulos: "22 títulos nacionales · 6 Series del Caribe",
    resumen:
      "Las Águilas Cibaeñas nacieron como Santiago Baseball Club y adoptaron su nombre actual en 1937. Representan a la región del Cibao y mantienen una de las rivalidades más intensas del béisbol dominicano frente al Licey.",
    famosos: [
      { nombre: "Bartolo Colón", bio: "Pitcher veterano ganador del Cy Young en 2005, jugó en Grandes Ligas hasta los 45 años y se hizo viral por conectar su primer jonrón en las Mayores a los 42." },
      { nombre: "Edwin Encarnación", bio: "Bateador poderoso, superó los 30 jonrones en varias temporadas con Toronto, conocido por su icónico festejo de \"el loro\" al conectar cuadrangulares." },
      { nombre: "Carlos Gómez", bio: "Jardinero central All-Star, reconocido tanto por su velocidad y defensa como por su poder ofensivo con Milwaukee y Houston." },
      { nombre: "Dellin Betances", bio: "Relevista dominante de los Yankees de Nueva York, varias veces All-Star, con una de las tasas de ponches más altas de su época." },
    ],
    instagram: "aguilasbbc",
    x: "aguilascibaenas",
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/07/Estadio_Cibao_Drone.jpg",
      autor: "ThePapo309",
      licencia: "CC BY-SA 4.0",
    },
    color: "#C9971A",
  },
  "671": {
    fundado: "17 de febrero de 1921",
    estadio: "Quisqueya Juan Marichal (Santo Domingo, compartido con Licey)",
    titulos: "18 títulos nacionales · 5 Series del Caribe",
    resumen:
      "Los Leones del Escogido surgieron de la unión de varios equipos capitalinos para hacerle frente al dominio del Licey. Comparten estadio con su archirrival y han tenido varias dinastías, incluyendo cuatro títulos entre 2009-10 y 2015-16.",
    famosos: [
      { nombre: "Juan Marichal", bio: "El \"Dandy Dominicano\", primer dominicano en el Salón de la Fama (1983), famoso por su inconfundible patada alta al lanzar." },
      { nombre: "David Ortiz", bio: "\"Big Papi\", bateador designado icónico de los Red Sox, 3 veces campeón de Serie Mundial e inducido al Salón de la Fama en 2022." },
      { nombre: "Sammy Sosa", bio: "Uno de los sluggers más queridos de RD, protagonista de la histórica carrera de jonrones de 1998 y con 609 cuadrangulares en su carrera." },
      { nombre: "Los hermanos Alou", bio: "Felipe, Mateo y Jesús Alou formaron el único trío de hermanos que ha jugado junto en el mismo jardín de un equipo de Grandes Ligas (Gigantes, 1963)." },
    ],
    instagram: "escogidobbclub",
    x: "EscogidoDRTeam",
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Estadio_quisqueya_santo_domingo_dominican_republic_1.jpg",
      autor: "Calt2001",
      licencia: "CC0",
    },
    color: "#C8102E",
  },
  "669": {
    fundado: "15 de diciembre de 1910",
    estadio: "Estadio Tetelo Vargas (San Pedro de Macorís)",
    titulos: "4 títulos nacionales (1936, 1954, 1967-68, 2018-19)",
    resumen:
      "Las Estrellas Orientales representan a San Pedro de Macorís, ciudad conocida por producir una enorme cantidad de peloteros de Grandes Ligas. Ganaron su cuarto título en 2018-19 tras 51 años de sequía, venciendo a los Toros del Este.",
    famosos: [
      { nombre: "Tetelo Vargas", bio: "Leyenda del béisbol caribeño y las Ligas Negras, considerado uno de los mejores peloteros que nunca llegó a Grandes Ligas por la segregación racial de su época. El estadio del equipo lleva su nombre." },
      { nombre: "Alfredo Griffin", bio: "Campocorto de guante de oro, co-Novato del Año en 1979, ganó 2 Series Mundiales con Dodgers y Azulejos." },
      { nombre: "Rico Carty", bio: "\"Beeg Boy\", campeón de bateo en 1970 con los Bravos de Atlanta, uno de los primeros grandes astros dominicanos en las Mayores." },
    ],
    instagram: "estrellasbc",
    x: "Estrellas_1910",
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/55/Estadio_Tetelo_Vargas.png",
      autor: "Missael1990",
      licencia: "CC BY-SA 4.0",
    },
    color: "#046A38",
  },
  "668": {
    fundado: "1983 (como Azucareros del Este)",
    estadio: "Estadio Francisco A. Micheli (La Romana), único estadio privado de la liga",
    titulos: "3 títulos nacionales (1994-95, 2010-11, 2019-20) · 1 Serie del Caribe (2020)",
    resumen:
      "Los Toros del Este representan a La Romana y juegan en el único estadio de la liga que es propiedad privada (de la Central Romana Corporation). Ganaron su primera Serie del Caribe en 2020, un hito histórico para la franquicia.",
    famosos: [
      { nombre: "Eddy Garabito", bio: "Ícono absoluto de la franquicia, jugó sus 11 temporadas de carrera con los Azucareros/Toros y fue el primer jugador con el número retirado por el equipo." },
      { nombre: "Cecilio Guante", bio: "Pitcher relevista que jugó más de una década en Grandes Ligas con equipos como Piratas y Yankees." },
      { nombre: "Esteban Germán", bio: "Infielder versátil conocido por su buen ojo al bate, jugó con varios equipos de Grandes Ligas incluyendo los Reales de Kansas City." },
    ],
    instagram: "torosdeleste",
    x: "TorosdelEste",
    foto: null,
    color: "#F26522",
  },
  "670": {
    fundado: "23 de abril de 1996 (como Gigante del Nordeste)",
    estadio: "Estadio Julián Javier (San Francisco de Macorís)",
    titulos: "2 títulos nacionales (2014-15, 2021-22)",
    resumen:
      "Los Gigantes del Cibao son el equipo más joven de la LIDOM, representando a San Francisco de Macorís. Ganaron su primer título en 2014-15 y el segundo en 2021-22, consolidándose como una fuerza en ascenso de la liga.",
    famosos: [
      { nombre: "Marcell Ozuna", bio: "Bateador de poder, varias veces All-Star y ganador del Bate de Plata con los Bravos de Atlanta." },
      { nombre: "Ketel Marte", bio: "Infielder/jardinero All-Star de los Diamondbacks de Arizona, pieza clave en su histórica carrera a la Serie Mundial de 2023." },
      { nombre: "José Sirí", bio: "Jardinero conocido por combinar poder y una defensa espectacular, destacado con los Rays de Tampa Bay." },
      { nombre: "Camilo Doval", bio: "Cerrador dominante de los Gigantes de San Francisco, varias veces seleccionado al Juego de Estrellas." },
    ],
    instagram: "gigantescibao",
    x: "Gigantes_Cibao",
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Estadio_Julian_Javier.jpg",
      autor: "OzzyDiaz",
      licencia: "CC BY-SA 3.0",
    },
    color: "#722F37",
  },
};
