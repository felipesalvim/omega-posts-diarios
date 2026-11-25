import { test } from 'node:test';
import assert from 'node:assert/strict';
import { montarLegenda } from '../src/legenda.js';
import { HASHTAGS, LIMITES, CONTATOS } from '../src/config.js';
import { validarPost } from '../src/conteudo.js';

const post = { legenda: 'Frase de apoio.', cta_final: 'Chame no WhatsApp.' };

test('montarLegenda junta legenda, chamada, contatos (site e WhatsApp) e hashtags fixas', () => {
  const bloco = `Ômega Elevadores | Fortaleza, CE\nSite: ${CONTATOS.siteUrl}\nWhatsApp: ${CONTATOS.whatsapp}`;
  assert.equal(montarLegenda(post), `Frase de apoio.\n\nChame no WhatsApp.\n\n${bloco}\n\n${HASHTAGS}`);
});

test('o site completo e o WhatsApp aparecem em toda legenda', () => {
  const legenda = montarLegenda(post);
  assert.ok(legenda.includes('https://www.omegaelevadores.com.br/'));
  assert.ok(legenda.includes('(85) 3252.2240'));
});

test('validarPost conta o bloco de contatos no limite da legenda', () => {
  const base = { data: '2026-12-01', pilar: 'p', objetivo: 'o', titulo_capa: 't', slide2_texto: 'a', slide3_texto: 'b', cta_final: 'c' };
  const folga = LIMITES.legenda - montarLegenda({ ...base, legenda: '' }).length;
  assert.deepEqual(validarPost({ ...base, legenda: 'x'.repeat(folga) }), []);
  assert.equal(validarPost({ ...base, legenda: 'x'.repeat(folga + 1) }).length, 1);
});

test('montarLegenda cabe no limite do Instagram', () => {
  assert.ok(montarLegenda(post).length <= LIMITES.legenda);
});
