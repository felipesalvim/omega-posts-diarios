import fs from 'node:fs';
import path from 'node:path';
import { PAGES_BASE_URL } from './config.js';
import { lerPosts, validarPost } from './conteudo.js';
import { postDoDia } from './agenda.js';
import { montarLegenda } from './legenda.js';
import { lerRegistro, jaPublicado, registrar } from './registro.js';
import { resolverImagem } from './slides/imagens.js';
import { renderizarSlides } from './slides/renderizar.js';
import { publicarCarrossel } from './instagram.js';

/**
 * Valida o post do dia e gera os 4 JPEGs em `pastaSite/<data>/`.
 * @returns {Promise<null | {data:string, post:object, legenda:string, arquivos:string[], urls:string[]}>}
 *   null quando o dia já foi publicado ou o calendário ainda não começou.
 */
export async function prepararDia({ hoje, pastaConteudo, pastaSite, caminhoRegistro }) {
  if (jaPublicado(lerRegistro(caminhoRegistro), hoje)) return null;

  const posts = lerPosts(pastaConteudo);
  const post = postDoDia(posts, hoje);
  if (!post) {
    const primeiroDia = posts.map((p) => p.data).sort()[0];
    if (primeiroDia && hoje < primeiroDia) return null; // o calendário ainda não começou
    throw new Error(`Não existe post para ${hoje} nos arquivos de conteúdo.`);
  }
  if (post.status !== 'Aprovado') throw new Error(`O post de ${hoje} está com status "${post.status}"; precisa estar Aprovado.`);
  const erros = validarPost(post);
  if (erros.length) throw new Error(erros.join('\n'));

  const imagem = resolverImagem(post);
  if (imagem?.tipo === 'foto' && !fs.existsSync(path.join(pastaConteudo, '..', 'imagens', imagem.arquivo))) {
    throw new Error(`A foto imagens/${imagem.arquivo} do post de ${hoje} não está no repositório.`);
  }

  const arquivos = await renderizarSlides(post, path.join(pastaSite, hoje));
  const urls = arquivos.map((a) => `${PAGES_BASE_URL}/${hoje}/${path.basename(a)}`);
  return { data: hoje, post, legenda: montarLegenda(post), arquivos, urls };
}

/** Publica o carrossel e só então registra o dia. Com `simular`, não faz nada e devolve null. */
export async function publicarDia({ contexto, igUserId, token, caminhoRegistro, simular = false, fetchImpl, esperar }) {
  if (simular) return null;
  const mediaId = await publicarCarrossel({ igUserId, token, urls: contexto.urls, legenda: contexto.legenda, fetchImpl, esperar });
  registrar(caminhoRegistro, contexto.data, mediaId);
  return mediaId;
}
