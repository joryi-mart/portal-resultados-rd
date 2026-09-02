import type { Metadata } from "next";
import "./globals.css";
import EstrellaMeGusta from "./EstrellaMeGusta";

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
      <body className="min-h-full flex flex-col">
        <div className="sticky top-0 z-50 border-b border-white/10 bg-[#10203A] px-4 py-2 shadow-md sm:px-8">
          <a href="/" className="mx-auto flex max-w-7xl items-center gap-2">
            <img src="/logo-icon.svg" alt="" className="h-6 w-6" />
            <span className="text-base font-bold leading-none text-[#FBF7EE]">
              La Bankera<span className="text-[#E7A63C]">RD</span>
            </span>
          </a>
        </div>
        {children}
        <EstrellaMeGusta />
      </body>
    </html>
  );
}