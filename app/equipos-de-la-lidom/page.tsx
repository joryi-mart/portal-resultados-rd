import GuiaJuegos from "../GuiaJuegos";

const GUIAS_LIDOM = [
  { href: "/como-funciona-la-lidom", titulo: "Cómo funciona la LIDOM" },
  { href: "/equipos-de-la-lidom", titulo: "Los 6 equipos de la LIDOM" },
  { href: "/reglas-basicas-del-beisbol", titulo: "Reglas básicas del béisbol" },
  { href: "/glorias-dominicanas-del-beisbol", titulo: "Glorias Dominicanas del Béisbol" },
  { href: "/lidom", titulo: "LIDOM hoy: equipos y noticias" },
];

export const metadata = {
  title: "Los 6 Equipos de la LIDOM: Licey, Escogido, Águilas, Estrellas, Toros y Gigantes",
  description:
    "Conoce los seis equipos de la LIDOM: su ciudad, su estadio, el año de fundación y un poco de su historia. Tigres del Licey, Leones del Escogido, Águilas Cibaeñas, Estrellas Orientales, Toros del Este y Gigantes del Cibao.",
  openGraph: {
    title: "Los 6 Equipos de la LIDOM",
    description: "Ciudad, estadio y fundación de cada equipo del béisbol invernal dominicano.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/equipos-de-la-lidom" },
};

export default function EquiposDeLaLidomPage() {
  return (
    <GuiaJuegos
      hrefActual="/equipos-de-la-lidom"
      titulo="Los 6 equipos de la LIDOM: ciudad, estadio e historia"
      subtitulo="Licey, Escogido, Águilas, Estrellas, Toros y Gigantes."
      descripcion="Guía de los seis equipos de la LIDOM: ciudad, estadio y año de fundación."
      aviso="Página informativa no oficial de la LIDOM"
      icono="⚾"
      mostrarComoJugar={false}
      tituloGuias="Más sobre la LIDOM"
      guiasRelacionadas={GUIAS_LIDOM}
      botones={[
        { href: "/lidom/672", texto: "Tigres del Licey" },
        { href: "/lidom/671", texto: "Leones del Escogido" },
        { href: "/lidom/667", texto: "Águilas Cibaeñas" },
        { href: "/lidom/669", texto: "Estrellas Orientales" },
        { href: "/lidom/668", texto: "Toros del Este" },
        { href: "/lidom/670", texto: "Gigantes del Cibao" },
      ]}
      introduccion="La LIDOM tiene seis equipos que representan a distintas ciudades del país. Cada uno tiene su propia historia, su estadio y su afición. En la página de cada equipo de La Bankera RD (botones de arriba) puedes ver sus últimos juegos, el roster y las noticias."
      encabezadoJuegos="Los equipos"
      juegos={[
        {
          nombre: "Tigres del Licey",
          texto: "Fundados el 7 de noviembre de 1907 y conocidos como \"El Glorioso\". Representan a Santo Domingo y juegan en el Estadio Quisqueya Juan Marichal, que comparten con el Escogido.",
        },
        {
          nombre: "Leones del Escogido",
          texto: "Fundados el 17 de febrero de 1921, surgieron de la unión de varios equipos capitalinos. También juegan en el Estadio Quisqueya Juan Marichal, en Santo Domingo, y su rivalidad con el Licey es la más famosa de la capital.",
        },
        {
          nombre: "Águilas Cibaeñas",
          texto: "Nacieron en 1933 como Santiago Baseball Club y adoptaron su nombre actual en 1937. Representan a Santiago y a la región del Cibao, y juegan en el Estadio Cibao, el más grande del país. Mantienen una rivalidad intensa con el Licey.",
        },
        {
          nombre: "Estrellas Orientales",
          texto: "Fundadas el 15 de diciembre de 1910, representan a San Pedro de Macorís, una ciudad conocida por producir una enorme cantidad de peloteros de Grandes Ligas. Juegan en el Estadio Tetelo Vargas.",
        },
        {
          nombre: "Toros del Este",
          texto: "Nacieron en 1983 como Azucareros del Este. Representan a La Romana y juegan en el Estadio Francisco A. Micheli, el único estadio de la liga que es de propiedad privada.",
        },
        {
          nombre: "Gigantes del Cibao",
          texto: "Fundados el 23 de abril de 1996 como Gigante del Nordeste, son el equipo más joven de la liga. Representan a San Francisco de Macorís y juegan en el Estadio Julián Javier.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿Cuáles son los equipos de la LIDOM?",
          respuesta:
            "Tigres del Licey, Leones del Escogido, Águilas Cibaeñas, Estrellas Orientales, Toros del Este y Gigantes del Cibao.",
        },
        {
          pregunta: "¿Qué equipos comparten estadio?",
          respuesta:
            "El Licey y el Escogido, que juegan en el Estadio Quisqueya Juan Marichal, en Santo Domingo.",
        },
        {
          pregunta: "¿Cuál es el equipo más joven de la LIDOM?",
          respuesta:
            "Los Gigantes del Cibao, fundados en 1996, representan a San Francisco de Macorís.",
        },
        {
          pregunta: "¿Cuál es el equipo más antiguo?",
          respuesta:
            "Los Tigres del Licey, fundados en 1907.",
        },
      ]}
      notaFinal="Esta guía es informativa y no oficial. Los datos de los equipos pueden cambiar con el tiempo: consulta los canales oficiales de la liga y de cada equipo para la información vigente."
    />
  );
}
