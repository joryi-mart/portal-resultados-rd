import EquipoLidomCliente from "./EquipoLidomCliente";

const NOMBRES_EQUIPOS: Record<string, string> = {
  "672": "Tigres del Licey",
  "667": "Águilas Cibaeñas",
  "671": "Leones del Escogido",
  "669": "Estrellas Orientales",
  "668": "Toros del Este",
  "670": "Gigantes del Cibao",
};

export async function generateMetadata(props: { params: Promise<{ equipo: string }> }) {
  const params = await props.params;
  const nombre = NOMBRES_EQUIPOS[params.equipo];
  if (!nombre) return { title: "Equipo no encontrado" };

  const titulo = `${nombre}: Roster, Últimos Juegos y Noticias`;
  const descripcion = `Sigue a ${nombre} de la LIDOM: alineación, últimos resultados y noticias del equipo.`;

  return {
    title: titulo,
    description: descripcion,
    openGraph: { title: titulo, description: descripcion, locale: "es_DO", type: "website" },
    alternates: { canonical: `https://labankerard.com/lidom/${params.equipo}` },
  };
}

export default async function EquipoLidomPage(props: { params: Promise<{ equipo: string }> }) {
  const params = await props.params;
  return <EquipoLidomCliente equipoId={params.equipo} />;
}
