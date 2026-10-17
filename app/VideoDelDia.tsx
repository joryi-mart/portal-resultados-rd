type MetaVideo = { fecha?: string; caption?: string; destino?: string };

async function leerMetaVideo(slug: string): Promise<MetaVideo | null> {
  // Se pide por HTTP (no fs.readFileSync): los archivos de /public no siempre
  // quedan incluidos en el paquete de la funcion serverless cuando se leen
  // con una ruta armada dinamicamente, pero por HTTP siempre los sirve el
  // CDN de Vercel - mismo patron que ya usa app/api/publicar-reel-diario.
  try {
    const res = await fetch(`https://labankerard.com/reel-${slug}.json`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function diasDesde(fechaISO: string) {
  const hoyRD = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const a = new Date(hoyRD + "T00:00:00");
  const b = new Date(fechaISO + "T00:00:00");
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

// Muestra el mismo video que ya se publica en Facebook (generado cada
// mañana por scripts/generar_reel_diario.py), directo en la pagina web.
// Si ese deporte no tuvo juegos recientes, el archivo .mp4 queda viejo (el
// script no lo borra, solo lo sobrescribe la proxima vez que si hay
// partido) - por eso aqui se revisa la fecha del .json y no se muestra si
// tiene mas de 2 dias, para no hacerlo pasar por el resumen de "hoy".
export default async function VideoDelDia(props: { slug: string; titulo: string }) {
  const meta = await leerMetaVideo(props.slug);
  if (!meta || !meta.fecha || diasDesde(meta.fecha) > 2) return null;

  return (
    <div className="mx-auto max-w-sm px-4 pt-6">
      <p className="mb-2 text-center font-mono text-xs font-bold uppercase tracking-wide text-[#5C6B78]">
        {props.titulo}
      </p>
      <video
        src={`/reel-${props.slug}.mp4`}
        controls
        playsInline
        preload="metadata"
        className="w-full rounded-xl border border-[#10203A]/12 shadow-sm"
        style={{ aspectRatio: "9 / 16" }}
      />
    </div>
  );
}
