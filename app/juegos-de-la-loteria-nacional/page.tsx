import GuiaJuegos from "../GuiaJuegos";

export const metadata = {
  title: "¿Cómo Funcionan los Juegos de la Lotería Nacional? Gana Más, Juega + Pega + y Quiniela Nacional",
  description:
    "Qué sorteos tiene la Lotería Nacional Dominicana, a qué hora salen y cómo se juega cada uno: Gana Más, Juega + Pega + y la Quiniela Nacional de la noche.",
  openGraph: {
    title: "¿Cómo Funcionan los Juegos de la Lotería Nacional?",
    description: "Guía de Gana Más, Juega + Pega + y la Quiniela Nacional, con sus horarios.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/juegos-de-la-loteria-nacional" },
};

export default function JuegosDeLaLoteriaNacionalPage() {
  return (
    <GuiaJuegos
      hrefActual="/juegos-de-la-loteria-nacional"
      titulo="¿Cómo funcionan los juegos de la Lotería Nacional?"
      subtitulo="Gana Más, Juega + Pega + y la Quiniela Nacional de la noche."
      descripcion="Guía de los sorteos de la Lotería Nacional Dominicana y sus horarios."
      botones={[
        { href: "/nacional", texto: "Ve los resultados de hoy de la Lotería Nacional" },
        { href: "/historia-loteria-nacional", texto: "Historia de la Lotería Nacional" },
      ]}
      introduccion="La Lotería Nacional es la más antigua del país y una de las más seguidas. Tiene un sorteo de tarde, que incluye el Gana Más y el Juega + Pega +, y un sorteo de noche, la Quiniela Nacional. Así funciona cada uno:"
      encabezadoJuegos="Los sorteos de la Lotería Nacional"
      juegos={[
        {
          nombre: "Gana Más",
          texto: "Una quiniela de tres números del 00 al 99 que se sortea todos los días a las 2:30 p.m. Ganas si tu número sale en cualquiera de las tres posiciones, y el primer lugar es el que mejor paga.",
        },
        {
          nombre: "Juega + Pega +",
          texto: "Un sorteo distinto a la quiniela, cuyo resultado tiene cinco números. Sale a la misma hora que el Gana Más, a las 2:30 p.m. Confirma en tu banca cómo se juega y cuánto paga.",
        },
        {
          nombre: "Quiniela Nacional (noche)",
          texto: "La quiniela de la noche, también de tres números del 00 al 99. Se sortea a las 9:00 p.m. de lunes a sábado, y los domingos se adelanta a las 6:00 p.m.",
        },
        {
          nombre: "Cómo salen los números de la quiniela",
          texto: "En los sorteos de quiniela se usan tres tómbolas con bolas numeradas del 00 al 99, y se saca una bola de cada una: la primera es el primer premio, la segunda el segundo, y la tercera el tercero.",
        },
        {
          nombre: "Se transmiten en vivo",
          texto: "La Lotería Nacional transmite sus sorteos en vivo por televisión, lo que ayuda a que sus resultados sean de los más seguidos del país.",
        },
        {
          nombre: "Su relación con el Súper Palé",
          texto: "Los resultados de la Lotería Nacional también se usan para armar el Súper Palé de otras loterías. Por ejemplo, el Súper Palé Real usa el primer premio del Gana Más. Tenemos una guía con más detalle.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿Qué sorteos tiene la Lotería Nacional?",
          respuesta:
            "Tres: el Gana Más y el Juega + Pega + por la tarde (2:30 p.m.) y la Quiniela Nacional por la noche (9:00 p.m., y 6:00 p.m. los domingos).",
        },
        {
          pregunta: "¿A qué hora sale la Quiniela Nacional?",
          respuesta:
            "A las 9:00 p.m. de lunes a sábado y a las 6:00 p.m. los domingos.",
        },
        {
          pregunta: "¿Cuál es la diferencia entre el Gana Más y la Quiniela Nacional?",
          respuesta:
            "Las dos son quinielas de tres números del 00 al 99, pero se sortean en horarios distintos: el Gana Más a las 2:30 p.m. y la Quiniela Nacional por la noche.",
        },
        {
          pregunta: "¿Cuántos números tiene el Juega + Pega +?",
          respuesta: "Su resultado tiene cinco números.",
        },
      ]}
    />
  );
}
