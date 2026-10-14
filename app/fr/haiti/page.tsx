import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";
import PreguntasFrecuentes from "../../PreguntasFrecuentes";

// Version en frances de /haiti para el publico haitiano (Search Console mostro
// busquedas en frances con muy buen CTR). Ademas del Haiti Bolet muestra los
// tirajes de New York, Florida y Georgia, que la borlette haitiana usa mucho.
// Las horas se muestran en hora de Haiti (America/Port-au-Prince), que en
// invierno va una hora detras de RD.

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

const COLOR_AZUL = "#1E4D8C";
const COLOR_TEXTO_SECUNDARIO = "#2E3B48";

export const revalidate = 300;

const URL_FR = "https://labankerard.com/fr/haiti";
const URL_ES = "https://labankerard.com/haiti";

const TITULO = "Résultats Haïti Bolet aujourd'hui — Tirages et horaires";
const DESCRIPCION =
  "Résultats du Haïti Bolet aujourd'hui : les 6 tirages du jour, plus les tirages New York, Florida et Georgia. Numéros gagnants mis à jour en direct.";

export const metadata = {
  title: TITULO,
  description: DESCRIPCION,
  openGraph: { images: ["/opengraph-image.png"], title: `${TITULO} | La Bankera RD`, description: DESCRIPCION, locale: "fr_HT", type: "website" },
  alternates: {
    canonical: URL_FR,
    languages: { es: URL_ES, fr: URL_FR, "x-default": URL_ES },
  },
};

// Nombre en frances de cada sorteo, como lo llaman en Haiti (Midi / Soir).
const NOMBRES_TIRAGES: Record<number, string> = {
  113: "New York Midi",
  115: "New York Soir",
  118: "Florida Midi",
  114: "Florida Soir",
  140: "Georgia Midi",
  141: "Georgia Soir",
  142: "Georgia Nuit",
};
const IDS_HAITI = [129, 130, 131, 132, 133, 134];
const IDS_AMERICAINS = [113, 115, 118, 114, 140, 141, 142];

type Sorteo = { id: number; nombre: string; hora_sorteo: string };
type Resultado = { sorteo_id: number; numeros: string; fecha: string };

