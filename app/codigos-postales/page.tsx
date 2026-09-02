import Buscador from "./Buscador";

export const metadata = {
  title: "Códigos Postales de República Dominicana",
  description: "Busca el código postal de tu sector, barrio o provincia en República Dominicana. Más de 2,300 localidades con su código de 5 dígitos.",
  openGraph: {
    title: "Códigos Postales de República Dominicana",
    description: "Busca el código postal de tu sector o provincia en República Dominicana.",
    locale: "es_DO",
    type: "website",
  },
  alternates: { canonical: "https://labankerard.com/codigos-postales" },
};

export default function CodigosPostalesPage() {
  return <Buscador />;
}
