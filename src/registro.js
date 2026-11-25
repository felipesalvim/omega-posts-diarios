import fs from 'node:fs';
import path from 'node:path';

/** @typedef {Record<string, {mediaId: string, publicadoEm: string}>} Registro */

/** @returns {Registro} arquivo ausente = nada publicado ainda */
export function lerRegistro(caminho) {
  if (!fs.existsSync(caminho)) return {};
  return JSON.parse(fs.readFileSync(caminho, 'utf8') || '{}');
}

export function jaPublicado(registro, data) {
  return Object.hasOwn(registro, data);
}

export function registrar(caminho, data, mediaId, agora = new Date()) {
  const registro = lerRegistro(caminho);
  registro[data] = { mediaId, publicadoEm: agora.toISOString() };
  const ordenado = Object.fromEntries(Object.entries(registro).sort(([a], [b]) => a.localeCompare(b)));
  fs.mkdirSync(path.dirname(caminho), { recursive: true });
  fs.writeFileSync(caminho, `${JSON.stringify(ordenado, null, 2)}\n`);
}
