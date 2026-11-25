import fs from 'node:fs';
import { CONTATOS } from '../config.js';

const lerModelo = (nome) => fs.readFileSync(new URL(`./templates/${nome}`, import.meta.url), 'utf8');

/**
 * @typedef {Object} Slide
 * @property {'capa'|'conteudo'|'contracapa'} tipo
 * @property {'escuro'|'claro'} fundo
 * @property {string} etiqueta  nome do slide, mostrado ao lado do indicador de andar
 * @property {string} texto
 * @property {number} indice  1 a 4
 */

/** Os 4 slides do carrossel, na ordem. @returns {Slide[]} */
export function montarSlides(post) {
  return [
    { tipo: 'capa', fundo: 'escuro', etiqueta: post.pilar, texto: post.titulo_capa, indice: 1 },
    { tipo: 'conteudo', fundo: 'claro', etiqueta: 'Contexto', texto: post.slide2_texto, indice: 2 },
    { tipo: 'conteudo', fundo: 'claro', etiqueta: 'Na prática', texto: post.slide3_texto, indice: 3 },
    { tipo: 'contracapa', fundo: 'escuro', etiqueta: 'Fale com a Ômega', texto: post.cta_final, indice: 4 },
  ];
}

const escapar = (t) =>
  String(t).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const seta = (paraBaixo) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true"${paraBaixo ? ' style="transform:rotate(180deg)"' : ''}><path d="M12 3 L22 21 H2 Z" fill="currentColor"/></svg>`;

/** Página HTML completa de um slide; `assets` é o caminho das logos/fontes visto a partir do HTML. */
export function htmlDoSlide(slide, { assets = '../../assets' } = {}) {
  const valores = {
    assets,
    estilo: lerModelo('estilo.css'),
    ajuste: lerModelo('ajuste.js'),
    fundo: slide.fundo,
    logo: slide.fundo === 'escuro' ? 'logo-branca.png' : 'logo-colorida.png',
    indice: String(slide.indice),
    etiqueta: escapar(slide.etiqueta),
    texto: escapar(slide.texto),
    seta: seta(slide.indice === 4),
    whatsapp: escapar(CONTATOS.whatsapp),
    instagram: escapar(CONTATOS.instagram),
    site: escapar(CONTATOS.site),
  };
  // O estilo entra primeiro, porque ele mesmo usa {{assets}}.
  const html = lerModelo(`${slide.tipo}.html`).replace('{{estilo}}', valores.estilo).replace('{{ajuste}}', valores.ajuste);
  return html.replace(/\{\{(\w+)\}\}/g, (_, chave) => valores[chave] ?? '');
}
