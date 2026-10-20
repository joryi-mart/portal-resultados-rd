"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const GOOGLE_ANALYTICS_ID = "G-S0FTS8VX1J";
// Microsoft Clarity: grabaciones de sesiones y mapas de calor (gratis).
const CLARITY_ID = "yxp652wkqa";

const FILTRO_BOTS = "bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|HeadlessChrome|Lighthouse|Google-InspectionTool|Chrome-Lighthouse|PageSpeed";

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
          // revisiones de Google, herramientas de SEO como SEMrush/Ahrefs
          // corriendo Chrome real desde sus servidores en la nube...) usan un
          // navegador normal y pasan el filtro de arriba sin problema. Lo que
          // sí tienen en comun es que nunca se quedan, ni tocan nada: por eso
          // no se manda 'config' hasta que pasan 2 segundos reales en la
          // pagina o hay alguna senal de interaccion (scroll, toque, clic,
          // tecla). Un bot que entra y se va en 0 segundos nunca llega a
          // contarse como visita.
          if (!navigator.webdriver && !/${FILTRO_BOTS}/i.test(navigator.userAgent)) {
            var yaEnvio = false;
            function enviarGA() {
              if (yaEnvio) return;
              yaEnvio = true;
              gtag('js', new Date());
              gtag('config', '${GOOGLE_ANALYTICS_ID}');
            }
            var temporizador = setTimeout(enviarGA, 2000);
            var eventos = ['scroll', 'touchstart', 'click', 'keydown', 'mousemove'];
            eventos.forEach(function (ev) {
              window.addEventListener(ev, enviarGA, { once: true, passive: true });
            });
          }
        `}
      </Script>
      {/* Mismo filtro de robots y de "solo cuenta si hay persona real" que Analytics. */}
      <Script id="microsoft-clarity" strategy="lazyOnload">
        {`
          if (!navigator.webdriver && !/${FILTRO_BOTS}/i.test(navigator.userAgent)) {
            var yaEnvioClarity = false;
            function enviarClarity() {
              if (yaEnvioClarity) return;
              yaEnvioClarity = true;
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_ID}");
            }
            var temporizadorClarity = setTimeout(enviarClarity, 2000);
            var eventosClarity = ['scroll', 'touchstart', 'click', 'keydown', 'mousemove'];
            eventosClarity.forEach(function (ev) {
              window.addEventListener(ev, enviarClarity, { once: true, passive: true });
            });
          }
        `}
      </Script>
    </>
  );
}
