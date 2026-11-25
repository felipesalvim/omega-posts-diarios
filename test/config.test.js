import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CORES, CONTATOS, PAGES_BASE_URL, ESTOQUE_MINIMO_DIAS, LIMITES, SLIDE_PX, SLIDE_ALTURA_PX, INSTAGRAM, FUSO } from '../src/config.js';

test('config guarda as cores da marca Ômega', () => {
  assert.equal(CORES.vinho, '#8A151B');
  assert.equal(CORES.dourado, '#A9824B');
});

test('config guarda os contatos fixos da contra-capa', () => {
  assert.equal(CONTATOS.whatsapp, '(85) 3252.2240');
  assert.equal(CONTATOS.instagram, '@omegaelevadores');
  assert.equal(CONTATOS.siteUrl, 'https://www.omegaelevadores.com.br/');
});

test('config guarda endereço do Pages, estoque mínimo e limites', () => {
  assert.equal(PAGES_BASE_URL, 'https://felipesalvim.github.io/omega-posts-diarios');
  assert.equal(ESTOQUE_MINIMO_DIAS, 7);
  assert.equal(LIMITES.palavrasSlide, 40);
  assert.equal(LIMITES.legenda, 2200);
  assert.equal(SLIDE_PX, 1080);
  assert.equal(SLIDE_ALTURA_PX, 1350);
  assert.equal(FUSO, 'America/Fortaleza');
  assert.equal(INSTAGRAM.host, 'https://graph.facebook.com');
});
