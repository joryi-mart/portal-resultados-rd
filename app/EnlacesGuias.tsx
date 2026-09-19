export default function EnlacesGuias(props: { titulo: string; enlaces: { href: string; texto: string }[] }) {
  return (
    <div className="bg-[#FBF7EE] px-4 pb-10 sm:px-8">
      <div className="mx-auto max-w-6xl border-t border-[#10203A]/10 pt-6">
        <p className="mb-2 text-sm font-bold text-[#10203A]">{props.titulo}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {props.enlaces.map(function (e) {
            return (
              <a key={e.href} href={e.href} className="underline" style={{ color: "#1E4D8C" }}>
                {e.texto}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
