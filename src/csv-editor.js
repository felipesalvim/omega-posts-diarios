import { parse } from 'csv-parse/sync';

const celula = (valor) => (/[",\r\n]/.test(valor) ? `"${valor.replaceAll('"', '""')}"` : valor);

/**
 * Edita um CSV de conteúdo sem mexer no que não foi pedido (status, textos já editados, BOM e tipo de quebra de linha).
 * `novasColunas`: [{nome, antesDe: [colunas...]}] cria a coluna na primeira posição encontrada.
 * `editar(linha)` altera a linha (objeto) no lugar.
 */
export function editarCsv(texto, { novasColunas = [], editar }) {
  const bom = texto.startsWith('﻿') ? '﻿' : '';
  const quebra = texto.includes('\r\n') ? '\r\n' : '\n';
  const linhas = parse(texto, { columns: true, skip_empty_lines: true, bom: true });
  const colunas = Object.keys(linhas[0] ?? {});
  for (const { nome, antesDe = [] } of novasColunas) {
    if (colunas.includes(nome)) continue;
    const pos = antesDe.map((c) => colunas.indexOf(c)).find((i) => i >= 0);
    colunas.splice(pos ?? colunas.length, 0, nome);
  }
  const corpo = linhas.map((original) => {
    const linha = Object.fromEntries(colunas.map((c) => [c, original[c] ?? '']));
    editar(linha);
    return colunas.map((c) => celula(linha[c] ?? '')).join(',');
  });
  return bom + [colunas.join(','), ...corpo].join(quebra) + quebra;
}
