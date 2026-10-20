import { readFileSync } from "fs";
import { createSign } from "crypto";
import path from "path";

// Misma cuenta de servicio que ya usa Google Analytics (lib/analytics.js);
// solo hace falta agregarla como usuario en Search Console y habilitar la
// API en el mismo proyecto de Google Cloud, sin credenciales nuevas.
const SITE_URL = process.env.GSC_SITE_URL || "sc-domain:labankerard.com";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEARCH_CONSOLE_API = "https://searchconsole.googleapis.com/webmasters/v3";

function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function leerCredenciales() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }
  const ruta = path.join(process.cwd(), "credentials", "analytics-service-account.json");
  return JSON.parse(readFileSync(ruta, "utf8"));
}

async function obtenerTokenAcceso() {
  const credenciales = leerCredenciales();
  const ahora = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(JSON.stringify({
    iss: credenciales.client_email,
    scope: SCOPE,
    aud: TOKEN_URL,
    exp: ahora + 3600,
    iat: ahora,
  }));
  const firmante = createSign("RSA-SHA256");
  firmante.update(header + "." + claim);
  const firma = firmante.sign(credenciales.private_key, "base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const jwt = header + "." + claim + "." + firma;

  const respuesta = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error("No se pudo obtener el token de Google: " + JSON.stringify(datos));
  }
  return datos.access_token;
}

// A diferencia de la API de Analytics, Search Console no acepta "28daysAgo"
// ni "today": exige fechas exactas en formato YYYY-MM-DD.
function fechaISO(diasAtras) {
  const d = new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

async function consultar(cuerpo) {
  const token = await obtenerTokenAcceso();
  const respuesta = await fetch(
    `${SEARCH_CONSOLE_API}/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    }
  );
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error("No se pudo leer Search Console: " + JSON.stringify(datos));
  }
  return datos;
}

// endDate "today" no sirve aqui (Search Console tiene ~2-3 dias de retraso
// propio); por defecto se piden los ultimos 28 dias ya procesados.
export async function rendimientoGeneral(dias = 28) {
  const datos = await consultar({
    startDate: fechaISO(dias),
    endDate: fechaISO(3),
  });
  const fila = datos.rows?.[0];
  return {
    clics: fila ? Math.round(fila.clicks) : 0,
    impresiones: fila ? Math.round(fila.impressions) : 0,
    ctr: fila ? +(fila.ctr * 100).toFixed(2) : 0,
    posicionPromedio: fila ? +fila.position.toFixed(1) : 0,
  };
}

export async function principalesConsultas(dias = 28, limite = 20) {
  const datos = await consultar({
    startDate: fechaISO(dias),
    endDate: fechaISO(3),
    dimensions: ["query"],
    rowLimit: limite,
  });
  return (datos.rows || []).map(function (fila) {
    return {
      consulta: fila.keys[0],
      clics: Math.round(fila.clicks),
      impresiones: Math.round(fila.impressions),
      ctr: +(fila.ctr * 100).toFixed(2),
      posicion: +fila.position.toFixed(1),
    };
  });
}

export async function paginasConMasClics(dias = 28, limite = 20) {
  const datos = await consultar({
    startDate: fechaISO(dias),
    endDate: fechaISO(3),
    dimensions: ["page"],
    rowLimit: limite,
  });
  return (datos.rows || []).map(function (fila) {
    return {
      pagina: fila.keys[0],
      clics: Math.round(fila.clicks),
      impresiones: Math.round(fila.impressions),
      ctr: +(fila.ctr * 100).toFixed(2),
      posicion: +fila.position.toFixed(1),
    };
  });
}
