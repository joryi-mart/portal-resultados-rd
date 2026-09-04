export type HistoriaEquipo = {
  fundado: string;
  estadio: string;
  titulos: string;
  resumen: string;
  famosos: string[];
  instagram: string;
  x: string;
  foto: { url: string; autor: string; licencia: string } | null;
};

export const HISTORIAS_LIDOM: Record<string, HistoriaEquipo> = {
  "672": {
    fundado: "7 de noviembre de 1907",
    estadio: "Quisqueya Juan Marichal (Santo Domingo, compartido con Escogido)",
    titulos: "23 títulos nacionales · 11 Series del Caribe",
    resumen:
      "Conocidos como \"El Glorioso\", los Tigres del Licey son el equipo más laureado de la LIDOM y uno de los más ganadores del béisbol mundial. Fueron el primer campeón de la liga en 1951 y el primer representante dominicano en ganar una Serie del Caribe, en 1971.",
    famosos: ["Pedro Martínez", "Vladimir Guerrero", "Manny Mota", "Julio Franco"],
    instagram: "tigresdellicey",
    x: "TigresdelLicey",
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Estadio_quisqueya_santo_domingo_dominican_republic_1.jpg",
      autor: "Calt2001",
      licencia: "CC0",
    },
  },
  "667": {
    fundado: "2 de enero de 1933",
    estadio: "Estadio Cibao (Santiago), el más grande del país",
    titulos: "22 títulos nacionales · 6 Series del Caribe",
    resumen:
      "Las Águilas Cibaeñas nacieron como Santiago Baseball Club y adoptaron su nombre actual en 1937. Representan a la región del Cibao y mantienen una de las rivalidades más intensas del béisbol dominicano frente al Licey.",
    famosos: ["Bartolo Colón", "Edwin Encarnación", "Carlos Gómez", "Dellin Betances"],
    instagram: "aguilasbbc",
    x: "aguilascibaenas",
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/07/Estadio_Cibao_Drone.jpg",
      autor: "ThePapo309",
      licencia: "CC BY-SA 4.0",
    },
  },
  "671": {
    fundado: "17 de febrero de 1921",
    estadio: "Quisqueya Juan Marichal (Santo Domingo, compartido con Licey)",
    titulos: "18 títulos nacionales · 5 Series del Caribe",
    resumen:
      "Los Leones del Escogido surgieron de la unión de varios equipos capitalinos para hacerle frente al dominio del Licey. Comparten estadio con su archirrival y han tenido varias dinastías, incluyendo cuatro títulos entre 2009-10 y 2015-16.",
    famosos: ["Juan Marichal", "David Ortiz", "Sammy Sosa", "los hermanos Alou"],
    instagram: "escogidobbclub",
    x: "EscogidoDRTeam",
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Estadio_quisqueya_santo_domingo_dominican_republic_1.jpg",
      autor: "Calt2001",
      licencia: "CC0",
    },
  },
  "669": {
    fundado: "15 de diciembre de 1910",
    estadio: "Estadio Tetelo Vargas (San Pedro de Macorís)",
    titulos: "4 títulos nacionales (1936, 1954, 1967-68, 2018-19)",
    resumen:
      "Las Estrellas Orientales representan a San Pedro de Macorís, ciudad conocida por producir una enorme cantidad de peloteros de Grandes Ligas. Ganaron su cuarto título en 2018-19 tras 51 años de sequía, venciendo a los Toros del Este.",
    famosos: ["Tetelo Vargas", "Alfredo Griffin", "Rico Carty"],
    instagram: "estrellasbc",
    x: "Estrellas_1910",
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/55/Estadio_Tetelo_Vargas.png",
      autor: "Missael1990",
      licencia: "CC BY-SA 4.0",
    },
  },
  "668": {
    fundado: "1983 (como Azucareros del Este)",
    estadio: "Estadio Francisco A. Micheli (La Romana), único estadio privado de la liga",
    titulos: "3 títulos nacionales (1994-95, 2010-11, 2019-20) · 1 Serie del Caribe (2020)",
    resumen:
      "Los Toros del Este representan a La Romana y juegan en el único estadio de la liga que es propiedad privada (de la Central Romana Corporation). Ganaron su primera Serie del Caribe en 2020, un hito histórico para la franquicia.",
    famosos: ["Eddy Garabito", "Cecilio Guante", "Esteban Germán"],
    instagram: "torosdeleste",
    x: "TorosdelEste",
    foto: null,
  },
  "670": {
    fundado: "23 de abril de 1996 (como Gigante del Nordeste)",
    estadio: "Estadio Julián Javier (San Francisco de Macorís)",
    titulos: "2 títulos nacionales (2014-15, 2021-22)",
    resumen:
      "Los Gigantes del Cibao son el equipo más joven de la LIDOM, representando a San Francisco de Macorís. Ganaron su primer título en 2014-15 y el segundo en 2021-22, consolidándose como una fuerza en ascenso de la liga.",
    famosos: ["Marcell Ozuna", "Ketel Marte", "José Sirí", "Camilo Doval"],
    instagram: "gigantescibao",
    x: "Gigantes_Cibao",
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Estadio_Julian_Javier.jpg",
      autor: "OzzyDiaz",
      licencia: "CC BY-SA 3.0",
    },
  },
};
