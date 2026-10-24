// Recuadro con enlaces a las calculadoras laborales, para las paginas de
// loterias. Las paginas por fecha son las que mejor posiciona Google (4-8),
// y un enlace desde ellas le dice a Google que las calculadoras son
// importantes dentro del sitio (estaban en la posicion 71).
export default function EnlaceCalculadoras() {
  const ano = new Date(Date.now() - 4 * 60 * 60 * 1000).getUTCFullYear();
  return (
    <section className="mt-8 rounded-xl border border-[#10203A]/12 bg-white p-5">
      <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold text-[#10203A]">Calculadoras laborales RD</h2>
      <div className="flex flex-col gap-3">
        <a href="/calculadora-regalia-pascual" className="flex items-center justify-between gap-3 rounded-lg bg-[#FBF7EE] px-4 py-3 hover:bg-[#F3EEE1]">
          <span className="flex flex-col">
            <span className="text-base font-bold text-[#10203A] underline decoration-[#1E4D8C]/30 underline-offset-4">Calculadora de regalía pascual {ano}</span>
            <span className="text-sm font-semibold text-[#2E3B48]">¿Cuánto te toca de doble sueldo? Se paga antes del 20 de diciembre.</span>
          </span>
          <span className="shrink-0 font-mono text-base font-bold text-[#007A33]">→</span>
        </a>
        <a href="/calcular-prestaciones-rd" className="flex items-center justify-between gap-3 rounded-lg bg-[#FBF7EE] px-4 py-3 hover:bg-[#F3EEE1]">
          <span className="flex flex-col">
            <span className="text-base font-bold text-[#10203A] underline decoration-[#1E4D8C]/30 underline-offset-4">Calculadora de prestaciones laborales</span>
            <span className="text-sm font-semibold text-[#2E3B48]">¿Te botaron o renunciaste? Mira cuánto te deben pagar.</span>
          </span>
          <span className="shrink-0 font-mono text-base font-bold text-[#007A33]">→</span>
        </a>
      </div>
    </section>
  );
}
