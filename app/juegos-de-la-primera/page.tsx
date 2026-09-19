import GuiaJuegos from "../GuiaJuegos";

export const metadata = {
  title: "¿Cómo Funcionan los Juegos de La Primera? Quiniela, Quinielón y Loto 5",
  description:
    "Qué ofrece La Primera y cómo se juega cada producto: Quiniela La Primera (día y noche), Quinielón y Loto 5.",
  openGraph: {
    title: "¿Cómo Funcionan los Juegos de La Primera?",
    description: "Guía de los productos de La Primera: Quiniela, Quinielón y Loto 5.",
    locale: "es_DO",
    type: "article",
  },
  alternates: { canonical: "https://labankerard.com/juegos-de-la-primera" },
};

export default function JuegosDeLaPrimeraPage() {
  return (
    <GuiaJuegos
      hrefActual="/juegos-de-la-primera"
      titulo="¿Cómo funcionan los juegos de La Primera?"
      subtitulo="Quiniela, Quinielón y Loto 5, con sorteos de día y de noche."
      descripcion="Guía de los productos de La Primera y cómo se juega cada uno."
      botones={[{ href: "/la-primera", texto: "Ve los resultados de hoy de La Primera" }]}
      introduccion="La Primera tiene sorteos en dos momentos del día: uno al mediodía y otro por la noche. Estos son sus productos principales:"
      juegos={[
        {
          nombre: "Quiniela La Primera",
          texto: "El sorteo tradicional de tres números (00-99). Se juega en dos tandas al día: la de mediodía (12:00 p.m.) y la de la noche (8:00 p.m., conocida como La Primera Noche). Ganas si tu número sale en cualquiera de las tres posiciones.",
        },
        {
          nombre: "Quinielón",
          texto: "Un juego electrónico que también tiene dos sorteos al día, uno de día (12:00 p.m.) y uno de noche (8:00 p.m.). Las reglas exactas de premios las define La Primera, así que lo mejor es confirmarlas en tu banca.",
        },
        {
          nombre: "Loto 5",
          texto: "Se escogen 5 números y hay distintos premios según cuántos aciertes. Se sortea por la noche, a las 8:00 p.m.",
        },
        {
          nombre: "Palé y tripleta",
          texto: "Son las formas clásicas de jugar sobre la quiniela: en el palé eliges dos números y ganas si ambos salen entre los tres premios; en la tripleta eliges tres y ganas si salen los tres. Están explicadas en nuestra guía de cómo jugar.",
        },
      ]}
      preguntas={[
        {
          pregunta: "¿A qué hora salen los sorteos de La Primera?",
          respuesta:
            "Hay una tanda al mediodía (12:00 p.m.) y otra por la noche (8:00 p.m.). Consulta el horario exacto de cada sorteo en la página de La Primera de La Bankera RD.",
        },
        {
          pregunta: "¿Cuántos números se escogen en el Loto 5?",
          respuesta: "Cinco números.",
        },
        {
          pregunta: "¿Qué es La Primera Noche?",
          respuesta:
            "Es la quiniela de La Primera que se sortea por la noche, además de la de mediodía.",
        },
      ]}
    />
  );
}
