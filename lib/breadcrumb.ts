// Genera el JSON-LD de BreadcrumbList (el "camino de migas": Inicio > Loterías
// > X) para que Google entienda la jerarquía del sitio y, a veces, lo
// muestre directo en el resultado de búsqueda.
export function migaDePan(items: { nombre: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(function (item, i) {
      return {
        "@type": "ListItem",
        position: i + 1,
        name: item.nombre,
        item: item.url,
      };
    }),
  };
}
