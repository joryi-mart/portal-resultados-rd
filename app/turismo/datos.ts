export type Ciudad = {
  slug: string;
  nombre: string;
  resumen: string;
  descripcion: string;
  atracciones: string[];
  hoteles: string[];
  ecoturismo: string[];
  lat: number;
  lon: number;
  foto: { url: string; autor: string; licencia: string };
  galeria: { url: string; autor: string; licencia: string; alt: string }[];
};

export const CIUDADES: Ciudad[] = [
  {
    slug: "punta-cana",
    nombre: "Punta Cana",
    lat: 18.5601,
    lon: -68.3725,
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2023_-_Playa_Bavaro_Punta_Cana_-_01.jpg/1280px-2023_-_Playa_Bavaro_Punta_Cana_-_01.jpg",
      autor: "Oleg Yunakov",
      licencia: "CC BY-SA 4.0",
    },
    galeria: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Lopesan_Costa_B%C3%A1varo_Resort%2C_Spa_%26_Casino.jpg/1280px-Lopesan_Costa_B%C3%A1varo_Resort%2C_Spa_%26_Casino.jpg",
        autor: "IsaiahRogers",
        licencia: "CC BY-SA 4.0",
        alt: "Resort todo incluido en Bávaro, Punta Cana",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Dominican_Republic_Hoyo_Azul.jpg/1280px-Dominican_Republic_Hoyo_Azul.jpg",
        autor: "asw909 (Flickr)",
        licencia: "CC BY 2.0",
        alt: "Hoyo Azul, cenote de aguas turquesa",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Isla_Saona_Dominican_Republic.jpg/1280px-Isla_Saona_Dominican_Republic.jpg",
        autor: "bez_uk (Flickr)",
        licencia: "CC BY-SA 2.0",
        alt: "Playa de Isla Saona",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Cap_Cana_Marina_Dominican_Republic.jpg/1280px-Cap_Cana_Marina_Dominican_Republic.jpg",
        autor: "uira (Flickr)",
        licencia: "CC BY-SA 2.0",
        alt: "Marina de Cap Cana",
      },
    ],
    resumen: "El destino de playa más famoso de República Dominicana, conocido por sus resorts todo incluido y arena blanca.",
    descripcion:
      "Punta Cana, en el extremo este del país (provincia La Altagracia), es el destino turístico más visitado de República Dominicana. " +
      "Es conocida internacionalmente por sus extensas playas de arena blanca y aguas turquesa, la mayoría bordeadas por grandes " +
      "complejos hoteleros todo incluido. La zona incluye playas como Bávaro, Cabeza de Toro y Macao, y es un punto de partida " +
      "popular para excursiones a Isla Saona y Isla Catalina.",
    atracciones: [
      "Playa Bávaro — una de las playas más premiadas del Caribe",
      "Isla Saona — excursión en catamarán o lancha, dentro del Parque Nacional del Este",
      "Campos de golf de nivel internacional (Cap Cana, Punta Espada)",
      "Vida nocturna y centros comerciales en Bávaro y Cap Cana",
    ],
    hoteles: [
      "Bávaro — la zona con mayor concentración de resorts todo incluido, ideal para una primera visita",
      "Cap Cana — la zona más exclusiva, con hoteles de lujo y campos de golf frente al mar",
      "Uvero Alto — resorts grandes y más aislados, ideal para desconectar",
      "Playa Macao — la zona hotelera más nueva, con oleaje fuerte y ambiente más local",
    ],
    ecoturismo: [
      "Ojos Indígenas — reserva ecológica con 12 lagunas naturales de agua dulce para nadar",
      "Hoyo Azul (Scape Park) — cenote de aguas turquesa dentro de un parque ecológico",
      "Manatí Park — fauna dominicana, delfines y aves tropicales en un entorno natural",
    ],
  },
  {
    slug: "santo-domingo",
    nombre: "Santo Domingo",
    lat: 18.4732,
    lon: -69.893,
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Calle_las_Damas%2C_Santo_Domingo%2C_Zona_Colonial.jpg/1280px-Calle_las_Damas%2C_Santo_Domingo%2C_Zona_Colonial.jpg",
      autor: "Desox7x",
      licencia: "CC0",
    },
    galeria: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Santo_Domingo_-_Alcazar_de_Colon_01.JPG/1280px-Santo_Domingo_-_Alcazar_de_Colon_01.JPG",
        autor: "Martin Falbisoner",
        licencia: "CC BY-SA 4.0",
        alt: "Alcázar de Colón en la Zona Colonial",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/LosTresOjos.JPG/1280px-LosTresOjos.JPG",
        autor: "Swatigsood",
        licencia: "Dominio público",
        alt: "Los Tres Ojos, cuevas con lagunas de agua dulce",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Catedral_Primada_CCSD_09_2018_1234.jpg/1280px-Catedral_Primada_CCSD_09_2018_1234.jpg",
        autor: "Mariordo (Mario Roberto Durán Ortiz)",
        licencia: "CC BY-SA 4.0",
        alt: "Catedral Primada de América",
      },
    ],
    resumen: "La capital del país y la ciudad más antigua fundada por europeos en América, con su Zona Colonial declarada Patrimonio de la Humanidad.",
    descripcion:
      "Santo Domingo es la capital de República Dominicana y la primera ciudad europea permanente del continente americano, " +
      "fundada en 1496. Su Zona Colonial fue declarada Patrimonio de la Humanidad por la UNESCO en 1990, y conserva calles " +
      "empedradas, edificios históricos y la Catedral Primada de América, la primera catedral construida en el Nuevo Mundo. " +
      "Además de su historia, la ciudad ofrece gastronomía, vida nocturna y el Malecón junto al mar Caribe.",
    atracciones: [
      "Zona Colonial — Patrimonio de la Humanidad, calles y edificios del siglo XVI",
      "Catedral Primada de América — la catedral más antigua del continente",
      "Alcázar de Colón — antigua residencia de Diego Colón, hijo de Cristóbal Colón",
      "El Malecón — avenida costera con vista al mar Caribe",
      "Mercado Modelo — artesanías y productos típicos dominicanos",
    ],
    hoteles: [
      "Zona Colonial — hoteles boutique en edificios históricos restaurados, a pasos de las principales atracciones",
      "Piantini y Naco — el distrito financiero, con hoteles de cadenas internacionales orientados a viajes de negocios",
      "El Malecón — hoteles frente al mar Caribe, a corta distancia de la Zona Colonial",
    ],
    ecoturismo: [
      "Jardín Botánico Nacional Dr. Rafael Ma. Moscoso — el más grande del Caribe, con jardín japonés y recorrido en tren",
      "Los Tres Ojos — cuevas con lagunas subterráneas de agua dulce y pinturas rupestres taínas",
      "Parque Mirador Sur — 6 km de áreas verdes junto al mar, ideal para caminar o andar en bicicleta",
    ],
  },
  {
    slug: "puerto-plata",
    nombre: "Puerto Plata",
    lat: 19.7808,
    lon: -70.6871,
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Playa_Dorada_-_Puerto_Plata.jpg/1280px-Playa_Dorada_-_Puerto_Plata.jpg",
      autor: "Max Bosio",
      licencia: "CC BY 2.0",
    },
    galeria: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Fortaleza_de_San_Felipe_DR_1.jpg/1280px-Fortaleza_de_San_Felipe_DR_1.jpg",
        autor: "CareAhLine",
        licencia: "CC0",
        alt: "Fortaleza de San Felipe",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/27_Charcas_rio_Damajagua_-_panoramio.jpg/1280px-27_Charcas_rio_Damajagua_-_panoramio.jpg",
        autor: "kikeam71",
        licencia: "CC BY-SA 3.0",
        alt: "Canyoning en los 27 Charcos de Damajagua",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Sosua_Beach_Dominican_Republic.jpg/1280px-Sosua_Beach_Dominican_Republic.jpg",
        autor: "stupiddingo (Flickr)",
        licencia: "CC BY 2.0",
        alt: "Playa Sosúa",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/5/54/Telef%C3%A9rico_Puerto_Plata.jpg",
        autor: "Ronny Medina",
        licencia: "CC BY 4.0",
        alt: "Teleférico de Puerto Plata",
      },
    ],
    resumen: "En la Costa Ámbar, al norte del país, conocida por su teleférico, cascadas y playas menos concurridas.",
    descripcion:
      "Puerto Plata, en la costa norte de República Dominicana, es el corazón de la llamada Costa Ámbar, nombrada así por los " +
      "yacimientos de ámbar de la región. Es una de las zonas turísticas más antiguas del país, con playas más tranquilas " +
      "que Punta Cana y acceso cercano a montañas y ríos. Su malecón y el histórico Fuerte de San Felipe reflejan su pasado " +
      "colonial y comercial.",
    atracciones: [
      "Fuerte de San Felipe — fortaleza del siglo XVI a la entrada de la bahía",
      "Playa Sosúa — playa cercana con buena infraestructura turística y arrecife de coral",
      "Museo del Ámbar Dominicano",
    ],
    hoteles: [
      "Playa Dorada — la zona hotelera más establecida, con resorts todo incluido y campo de golf",
      "Costambar — zona residencial y más tranquila, popular entre extranjeros residentes",
      "Cofresí — a 10 minutos del centro histórico, junto a Ocean World Adventure Park",
    ],
    ecoturismo: [
      "27 Charcos de Damajagua — cascadas y toboganes naturales para hacer canyoning",
      "Teleférico y Reserva Científica Isabel de Torres — el único teleférico del Caribe, sube a un bosque nublado",
      "La Rejoya y Charco de los Militares — cascadas y piscinas naturales menos conocidas",
    ],
  },
];
