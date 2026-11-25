import crypto from 'node:crypto';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { editarCsv } from '../csv-editor.js';
import { LEGENDAS_DEZEMBRO } from './legendas-dezembro.js';

export { LEGENDAS_DEZEMBRO };

export const sha = (texto) => crypto.createHash('sha1').update(String(texto).trim()).digest('hex');

/**
 * Acrescenta a coluna `pergunta` e troca a `legenda` pela versão nova, mas só quando
 * a legenda ainda é o rascunho original. Textos que a pessoa já editou ficam como estão.
 */
export function aplicarLegendas(texto, mapa) {
  return editarCsv(texto, {
    novasColunas: [{ nome: 'pergunta', antesDe: ['imagem', 'status'] }],
    editar(linha) {
      const novo = mapa[linha.data];
      if (!novo) return;
      if (sha(linha.legenda) === novo.antiga) linha.legenda = novo.legenda;
      if (!linha.pergunta.trim()) linha.pergunta = novo.pergunta;
    },
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const caminho = process.argv[2] ?? 'conteudo/2026-12.csv';
  fs.writeFileSync(caminho, aplicarLegendas(fs.readFileSync(caminho, 'utf8'), LEGENDAS_DEZEMBRO));
  console.log(`Legendas e perguntas atualizadas em ${caminho} (textos que você editou foram mantidos).`);
}
