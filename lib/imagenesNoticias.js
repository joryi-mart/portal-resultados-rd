// Las noticias de Currents API traen la foto que puso cada periodico, y a veces
// esa foto ya no existe (ej. jornada.com.mx/imagemeta/1200x630BN.jpg da 404).
// Una foto rota deja un cuadro vacio y un error en la consola del navegador
// (Lighthouse lo marca), asi que se revisa cada una antes de mostrarla. El
// resultado queda en el cache de cada lista de noticias, asi que esto solo
// corre cuando se refresca la lista (cada 15-30 min).
async function imagenFunciona(url) {
  if (!url || !/^https?:\/\//.test(url)) return false;
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(4000), cache: "no-store" });
    // Algunos servidores no aceptan HEAD (405/403): en ese caso no se puede
    // saber, y se deja la foto.
    if (res.status === 405 || res.status === 403) return true;
    return res.ok && (res.headers.get("content-type") || "image/").startsWith("image/");
  } catch {
    return false;
  }
}

export async function quitarImagenesRotas(noticias) {
  return Promise.all(
    (noticias || []).map(async function (n) {
      if (!n.image || n.image === "None") return { ...n, image: "" };
      return (await imagenFunciona(n.image)) ? n : { ...n, image: "" };
    })
  );
}
