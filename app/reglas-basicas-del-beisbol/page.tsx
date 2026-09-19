import GuiaJuegos from "../GuiaJuegos";

const GUIAS_BEISBOL = [
  { href: "/reglas-basicas-del-beisbol", titulo: "Reglas básicas del béisbol" },
  { href: "/como-funciona-la-lidom", titulo: "Cómo funciona la LIDOM" },
  { href: "/equipos-de-la-lidom", titulo: "Los 6 equipos de la LIDOM" },
  { href: "/beisbol", titulo: "Béisbol y Grandes Ligas hoy" },
];

export const metadata = {
  title: "Reglas Básicas del Béisbol Explicadas Fácil: Entradas, Outs, Strikes y Bolas",
  description:
    "Aprende las reglas básicas del béisbol paso a paso: cuántas entradas tiene un juego, qué es un out, cuántos strikes y bolas hay, cómo se anota una carrera y qué significan el promedio de bateo y la efectividad.",
  openGraph: {
    title: "Reglas Básicas del Béisbol Explicadas Fácil",
    description: "Entradas, outs, strikes, bolas, carreras y estadísticas básicas, en lenguaje sencillo.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/reglas-basicas-del-beisbol" },
};

export default function ReglasBasicasDelBeisbolPage() {
  return (
    <GuiaJuegos
      hrefActual="/reglas-basicas-del-beisbol"
      titulo="Reglas básicas del béisbol, explicadas fácil"
      subtitulo="Entradas, outs, strikes, bolas y cómo se anotan las carreras."
      descripcion="Las reglas básicas del béisbol explicadas paso a paso, en lenguaje sencillo."
      aviso="Guía informativa no oficial de béisbol"
      icono="⚾"
      mostrarComoJugar={false}
      tituloGuias="Más sobre béisbol"
      guiasRelacionadas={GUIAS_BEISBOL}
      botones={[
        { href: "/beisbol", texto: "Béisbol y Grandes Ligas hoy" },
        { href: "/lidom", texto: "Ver la LIDOM" },
      ]}
      introduccion="El béisbol es el deporte más querido en República Dominicana, pero si estás empezando a verlo o quieres explicárselo a alguien, sus reglas pueden parecer complicadas. Aquí van las básicas, en lenguaje sencillo. Los detalles pueden variar un poco de una liga a otra."
      encabezadoJuegos="Lo esencial"
      juegos={[
        {
          nombre: "El objetivo",
          texto: "Ganar el equipo que anote más carreras al terminar el juego. Una carrera se anota cuando un jugador da la vuelta completa por las tres bases y llega a home antes de que se acaben los outs.",
        },
        {
          nombre: "Entradas y outs",
          texto: "Un juego normal tiene 9 entradas. En cada entrada hay dos mitades: el equipo visitante batea primero (arriba) y el local después (abajo). Cada mitad termina cuando la defensa consigue 3 outs. Si al final de las 9 entradas hay empate, se juegan entradas extra hasta que alguien gane.",
        },
        {
          nombre: "Los jugadores",
          texto: "En defensa hay 9 jugadores en el terreno: el lanzador, el receptor (cátcher), los tres jugadores de base (primera, segunda y tercera), el campocorto y tres jardineros (izquierdo, central y derecho). En muchas ligas, incluidas las Grandes Ligas, un bateador designado batea en lugar del lanzador.",
        },
        {
          nombre: "Strikes y bolas",
          texto: "Con tres strikes, el bateador es ponchado (out). Con cuatro bolas, camina a primera base (boleto). Es strike cuando el bateador tira y falla, cuando el lanzamiento pasa por la zona de strike sin que tire, o cuando batea una bola foul (aunque un foul no cuenta como tercer strike, salvo en un toque de bola).",
        },
        {
          nombre: "Cómo se hace un out",
          texto: "Hay varias formas: ponchar al bateador, atrapar una bola en el aire, tocar a un corredor con la bola cuando no está en una base, o pisar la base con la bola antes de que llegue el corredor cuando está obligado a avanzar.",
        },
        {
          nombre: "Hits, jonrones y errores",
          texto: "Un hit es cuando el bateador conecta la bola y llega a salvo a una base sin que haya un error: sencillo (primera base), doble, triple o jonrón. El jonrón (cuadrangular) es cuando la bola sale del parque en juego: el bateador y todos los corredores en base anotan. Un error es cuando la defensa falla en una jugada que debió ser out.",
        },
        {
          nombre: "Estadísticas que verás siempre",
          texto: "El promedio de bateo se calcula dividiendo los hits entre los turnos oficiales al bate; por ejemplo, .300 significa que el bateador conecta 3 hits de cada 10 turnos. La efectividad de un lanzador (ERA) es el promedio de carreras limpias que permite cada 9 entradas: mientras más baja, mejor.",
        },
        {
          nombre: "La distancia entre las bases",
          texto: "En las Grandes Ligas, las bases están a 90 pies (unos 27 metros) una de otra, y el lanzador tira desde 60 pies y 6 pulgadas (unos 18 metros) del plato.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿Cuántas entradas tiene un juego de béisbol?",
          respuesta: "Nueve. Si hay empate al final, se juegan entradas extra hasta que uno de los equipos gane.",
        },
        {
          pregunta: "¿Cuántos strikes y cuántas bolas hay?",
          respuesta: "Tres strikes son un ponche (out) y cuatro bolas son un boleto (el bateador pasa a primera base).",
        },
        {
          pregunta: "¿Cuántos outs tiene cada mitad de una entrada?",
          respuesta: "Tres. Cuando la defensa consigue el tercer out, se cambian los equipos.",
        },
        {
          pregunta: "¿Qué es un jonrón?",
          respuesta:
            "Es cuando el bateador manda la bola fuera del parque en juego. El bateador y todos los corredores que estén en base anotan una carrera.",
        },
        {
          pregunta: "¿Qué es la efectividad (ERA) de un lanzador?",
          respuesta:
            "Es el promedio de carreras limpias que permite el lanzador por cada 9 entradas. Mientras más baja, mejor lanza.",
        },
      ]}
      notaFinal="Esta guía es informativa y no oficial. Las reglas pueden tener diferencias entre ligas y cambiar con el tiempo: consulta los canales oficiales de la liga para el reglamento vigente."
    />
  );
}
