// scripts/ejecutar_calendario.mjs
// Revisa lib/calendario.json y llama a los publicadores que tocan a esta hora
// (hora de RD). Lo corre .github/workflows/calendario.yml cada hora.
// Si algún publicador falla, termina con error para que GitHub mande el aviso por correo.
//
// Uso: CRON_SECRET=... node scripts/ejecutar_calendario.mjs
//      (con SOLO=<id> corre solo esa publicación, sin mirar el día ni la hora)

import { readFileSync } from "fs";

const BASE = "https://labankerard.com";
const calendario = JSON.parse(readFileSync(new URL("../lib/calendario.json", import.meta.url), "utf8"));
const clave = (process.env.CRON_SECRET || "").trim();
if (!clave) {
  console.error("Falta CRON_SECRET");
  process.exit(1);
}

const ahoraRD = new Date(Date.now() - 4 * 60 * 60 * 1000);
const dia = ahoraRD.getUTCDay();
const hora = ahoraRD.getUTCHours();
const solo = process.env.SOLO;

const pendientes = calendario.publicaciones.filter(function (p) {
  if (solo) return p.id === solo;
  return p.dias.includes(dia) && hora >= p.hora && hora - p.hora < calendario.ventanaHoras;
});

console.log(`Hora de RD: ${ahoraRD.toISOString().slice(0, 16).replace("T", " ")} (dia ${dia}). Tocan: ${pendientes.map((p) => p.id).join(", ") || "nada"}`);

let fallos = 0;
for (const p of pendientes) {
  const url = `${BASE}${p.ruta}${p.ruta.includes("?") ? "&" : "?"}clave=${encodeURIComponent(clave)}`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${clave}` }, signal: AbortSignal.timeout(280000) });
    const texto = await res.text();
    let cuerpo;
    try { cuerpo = JSON.parse(texto); } catch { cuerpo = { error: "respuesta no es JSON", detalle: texto.slice(0, 200) }; }
    const erroresInternos = (cuerpo.resultados || []).filter((r) => r.error);
    if (!res.ok || cuerpo.error || erroresInternos.length) {
      fallos++;
      console.log(`❌ ${p.nombre}: ${JSON.stringify(cuerpo)}`);
    } else {
      console.log(`✅ ${p.nombre}: ${JSON.stringify(cuerpo)}`);
    }
  } catch (e) {
    fallos++;
    console.log(`❌ ${p.nombre}: ${e.message}`);
  }
}

if (fallos) {
  console.error(`${fallos} publicacion(es) fallaron.`);
  process.exit(1);
}
