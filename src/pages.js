const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/** Espera as imagens responderem 200 no GitHub Pages (a publicação demora um pouco para propagar). */
export async function aguardarUrls(urls, { fetchImpl = fetch, esperar = dormir, tentativas = 30, intervaloMs = 10000 } = {}) {
  for (const url of urls) {
    let ok = false;
    for (let i = 0; i < tentativas && !ok; i++) {
      try {
        ok = (await fetchImpl(url, { method: 'HEAD' })).ok;
      } catch {
        ok = false;
      }
      if (!ok) await esperar(intervaloMs);
    }
    if (!ok) throw new Error(`Imagem não ficou disponível no GitHub Pages: ${url}`);
  }
}
