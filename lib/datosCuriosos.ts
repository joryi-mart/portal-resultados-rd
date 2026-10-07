// lib/datosCuriosos.ts
// Lista de publicaciones "¿Sabías qué...?" para Facebook. El calendario publica
// la siguiente que todavía no haya salido (ver /api/publicar-dato?siguiente=1).
// Solo hechos comprobables: si se agrega uno nuevo, verificarlo antes.
// Para agregar más, basta con añadirlos al final de la lista.

export type Dato = { slug: string; texto: string; pie: string; enlace?: string; hashtags?: string; caption?: string };

export const DATOS: Dato[] = [
  {
    slug: "dato-nacional-1882",
    texto: "La Lotería Nacional Dominicana nació el 24 de octubre de 1882, fundada por el padre Francisco Xavier Billini.",
    pie: "La creó para recaudar fondos y ayudar a los más pobres. Hoy sigue siendo una de las loterías más antiguas de América.",
    caption:
      "¿Sabías qué...? 🎓\n\n" +
      "La Lotería Nacional Dominicana nació el 24 de octubre de 1882, fundada por el padre Francisco Xavier Billini, " +
      "para recaudar fondos y ayudar a los más pobres. Hoy sigue siendo una de las loterías más antiguas de América.\n\n" +
      "Lee la historia completa en https://labankerard.com/historia-loteria-nacional\n\n" +
      "Página informativa de La Bankera RD.\n\n#LoteriaDominicana #HistoriaDominicana #CuriosidadesRD",
  },
  {
    slug: "dato-catedral-primada",
    texto: "La Catedral Primada de América, en la Ciudad Colonial de Santo Domingo, es la catedral más antigua de América.",
    pie: "Se construyó entre 1514 y 1541.",
  },
  {
    slug: "dato-pico-duarte",
    texto: "El Pico Duarte es la montaña más alta de todo el Caribe.",
    pie: "Tiene más de 3,000 metros de altura y está en la Cordillera Central.",
  },
  {
    slug: "dato-lago-enriquillo",
    texto: "El Lago Enriquillo es el punto más bajo del Caribe: está unos 40 metros por debajo del nivel del mar.",
    pie: "Es un lago de agua salada donde viven cocodrilos americanos e iguanas.",
  },
  {
    slug: "dato-merengue-unesco",
    texto: "En 2016 la UNESCO declaró el merengue dominicano Patrimonio Cultural Inmaterial de la Humanidad.",
    pie: "Es el ritmo que más representa a la República Dominicana en el mundo.",
    hashtags: "#Merengue #CulturaDominicana #CuriosidadesRD",
  },
  {
    slug: "dato-bachata-unesco",
    texto: "La bachata también es Patrimonio Cultural Inmaterial de la Humanidad, desde 2019.",
    pie: "Nació en los barrios y campos dominicanos y hoy se baila en todo el mundo.",
    hashtags: "#Bachata #CulturaDominicana #CuriosidadesRD",
  },
  {
    slug: "dato-bandera-biblia",
    texto: "La bandera dominicana es la única del mundo que tiene una Biblia en su escudo.",
    pie: "Sobre la Biblia aparece una cruz y el lema «Dios, Patria, Libertad».",
  },
  {
    slug: "dato-larimar",
    texto: "El larimar, la piedra azul de Barahona, solo se encuentra en la República Dominicana.",
    pie: "Su nombre une «Larissa», la hija de quien la dio a conocer en los años 70, con la palabra «mar».",
  },
  {
    slug: "dato-ciudad-colonial-unesco",
    texto: "La Ciudad Colonial de Santo Domingo es Patrimonio de la Humanidad de la UNESCO desde 1990.",
    pie: "Allí están la primera catedral, el primer hospital y la primera universidad de América.",
  },
  {
    slug: "dato-santo-domingo-1496",
    texto: "Santo Domingo, fundada en 1496 por Bartolomé Colón, es la ciudad europea habitada más antigua de América.",
    pie: "Por eso se le llama «La Primada de América».",
  },
  {
    slug: "dato-primera-universidad",
    texto: "En Santo Domingo se fundó en 1538 la primera universidad de América.",
    pie: "Hoy es la Universidad Autónoma de Santo Domingo (UASD).",
  },
  {
    slug: "dato-ballenas-samana",
    texto: "Cada año, entre enero y marzo, miles de ballenas jorobadas llegan a la bahía de Samaná.",
    pie: "Vienen desde el Atlántico Norte a aparearse y a tener sus crías en aguas cálidas.",
  },
  {
    slug: "dato-himno-nacional",
    texto: "La letra del Himno Nacional es de Emilio Prud'Homme y la música de José Reyes.",
    pie: "Se cantó por primera vez en 1883.",
    enlace: "https://labankerard.com/efemerides",
  },
  {
    slug: "dato-duarte-trinitaria",
    texto: "Juan Pablo Duarte, el Padre de la Patria, nació el 26 de enero de 1813 en Santo Domingo.",
    pie: "En 1838 fundó La Trinitaria, la sociedad secreta que luchó por la independencia.",
    enlace: "https://labankerard.com/efemerides",
  },
  {
    slug: "dato-independencia-1844",
    texto: "La Independencia Nacional se proclamó la noche del 27 de febrero de 1844 en la Puerta del Conde.",
    pie: "Esa noche Matías Ramón Mella disparó el famoso trabucazo.",
    enlace: "https://labankerard.com/efemerides",
  },
  {
    slug: "dato-restauracion-1863",
    texto: "Cada 16 de agosto se celebra la Restauración de la República, que empezó en 1863 con el Grito de Capotillo.",
    pie: "Con esa guerra el país recuperó su independencia de España.",
    enlace: "https://labankerard.com/efemerides",
  },
  {
    slug: "dato-marichal-salon-fama",
    texto: "Juan Marichal, «El Monstruo de Laguna Verde», fue el primer dominicano en el Salón de la Fama del béisbol.",
    pie: "Entró en 1983.",
    enlace: "https://labankerard.com/glorias-dominicanas-del-beisbol",
    hashtags: "#BeisbolDominicano #MLB #CuriosidadesRD",
  },
  {
    slug: "dato-pedro-martinez",
    texto: "Pedro Martínez ganó tres premios Cy Young al mejor lanzador.",
    pie: "Entró al Salón de la Fama del béisbol en 2015.",
    enlace: "https://labankerard.com/glorias-dominicanas-del-beisbol",
    hashtags: "#BeisbolDominicano #MLB #CuriosidadesRD",
  },
  {
    slug: "dato-david-ortiz",
    texto: "David «Big Papi» Ortiz ganó tres Series Mundiales con los Medias Rojas de Boston: 2004, 2007 y 2013.",
    pie: "Entró al Salón de la Fama del béisbol en 2022.",
    enlace: "https://labankerard.com/glorias-dominicanas-del-beisbol",
    hashtags: "#BeisbolDominicano #MLB #CuriosidadesRD",
  },
  {
    slug: "dato-pujols-703",
    texto: "Albert Pujols terminó su carrera con 703 jonrones.",
    pie: "Es uno de solo cuatro peloteros en la historia con más de 700.",
    enlace: "https://labankerard.com/glorias-dominicanas-del-beisbol",
    hashtags: "#BeisbolDominicano #MLB #CuriosidadesRD",
  },
  {
    slug: "dato-vladimir-guerrero",
    texto: "Vladimir Guerrero entró al Salón de la Fama en 2018, y su hijo Vladimir Jr. también es estrella de Grandes Ligas.",
    pie: "Padre e hijo, orgullo de Nizao.",
    enlace: "https://labankerard.com/glorias-dominicanas-del-beisbol",
    hashtags: "#BeisbolDominicano #MLB #CuriosidadesRD",
  },
  {
    slug: "dato-dominicanos-en-mlb",
    texto: "Después de Estados Unidos, la República Dominicana es el país que más peloteros aporta a las Grandes Ligas.",
    pie: "Cada temporada hay más de cien dominicanos en MLB.",
    enlace: "https://labankerard.com/beisbol",
    hashtags: "#BeisbolDominicano #MLB #CuriosidadesRD",
  },
  {
    slug: "dato-licey-1907",
    texto: "Los Tigres del Licey, fundados en 1907, son el equipo más antiguo de la pelota dominicana.",
    pie: "Le siguen las Estrellas Orientales (1910) y los Leones del Escogido (1921).",
    enlace: "https://labankerard.com/equipos-de-la-lidom",
    hashtags: "#LIDOM #BeisbolDominicano #CuriosidadesRD",
  },
  {
    slug: "dato-serie-del-caribe",
    texto: "La República Dominicana es el país con más títulos en la historia de la Serie del Caribe.",
    pie: "El campeón de LIDOM representa al país cada año.",
    enlace: "https://labankerard.com/como-funciona-la-lidom",
    hashtags: "#LIDOM #SerieDelCaribe #CuriosidadesRD",
  },
  {
    slug: "dato-felix-sanchez",
    texto: "Félix Sánchez, «Super Man», ganó el oro olímpico en 400 metros con vallas en Atenas 2004 y Londres 2012.",
    pie: "Fue la primera medalla de oro olímpica de la República Dominicana.",
    hashtags: "#DeporteDominicano #CuriosidadesRD",
  },
  {
    slug: "dato-marileidy-paulino",
    texto: "Marileidy Paulino ganó en París 2024 el oro en los 400 metros, con récord olímpico.",
    pie: "Es la primera mujer dominicana en ganar una medalla de oro olímpica.",
    hashtags: "#DeporteDominicano #CuriosidadesRD",
  },
  {
    slug: "dato-ambar-dominicano",
    texto: "El ámbar dominicano es famoso en el mundo porque muchas piezas guardan insectos y plantas de millones de años.",
    pie: "Se saca sobre todo de las montañas de la Cordillera Septentrional.",
  },
  {
    slug: "dato-cacao-organico",
    texto: "La República Dominicana es uno de los mayores exportadores de cacao orgánico del mundo.",
    pie: "Gran parte se cultiva en San Francisco de Macorís y la región del Cibao.",
  },
  {
    slug: "dato-cigarros-premium",
    texto: "La República Dominicana es el mayor exportador de cigarros (puros) premium del mundo.",
    pie: "Buena parte se hace en Santiago y sus alrededores.",
  },
  {
    slug: "dato-faro-a-colon",
    texto: "El Faro a Colón se inauguró en 1992, cuando se cumplieron 500 años de la llegada de Colón a América.",
    pie: "De noche proyecta al cielo una enorme cruz de luz.",
  },
  {
    slug: "dato-alcazar-de-colon",
    texto: "El Alcázar de Colón fue la casa de Diego Colón, hijo de Cristóbal Colón, y de su esposa María de Toledo.",
    pie: "Se construyó a principios del siglo XVI, frente al río Ozama.",
  },
  {
    slug: "dato-isla-saona",
    texto: "La isla Saona es la isla más grande de las que rodean a la República Dominicana.",
    pie: "Forma parte del Parque Nacional del Este.",
  },
];

export function captionDato(dato: Dato) {
  if (dato.caption) return dato.caption;
  const enlace = dato.enlace || "https://labankerard.com";
  const hashtags = dato.hashtags || "#CuriosidadesRD #RepublicaDominicana #SabiasQue";
  return (
    `¿Sabías qué...? 🎓\n\n${dato.texto} ${dato.pie}\n\n` +
    `¿Lo sabías? Cuéntanos en los comentarios 👇\n\n` +
    `👉 Síguenos para aprender algo nuevo de RD cada semana.\n\n` +
    `Más en ${enlace}\n\nPágina informativa de La Bankera RD.\n\n${hashtags}`
  );
}
