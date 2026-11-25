import test from 'node:test';
import assert from 'node:assert/strict';
import { publicarCarrossel, consultarConta, renovarToken } from '../src/instagram.js';
import { aguardarUrls } from '../src/pages.js';

const resposta = (corpo, ok = true, status = 200) => ({ ok, status, json: async () => corpo, text: async () => JSON.stringify(corpo) });
const semEspera = async () => {};

/** fetch falso: registra chamadas e responde conforme `roteiro(chamada)`. */
function fetchFalso(roteiro) {
  const chamadas = [];
  const fn = async (url, opcoes = {}) => {
    const c = { url: String(url), metodo: opcoes.method || 'GET', corpo: opcoes.body ? JSON.parse(opcoes.body) : null, auth: opcoes.headers?.Authorization };
    chamadas.push(c);
    return roteiro(c, chamadas);
  };
  fn.chamadas = chamadas;
  return fn;
}

const URLS = [1, 2, 3, 4].map((n) => `https://x.github.io/r/2026-12-01/slide-${n}.jpg`);

function roteiroFeliz() {
  let seq = 0;
  return (c) => {
    if (c.metodo === 'POST' && c.url.endsWith('/media_publish')) return resposta({ id: 'MIDIA_FINAL' });
    if (c.metodo === 'POST') return resposta({ id: `C${++seq}` });
    return resposta({ status_code: 'FINISHED' });
  };
}

test('publica carrossel: 4 itens, depois o carrossel, depois publica', async () => {
  const f = fetchFalso(roteiroFeliz());
  const id = await publicarCarrossel({ igUserId: '123', token: 'TOK', urls: URLS, legenda: 'Olá', fetchImpl: f, esperar: semEspera });
  assert.equal(id, 'MIDIA_FINAL');
  const posts = f.chamadas.filter((c) => c.metodo === 'POST');
  assert.equal(posts.length, 6);
  posts.slice(0, 4).forEach((p, i) => {
    assert.match(p.url, /^https:\/\/graph\.instagram\.com\/v26\.0\/123\/media$/);
    assert.equal(p.corpo.image_url, URLS[i]);
    assert.equal(p.corpo.is_carousel_item, true);
    assert.equal(p.auth, 'Bearer TOK');
  });
  assert.equal(posts[4].corpo.media_type, 'CAROUSEL');
  assert.equal(posts[4].corpo.children, 'C1,C2,C3,C4');
  assert.equal(posts[4].corpo.caption, 'Olá');
  assert.match(posts[5].url, /\/123\/media_publish$/);
  assert.equal(posts[5].corpo.creation_id, 'C5');
});

test('falha no 3º item: não cria carrossel nem publica', async () => {
  let itens = 0;
  const f = fetchFalso((c) => {
    if (c.metodo === 'POST' && ++itens === 3) return resposta({ error: { message: 'url inválida' } }, false, 400);
    return roteiroFeliz()(c);
  });
  await assert.rejects(() => publicarCarrossel({ igUserId: '1', token: 't', urls: URLS, legenda: 'x', fetchImpl: f, esperar: semEspera }), /url inválida/);
  assert.equal(f.chamadas.filter((c) => c.url.includes('media_publish')).length, 0);
  assert.equal(f.chamadas.filter((c) => c.corpo?.media_type === 'CAROUSEL').length, 0);
});

test('status ERROR em um item interrompe antes de publicar', async () => {
  const f = fetchFalso((c) => (c.metodo === 'GET' ? resposta({ status_code: 'ERROR' }) : roteiroFeliz()(c)));
  await assert.rejects(() => publicarCarrossel({ igUserId: '1', token: 't', urls: URLS, legenda: 'x', fetchImpl: f, esperar: semEspera }), /ERROR/);
  assert.equal(f.chamadas.filter((c) => c.url.includes('media_publish')).length, 0);
});

test('espera o status FINISHED após IN_PROGRESS', async () => {
  let consultas = 0;
  const f = fetchFalso((c) => (c.metodo === 'GET' ? resposta({ status_code: ++consultas < 3 ? 'IN_PROGRESS' : 'FINISHED' }) : roteiroFeliz()(c)));
  await publicarCarrossel({ igUserId: '1', token: 't', urls: URLS, legenda: 'x', fetchImpl: f, esperar: semEspera });
  assert.ok(consultas >= 3);
});

test('rejeita 1 e 11 imagens (carrossel aceita de 2 a 10)', async () => {
  const f = fetchFalso(roteiroFeliz());
  for (const n of [1, 11]) {
    const urls = Array.from({ length: n }, (_, i) => `https://x/${i}.jpg`);
    await assert.rejects(() => publicarCarrossel({ igUserId: '1', token: 't', urls, legenda: 'x', fetchImpl: f, esperar: semEspera }), /2 a 10/);
  }
  assert.equal(f.chamadas.length, 0);
});

test('consultarConta devolve usuário e tipo da conta', async () => {
  const f = fetchFalso(() => resposta({ username: 'omegaelevadores', account_type: 'BUSINESS', id: '123' }));
  const conta = await consultarConta({ igUserId: '123', token: 'TOK', fetchImpl: f });
  assert.equal(conta.username, 'omegaelevadores');
  assert.match(f.chamadas[0].url, /graph\.instagram\.com\/v26\.0\/123\?fields=/);
  assert.equal(f.chamadas[0].auth, 'Bearer TOK');
});

test('renovarToken devolve só o novo token', async () => {
  const f = fetchFalso(() => resposta({ access_token: 'NOVO', token_type: 'bearer', expires_in: 5184000 }));
  assert.equal(await renovarToken({ token: 'VELHO', fetchImpl: f }), 'NOVO');
  assert.match(f.chamadas[0].url, /refresh_access_token\?grant_type=ig_refresh_token&access_token=VELHO/);
});

test('aguardarUrls tenta de novo até as imagens ficarem no ar', async () => {
  let n = 0;
  const f = fetchFalso(() => resposta({}, ++n > 2, n > 2 ? 200 : 404));
  await aguardarUrls(['https://x/a.jpg'], { fetchImpl: f, esperar: semEspera });
  assert.equal(n, 3);
});

test('aguardarUrls falha citando a URL que não apareceu', async () => {
  const f = fetchFalso(() => resposta({}, false, 404));
  await assert.rejects(() => aguardarUrls(['https://x/a.jpg'], { fetchImpl: f, esperar: semEspera, tentativas: 3 }), /https:\/\/x\/a\.jpg/);
});
