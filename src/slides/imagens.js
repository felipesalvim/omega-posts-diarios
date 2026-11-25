import { NOMES_ILUSTRACAO, svgDaIlustracao } from './ilustracoes.js';

export { NOMES_ILUSTRACAO, svgDaIlustracao };

/** Ilustração usada quando o post não escolhe uma. */
const PADRAO_POR_PILAR = {
  'Segurança em 1 minuto': 'escudo',
  'Mito ou verdade': 'vf',
  'Bastidores': 'checklist',
  'Manutenção na prática': 'chave',
  'Modernização': 'upgrade',
  'Curiosidade e convivência': 'pessoas',
  'Marca e valores': 'predio',
};
const PADRAO_GERAL = 'cabine';
export const SEM_IMAGEM = 'nenhuma';
const EXTENSAO_FOTO = /\.(jpe?g|png|webp)$/i;

export const ehFoto = (valor) => EXTENSAO_FOTO.test(String(valor ?? '').trim());

/**
 * Decide a imagem da capa a partir da coluna `imagem` do post.
 * @returns {null | {tipo:'ilustracao', nome:string} | {tipo:'foto', arquivo:string}}
 */
export function resolverImagem(post) {
  const valor = String(post.imagem ?? '').trim();
  if (valor === SEM_IMAGEM) return null;
  if (ehFoto(valor)) return { tipo: 'foto', arquivo: valor };
  if (valor) return { tipo: 'ilustracao', nome: valor };
  return { tipo: 'ilustracao', nome: PADRAO_POR_PILAR[post.pilar] ?? PADRAO_GERAL };
}

/** Erro em português quando a coluna `imagem` aponta para uma ilustração que não existe; senão null. */
export function erroDeImagem(post) {
  const valor = String(post.imagem ?? '').trim();
  if (!valor || valor === SEM_IMAGEM || ehFoto(valor) || NOMES_ILUSTRACAO.includes(valor)) return null;
  return `Post ${post.data || '(sem data)'}: a imagem "${valor}" não existe. Use um destes nomes: ${NOMES_ILUSTRACAO.join(', ')}; "${SEM_IMAGEM}"; ou o nome de uma foto da pasta imagens/ (ex.: visita.jpg).`;
}
