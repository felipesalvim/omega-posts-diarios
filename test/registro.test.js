import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { lerRegistro, jaPublicado, registrar } from '../src/registro.js';

const novoCaminho = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'reg-')), 'publicados.json');

test('arquivo ausente vira registro vazio', () => {
  assert.deepEqual(lerRegistro(novoCaminho()), {});
});

test('registrar marca o dia como publicado e só ele', () => {
  const c = novoCaminho();
  registrar(c, '2026-12-01', 'M1', new Date('2026-12-01T21:00:05Z'));
  const r = lerRegistro(c);
  assert.equal(jaPublicado(r, '2026-12-01'), true);
  assert.equal(jaPublicado(r, '2026-12-02'), false);
  assert.deepEqual(r['2026-12-01'], { mediaId: 'M1', publicadoEm: '2026-12-01T21:00:05.000Z' });
});

test('registrar mantém as datas em ordem', () => {
  const c = novoCaminho();
  registrar(c, '2026-12-02', 'M2');
  registrar(c, '2026-12-01', 'M1');
  assert.deepEqual(Object.keys(lerRegistro(c)), ['2026-12-01', '2026-12-02']);
});
