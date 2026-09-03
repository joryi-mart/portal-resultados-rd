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
  {
    slug: "samana",
    nombre: "Samaná",
    lat: 19.2058,
    lon: -69.3364,
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Cayo_Levantado%2C_Samana%2C_Dominican_Republic.jpg/1280px-Cayo_Levantado%2C_Samana%2C_Dominican_Republic.jpg",
      autor: "viajor (Flickr)",
      licencia: "CC BY 2.0",
    },
    galeria: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/El_Limon.JPG/1280px-El_Limon.JPG",
        autor: "AMartiniouk",
        licencia: "CC BY-SA 3.0",
        alt: "Cascada El Limón",
      },
    ],
    resumen: "Península en el nordeste del país, famosa por el avistamiento de ballenas jorobadas y playas rodeadas de montañas y cayos.",
    descripcion:
      "Samaná, en el extremo nordeste de República Dominicana, es una península de montañas verdes que caen directo al mar, con " +
      "unas 25 playas y una decena de cayos repartidos entre sus tres zonas turísticas: Santa Bárbara de Samaná, Las Terrenas y " +
      "Las Galeras. Entre enero y marzo es uno de los mejores lugares del mundo para observar ballenas jorobadas, que migran " +
      "hasta la bahía para reproducirse.",
    atracciones: [
      "Cayo Levantado — islote con playas públicas y restaurantes, a corta distancia en lancha",
      "Las Terrenas — playas de ambiente relajado con fuerte influencia francesa y europea",
      "Playa Rincón — una de las playas más premiadas del Caribe, de arena blanca y palmeras",
    ],
    hoteles: [
      "Las Terrenas — la zona con más hoteles boutique, villas y restaurantes de playa",
      "Santa Bárbara de Samaná — cerca del puerto de salida de las excursiones para ver ballenas",
      "Las Galeras — la zona más tranquila y menos desarrollada, ideal para desconectar",
    ],
    ecoturismo: [
      "Avistamiento de ballenas jorobadas — de enero a marzo, en excursiones en barco desde la bahía de Samaná",
      "Cascada El Limón — salto de unos 40 metros con piscina natural, se llega a pie o a caballo",
      "Parque Nacional Los Haitises — manglares, cuevas con pictografías taínas y mogotes de piedra caliza",
    ],
  },
  {
    slug: "bahia-de-las-aguilas",
    nombre: "Bahía de las Águilas",
    lat: 17.85,
    lon: -71.65,
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Bahia_de_las_Aguilas_beach.jpg/1280px-Bahia_de_las_Aguilas_beach.jpg",
      autor: "jordina_collellcortacans (Flickr)",
      licencia: "CC BY-SA 2.0",
    },
    galeria: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Dusk_-_Bahia_de_las_Aguilas%2C_Pedernales_-_Dominican_Republic.jpg/1280px-Dusk_-_Bahia_de_las_Aguilas%2C_Pedernales_-_Dominican_Republic.jpg",
        autor: "Remedylane",
        licencia: "Dominio público",
        alt: "Costa de Bahía de las Águilas al atardecer",
      },
    ],
    resumen: "Una de las playas vírgenes más espectaculares del Caribe, dentro del Parque Nacional Jaragua, en el extremo suroeste del país.",
    descripcion:
      "Bahía de las Águilas es una playa de casi 10 kilómetros dentro del Parque Nacional Jaragua, en la provincia de Pedernales, " +
      "junto a la frontera con Haití. Al ser un área protegida no tiene hoteles, tiendas ni restaurantes: solo se llega en " +
      "vehículo 4x4, a pie o en lancha desde el poblado de Cabo Rojo. Es uno de los últimos tramos de costa realmente virgen " +
      "del Caribe, con arrecifes de coral y aguas cristalinas.",
    atracciones: [
      "Bahía de las Águilas — casi 10 km de playa virgen, solo accesible en 4x4, lancha o caminando",
      "Cabo Rojo — mirador natural con vistas al mar Caribe, punto de partida hacia la bahía",
      "Isla Beata — isla deshabitada dentro del parque nacional, se visita en excursión en lancha",
    ],
    hoteles: [
      "Dentro de la bahía no hay hoteles por ser área protegida — el alojamiento más cercano está en Cabo Rojo y Pedernales",
      "Glamping EcoLodge Cueva de las Águilas — alojamiento tipo glamping en Cabo Rojo, organiza excursiones a la bahía",
      "Pedernales — el pueblo más cercano, con las opciones de hospedaje más completas de la zona",
    ],
    ecoturismo: [
      "Parque Nacional Jaragua — la mayor área protegida del país, con playas vírgenes y bosque seco subtropical",
      "Arrecifes de coral y praderas marinas — aguas cristalinas ideales para esnórquel y buceo",
      "Observación de aves — el parque alberga flamencos y otras especies costeras",
    ],
  },
  {
    slug: "miches",
    nombre: "Miches",
    lat: 18.9833,
    lon: -69.0333,
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/7/76/Playa_esmeralda_miches.png",
      autor: "Ugly (Wikimedia Commons)",
      licencia: "CC BY-SA 3.0",
    },
    galeria: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Laguna_Lim%C3%B3n.JPG/1280px-Laguna_Lim%C3%B3n.JPG",
        autor: "Ramon Armora",
        licencia: "CC BY-SA 3.0",
        alt: "Recorrido en kayak por la Laguna Limón",
      },
    ],
    resumen: "El destino emergente de lujo y naturaleza en la costa sur de la bahía de Samaná, con lagunas, montañas y playas vírgenes.",
    descripcion:
      "Miches, en la provincia de El Seibo, frente a la bahía de Samaná, es uno de los destinos que más ha crecido en los " +
      "últimos años en República Dominicana. Combina playas de arena dorada todavía poco desarrolladas con paisajes de " +
      "montaña, lagunas protegidas y una oferta hotelera que va desde resorts todo incluido hasta pequeños hoteles boutique " +
      "y villas de perfil ecológico.",
    atracciones: [
      "Montaña Redonda — columpios panorámicos con vista a la Laguna Limón y la costa",
      "Playa Esmeralda — una de las playas más vírgenes del país, de aguas turquesa",
      "Playa El Limón — extenso arenal poco concurrido junto a la laguna del mismo nombre",
    ],
    hoteles: [
      "Resorts todo incluido frente al mar, como Club Med Miches y Temptation Miches",
      "Hotel La Loma — en lo alto de una colina, con vista panorámica al pueblo y la bahía",
      "Hoteles boutique y villas de perfil ecológico integradas al paisaje",
    ],
    ecoturismo: [
      "Laguna Limón y Laguna Redonda — reservas científicas con manglares y aves migratorias, se recorren en bote o a caballo",
      "Salto Grande y Salto Cucuyo — cascadas poco conocidas en los alrededores",
      "Pesca artesanal con comunidades locales y recorridos por humedales protegidos",
    ],
  },
  {
    slug: "jarabacoa",
    nombre: "Jarabacoa",
    lat: 19.1167,
    lon: -70.6333,
    foto: {
      url: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Salto_de_Jimenoa_816.jpg",
      autor: "Jos1950",
      licencia: "CC BY-SA 4.0",
    },
    galeria: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Rio_Yaque_del_Norte_-_Jarabacoa.JPG/1280px-Rio_Yaque_del_Norte_-_Jarabacoa.JPG",
        autor: "Starus",
        licencia: "CC BY-SA 3.0",
        alt: "Río Yaque del Norte en Jarabacoa",
      },
    ],
    resumen: "En el corazón de la Cordillera Central, conocida como la 'ciudad de la eterna primavera' por su clima fresco, cascadas y montañas.",
    descripcion:
      "Jarabacoa, en la Cordillera Central, es el principal destino de montaña de República Dominicana. Su clima fresco todo " +
      "el año le ganó el apodo de 'ciudad de la eterna primavera', y su entorno de ríos, cascadas y picos la convirtió en la " +
      "capital dominicana de los deportes de aventura: rafting, canyoning, senderismo y ciclismo de montaña.",
    atracciones: [
      "Salto de Jimenoa — cascada de unos 35 metros, con un puente colgante de acceso",
      "Salto de Baiguate — cascada de fácil acceso rodeada de vegetación",
      "El Mogote — mirador natural con vista panorámica al valle de Jarabacoa",
    ],
    hoteles: [
      "Hotel Gran Jimenoa — a orillas del río Jimenoa, cerca del salto",
      "Rancho Baiguate — hotel de aventura con actividades de río incluidas",
      "Villas y cabañas de montaña — opción popular por el clima fresco de la zona",
    ],
    ecoturismo: [
      "Pico Duarte — el pico más alto del Caribe (3,087 m), ascenso guiado de 2 días",
      "Deportes de río — rafting, kayak y canyoning en los ríos Yaque del Norte y Jimenoa",
      "La Confluencia — punto de encuentro de los ríos Yaque del Norte y Jimenoa, popular para nadar",
    ],
  },
];
