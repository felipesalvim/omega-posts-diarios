import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { lerPosts, validarPost, validarCalendario } from '../src/conteudo.js';

const base = {
  data: '2026-12-01', pilar: 'Mito ou verdade', objetivo: 'Manter perfil ativo',
  titulo_capa: 'Título curto', slide2_texto: 'Contexto curto.', slide3_texto: 'Ação curta.',
  cta_final: 'Chame no WhatsApp.', legenda: 'Legenda curta.', status: 'Aprovado',
};

test('lerPosts preserva vírgulas, aspas e quebras de linha na legenda', () => {
  const posts = lerPosts(fileURLToPath(new URL('./fixtures/conteudo', import.meta.url)));
  assert.equal(posts.length, 2);
  assert.equal(posts[0].legenda, 'Linha 1, com "aspas"\nLinha 2');
  assert.equal(posts[1].status, 'Rascunho');
});

test('validarPost aceita post completo', () => {
  assert.deepEqual(validarPost(base), []);
});

test('validarPost rejeita colchetes', () => {
  const erros = validarPost({ ...base, titulo_capa: 'Olá [nome]' });
  assert.equal(erros.length, 1);
  assert.match(erros[0], /colchetes/);
});

test('validarPost rejeita campo vazio citando a coluna', () => {
  const erros = validarPost({ ...base, slide2_texto: '  ', legenda: '' });
  assert.equal(erros.length, 2);
  assert.match(erros.join('|'), /slide2_texto/);
  assert.match(erros.join('|'), /legenda/);
});

test('validarPost rejeita slide com mais de 40 palavras', () => {
  const longo = Array.from({ length: 41 }, (_, i) => `p${i}`).join(' ');
  const erros = validarPost({ ...base, slide3_texto: longo });
  assert.match(erros.join('|'), /slide3_texto.*41 palavras/);
  assert.deepEqual(validarPost({ ...base, slide3_texto: longo.split(' ').slice(0, 40).join(' ') }), []);
});

test('validarPost rejeita legenda final acima de 2200 caracteres', () => {
  const erros = validarPost({ ...base, legenda: 'a'.repeat(2300) });
  assert.match(erros.join('|'), /legenda/);
});

test('validarCalendario acusa data duplicada e formato inválido', () => {
  const erros = validarCalendario([base, { ...base }, { ...base, data: '01/12/2026' }]);
  assert.equal(erros.length, 2);
  assert.match(erros.join('|'), /duplicada/);
  assert.match(erros.join('|'), /formato/);
});
