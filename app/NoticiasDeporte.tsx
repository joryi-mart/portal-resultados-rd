import Image from "next/image";

type Noticia = {
  id: string;
  title: string;
  url: string;
  image: string;
  published: string;
};

export default function NoticiasDeporte({
  titulo,
  noticias,
}: {
  titulo: string;
  noticias: Noticia[];
}) {
  const lista = (noticias || []).filter((n) => n.title && n.url).slice(0, 6);
  if (lista.length === 0) return null;

  return (
    <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
      <h2 className="mb-3 text-lg font-bold text-[#10203A]">Reciente en {titulo}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((noticia) => (
          <a
            key={noticia.id}
            href={noticia.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex gap-3 overflow-hidden rounded-xl border border-[#10203A]/15 bg-white p-3 shadow-sm transition hover:shadow-md"
          >
            {noticia.image ? (
              <Image
                src={noticia.image}
                alt={noticia.title}
                width={80}
                height={80}
                unoptimized
                className="h-20 w-20 shrink-0 rounded-lg bg-[#10203A]/5 object-cover"
              />
            ) : null}
            <div className="min-w-0">
              <p className="line-clamp-3 text-sm font-semibold text-[#10203A]">{noticia.title}</p>
              <p className="mt-1 text-xs text-[#5C6B78]">
                {noticia.published ? new Date(noticia.published).toLocaleDateString("es-DO") : ""}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
