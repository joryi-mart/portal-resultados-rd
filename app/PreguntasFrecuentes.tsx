type Pregunta = { pregunta: string; respuesta: string };

export default function PreguntasFrecuentes({ preguntas }: { preguntas: Pregunta[] }) {
  if (!preguntas || preguntas.length === 0) return null;

  const datosEstructurados = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: preguntas.map((p) => ({
      "@type": "Question",
      name: p.pregunta,
      acceptedAnswer: { "@type": "Answer", text: p.respuesta },
    })),
  };

  return (
    <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }}
      />
      <h2 className="mb-3 text-lg font-bold text-[#10203A]">Preguntas frecuentes</h2>
      <div className="space-y-3">
        {preguntas.map((p) => (
          <div
            key={p.pregunta}
            className="rounded-xl border border-[#10203A]/15 bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-semibold text-[#10203A]">{p.pregunta}</p>
            <p className="mt-1 text-sm text-[#5C6B78]">{p.respuesta}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
