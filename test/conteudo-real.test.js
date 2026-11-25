import test from 'node:test';
import assert from 'node:assert/strict';
import { lerPosts, validarPost, validarCalendario } from '../src/conteudo.js';

const posts = lerPosts('conteudo');
const dezembro = posts.filter((p) => p.data.startsWith('2026-12-'));

test('dezembro tem um post para cada um dos 31 dias, sem repetir data', () => {
  assert.equal(dezembro.length, 31);
  assert.deepEqual(validarCalendario(posts), []);
  assert.equal(dezembro[0].data, '2026-12-01');
  assert.equal(dezembro[30].data, '2026-12-31');
});

test('todos os posts reais passam na validação (sem colchetes, textos curtos, legenda cabe)', () => {
  const erros = posts.flatMap(validarPost);
  assert.deepEqual(erros, []);
});

test('o pilar segue o dia da semana', () => {
  const esperado = ['Marca e valores', 'Segurança em 1 minuto', 'Mito ou verdade', 'Bastidores', 'Manutenção na prática', 'Modernização', 'Curiosidade e convivência'];
  for (const p of dezembro) {
    const dia = new Date(`${p.data}T12:00:00Z`).getUTCDay();
    assert.equal(p.pilar, esperado[dia], `${p.data} deveria ser "${esperado[dia]}"`);
  }
});

test('status só pode ser Rascunho ou Aprovado', () => {
  for (const p of posts) assert.ok(['Rascunho', 'Aprovado'].includes(p.status), `${p.data}: ${p.status}`);
});
