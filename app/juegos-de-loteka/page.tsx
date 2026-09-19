import GuiaJuegos from "../GuiaJuegos";

export const metadata = {
  title: "¿Cómo Funcionan los Juegos de Loteka? Quiniela, Mega Lotto y Más",
  description:
    "Qué ofrece Loteka y cómo se juega cada producto: Quiniela Loteka, Mega Lotto, Mega Chances, La Repartidera y Toca 3.",
  openGraph: {
    title: "¿Cómo Funcionan los Juegos de Loteka?",
    description: "Guía de los productos de Loteka: Quiniela, Mega Lotto, Mega Chances, La Repartidera y Toca 3.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/juegos-de-loteka" },
};

export default function JuegosDeLotekaPage() {
  return (
    <GuiaJuegos
      hrefActual="/juegos-de-loteka"
      titulo="¿Cómo funcionan los juegos de Loteka?"
      subtitulo="Quiniela, Mega Lotto, Mega Chances, La Repartidera y Toca 3, explicados uno por uno."
      descripcion="Guía de los productos de Loteka y cómo se juega cada uno."
      botones={[{ href: "/loteka", texto: "Ve los resultados de hoy de Loteka" }]}
      introduccion="Loteka es una de las loterías dominicanas más conocidas. Todos sus sorteos corren a la misma hora, por la noche (alrededor de las 7:55 p.m.), y cada producto tiene su propia forma de jugar:"
      juegos={[
        {
          nombre: "Quiniela Loteka",
          texto: "El sorteo tradicional de tres números (00-99): el primero, el segundo y el tercero corresponden a los tres premios de la quiniela. Es la base para jugar quiniela, palé o tripleta.",
        },
        {
          nombre: "Mega Lotto",
          texto: "Se escogen 6 números y no importa el orden en que los elijas. Se sortea los lunes y los jueves. Además del premio mayor por acertar los 6, hay premios menores por acertar menos números.",
        },
        {
          nombre: "Mega Chances",
          texto: "Se escogen 5 números, y hay distintos premios según cuántos aciertes.",
        },
        {
          nombre: "La Repartidera",
          texto: "Un sorteo relacionado con Mega Chances que publica un número de dos cifras (00-99) cada día. Si tienes dudas sobre cómo se paga, lo mejor es confirmarlo en tu banca de confianza.",
        },
        {
          nombre: "Toca 3",
          texto: "Se juega con una combinación de tres dígitos, cada uno del 0 al 9. Por eso sus resultados se ven así: 4-4-8.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿A qué hora salen los sorteos de Loteka?",
          respuesta:
            "Todos alrededor de las 7:55 p.m. Consulta el horario exacto en la página de Loteka de La Bankera RD, porque en fechas especiales puede cambiar.",
        },
        {
          pregunta: "¿Qué días se juega el Mega Lotto?",
          respuesta: "Los lunes y los jueves.",
        },
        {
          pregunta: "¿Cuál es la diferencia entre la Quiniela Loteka y Mega Chances?",
          respuesta:
            "La Quiniela Loteka saca tres números del 00 al 99 y ganas si tu número sale en cualquiera de las tres posiciones. En Mega Chances se escogen 5 números y los premios dependen de cuántos aciertes.",
        },
      ]}
    />
  );
}
