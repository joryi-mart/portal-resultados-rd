import GuiaJuegos from "../GuiaJuegos";

export const metadata = {
  title: "Cómo Jugar Powerball en Español: Reglas, Días de Sorteo y Cómo Revisar tu Boleto",
  description:
    "Cómo se juega el Powerball: cuántos números se escogen, qué días se sortea, qué es el Power Play y en qué se diferencia de Mega Millions.",
  openGraph: {
    title: "Cómo Jugar Powerball en Español",
    description: "Reglas del Powerball, días de sorteo, Power Play y diferencias con Mega Millions.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/como-jugar-powerball" },
};

export default function ComoJugarPowerballPage() {
  return (
    <GuiaJuegos
      hrefActual="/como-jugar-powerball"
      titulo="Cómo jugar Powerball (y en qué se diferencia de Mega Millions)"
      subtitulo="Reglas, días de sorteo y cómo revisar tus números, explicado en español."
      descripcion="Cómo se juega el Powerball, qué días se sortea y en qué se diferencia de Mega Millions."
      botones={[
        { href: "/powerball", texto: "Ve los resultados de Powerball" },
        { href: "/mega-millions", texto: "Ve los resultados de Mega Millions" },
      ]}
      introduccion="El Powerball es una de las loterías de Estados Unidos con los premios mayores más grandes, y muchos dominicanos, tanto en RD como en Estados Unidos, siguen sus resultados. Se juega en estados de EE. UU. que participan en el juego, y cada estado define detalles como la edad mínima y dónde se puede comprar el boleto."
      encabezadoJuegos="Lo básico del Powerball"
      juegos={[
        {
          nombre: "Cómo se juega",
          texto: "Se escogen 5 números blancos del 1 al 69 y 1 número rojo, el Powerball, del 1 al 26. También existe la opción \"Quick Pick\", en la que la máquina escoge los números por ti. Para el premio mayor hay que acertar los 6 números; también hay premios menores por acertar menos.",
        },
        {
          nombre: "Cuándo se sortea",
          texto: "Los lunes, miércoles y sábados, a las 10:59 p.m. hora del este de Estados Unidos. Como República Dominicana no cambia de horario en verano pero Estados Unidos sí, la hora en RD puede variar una hora según la época del año: en verano coincide, y en invierno RD va una hora adelantada.",
        },
        {
          nombre: "Qué es el Power Play",
          texto: "Es una opción que se paga aparte, al comprar el boleto. Si sale, multiplica los premios que no son el premio mayor. Cada estado y cada tienda pueden tener sus propias reglas de compra, así que confirma los detalles donde compres.",
        },
        {
          nombre: "En qué se diferencia de Mega Millions",
          texto: "Mega Millions es la otra gran lotería nacional de Estados Unidos. Se escogen 5 números del 1 al 70 más 1 número Mega Ball del 1 al 24, se sortea los martes y viernes, y cada jugada incluye un multiplicador. Powerball se sortea lunes, miércoles y sábado.",
        },
        {
          nombre: "Cómo revisar si ganaste",
          texto: "Compara tus números con los que salieron en el sorteo. En La Bankera RD publicamos los resultados de Powerball y Mega Millions en sus páginas, pero para reclamar un premio siempre debes acudir a los canales oficiales de la lotería de tu estado.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿Qué días se sortea el Powerball?",
          respuesta: "Los lunes, miércoles y sábados por la noche, hora del este de Estados Unidos.",
        },
        {
          pregunta: "¿Cuántos números se escogen en el Powerball?",
          respuesta: "Cinco números blancos del 1 al 69 y un número rojo, el Powerball, del 1 al 26.",
        },
        {
          pregunta: "¿Cuál es la diferencia entre Powerball y Mega Millions?",
          respuesta:
            "Son dos loterías distintas de Estados Unidos. Powerball usa 5 números del 1 al 69 más un Powerball del 1 al 26 y se sortea lunes, miércoles y sábado. Mega Millions usa 5 números del 1 al 70 más una Mega Ball del 1 al 24 y se sortea martes y viernes.",
        },
        {
          pregunta: "¿La Bankera RD vende boletos de Powerball?",
          respuesta:
            "No. La Bankera RD es una página informativa no oficial: solo publica los resultados. Los boletos se compran en las tiendas autorizadas de los estados que participan.",
        },
      ]}
    />
  );
}
