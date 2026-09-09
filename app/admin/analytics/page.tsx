import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { usuariosActivos7Dias, usuariosEnVivo, paginasMasVisitadas, visitantesPorPais } from "@/lib/analytics";

const COOKIE_NAME = "analytics_auth";

async function iniciarSesion(formData: FormData) {
  "use server";
  const clave = formData.get("clave");
  if (clave && clave === process.env.ANALYTICS_ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, clave.toString(), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    redirect("/admin/analytics");
  }
  redirect("/admin/analytics?error=1");
}

export default async function AdminAnalytics(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();
  const autenticado = cookieStore.get(COOKIE_NAME)?.value === process.env.ANALYTICS_ADMIN_PASSWORD;

  if (!autenticado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF7EE] px-4">
        <form action={iniciarSesion} className="w-full max-w-sm rounded-xl border border-[#10203A]/12 bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-xl font-bold text-[#10203A]">Acceso privado</h1>
          <input
            type="password"
            name="clave"
            placeholder="Contraseña"
            autoFocus
            className="mb-3 w-full rounded-lg border border-[#10203A]/20 px-3 py-2 text-base"
          />
          {searchParams.error ? (
            <p className="mb-3 text-sm text-[#B23B26]">Contraseña incorrecta.</p>
          ) : null}
          <button type="submit" className="w-full rounded-lg bg-[#1E4D8C] px-3 py-2 font-bold text-white">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  const [usuarios7Dias, enVivo, paginas, paises] = await Promise.all([
    usuariosActivos7Dias(),
    usuariosEnVivo(),
    paginasMasVisitadas(),
    visitantesPorPais(),
  ]);

  return (
    <div className="min-h-screen bg-[#FBF7EE] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-[#10203A]">Analytics — La Bankera RD</h1>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#10203A]/12 bg-white p-6">
            <p className="text-sm text-[#5C6B78]">Usuarios activos (últimos 7 días)</p>
            <p className="mt-1 text-4xl font-bold text-[#1E4D8C]">{usuarios7Dias}</p>
          </div>
          <div className="rounded-xl border border-[#10203A]/12 bg-white p-6">
            <p className="text-sm text-[#5C6B78]">En el sitio ahora mismo</p>
            <p className="mt-1 text-4xl font-bold text-[#1E4D8C]">{enVivo}</p>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-[#10203A]/12 bg-white p-6">
          <p className="mb-3 text-sm font-bold text-[#5C6B78]">Páginas más visitadas (últimos 7 días)</p>
          {paginas.length === 0 ? (
            <p className="text-sm text-[#5C6B78]">Sin datos todavía.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {paginas.map(function (fila: { ruta: string; vistas: number }, i: number) {
                return (
                  <div key={i} className="flex items-center justify-between gap-3 border-t border-[#10203A]/6 pt-2 first:border-t-0 first:pt-0">
                    <span className="truncate text-sm text-[#10203A]">{fila.ruta}</span>
                    <span className="shrink-0 font-mono text-sm font-bold text-[#1E4D8C]">{fila.vistas}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[#10203A]/12 bg-white p-6">
          <p className="mb-3 text-sm font-bold text-[#5C6B78]">De dónde viene la gente (últimos 7 días)</p>
          {paises.length === 0 ? (
            <p className="text-sm text-[#5C6B78]">Sin datos todavía.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {paises.map(function (fila: { pais: string; usuarios: number }, i: number) {
                return (
                  <div key={i} className="flex items-center justify-between gap-3 border-t border-[#10203A]/6 pt-2 first:border-t-0 first:pt-0">
                    <span className="truncate text-sm text-[#10203A]">{fila.pais}</span>
                    <span className="shrink-0 font-mono text-sm font-bold text-[#1E4D8C]">{fila.usuarios}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
