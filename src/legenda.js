import { HASHTAGS, CONTATOS } from './config.js';

/** Nome, cidade, site e WhatsApp: vão em toda legenda para reforçar a marca nas buscas. */
export const BLOCO_CONTATOS = `Ômega Elevadores | Fortaleza, CE\nSite: ${CONTATOS.siteUrl}\nWhatsApp: ${CONTATOS.whatsapp}`;

/** Pede o salvamento e o envio: o Instagram valoriza posts salvos e compartilhados. */
export const LINHA_SALVAR = 'Salve este post e envie para o síndico ou a administradora do seu prédio.';

/**
 * Legenda do Instagram: gancho com palavra-chave, pergunta do dia (convite a comentar),
 * chamada para o WhatsApp, pedido de salvar, contatos e hashtags fixas.
 */
export function montarLegenda(post) {
  const pergunta = String(post.pergunta ?? '').trim();
  return [post.legenda, pergunta, post.cta_final, LINHA_SALVAR, BLOCO_CONTATOS, HASHTAGS]
    .filter(Boolean)
    .join('\n\n');
}
