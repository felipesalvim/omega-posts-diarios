import fs from 'node:fs';
import { CONTATOS } from '../config.js';
import { resolverImagem, svgDaIlustracao } from './imagens.js';

const lerModelo = (nome) => fs.readFileSync(new URL(`./templates/${nome}`, import.meta.url), 'utf8');

/**
 * @typedef {Object} Slide
 * @property {'capa'|'conteudo'|'contracapa'} tipo
 * @property {'escuro'|'claro'} fundo
 * @property {string} etiqueta  nome do slide, mostrado ao lado do indicador de andar
 * @property {string} texto
 * @property {number} indice  1 a 4
 * @property {ReturnType<typeof resolverImagem>} [imagem]  só na capa
 */

/** Os 4 slides do carrossel, na ordem. @returns {Slide[]} */
export function montarSlides(post) {
  return [
    { tipo: 'capa', fundo: 'escuro', etiqueta: post.pilar, texto: post.titulo_capa, indice: 1, imagem: resolverImagem(post) },
    { tipo: 'conteudo', fundo: 'claro', etiqueta: 'Contexto', texto: post.slide2_texto, indice: 2 },
    { tipo: 'conteudo', fundo: 'claro', etiqueta: 'Na prática', texto: post.slide3_texto, indice: 3 },
    { tipo: 'contracapa', fundo: 'escuro', etiqueta: 'Fale com a Ômega', texto: post.cta_final, indice: 4 },
  ];
}

const escapar = (t) =>
  String(t).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

/** Seta "próximo": só nos slides 1 a 3. */
const proximo = (indice) =>
  indice < 4
    ? '<div class="proximo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3.5 16.5 12 8 20.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
    : '';

/** Quatro traços no topo; o do slide atual fica aceso. */
const progresso = (indice) =>
  '<div class="progresso" aria-hidden="true">' +
  [1, 2, 3, 4].map((n) => `<span class="passo${n === indice ? ' atual' : ''}"></span>`).join('') +
  '</div>';

/** Primeira frase em destaque; o resto vira apoio. Texto de uma frase só fica todo em destaque. */
function textoComDestaque(texto) {
  const m = /^(.+?[.!?])\s+(\S[\s\S]*)$/.exec(texto);
  if (!m) {
    const longo = texto.split(/\s+/).filter(Boolean).length > 12;
    return longo ? `<span class="unico">${escapar(texto)}</span>` : `<strong class="destaque">${escapar(texto)}</strong>`;
  }
  return `<strong class="destaque">${escapar(m[1])}</strong><span class="resto">${escapar(m[2])}</span>`;
}

/** Reserva mínima de altura (px) para a imagem acima do título da capa. */
const RESERVA_IMAGEM_PX = 340;

function imagemDaCapa(imagem, assets) {
  if (!imagem) return '';
  if (imagem.tipo === 'foto') {
    return `<div class="zona-imagem"><img class="foto" src="${assets.replace(/assets$/, 'imagens')}/${escapar(imagem.arquivo)}" alt=""></div>`;
  }
  return `<div class="zona-imagem">${svgDaIlustracao(imagem.nome)}</div>`;
}

/** Página HTML completa de um slide; `assets` é o caminho das logos/fontes visto a partir do HTML. */
export function htmlDoSlide(slide, { assets = '../../assets' } = {}) {
  const valores = {
    assets,
    estilo: lerModelo('estilo.css'),
    ajuste: lerModelo('ajuste.js'),
    fundo: slide.fundo,
    logo: slide.fundo === 'escuro' ? 'logo-branca.png' : 'logo-colorida.png',
    indice: String(slide.indice),
    imagem: imagemDaCapa(slide.imagem, assets),
    comImagem: slide.imagem ? 'com-imagem' : '',
    reserva: slide.imagem ? String(RESERVA_IMAGEM_PX) : '0',
    progresso: progresso(slide.indice),
    proximo: proximo(slide.indice),
    textoDestaque: textoComDestaque(slide.texto),
    etiqueta: escapar(slide.etiqueta),
    texto: escapar(slide.texto),
    whatsapp: escapar(CONTATOS.whatsapp),
    instagram: escapar(CONTATOS.instagram),
    site: escapar(CONTATOS.site),
  };
  // O estilo entra primeiro, porque ele mesmo usa {{assets}}.
  const html = lerModelo(`${slide.tipo}.html`).replace('{{estilo}}', valores.estilo).replace('{{ajuste}}', valores.ajuste);
  return html.replace(/\{\{(\w+)\}\}/g, (_, chave) => valores[chave] ?? '');
}
