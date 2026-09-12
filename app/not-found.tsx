export default function NoEncontrado() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FBF7EE] px-6 text-center">
      <p className="font-mono text-sm font-bold uppercase tracking-wide text-[#E7A63C]">Error 404</p>
      <h1 className="font-bold text-2xl text-[#10203A] sm:text-3xl">Esta página no existe</h1>
      <p className="max-w-md text-sm text-[#5C6B78]">
        Puede que el enlace esté mal escrito o que la página se haya movido. Prueba desde la portada.
      </p>
      <a
        href="/"
        className="mt-2 rounded-lg px-5 py-2.5 font-mono text-sm font-bold text-white"
        style={{ backgroundColor: "#1E4D8C" }}
      >
        Volver a la portada
      </a>
    </div>
  );
}
