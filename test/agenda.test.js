import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hojeEmFortaleza, postDoDia, diasDeEstoque } from '../src/agenda.js';

const p = (data, status = 'Aprovado') => ({ data, status });

test('hojeEmFortaleza usa o fuso de Fortaleza, não UTC', () => {
  assert.equal(hojeEmFortaleza(new Date('2026-12-02T01:00:00Z')), '2026-12-01');
  assert.equal(hojeEmFortaleza(new Date('2026-12-01T21:00:00Z')), '2026-12-01');
  assert.equal(hojeEmFortaleza(new Date('2026-12-01T03:00:00Z')), '2026-12-01');
  assert.equal(hojeEmFortaleza(new Date('2026-12-01T02:59:00Z')), '2026-11-30');
});

test('postDoDia devolve o post da data e undefined quando não há linha', () => {
  const posts = [p('2026-12-01'), p('2026-12-02')];
  assert.equal(postDoDia(posts, '2026-12-02'), posts[1]);
  assert.equal(postDoDia(posts, '2026-12-09'), undefined);
});

test('diasDeEstoque conta dias aprovados consecutivos a partir de amanhã', () => {
  const posts = [p('2026-12-02'), p('2026-12-03'), p('2026-12-04'), p('2026-12-06')];
  assert.equal(diasDeEstoque(posts, '2026-12-01'), 3);
});

test('diasDeEstoque para no primeiro dia que não está Aprovado', () => {
  const posts = [p('2026-12-02'), p('2026-12-03', 'Rascunho'), p('2026-12-04')];
  assert.equal(diasDeEstoque(posts, '2026-12-01'), 1);
});

test('diasDeEstoque atravessa a virada de mês e de ano', () => {
  const posts = [p('2027-01-01'), p('2027-01-02')];
  assert.equal(diasDeEstoque(posts, '2026-12-31'), 2);
});

test('normalizarData aceita AAAA-MM-DD e DD/MM/AAAA e recusa o resto com aviso claro', async () => {
  const { normalizarData } = await import('../src/agenda.js');
  assert.equal(normalizarData('2026-12-02'), '2026-12-02');
  assert.equal(normalizarData('02/12/2026'), '2026-12-02');
  assert.equal(normalizarData(' 2/12/2026 '), '2026-12-02');
  assert.throws(() => normalizarData('2026-13-40'), /AAAA-MM-DD/);
  assert.throws(() => normalizarData('amanhã'), /AAAA-MM-DD/);
});
