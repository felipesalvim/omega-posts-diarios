import { HASHTAGS, CONTATOS } from './config.js';

/** Nome, cidade, site e WhatsApp: vão em toda legenda para reforçar a marca nas buscas. */
export const BLOCO_CONTATOS = `Ômega Elevadores | Fortaleza, CE\nSite: ${CONTATOS.siteUrl}\nWhatsApp: ${CONTATOS.whatsapp}`;

/** Legenda do Instagram: frase de apoio, chamada do dia, contatos e hashtags fixas. */
export function montarLegenda(post) {
  return `${post.legenda}\n\n${post.cta_final}\n\n${BLOCO_CONTATOS}\n\n${HASHTAGS}`;
}
