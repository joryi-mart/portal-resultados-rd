"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const GOOGLE_ANALYTICS_ID = "G-S0FTS8VX1J";

// El panel privado (/admin/*) es solo para nosotros, no para el público, así
// que no debe contarse como visita real en las estadísticas de Analytics.
// lazyOnload: Analytics se carga cuando la pagina ya termino de cargar, para
// no competir con el contenido (PageSpeed lo marcaba como JS sin usar).
export default function GoogleAnalytics() {
  const pathname = usePathname();
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          // Los robots que ejecutan JavaScript (vistas previas de Facebook,
          // revisiones de Google desde sus centros de datos en Lulea,
          // Prineville, Council Bluffs...) inflaban "usuarios activos". Sin
          // 'config' no se manda nada a Analytics.
          if (!navigator.webdriver && !/bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|HeadlessChrome|Lighthouse|Google-InspectionTool|Chrome-Lighthouse|PageSpeed/i.test(navigator.userAgent)) {
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          }
        `}
      </Script>
    </>
  );
}
