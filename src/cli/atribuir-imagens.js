import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { editarCsv } from '../csv-editor.js';

/** Ilustração escolhida para cada capa de dezembro de 2026. */
export const IMAGENS_DEZEMBRO = {
  '2026-12-01': 'botao', '2026-12-02': 'checklist', '2026-12-03': 'alerta', '2026-12-04': 'upgrade',
  '2026-12-05': 'espelho', '2026-12-06': 'predio', '2026-12-07': 'porta', '2026-12-08': 'cabos',
  '2026-12-09': 'motor', '2026-12-10': 'chave', '2026-12-11': 'cabine', '2026-12-12': 'pessoas',
  '2026-12-13': 'lupa', '2026-12-14': 'carga', '2026-12-15': 'vf', '2026-12-16': 'telefone',
  '2026-12-17': 'calendario', '2026-12-18': 'acessivel', '2026-12-19': 'engrenagem', '2026-12-20': 'pessoas',
  '2026-12-21': 'escudo', '2026-12-22': 'grade', '2026-12-23': 'checklist', '2026-12-24': 'botao',
  '2026-12-25': 'presente', '2026-12-26': 'pata', '2026-12-27': 'calendario', '2026-12-28': 'porta',
  '2026-12-29': 'lupa', '2026-12-30': 'estrela', '2026-12-31': 'check',
};

/**
 * Acrescenta a coluna `imagem` (antes de `status`) preenchendo só as células vazias.
 * Todo o resto do CSV, inclusive status e textos já editados, é mantido.
 */
export function adicionarColunaImagem(texto, mapaPorData) {
  return editarCsv(texto, {
    novasColunas: [{ nome: 'imagem', antesDe: ['status'] }],
    editar(linha) {
      if (!linha.imagem.trim()) linha.imagem = mapaPorData[linha.data] ?? '';
    },
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const caminho = process.argv[2] ?? 'conteudo/2026-12.csv';
  fs.writeFileSync(caminho, adicionarColunaImagem(fs.readFileSync(caminho, 'utf8'), IMAGENS_DEZEMBRO));
  console.log(`Coluna "imagem" preenchida em ${caminho}.`);
}
