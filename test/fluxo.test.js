import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { imageSize } from 'image-size';
import { prepararDia, publicarDia } from '../src/fluxo.js';
import { lerRegistro, registrar } from '../src/registro.js';
import { PAGES_BASE_URL } from '../src/config.js';

const FIXTURES = path.resolve('test/fixtures/conteudo');
const novaPasta = () => fs.mkdtempSync(path.join(os.tmpdir(), 'omega-'));
const resposta = (corpo, ok = true) => ({ ok, status: ok ? 200 : 400, json: async () => corpo });

function conteudoCom(linhas) {
  const pasta = novaPasta();
  const cab = 'data,pilar,objetivo,titulo_capa,slide2_texto,slide3_texto,cta_final,legenda,status';
  fs.writeFileSync(path.join(pasta, '2026-12.csv'), [cab, ...linhas].join('\n'));
  return pasta;
}
const linha = (data, status, titulo = 'Título') => `${data},Segurança,Atrair,${titulo},Texto dois.,Texto três.,Chame no WhatsApp.,Legenda,${status}`;

test('prepara o dia: 4 JPEGs 1080x1350 e as URLs públicas', async () => {
  const site = novaPasta();
  const ctx = await prepararDia({ hoje: '2026-12-01', pastaConteudo: FIXTURES, pastaSite: site, caminhoRegistro: path.join(novaPasta(), 'r.json') });
  assert.equal(ctx.urls.length, 4);
  assert.equal(ctx.urls[0], `${PAGES_BASE_URL}/2026-12-01/slide-1.jpg`);
  for (const arq of ctx.arquivos) {
    assert.ok(arq.startsWith(path.join(site, '2026-12-01')));
    const { width, height, type } = imageSize(fs.readFileSync(arq));
    assert.deepEqual([width, height, type], [1080, 1350, 'jpg']);
  }
  assert.match(ctx.legenda, /#ÔmegaElevadores/);
});

test('devolve null quando o dia já foi publicado', async () => {
  const reg = path.join(novaPasta(), 'r.json');
  registrar(reg, '2026-12-01', 'M1');
  assert.equal(await prepararDia({ hoje: '2026-12-01', pastaConteudo: FIXTURES, pastaSite: novaPasta(), caminhoRegistro: reg }), null);
});

test('erro claro quando não há post para a data', async () => {
  await assert.rejects(() => prepararDia({ hoje: '2027-01-15', pastaConteudo: FIXTURES, pastaSite: novaPasta(), caminhoRegistro: path.join(novaPasta(), 'r.json') }), /2027-01-15/);
});

test('antes do primeiro dia do calendário, apenas pula (null)', async () => {
  const ctx = await prepararDia({ hoje: '2026-11-25', pastaConteudo: FIXTURES, pastaSite: novaPasta(), caminhoRegistro: path.join(novaPasta(), 'r.json') });
  assert.equal(ctx, null);
});

test('erro quando o post do dia ainda é Rascunho', async () => {
  await assert.rejects(() => prepararDia({ hoje: '2026-12-02', pastaConteudo: FIXTURES, pastaSite: novaPasta(), caminhoRegistro: path.join(novaPasta(), 'r.json') }), /Aprovado/);
});

test('erro quando o post do dia tem colchetes não preenchidos', async () => {
  const pasta = conteudoCom([linha('2026-12-03', 'Aprovado', 'Veja [PREENCHER]')]);
  await assert.rejects(() => prepararDia({ hoje: '2026-12-03', pastaConteudo: pasta, pastaSite: novaPasta(), caminhoRegistro: path.join(novaPasta(), 'r.json') }), /colchetes/);
});

const contexto = { data: '2026-12-01', urls: ['u1', 'u2'], legenda: 'L' };

test('publicarDia registra o id da mídia depois de publicar', async () => {
  const reg = path.join(novaPasta(), 'r.json');
  let n = 0;
  const f = async (url, o = {}) => {
    if (o.method === 'POST' && url.endsWith('/media_publish')) return resposta({ id: 'FINAL' });
    if (o.method === 'POST') return resposta({ id: `C${++n}` });
    return resposta({ status_code: 'FINISHED' });
  };
  const id = await publicarDia({ contexto, igUserId: '1', token: 't', caminhoRegistro: reg, fetchImpl: f, esperar: async () => {} });
  assert.equal(id, 'FINAL');
  assert.equal(lerRegistro(reg)['2026-12-01'].mediaId, 'FINAL');
});

test('falha do Instagram não grava no registro', async () => {
  const reg = path.join(novaPasta(), 'r.json');
  const f = async () => resposta({ error: { message: 'token expirado' } }, false);
  await assert.rejects(() => publicarDia({ contexto, igUserId: '1', token: 't', caminhoRegistro: reg, fetchImpl: f, esperar: async () => {} }), /token expirado/);
  assert.deepEqual(lerRegistro(reg), {});
});

test('simular não chama a rede nem grava registro', async () => {
  const reg = path.join(novaPasta(), 'r.json');
  const f = async () => { throw new Error('não deveria chamar a rede'); };
  const id = await publicarDia({ contexto, igUserId: '1', token: 't', caminhoRegistro: reg, simular: true, fetchImpl: f, esperar: async () => {} });
  assert.equal(id, null);
  assert.deepEqual(lerRegistro(reg), {});
});
