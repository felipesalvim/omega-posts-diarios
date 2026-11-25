// Publica o carrossel preparado em tmp/contexto.json. SIMULAR=true confere tudo sem publicar.
import fs from 'node:fs';
import { publicarDia } from '../fluxo.js';
import { aguardarUrls } from '../pages.js';
import { consultarConta } from '../instagram.js';

const contexto = JSON.parse(fs.readFileSync('tmp/contexto.json', 'utf8'));
const simular = process.env.SIMULAR === 'true';
const { IG_USER_ID: igUserId, IG_ACCESS_TOKEN: token } = process.env;

if (simular) {
  console.log(`Simulação de ${contexto.data}: nada será publicado.`);
  console.log(contexto.legenda);
  if (igUserId && token) {
    const conta = await consultarConta({ igUserId, token });
    console.log(`Token enxerga a conta @${conta.username} (${conta.account_type}).`);
  }
  process.exit(0);
}
if (!igUserId || !token) throw new Error('Faltam os segredos IG_USER_ID e IG_ACCESS_TOKEN.');

await aguardarUrls(contexto.urls);
const mediaId = await publicarDia({ contexto, igUserId, token, caminhoRegistro: 'registro/publicados.json' });
console.log(`Publicado: ${contexto.data} (mídia ${mediaId}).`);
