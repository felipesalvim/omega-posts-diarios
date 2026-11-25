import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textosAlternativos } from '../src/alt.js';
import { CONTATOS } from '../src/config.js';

const post = {
  data: '2026-12-08', pilar: 'Mito ou verdade', titulo_capa: 'Se um cabo arrebentar, o elevador cai?',
  slide2_texto: 'Não é assim. O elevador usa vários cabos de aço e tem freio de segurança.',
  slide3_texto: 'Por isso a manutenção periódica importa.', cta_final: 'Chame a Ômega.',
};

test('um texto alternativo por slide, na ordem do carrossel', () => {
  const alts = textosAlternativos(post);
  assert.equal(alts.length, 4);
  assert.match(alts[0], /Se um cabo arrebentar, o elevador cai\?/);
  assert.match(alts[0], /Ômega Elevadores/);
  assert.match(alts[1], /Não é assim/);
  assert.match(alts[2], /manutenção periódica/);
  assert.ok(alts[3].includes(CONTATOS.whatsapp) && alts[3].includes(CONTATOS.site));
});

test('nenhum texto alternativo passa de 250 caracteres', () => {
  const longo = 'elevador '.repeat(80);
  for (const a of textosAlternativos({ ...post, titulo_capa: longo, slide2_texto: longo, slide3_texto: longo })) {
    assert.ok(a.length <= 250, `${a.length} caracteres`);
  }
});
