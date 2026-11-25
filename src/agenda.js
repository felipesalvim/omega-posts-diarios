import { FUSO } from './config.js';

/** Data de hoje (AAAA-MM-DD) no fuso de Fortaleza, não em UTC. */
export function hojeEmFortaleza(agora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(agora);
}

export function postDoDia(posts, hoje) {
  return posts.find((p) => p.data === hoje);
}

function diaSeguinte(data) {
  const d = new Date(`${data}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Quantos dias consecutivos, a partir de amanhã, têm post Aprovado. */
export function diasDeEstoque(posts, hoje) {
  const statusPorData = new Map(posts.map((p) => [p.data, p.status]));
  let dias = 0;
  for (let d = diaSeguinte(hoje); statusPorData.get(d) === 'Aprovado'; d = diaSeguinte(d)) dias += 1;
  return dias;
}

/** Aceita AAAA-MM-DD ou DD/MM/AAAA e devolve AAAA-MM-DD; qualquer outra coisa é erro, para não pular o dia em silêncio. */
export function normalizarData(texto) {
  const t = String(texto).trim();
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t);
  const iso = br ? `${br[3]}-${br[2].padStart(2, '0')}-${br[1].padStart(2, '0')}` : t;
  const d = new Date(`${iso}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) {
    throw new Error(`Data "${texto}" inválida. Use AAAA-MM-DD, por exemplo 2026-12-02.`);
  }
  return iso;
}
