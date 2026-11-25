import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { LIMITES } from './config.js';
import { montarLegenda } from './legenda.js';
import { erroDeImagem } from './slides/imagens.js';

/**
 * @typedef {Object} Post
 * @property {string} data  AAAA-MM-DD
 * @property {string} pilar
 * @property {string} objetivo
 * @property {string} titulo_capa
 * @property {string} slide2_texto
 * @property {string} slide3_texto
 * @property {string} cta_final
 * @property {string} legenda
 * @property {string} [imagem]  ilustração da biblioteca, foto em imagens/ ou "nenhuma"; vazio = padrão do pilar
 * @property {string} status  Rascunho | Aprovado | Publicado
 */

const CAMPOS_OBRIGATORIOS = [
  'data', 'pilar', 'objetivo', 'titulo_capa', 'slide2_texto', 'slide3_texto', 'cta_final', 'legenda',
];
const CAMPOS_SLIDE = ['slide2_texto', 'slide3_texto'];
const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

/** Lê todos os CSVs de uma pasta, em ordem de nome. @returns {Post[]} */
export function lerPosts(pasta) {
  const arquivos = fs.readdirSync(pasta).filter((f) => f.endsWith('.csv')).sort();
  return arquivos.flatMap((arquivo) =>
    parse(fs.readFileSync(path.join(pasta, arquivo), 'utf8'), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    }),
  );
}

const contarPalavras = (texto) => texto.split(/\s+/).filter(Boolean).length;

/** Erros em português; lista vazia = post pronto para publicar (o status não é conferido aqui). */
export function validarPost(post) {
  const erros = [];
  const rotulo = `Post ${post.data || '(sem data)'}`;

  for (const campo of CAMPOS_OBRIGATORIOS) {
    if (!String(post[campo] ?? '').trim()) erros.push(`${rotulo}: o campo ${campo} está vazio.`);
  }
  for (const [campo, valor] of Object.entries(post)) {
    if (campo !== 'status' && /[[\]]/.test(String(valor ?? ''))) {
      erros.push(`${rotulo}: o campo ${campo} tem colchetes ainda não preenchidos.`);
    }
  }
  for (const campo of CAMPOS_SLIDE) {
    const palavras = contarPalavras(String(post[campo] ?? ''));
    if (palavras > LIMITES.palavrasSlide) {
      erros.push(`${rotulo}: ${campo} tem ${palavras} palavras (máximo ${LIMITES.palavrasSlide}).`);
    }
  }
  const legendaFinal = montarLegenda({ legenda: post.legenda ?? '', pergunta: post.pergunta, cta_final: post.cta_final ?? '' });
  if (legendaFinal.length > LIMITES.legenda) {
    erros.push(`${rotulo}: a legenda final tem ${legendaFinal.length} caracteres (máximo ${LIMITES.legenda}).`);
  }
  const erroImagem = erroDeImagem(post);
  if (erroImagem) erros.push(erroImagem);
  return erros;
}

/** Datas fora do formato AAAA-MM-DD ou repetidas. */
export function validarCalendario(posts) {
  const erros = [];
  const vistas = new Set();
  for (const { data } of posts) {
    if (!FORMATO_DATA.test(data ?? '')) {
      erros.push(`Data "${data}" fora do formato AAAA-MM-DD.`);
      continue;
    }
    if (vistas.has(data)) erros.push(`Data ${data} duplicada no calendário.`);
    vistas.add(data);
  }
  return erros;
}
