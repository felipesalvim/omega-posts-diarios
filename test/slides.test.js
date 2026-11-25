import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { imageSize } from 'image-size';
import { montarSlides, htmlDoSlide } from '../src/slides/montar.js';
import { renderizarSlides, abrirNavegador, PASTA_HTML } from '../src/slides/renderizar.js';

const post = {
  data: '2026-12-01', pilar: 'Mito ou verdade', objetivo: 'Manter perfil ativo',
  titulo_capa: 'Apertar mais vezes chama mais rápido?',
  slide2_texto: 'Um único toque já registra a chamada do elevador.',
  slide3_texto: 'Apertar de novo só desgasta o botão e não faz a cabine chegar antes.',
  cta_final: 'Quer avaliar o seu elevador? Chame a Ômega.', legenda: 'Mito derrubado em uma frase.',
  status: 'Aprovado',
};
const palavras = (n) => Array.from({ length: n }, () => 'elevador').join(' ');

test('montarSlides devolve 4 slides: capa, conteudo, conteudo, contracapa', () => {
  const slides = montarSlides(post);
  assert.deepEqual(slides.map((s) => s.tipo), ['capa', 'conteudo', 'conteudo', 'contracapa']);
  assert.deepEqual(slides.map((s) => s.fundo), ['escuro', 'claro', 'claro', 'escuro']);
  assert.deepEqual(slides.map((s) => s.indice), [1, 2, 3, 4]);
  assert.equal(slides[0].etiqueta, 'Mito ou verdade');
  assert.equal(slides[0].texto, post.titulo_capa);
  assert.equal(slides[3].texto, post.cta_final);
});

test('htmlDoSlide usa logo branca em fundo escuro e colorida em fundo claro', () => {
  const [capa, conteudo] = montarSlides(post);
  assert.match(htmlDoSlide(capa), /logo-branca\.png/);
  assert.doesNotMatch(htmlDoSlide(capa), /logo-colorida\.png/);
  assert.match(htmlDoSlide(conteudo), /logo-colorida\.png/);
  assert.doesNotMatch(htmlDoSlide(conteudo), /logo-branca\.png/);
});

test('contra-capa contém os três contatos e a chamada do dia', () => {
  const html = htmlDoSlide(montarSlides(post)[3]);
  for (const trecho of ['(85) 3252.2240', '@omegaelevadores', 'omegaelevadores.com.br', 'Quer avaliar o seu elevador?']) {
    assert.ok(html.includes(trecho), `faltou ${trecho}`);
  }
});

test('htmlDoSlide escapa HTML do texto', () => {
  const [capa] = montarSlides({ ...post, titulo_capa: '<b>x</b> & y' });
  const html = htmlDoSlide(capa);
  assert.ok(html.includes('&lt;b&gt;x&lt;/b&gt; &amp; y'));
});

test('renderizarSlides gera 4 JPEGs 1080x1350', async () => {
  const saida = fs.mkdtempSync(path.join(os.tmpdir(), 'slides-'));
  const arquivos = await renderizarSlides(post, saida);
  assert.deepEqual(arquivos.map((f) => path.basename(f)), ['slide-1.jpg', 'slide-2.jpg', 'slide-3.jpg', 'slide-4.jpg']);
  for (const f of arquivos) {
    const { width, height, type } = imageSize(fs.readFileSync(f));
    assert.deepEqual([width, height, type], [1080, 1350, 'jpg']);
  }
});

