export default function Cargando() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FBF7EE]">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-[#1E4D8C]/20"
        style={{ borderTopColor: "#1E4D8C" }}
      />
      <p className="font-mono text-sm text-[#5C6B78]">Cargando resultados...</p>
    </div>
  );
}
