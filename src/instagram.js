import { INSTAGRAM } from './config.js';

const base = () => `${INSTAGRAM.host}/${INSTAGRAM.versao}`;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function chamar(fetchImpl, url, { metodo = 'GET', token, corpo } = {}) {
  const opcoes = { method: metodo, headers: {} };
  if (token) opcoes.headers.Authorization = `Bearer ${token}`;
  if (corpo) {
    opcoes.headers['Content-Type'] = 'application/json';
    opcoes.body = JSON.stringify(corpo);
  }
  const r = await fetchImpl(url, opcoes);
  const dados = await r.json();
  if (!r.ok || dados?.error) {
    const msg = dados?.error?.message ?? `HTTP ${r.status}`;
    throw new Error(`Instagram recusou a chamada: ${msg}`);
  }
  return dados;
}

/** Espera o contêiner de mídia ficar FINISHED (ERROR/EXPIRED ou tempo esgotado = erro). */
async function aguardarPronto(fetchImpl, esperar, token, id, tentativas = 30) {
  for (let i = 0; i < tentativas; i++) {
    const { status_code: status } = await chamar(fetchImpl, `${base()}/${id}?fields=status_code`, { token });
    if (status === 'FINISHED') return;
    if (status === 'ERROR' || status === 'EXPIRED') throw new Error(`Mídia ${id} terminou com status ${status}`);
    await esperar(2000);
  }
  throw new Error(`Mídia ${id} não ficou pronta a tempo`);
}

/** Publica um carrossel (2 a 10 imagens JPEG com URL pública) e devolve o id da mídia publicada. */
export async function publicarCarrossel({ igUserId, token, urls, legenda, fetchImpl = fetch, esperar = dormir }) {
  if (urls.length < 2 || urls.length > 10) throw new Error(`Carrossel precisa de 2 a 10 imagens, recebi ${urls.length}`);
  const post = (corpo) => chamar(fetchImpl, `${base()}/${igUserId}/media`, { metodo: 'POST', token, corpo });

  const filhos = [];
  for (const url of urls) {
    const { id } = await post({ image_url: url, is_carousel_item: true });
    await aguardarPronto(fetchImpl, esperar, token, id);
    filhos.push(id);
  }
  const { id: carrossel } = await post({ media_type: 'CAROUSEL', children: filhos.join(','), caption: legenda });
  await aguardarPronto(fetchImpl, esperar, token, carrossel);
  const publicado = await chamar(fetchImpl, `${base()}/${igUserId}/media_publish`, {
    metodo: 'POST', token, corpo: { creation_id: carrossel },
  });
  return publicado.id;
}

/** Confere que o token enxerga a conta certa. */
export async function consultarConta({ igUserId, token, fetchImpl = fetch }) {
  return chamar(fetchImpl, `${base()}/${igUserId}?fields=username,account_type`, { token });
}

/** Renova o token de longa duração; devolve apenas o novo token. */
export async function renovarToken({ token, fetchImpl = fetch }) {
  const url = `${INSTAGRAM.host}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`;
  const { access_token: novo } = await chamar(fetchImpl, url);
  return novo;
}
