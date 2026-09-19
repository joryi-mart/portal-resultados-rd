import GuiaJuegos from "../GuiaJuegos";

export const metadata = {
  title: "Loterías Americanas en RD: Cómo Funcionan New York, Florida, New Jersey y Georgia",
  description:
    "Qué son las loterías americanas que se juegan en bancas dominicanas, cómo se forma la quiniela de New York y Florida con Pick 3 y Pick 4, y dónde ver los resultados.",
  openGraph: {
    title: "Loterías Americanas en RD: New York, Florida, New Jersey y Georgia",
    description: "Cómo funcionan las loterías americanas en las bancas dominicanas y cómo se forma su quiniela.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/guia-loterias-americanas" },
};

export default function GuiaLoteriasAmericanasPage() {
  return (
    <GuiaJuegos
      hrefActual="/guia-loterias-americanas"
      titulo="Loterías americanas en RD: cómo funcionan New York, Florida, New Jersey y Georgia"
      subtitulo="Qué son, a qué hora salen y cómo se forma su quiniela."
      descripcion="Guía de las loterías americanas que se siguen en las bancas dominicanas."
      botones={[
        { href: "/new-york", texto: "Resultados de New York" },
        { href: "/florida", texto: "Resultados de Florida" },
        { href: "/loterias-americanas", texto: "New Jersey y Georgia" },
      ]}
      introduccion="Además de las loterías dominicanas, en las bancas de República Dominicana también se juegan sorteos de Estados Unidos, y mucha gente que vive allá los sigue todos los días. Los más conocidos son los de New York y Florida, y también se siguen los de New Jersey y Georgia. Aquí te explicamos cómo funcionan."
      encabezadoJuegos="Las loterías americanas más seguidas"
      juegos={[
        {
          nombre: "New York",
          texto: "Tiene dos sorteos al día: el de la tarde (alrededor de las 2:30 p.m.) y el de la noche (alrededor de las 10:30 p.m.). Sus resultados salen de los sorteos diarios de tres y cuatro dígitos del estado de Nueva York.",
        },
        {
          nombre: "Florida",
          texto: "También tiene dos sorteos al día: el de día (alrededor de la 1:30 p.m.) y el de la noche (cerca de las 10:00 p.m.). Sus resultados salen de los sorteos Pick 3 y Pick 4 de la lotería de Florida.",
        },
        {
          nombre: "New Jersey y Georgia",
          texto: "Se siguen varios sorteos al día: New Jersey de día y de noche, y Georgia de día, de tarde y de noche. Puedes ver todos en la página de Loterías Americanas de La Bankera RD.",
        },
        {
          nombre: "Cómo se forma la quiniela",
          texto: "En las bancas dominicanas, la quiniela de estas loterías se arma con los números de los sorteos de tres dígitos (Pick 3) y cuatro dígitos (Pick 4) de cada estado. La forma más común es: el primer número son los dos últimos dígitos del Pick 3, y el segundo y el tercero salen de los cuatro dígitos del Pick 4 (los dos primeros y los dos últimos). Por eso el resultado se ve como tres números de dos cifras. Si tienes dudas sobre cómo lo arma tu banca, confírmalo con ella.",
        },
        {
          nombre: "Powerball y Mega Millions",
          texto: "Son las dos loterías nacionales de Estados Unidos con los premios mayores más grandes. Funcionan distinto a las anteriores: se escogen números y se sortean solo algunos días a la semana. Tenemos una guía aparte con sus reglas.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿Por qué se juegan loterías de Estados Unidos en República Dominicana?",
          respuesta:
            "Porque las bancas dominicanas usan los resultados de los sorteos de New York, Florida y otros estados para armar sus propias quinielas, y muchos dominicanos en Estados Unidos también las siguen.",
        },
        {
          pregunta: "¿A qué hora salen New York y Florida?",
          respuesta:
            "New York: tarde alrededor de las 2:30 p.m. y noche alrededor de las 10:30 p.m. Florida: día alrededor de la 1:30 p.m. y noche cerca de las 10:00 p.m. Los horarios pueden variar según la época del año, por el cambio de horario en Estados Unidos.",
        },
        {
          pregunta: "¿Qué son Pick 3 y Pick 4?",
          respuesta:
            "Son los sorteos diarios de tres y cuatro dígitos de una lotería estatal de Estados Unidos. Sus resultados se usan para armar las quinielas de New York y Florida en las bancas dominicanas.",
        },
        {
          pregunta: "¿Dónde puedo ver los resultados?",
          respuesta:
            "En las páginas de New York, Florida y Loterías Americanas de La Bankera RD. Recuerda que somos una página informativa no oficial.",
        },
      ]}
    />
  );
}
