import { test } from 'node:test';
import assert from 'node:assert/strict';
import { montarLegenda } from '../src/legenda.js';
import { HASHTAGS, LIMITES } from '../src/config.js';

const post = { legenda: 'Frase de apoio.', cta_final: 'Chame no WhatsApp.' };

test('montarLegenda junta legenda, chamada e hashtags fixas', () => {
  assert.equal(montarLegenda(post), `Frase de apoio.\n\nChame no WhatsApp.\n\n${HASHTAGS}`);
});

test('montarLegenda cabe no limite do Instagram', () => {
  assert.ok(montarLegenda(post).length <= LIMITES.legenda);
});
