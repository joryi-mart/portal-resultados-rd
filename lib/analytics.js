import { readFileSync } from "fs";
import { createSign } from "crypto";
import path from "path";

const PROPERTY_ID = process.env.GA_PROPERTY_ID;
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DATA_API = "https://analyticsdata.googleapis.com/v1beta";

function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// En tu computadora, la llave vive en un archivo local (credentials/), que Git
// nunca sube. En Vercel (donde vive el sitio real) ese archivo no existe, así
// que ahí la llave se guarda como variable de entorno (GOOGLE_SERVICE_ACCOUNT_JSON)
// dentro del panel privado de Vercel, no en el código.
function leerCredenciales() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const texto = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    try {
      return JSON.parse(texto);
    } catch (error) {
      const posMatch = /position (\d+)/.exec(error.message);
      const pos = posMatch ? Number(posMatch[1]) : 0;
      const alrededor = texto.slice(Math.max(0, pos - 20), pos + 20);
      throw new Error(
        `${error.message} | largo=${texto.length} | alrededor="${JSON.stringify(alrededor)}"`
      );
    }
  }
  const ruta = path.join(process.cwd(), "credentials", "analytics-service-account.json");
  return JSON.parse(readFileSync(ruta, "utf8"));
}

// Google no ofrece un endpoint REST simple con contraseña: la cuenta de servicio
// firma un JWT con su llave privada y lo cambia por un token de acceso temporal
// (dura 1 hora). Evitamos la librería oficial @google-analytics/data porque su
// dependencia de gRPC es demasiado pesada para compilar rápido en este proyecto.
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

async function llamarApi(endpoint, cuerpo) {
  const token = await obtenerTokenAcceso();
  const respuesta = await fetch(`${DATA_API}/properties/${PROPERTY_ID}:${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cuerpo),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error("No se pudo leer Analytics: " + JSON.stringify(datos));
  }
  return datos;
}

export async function usuariosActivos7Dias() {
  const datos = await llamarApi("runReport", {
    dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    metrics: [{ name: "activeUsers" }],
  });
  const valor = datos.rows?.[0]?.metricValues?.[0]?.value;
  return valor ? Number(valor) : 0;
}

export async function usuariosEnVivo() {
  const datos = await llamarApi("runRealtimeReport", {
    metrics: [{ name: "activeUsers" }],
  });
  const valor = datos.rows?.[0]?.metricValues?.[0]?.value;
  return valor ? Number(valor) : 0;
}

export async function paginasMasVisitadas() {
  const datos = await llamarApi("runReport", {
    dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 10,
  });
  return (datos.rows || []).map(function (fila) {
    return {
      ruta: fila.dimensionValues[0].value,
      vistas: Number(fila.metricValues[0].value),
    };
  });
}

export async function visitantesPorPais() {
  const datos = await llamarApi("runReport", {
    dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    dimensions: [{ name: "country" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit: 10,
  });
  return (datos.rows || []).map(function (fila) {
    return {
      pais: fila.dimensionValues[0].value,
      usuarios: Number(fila.metricValues[0].value),
    };
  });
}