test('texto longo não estoura a área nem passa por trás da logo', async () => {
  const saida = fs.mkdtempSync(path.join(os.tmpdir(), 'slides-'));
  await renderizarSlides({
    ...post, titulo_capa: palavras(14), slide2_texto: palavras(40), slide3_texto: palavras(40),
    cta_final: palavras(14),
  }, saida);
  const navegador = await abrirNavegador();
  try {
    const page = await navegador.newPage({ viewport: { width: 1080, height: 1350 } });
    for (const n of [1, 2, 3, 4]) {
      await page.goto(pathToFileURL(path.join(PASTA_HTML, `slide-${n}.html`)).href);
      await page.waitForSelector('body[data-pronto]');
      const m = await page.evaluate(() => {
        const area = document.querySelector('.area-texto');
        const texto = document.querySelector('.texto').getBoundingClientRect();
        const logo = document.querySelector('.logo').getBoundingClientRect();
        return {
          estoura: texto.top < area.getBoundingClientRect().top - 1 || texto.bottom > area.getBoundingClientRect().bottom + 1,
          textoBottom: texto.bottom, logoTop: logo.top, logoLeft: logo.left, textoRight: texto.right,
        };
      });
      assert.equal(m.estoura, false, `slide ${n} estoura a área`);
      const atrasDaLogo = m.textoBottom > m.logoTop - 24 && m.textoRight > m.logoLeft;
      assert.equal(atrasDaLogo, false, `slide ${n} chega perto da logo`);
    }
  } finally {
    await navegador.close();
  }
});

test('slides 1 a 3 têm seta de próximo; o 4 não; nenhum mostra o número do slide', () => {
  const htmls = montarSlides(post).map((s) => htmlDoSlide(s));
  htmls.forEach((html, i) => {
    assert.equal(/class="proximo"/.test(html), i < 3, `seta no slide ${i + 1}`);
    assert.doesNotMatch(html, /class="painel"/, `slide ${i + 1} ainda mostra o número`);
    assert.equal((html.match(/class="passo/g) || []).length, 4, `slide ${i + 1} sem 4 passos de progresso`);
    assert.equal((html.match(/passo atual/g) || []).length, 1, `slide ${i + 1} sem passo atual`);
  });
});

test('slides de conteúdo destacam a primeira frase', () => {
  const html = htmlDoSlide(montarSlides({ ...post, slide2_texto: 'Falso. Um toque basta.' })[1]);
  assert.match(html, /<strong class="destaque">Falso\.<\/strong>/);
  assert.match(html, /<span class="resto">Um toque basta\.<\/span>/);
});

test('texto longo não passa por baixo da seta', async () => {
  const saida = fs.mkdtempSync(path.join(os.tmpdir(), 'slides-'));
  await renderizarSlides({ ...post, titulo_capa: palavras(14), slide2_texto: palavras(40), slide3_texto: palavras(40) }, saida);
  const navegador = await abrirNavegador();
  try {
    const page = await navegador.newPage({ viewport: { width: 1080, height: 1350 } });
    for (const n of [1, 2, 3]) {
      await page.goto(pathToFileURL(path.join(PASTA_HTML, `slide-${n}.html`)).href);
      await page.waitForSelector('body[data-pronto]');
      const m = await page.evaluate(() => ({
        textoRight: document.querySelector('.texto').getBoundingClientRect().right,
        setaLeft: document.querySelector('.proximo').getBoundingClientRect().left,
      }));
      assert.ok(m.textoRight <= m.setaLeft - 16, `slide ${n}: texto (${m.textoRight}) encosta na seta (${m.setaLeft})`);
    }
  } finally {
    await navegador.close();
  }
});

test('texto de uma frase só: curto fica em destaque, longo fica em peso normal', () => {
  const curto = htmlDoSlide(montarSlides({ ...post, slide2_texto: 'Um toque basta.' })[1]);
  assert.match(curto, /<strong class="destaque">Um toque basta\.<\/strong>/);
  const longo = htmlDoSlide(montarSlides({ ...post, slide2_texto: 'Por isso a manutenção periódica importa: ela mantém cabos, freios e limitadores em condição de trabalhar quando necessário.' })[1]);
  assert.match(longo, /<span class="unico">Por isso/);
  assert.doesNotMatch(longo, /<strong class="destaque">Por isso/);
});
