import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import calendario from "@/lib/calendario.json";
import { DATOS } from "@/lib/datosCuriosos";

// Panel privado: el calendario semanal de publicaciones de Facebook y lo que se
// publicó en los últimos 7 días. Usa la misma sesión que /admin/analytics.
export const dynamic = "force-dynamic";

const COOKIE_NAME = "analytics_auth";
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const PREFIJOS = ["que-paso-", "efemeride-", "dato-", "reel-"];

type Publicacion = { id: string; nombre: string; dias: number[]; hora: number; ruta: string };
type Fila = { loteria_slug: string; fecha: string; post_id: string | null };

function horaTexto(h: number) {
  const sufijo = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:00 ${sufijo}`;
}

function tipoDeSlug(slug: string) {
  if (slug.startsWith("que-paso-mlb")) return "¿Qué pasó ayer en MLB?";
  if (slug.startsWith("que-paso-lidom")) return "¿Qué pasó ayer en LIDOM?";
  if (slug.startsWith("que-paso-nba")) return "¿Qué pasó ayer en la NBA?";
  if (slug.startsWith("que-paso-futbol")) return "¿Qué pasó ayer en LaLiga?";
  if (slug.startsWith("efemeride-")) return "Un día como hoy";
  if (slug.startsWith("reel-")) return "Reel de deportes";
  return "¿Sabías qué…?";
}

export default async function AdminCalendario() {
  const cookieStore = await cookies();
  const autenticado = cookieStore.get(COOKIE_NAME)?.value === process.env.ANALYTICS_ADMIN_PASSWORD;

  if (!autenticado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF7EE] px-4">
        <div className="w-full max-w-sm rounded-xl border border-[#10203A]/12 bg-white p-6 text-center shadow-sm">
          <h1 className="mb-3 text-xl font-bold text-[#10203A]">Acceso privado</h1>
          <p className="mb-4 text-sm text-[#5C6B78]">Entra primero con tu contraseña y luego vuelve a esta página.</p>
          <a href="/admin/analytics" className="block rounded-lg bg-[#1E4D8C] px-3 py-2 font-bold text-white">
            Iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  const publicaciones = calendario.publicaciones as Publicacion[];
  const desde = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("publicaciones_facebook")
    .select("loteria_slug, fecha, post_id")
    .gte("fecha", desde)
    .order("fecha", { ascending: false })
    .limit(300);
  const recientes = ((data || []) as Fila[]).filter(function (f) {
    return PREFIJOS.some(function (p) { return f.loteria_slug.startsWith(p); }) && !f.loteria_slug.startsWith("dato-del-dia-");
  });

  const { data: datosSalidos } = await supabase
    .from("publicaciones_facebook")
    .select("loteria_slug")
    .in("loteria_slug", DATOS.map(function (d) { return d.slug; }));
  const datosRestantes = DATOS.length - (datosSalidos || []).length;

  return (
    <div className="min-h-screen bg-[#FBF7EE] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 text-2xl font-bold text-[#10203A]">Calendario de publicaciones</h1>
        <p className="mb-6 text-sm text-[#5C6B78]">
          Se publica solo en Facebook, todas las semanas. Horas de República Dominicana. Si un día no hay juegos o
          efeméride, esa publicación no sale.
        </p>

        <div className="mb-4 overflow-x-auto rounded-xl border border-[#10203A]/12 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-[#5C6B78]">
                <th className="p-3">Hora</th>
                <th className="p-3">Publicación</th>
                {DIAS.map(function (d) {
                  return <th key={d} className="p-3 text-center">{d}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {publicaciones.map(function (p) {
                return (
                  <tr key={p.id} className="border-t border-[#10203A]/6">
                    <td className="whitespace-nowrap p-3 font-mono text-[#1E4D8C]">{horaTexto(p.hora)}</td>
                    <td className="p-3 font-bold text-[#10203A]">{p.nombre}</td>
                    {DIAS.map(function (_, i) {
                      return (
                        <td key={i} className="p-3 text-center">
                          {p.dias.includes(i) ? <span className="text-[#1E4D8C]">●</span> : <span className="text-[#10203A]/20">·</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mb-4 rounded-xl border border-[#10203A]/12 bg-white p-6">
          <p className="text-sm text-[#5C6B78]">Datos «¿Sabías qué…?» que quedan por publicar</p>
          <p className="mt-1 text-3xl font-bold text-[#1E4D8C]">
            {datosRestantes} <span className="text-base font-normal text-[#5C6B78]">de {DATOS.length}</span>
          </p>
          {datosRestantes <= 5 ? (
            <p className="mt-2 text-sm text-[#B23B26]">Quedan pocos: hay que agregar más datos a la lista.</p>
          ) : null}
        </div>

        <div className="mb-4 rounded-xl border border-[#10203A]/12 bg-white p-6">
          <p className="mb-3 text-sm font-bold text-[#5C6B78]">Publicado en los últimos días</p>
          {error ? (
            <p className="text-sm text-[#B23B26]">No se pudo cargar: {error.message}</p>
          ) : recientes.length === 0 ? (
            <p className="text-sm text-[#5C6B78]">Todavía no hay publicaciones del calendario.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recientes.map(function (f, i) {
                return (
                  <div key={i} className="flex items-center justify-between gap-3 border-t border-[#10203A]/6 pt-2 first:border-t-0 first:pt-0">
                    <span className="min-w-0 truncate text-sm text-[#10203A]">
                      <span className="mr-2 font-mono text-[#5C6B78]">{f.fecha}</span>
                      {tipoDeSlug(f.loteria_slug)}
                    </span>
                    {f.post_id ? (
                      <a href={`https://www.facebook.com/${f.post_id}`} target="_blank" rel="noreferrer" className="shrink-0 text-sm font-bold text-[#1E4D8C] underline">
                        Ver
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-sm text-[#5C6B78]">
          Historial técnico de cada hora:{" "}
          <a
            href="https://github.com/joryi-mart/portal-resultados-rd/actions/workflows/calendario.yml"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-[#1E4D8C] underline"
          >
            ver en GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
