import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { SLIDE_PX } from '../config.js';
import { montarSlides, htmlDoSlide } from './montar.js';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
/** Os HTMLs ficam aqui (dois níveis abaixo da raiz, por isso o prefixo ../../assets). */
export const PASTA_HTML = path.join(RAIZ, 'tmp', 'slides');

/** Chromium do Playwright; CHROME_PATH aponta para um Chrome já instalado, se houver. */
export function abrirNavegador() {
  return chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    args: ['--no-sandbox'],
  });
}

/** Grava slide-1.jpg … slide-4.jpg (1080×1080) em `pastaSaida` e devolve os caminhos. */
export async function renderizarSlides(post, pastaSaida) {
  fs.mkdirSync(PASTA_HTML, { recursive: true });
  fs.mkdirSync(pastaSaida, { recursive: true });
  const navegador = await abrirNavegador();
  try {
    const page = await navegador.newPage({ viewport: { width: SLIDE_PX, height: SLIDE_PX } });
    const arquivos = [];
    for (const slide of montarSlides(post)) {
      const html = path.join(PASTA_HTML, `slide-${slide.indice}.html`);
      fs.writeFileSync(html, htmlDoSlide(slide));
      await page.goto(pathToFileURL(html).href);
      await page.waitForSelector('body[data-pronto]');
      const jpg = path.join(pastaSaida, `slide-${slide.indice}.jpg`);
      await page.screenshot({ path: jpg, type: 'jpeg', quality: 90 });
      arquivos.push(jpg);
    }
    return arquivos;
  } finally {
    await navegador.close();
  }
}
