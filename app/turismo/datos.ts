export type Ciudad = {
  slug: string;
  nombre: string;
  resumen: string;
  descripcion: string;
  atracciones: string[];
  lat: number;
  lon: number;
  foto: { url: string; autor: string; licencia: string };
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
    resumen: "El destino de playa más famoso de República Dominicana, conocido por sus resorts todo incluido y arena blanca.",
    descripcion:
      "Punta Cana, en el extremo este del país (provincia La Altagracia), es el destino turístico más visitado de República Dominicana. " +
      "Es conocida internacionalmente por sus extensas playas de arena blanca y aguas turquesa, la mayoría bordeadas por grandes " +
      "complejos hoteleros todo incluido. La zona incluye playas como Bávaro, Cabeza de Toro y Macao, y es un punto de partida " +
      "popular para excursiones a Isla Saona y Isla Catalina.",
    atracciones: [
      "Playa Bávaro — una de las playas más premiadas del Caribe",
      "Isla Saona — excursión en catamarán o lancha, dentro del Parque Nacional del Este",
      "Ojos Indígenas — reserva ecológica con lagunas naturales para nadar",
      "Campos de golf de nivel internacional (Cap Cana, Punta Espada)",
      "Vida nocturna y centros comerciales en Bávaro y Cap Cana",
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
    resumen: "En la Costa Ámbar, al norte del país, conocida por su teleférico, cascadas y playas menos concurridas.",
    descripcion:
      "Puerto Plata, en la costa norte de República Dominicana, es el corazón de la llamada Costa Ámbar, nombrada así por los " +
      "yacimientos de ámbar de la región. Es una de las zonas turísticas más antiguas del país, con playas más tranquilas " +
      "que Punta Cana y acceso cercano a montañas y ríos. Su malecón y el histórico Fuerte de San Felipe reflejan su pasado " +
      "colonial y comercial.",
    atracciones: [
      "Teleférico de Puerto Plata — el único de su tipo en el Caribe, con vista al Pico Isabel de Torres",
      "27 Charcos de Damajagua — cascadas y toboganes naturales para hacer canyoning",
      "Fuerte de San Felipe — fortaleza del siglo XVI",
      "Playa Sosúa y Playa Dorada — zonas de playa cercanas con buena infraestructura turística",
      "Museo del Ámbar Dominicano",
    ],
  },
];
