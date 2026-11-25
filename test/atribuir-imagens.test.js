import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'csv-parse/sync';
import { adicionarColunaImagem, IMAGENS_DEZEMBRO } from '../src/cli/atribuir-imagens.js';
import { NOMES_ILUSTRACAO } from '../src/slides/imagens.js';

const csv = 'data,pilar,titulo_capa,legenda,status\n' +
  '2026-12-01,Mito ou verdade,"Apertar, apertar?","Ele disse ""não"".",Aprovado\n' +
  '2026-12-02,Bastidores,Visita,Texto,Rascunho\n';

test('acrescenta a coluna imagem antes de status e preserva o resto', () => {
  const saida = adicionarColunaImagem(csv, { '2026-12-01': 'botao', '2026-12-02': 'checklist' });
  const linhas = parse(saida, { columns: true });
  assert.deepEqual(Object.keys(linhas[0]), ['data', 'pilar', 'titulo_capa', 'legenda', 'imagem', 'status']);
  assert.deepEqual(linhas.map((l) => [l.imagem, l.status]), [['botao', 'Aprovado'], ['checklist', 'Rascunho']]);
  assert.equal(linhas[0].titulo_capa, 'Apertar, apertar?');
  assert.equal(linhas[0].legenda, 'Ele disse "não".');
});

test('não sobrescreve imagem que a pessoa já escolheu e é idempotente', () => {
  const uma = adicionarColunaImagem(csv, { '2026-12-01': 'botao', '2026-12-02': 'checklist' });
  const editada = uma.replace('checklist', 'visita.jpg');
  const duas = adicionarColunaImagem(editada, { '2026-12-01': 'cabos', '2026-12-02': 'checklist' });
  assert.deepEqual(parse(duas, { columns: true }).map((l) => l.imagem), ['botao', 'visita.jpg']);
});

test('mantém BOM e quebras de linha CRLF', () => {
  const entrada = '﻿' + csv.replaceAll('\n', '\r\n');
  const saida = adicionarColunaImagem(entrada, {});
  assert.ok(saida.startsWith('﻿'));
  assert.ok(saida.includes('\r\n') && !/[^\r]\n/.test(saida));
});

test('o mapa de dezembro cobre os 31 dias com ilustrações que existem', () => {
  assert.equal(Object.keys(IMAGENS_DEZEMBRO).length, 31);
  for (const [data, nome] of Object.entries(IMAGENS_DEZEMBRO)) assert.ok(NOMES_ILUSTRACAO.includes(nome), `${data}: ${nome}`);
});
