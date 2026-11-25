// Gera as imagens do dia em site/ e grava tmp/contexto.json. Uso: node src/cli/preparar.js [AAAA-MM-DD]
import fs from 'node:fs';
import { hojeEmFortaleza, normalizarData } from '../agenda.js';
import { prepararDia } from '../fluxo.js';

const hoje = process.argv[2] ? normalizarData(process.argv[2]) : hojeEmFortaleza();
const contexto = await prepararDia({
  hoje, pastaConteudo: 'conteudo', pastaSite: 'site', caminhoRegistro: 'registro/publicados.json',
});

const pular = contexto === null;
if (pular) {
  console.log(`${hoje}: nada a publicar hoje (já publicado ou calendário ainda não começou).`);
} else {
  fs.mkdirSync('tmp', { recursive: true });
  fs.writeFileSync('tmp/contexto.json', JSON.stringify(contexto, null, 2));
  fs.writeFileSync('site/index.html', '<!doctype html><meta charset="utf-8"><title>Ômega Elevadores</title>');
  console.log(`${hoje}: ${contexto.arquivos.length} imagens prontas.`);
}
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `pular=${pular}\n`);