function hoyRD() {
  return new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function sumarDias(fechaISO: string, dias: number) {
  return new Date(new Date(fechaISO + "T12:00:00Z").getTime() + dias * 86400000).toISOString().slice(0, 10);
}

// La hora guardada es hora de RD (UTC-4 fijo); se pasa a la hora de Haiti.
function heureHaiti(hora24: string, fechaISO: string) {
  if (!hora24) return "";
  const [h, m] = hora24.split(":");
  const instante = new Date(`${fechaISO}T${h.padStart(2, "0")}:${(m || "00").padStart(2, "0")}:00-04:00`);
  const texto = instante.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Port-au-Prince" });
  const [hh, mm] = texto.split(":");
  return `${parseInt(hh, 10)}h${mm}`;
}

function dateLongue(fechaISO: string) {
  const t = new Date(fechaISO + "T12:00:00Z").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function dateCourte(fechaISO: string) {
  return new Date(fechaISO + "T12:00:00Z").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}

const LOTS = ["1er lot", "2e lot", "3e lot"];

function Tirage(props: { titre: string; heure: string; aujourdhui?: Resultado; dernier?: Resultado }) {
  const numeros = props.aujourdhui ? props.aujourdhui.numeros.split("-") : [];
  return (
    <div className="rounded-xl border border-[#10203A]/15 bg-white p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">{props.titre}</p>
        <p className="shrink-0 font-mono text-base font-semibold" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{props.heure}</p>
      </div>
      {numeros.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {numeros.map(function (n, i) {
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full text-2xl font-extrabold"
                  style={i === 0 ? { backgroundColor: "#FFD166", color: "#10203A" } : { backgroundColor: COLOR_AZUL, color: "#FFFFFF" }}
                >
                  {n}
                </span>
                <span className="font-mono text-xs font-semibold" style={{ color: COLOR_TEXTO_SECUNDARIO }}>{LOTS[i] || ""}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <span className="inline-block rounded-full px-3 py-1 font-mono text-xs font-bold uppercase tracking-wide" style={{ backgroundColor: "#E4E8EB", color: "#4A5560" }}>
          En attente
        </span>
      )}
      {!props.aujourdhui && props.dernier ? (
        <p className="mt-3 border-t border-[#10203A]/8 pt-3 text-sm" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Dernier résultat ({dateCourte(props.dernier.fecha)}) : <strong>{props.dernier.numeros.split("-").join(" - ")}</strong>
        </p>
      ) : null}
    </div>
  );
}

export default async function HaitiBoletFrancais() {
  const hoy = hoyRD();
  const ids = [...IDS_HAITI, ...IDS_AMERICAINS];

  const [{ data: sorteosData }, { data: resultadosData }] = await Promise.all([
    supabase.from("sorteos").select("id, nombre, hora_sorteo").in("id", ids),
    supabase.from("resultados").select("sorteo_id, numeros, fecha").in("sorteo_id", ids).gte("fecha", sumarDias(hoy, -7)).order("fecha", { ascending: false }),
  ]);
  const sorteos = (sorteosData || []) as Sorteo[];
  const resultados = (resultadosData || []) as Resultado[];

  function sorteo(id: number) {
    return sorteos.find(function (s) { return s.id === id; });
  }
  function deHoy(id: number) {
    return resultados.find(function (r) { return r.sorteo_id === id && r.fecha === hoy; });
  }
  function ultimo(id: number) {
    return resultados.find(function (r) { return r.sorteo_id === id && r.fecha < hoy; });
  }

  const heuresHaiti = IDS_HAITI.map(function (id) { return heureHaiti(sorteo(id)?.hora_sorteo || "", hoy); }).filter(Boolean);

  return (
    <div lang="fr" className={display.variable + " " + body.variable + " " + mono.variable + " min-h-screen bg-[#FBF7EE] font-[family-name:var(--font-body)] text-[#10203A]"}>
      <header className="bg-[#10203A] px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            <a href="/haiti" hrefLang="es" className="rounded-full border border-white/25 px-3 py-1 text-[#FBF7EE] hover:bg-white/10">🇩🇴 Español</a>
            <span className="rounded-full bg-[#E7A63C] px-3 py-1 text-[#10203A]">🇫🇷 Français</span>
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-[#FBF7EE] sm:text-4xl">
            Résultats Haïti Bolet aujourd&apos;hui
          </h1>
          <p className="mt-2 font-mono text-base text-[#D5DEEA]">{dateLongue(hoy)}</p>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-[#D5DEEA]">
            Les 6 tirages du Haïti Bolet et les tirages New York, Florida et Georgia, mis à jour automatiquement tout au long de la journée. Toutes les heures sont à l&apos;heure d&apos;Haïti.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <section>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A]">Haïti Bolet : les 6 tirages du jour</h2>
          <div className="flex flex-col gap-4">
            {IDS_HAITI.map(function (id) {
              const s = sorteo(id);
              if (!s) return null;
              const heure = heureHaiti(s.hora_sorteo, hoy);
              return <Tirage key={id} titre={`Tirage de ${heure}`} heure={heure} aujourdhui={deHoy(id)} dernier={ultimo(id)} />;
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A]">Tirages New York, Florida et Georgia</h2>
          <p className="mb-4 text-base leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
            Les borlettes en Haïti utilisent souvent ces tirages américains. Voici les résultats du jour.
          </p>
          <div className="flex flex-col gap-4">
            {IDS_AMERICAINS.map(function (id) {
              const s = sorteo(id);
              if (!s) return null;
              return <Tirage key={id} titre={NOMBRES_TIRAGES[id]} heure={heureHaiti(s.hora_sorteo, hoy)} aujourdhui={deHoy(id)} dernier={ultimo(id)} />;
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-bold text-[#10203A]">Comment lire les résultats</h2>
          <p className="text-base leading-relaxed">
            Chaque tirage donne trois numéros de deux chiffres, de 00 à 99. Le premier est le <strong>1er lot</strong>, le deuxième le{" "}
            <strong>2e lot</strong> et le troisième le <strong>3e lot</strong>. Le 1er lot est affiché en jaune.
          </p>
          <p className="mt-3 text-base leading-relaxed">
            Vous pouvez aussi consulter l&apos;
            <a href="/haiti/historial" className="underline" style={{ color: COLOR_AZUL }}>historique complet du Haïti Bolet</a> (en espagnol) ou les pages{" "}
            <a href="/new-york" className="underline" style={{ color: COLOR_AZUL }}>New York</a> et{" "}
            <a href="/florida" className="underline" style={{ color: COLOR_AZUL }}>Florida</a>.
          </p>
        </section>
      </main>

      <PreguntasFrecuentes
        titulo="Questions fréquentes"
        preguntas={[
          {
            pregunta: "À quelle heure sont les tirages du Haïti Bolet ?",
            respuesta: `Il y a 6 tirages par jour : ${heuresHaiti.join(", ")} (heure d'Haïti). Les résultats apparaissent sur cette page quelques minutes après chaque tirage.`,
          },
          {
            pregunta: "Combien de numéros sortent à chaque tirage ?",
            respuesta: "Trois numéros de deux chiffres, de 00 à 99 : le 1er lot, le 2e lot et le 3e lot.",
          },
          {
            pregunta: "Où voir les résultats New York, Florida et Georgia ?",
            respuesta: "Sur cette même page, plus bas : New York Midi et Soir, Florida Midi et Soir, et Georgia Midi, Soir et Nuit.",
          },
          {
            pregunta: "Ce site est-il officiel ?",
            respuesta: "Non. La Bankera RD est un site d'information indépendant. Nous ne vendons pas de billets et n'acceptons pas de paris. Vérifiez toujours les résultats auprès des sources officielles.",
          },
        ]}
      />

      <footer className="border-t border-[#10203A]/8 px-6 py-8 text-center sm:px-10">
        <p className="mx-auto max-w-xl text-sm leading-relaxed" style={{ color: COLOR_TEXTO_SECUNDARIO }}>
          Site d&apos;information non officiel. La Bankera RD ne vend pas de billets et n&apos;accepte pas de paris.
        </p>
        <a href="/haiti" hrefLang="es" className="mt-3 inline-block font-mono text-sm text-[#1E4D8C] hover:underline">🇩🇴 Ver esta página en español</a>
      </footer>
    </div>
  );
}
