import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La Bankera RD — Resultados de Loterías Dominicanas",
    short_name: "La Bankera RD",
    description: "Resultados de loterías dominicanas en vivo: Leidsa, Nacional, Loteka, Real y más.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF7EE",
    theme_color: "#10203A",
    lang: "es-DO",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
