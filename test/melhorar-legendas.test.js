import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { parse } from 'csv-parse/sync';
import { aplicarLegendas, LEGENDAS_DEZEMBRO, sha } from '../src/cli/melhorar-legendas.js';
import { validarPost } from '../src/conteudo.js';
import { montarLegenda } from '../src/legenda.js';

const csv = 'data,pilar,legenda,imagem,status\n' +
  '2026-12-01,Mito,Texto antigo um.,botao,Aprovado\n' +
  '2026-12-02,Bastidores,Texto que o Felipe editou.,checklist,Aprovado\n';
const mapa = {
  '2026-12-01': { antiga: sha('Texto antigo um.'), legenda: 'Texto novo um.', pergunta: 'Pergunta um?' },
  '2026-12-02': { antiga: sha('Texto antigo dois.'), legenda: 'Texto novo dois.', pergunta: 'Pergunta dois?' },
};

test('troca a legenda só quando ela ainda é o rascunho original e cria a coluna pergunta', () => {
  const linhas = parse(aplicarLegendas(csv, mapa), { columns: true });
  assert.deepEqual(Object.keys(linhas[0]), ['data', 'pilar', 'legenda', 'pergunta', 'imagem', 'status']);
  assert.equal(linhas[0].legenda, 'Texto novo um.');
  assert.equal(linhas[1].legenda, 'Texto que o Felipe editou.');
  assert.deepEqual(linhas.map((l) => l.pergunta), ['Pergunta um?', 'Pergunta dois?']);
  assert.deepEqual(linhas.map((l) => l.status), ['Aprovado', 'Aprovado']);
});

test('não sobrescreve pergunta já preenchida e é idempotente', () => {
  const uma = aplicarLegendas(csv, mapa);
  const editada = uma.replace('Pergunta dois?', 'Minha pergunta?');
  const duas = aplicarLegendas(editada, mapa);
  assert.deepEqual(parse(duas, { columns: true }).map((l) => l.pergunta), ['Pergunta um?', 'Minha pergunta?']);
  assert.equal(aplicarLegendas(duas, mapa), duas);
});

test('dezembro: 31 legendas e perguntas, com a palavra-chave logo no início', () => {
  const datas = Object.keys(LEGENDAS_DEZEMBRO);
  assert.equal(datas.length, 31);
  for (const [data, v] of Object.entries(LEGENDAS_DEZEMBRO)) {
    assert.match(v.legenda.slice(0, 125).toLowerCase(), /elevador|ômega/, `${data}: sem palavra-chave no começo`);
    assert.match(v.pergunta, /\?|comente|conta|conte/i, `${data}: pergunta sem convite`);
    assert.ok(v.legenda.length <= 520, `${data}: legenda com ${v.legenda.length} caracteres`);
    assert.ok(!/[[\]]/.test(v.legenda + v.pergunta), `${data}: colchetes`);
  }
});

test('o mapa casa com o CSV do repositório (rascunho original ou já atualizado) e a legenda final cabe', () => {
  const linhas = parse(fs.readFileSync('conteudo/2026-12.csv', 'utf8'), { columns: true, bom: true });
  for (const l of linhas) {
    const v = LEGENDAS_DEZEMBRO[l.data];
    assert.ok(v, `${l.data} sem entrada`);
    assert.ok([v.antiga, sha(v.legenda)].includes(sha(l.legenda)), `${l.data}: legenda do CSV não bate com o mapa`);
    const final = { ...l, legenda: v.legenda, pergunta: v.pergunta };
    assert.deepEqual(validarPost(final), [], l.data);
    assert.ok(montarLegenda(final).length <= 2200);
  }
});

test('sha é SHA-1 em hexadecimal do texto sem espaços nas pontas', () => {
  assert.equal(sha('  oi '), crypto.createHash('sha1').update('oi').digest('hex'));
});
