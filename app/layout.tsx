import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://labankerard.com"),
  title: {
    default: "La Bankera RD | Resultados de Loterías Dominicanas en Vivo",
    template: "%s | La Bankera RD",
  },
  description:
    "Resultados en vivo de las loterías dominicanas: Nacional, Leidsa, Loteka, Real, Lotedom, La Primera y más. Además, Béisbol/MLB, NBA, Fútbol y Cine en un solo lugar.",
  keywords: [
    "loterias dominicanas",
    "resultados leidsa",
    "loteria nacional resultados",
    "loteka resultados",
    "quiniela dominicana",
    "resultados de hoy republica dominicana",
  ],
  openGraph: {
    title: "La Bankera RD | Resultados de Loterías Dominicanas en Vivo",
    description:
      "Resultados en vivo de las loterías dominicanas, actualizados al instante. Consulta Leidsa, Nacional, Loteka, Real y más.",
    siteName: "La Bankera RD",
    locale: "es_DO",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const datosEstructurados = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "La Bankera RD",
  url: "https://labankerard.com",
  description:
    "Resultados en vivo de las loterías dominicanas, Béisbol/MLB, NBA, Fútbol y Cine.",
  inLanguage: "es-DO",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://labankerard.com/{search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}