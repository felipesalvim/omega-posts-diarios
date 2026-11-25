import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolverImagem, svgDaIlustracao, NOMES_ILUSTRACAO } from '../src/slides/imagens.js';
import { montarSlides, htmlDoSlide } from '../src/slides/montar.js';
import { renderizarSlides, abrirNavegador, PASTA_HTML } from '../src/slides/renderizar.js';
import { validarPost, lerPosts } from '../src/conteudo.js';
import { prepararDia } from '../src/fluxo.js';

const post = {
  data: '2026-12-01', pilar: 'Mito ou verdade', objetivo: 'Manter perfil ativo',
  titulo_capa: 'Se um cabo arrebentar, o elevador cai?',
  slide2_texto: 'Não. Existem vários cabos e um freio de segurança.',
  slide3_texto: 'A manutenção confere o estado dos cabos.', cta_final: 'Chame a Ômega.',
  legenda: 'Mito derrubado.', status: 'Aprovado',
};
const palavras = (n) => Array.from({ length: n }, () => 'elevador').join(' ');

test('resolverImagem: nome de ilustração, foto ou padrão do pilar', () => {
  assert.deepEqual(resolverImagem({ ...post, imagem: 'cabos' }), { tipo: 'ilustracao', nome: 'cabos' });
  assert.deepEqual(resolverImagem({ ...post, imagem: 'visita-tecnica.jpg' }), { tipo: 'foto', arquivo: 'visita-tecnica.jpg' });
  assert.deepEqual(resolverImagem({ ...post, imagem: '' }), { tipo: 'ilustracao', nome: 'vf' });
  assert.deepEqual(resolverImagem({ ...post, imagem: undefined, pilar: 'Pilar novo' }), { tipo: 'ilustracao', nome: 'cabine' });
  assert.equal(resolverImagem({ ...post, imagem: 'nenhuma' }), null);
});

test('todo nome da biblioteca tem um desenho SVG', () => {
  assert.ok(NOMES_ILUSTRACAO.length >= 20, `só ${NOMES_ILUSTRACAO.length} ilustrações`);
  for (const nome of NOMES_ILUSTRACAO) {
    const svg = svgDaIlustracao(nome);
    assert.match(svg, /^<svg class="ilustracao"[^>]*viewBox="0 0 400 400"/, nome);
    assert.match(svg, /<\/svg>$/, nome);
  }
});

test('validarPost recusa ilustração desconhecida e aceita nome, foto ou vazio', () => {
  assert.deepEqual(validarPost({ ...post, imagem: 'cabos' }), []);
  assert.deepEqual(validarPost({ ...post, imagem: 'foto.PNG' }), []);
  assert.deepEqual(validarPost({ ...post, imagem: '' }), []);
  const erros = validarPost({ ...post, imagem: 'cabo' });
  assert.equal(erros.length, 1);
  assert.match(erros[0], /imagem "cabo" não existe/);
});

test('só a capa leva imagem: SVG para ilustração, <img> para foto', () => {
  const [capa, c2, c3, fim] = montarSlides({ ...post, imagem: 'cabos' });
  assert.match(htmlDoSlide(capa), /<svg class="ilustracao"/);
  for (const s of [c2, c3, fim]) assert.doesNotMatch(htmlDoSlide(s), /<svg class="ilustracao"|<img class="foto"/);
  const [capaFoto] = montarSlides({ ...post, imagem: 'visita.jpg' });
  assert.match(htmlDoSlide(capaFoto), /<img class="foto" src="..\/..\/imagens\/visita\.jpg"/);
  const [capaSem] = montarSlides({ ...post, imagem: 'nenhuma' });
  assert.doesNotMatch(htmlDoSlide(capaSem), /<svg class="ilustracao"|<img class="foto"/);
});

test('título longo na capa não invade a imagem, e a imagem tem tamanho útil', async () => {
  const saida = fs.mkdtempSync(path.join(os.tmpdir(), 'slides-'));
  await renderizarSlides({ ...post, imagem: 'cabos', titulo_capa: palavras(14) }, saida);
  const navegador = await abrirNavegador();
  try {
    const page = await navegador.newPage({ viewport: { width: 1080, height: 1350 } });
    await page.goto(pathToFileURL(path.join(PASTA_HTML, 'slide-1.html')).href);
    await page.waitForSelector('body[data-pronto]');
    const m = await page.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      return { imgBottom: r('.ilustracao').bottom, tituloTop: r('.texto').top, altura: r('.ilustracao').height,
               imgRight: r('.ilustracao').right, setaLeft: r('.proximo').left };
    });
    assert.ok(m.imgBottom <= m.tituloTop, `imagem (${m.imgBottom}) invade o título (${m.tituloTop})`);
    assert.ok(m.altura >= 300, `imagem com só ${m.altura}px de altura`);
    assert.ok(m.imgRight <= m.setaLeft - 16, 'imagem encosta na seta');
  } finally {
    await navegador.close();
  }
});

test('prepararDia avisa quando a foto indicada não existe na pasta imagens', async () => {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'raiz-'));
  const conteudo = path.join(raiz, 'conteudo');
  fs.mkdirSync(conteudo);
  const csv = `data,pilar,objetivo,titulo_capa,slide2_texto,slide3_texto,cta_final,legenda,imagem,status\n` +
    `2026-12-01,Bastidores,x,Título,Texto dois.,Texto três.,Chame a Ômega.,Legenda.,sumiu.jpg,Aprovado\n`;
  fs.writeFileSync(path.join(conteudo, '2026-12.csv'), csv);
  await assert.rejects(
    prepararDia({ hoje: '2026-12-01', pastaConteudo: conteudo, pastaSite: path.join(raiz, 'site'), caminhoRegistro: path.join(raiz, 'r.json') }),
    /imagens\/sumiu\.jpg/,
  );
});

test('posts reais: toda imagem escolhida existe na biblioteca', () => {
  for (const p of lerPosts('conteudo')) {
    const r = resolverImagem(p);
    if (r?.tipo === 'ilustracao') assert.ok(NOMES_ILUSTRACAO.includes(r.nome), `${p.data}: ${r.nome}`);
  }
});
