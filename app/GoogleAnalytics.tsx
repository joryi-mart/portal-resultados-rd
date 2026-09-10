"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const GOOGLE_ANALYTICS_ID = "G-S0FTS8VX1J";

// El panel privado (/admin/*) es solo para nosotros, no para el público, así
// que no debe contarse como visita real en las estadísticas de Analytics.
export default function GoogleAnalytics() {
  const pathname = usePathname();
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ANALYTICS_ID}');
        `}
      </Script>
    </>
  );
}
