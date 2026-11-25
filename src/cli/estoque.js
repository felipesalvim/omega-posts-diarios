// Falha (exit 1) quando restam menos de 7 dias de posts aprovados.
import { lerPosts } from '../conteudo.js';
import { diasDeEstoque, hojeEmFortaleza } from '../agenda.js';
import { ESTOQUE_MINIMO_DIAS } from '../config.js';

const dias = diasDeEstoque(lerPosts('conteudo'), hojeEmFortaleza());
console.log(`Estoque: ${dias} dia(s) de posts aprovados à frente.`);
if (dias < ESTOQUE_MINIMO_DIAS) {
  console.error(`Menos de ${ESTOQUE_MINIMO_DIAS} dias de estoque: aprove os próximos posts em conteudo/.`);
  process.exit(1);
}
