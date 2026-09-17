// lib/imagenPublicacion.js
// Genera la imagen cuadrada que acompaña cada publicacion de Facebook,
// con el nombre de la loteria y los resultados del dia.

import sharp from "sharp";

function escaparXml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function generarImagenResultados(loteriaNombre, fechaTexto, resultados) {
  const alturaFila = 92;
  const inicioFilas = 300;
  const alturaFilas = resultados.length * alturaFila;
  const alto = inicioFilas + alturaFilas + 140;

  const filas = resultados
    .map(function (r, i) {
      const y = inicioFilas + i * alturaFila;
      return `
        <rect x="80" y="${y}" width="920" height="72" rx="14" fill="#FFFFFF" opacity="0.06"/>
        <text x="112" y="${y + 46}" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#D5DEEA">${escaparXml(r.sorteoNombre)}</text>
        <text x="948" y="${y + 46}" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="34" fill="#F6D983" text-anchor="end">${escaparXml(r.numeros)}</text>
      `;
    })
    .join("");

  const svg = `
    <svg width="1080" height="${alto}" viewBox="0 0 1080 ${alto}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fondo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#173B63"/>
          <stop offset="100%" stop-color="#0A1830"/>
        </linearGradient>
        <radialGradient id="bolaBlanca" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="55%" stop-color="#F2F4F7"/>
          <stop offset="100%" stop-color="#C9D2DC"/>
        </radialGradient>
      </defs>

      <rect width="1080" height="${alto}" fill="url(#fondo)"/>

      <circle cx="90" cy="96" r="34" fill="#2E6DA4" stroke="#E7A63C" stroke-width="2"/>
      <circle cx="78" cy="86" r="13" fill="url(#bolaBlanca)"/>
      <text x="78" y="91" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="10" fill="#1B3A63" text-anchor="middle">07</text>
      <circle cx="102" cy="86" r="13" fill="url(#bolaBlanca)"/>
      <text x="102" y="91" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="10" fill="#1B3A63" text-anchor="middle">19</text>
      <circle cx="90" cy="106" r="13" fill="url(#bolaBlanca)"/>
      <text x="90" y="111" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="10" fill="#1B3A63" text-anchor="middle">58</text>
      <text x="140" y="106" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="34" fill="#FBF7EE">La Bankera<tspan fill="#E7A63C">RD</tspan></text>

      <text x="80" y="220" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="54" fill="#FBF7EE">${escaparXml(loteriaNombre)}</text>
      <text x="80" y="264" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#9AB0CC">${escaparXml(fechaTexto)}</text>

      ${filas}

      <text x="80" y="${alto - 60}" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#D5DEEA">labankerard.com</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
