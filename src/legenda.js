import { HASHTAGS } from './config.js';

/** Legenda do Instagram: frase de apoio, chamada do dia e hashtags fixas. */
export function montarLegenda(post) {
  return `${post.legenda}\n\n${post.cta_final}\n\n${HASHTAGS}`;
}
