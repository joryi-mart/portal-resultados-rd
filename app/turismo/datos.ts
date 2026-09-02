export type Ciudad = {
  slug: string;
  nombre: string;
  resumen: string;
  descripcion: string;
  atracciones: string[];
};

export const CIUDADES: Ciudad[] = [
  {
    slug: "punta-cana",
    nombre: "Punta Cana",
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
