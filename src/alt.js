import { CONTATOS } from './config.js';

const LIMITE = 250;
const cortar = (t) => (t.length <= LIMITE ? t : `${t.slice(0, LIMITE - 1).trimEnd()}…`);

/** Texto alternativo de cada slide (acessibilidade e busca do Instagram), na ordem do carrossel. */
export function textosAlternativos(post) {
  return [
    `Ômega Elevadores, ${post.pilar}: ${post.titulo_capa}`,
    `Ômega Elevadores: ${post.slide2_texto}`,
    `Ômega Elevadores: ${post.slide3_texto}`,
    `Ômega Elevadores em Fortaleza. WhatsApp ${CONTATOS.whatsapp}, Instagram ${CONTATOS.instagram}, site ${CONTATOS.site}`,
  ].map(cortar);
}
