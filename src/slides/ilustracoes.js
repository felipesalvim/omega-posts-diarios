// Biblioteca de ilustrações da capa. Todas em 400×400, traço dourado sobre o vinho da marca.
// Classes (definidas em estilo.css): t = traço, f = forma vinho escuro com contorno,
// d = dourado cheio, fino = traço mais leve.

const estrela = (cx, cy, R, r) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const raio = i % 2 ? r : R;
    return `${(cx + raio * Math.cos(a)).toFixed(1)},${(cy + raio * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

const dentes = Array.from({ length: 8 }, (_, i) =>
  `<rect x="182" y="58" width="36" height="52" rx="7" class="f" transform="rotate(${i * 45} 200 200)"/>`).join('');

const brilho = (x, y, s = 14) =>
  `<path class="d" d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z"/>`;

const DESENHOS = {
  botao: `<rect class="f" x="130" y="55" width="140" height="290" rx="26"/>
    <circle class="d" cx="200" cy="145" r="38"/><path d="M200 126 L220 158 H180 Z" fill="#5C0C11"/>
    <circle class="t" cx="200" cy="255" r="38"/><path class="d" d="M200 274 L220 242 H180 Z"/>`,

  cabos: `<circle class="f" cx="200" cy="105" r="52"/><circle class="d" cx="200" cy="105" r="15"/>
    <path class="t" d="M150 105 V235 M250 105 V190 M168 150 V235 M232 150 V190" />
    <rect class="f" x="105" y="235" width="90" height="105" rx="10"/><path class="t fino" d="M150 245 V330"/>
    <rect class="f" x="222" y="190" width="56" height="100" rx="8"/><path class="t fino" d="M232 220 H268 M232 245 H268 M232 270 H268"/>`,

  motor: `<g transform="translate(-24 0)"><path class="t" d="M65 305 H335"/>
    <rect class="f" x="80" y="165" width="170" height="125" rx="20"/>
    <path class="t fino" d="M115 188 V268 M150 188 V268 M185 188 V268 M220 188 V268"/>
    <path class="t" d="M250 228 H290"/>
    <circle class="f" cx="302" cy="228" r="56"/><circle class="d" cx="302" cy="228" r="16"/>
    <path class="t fino" d="M302 190 V266 M264 228 H340"/></g>`,

  checklist: `<rect class="f" x="95" y="70" width="210" height="275" rx="24"/>
    <rect class="d" x="158" y="48" width="84" height="42" rx="14"/>
    <path class="t" d="M125 158 l14 14 l26 -30 M125 220 l14 14 l26 -30 M125 282 l14 14 l26 -30"/>
    <path class="t fino" d="M190 158 H278 M190 220 H278 M190 282 H278"/>`,

  alerta: `<path class="f" d="M200 62 L338 312 H62 Z"/>
    <path class="t" stroke-width="18" d="M200 145 V228"/><circle class="d" cx="200" cy="270" r="12"/>`,

  upgrade: `<circle class="t fino" cx="200" cy="205" r="140" stroke-dasharray="3 20"/>
    <path class="d" d="M200 120 L268 205 H228 V285 H172 V205 H132 Z"/>${brilho(312, 100)}${brilho(92, 298, 12)}`,

  espelho: `<rect class="t" x="95" y="50" width="210" height="300" rx="26"/>
    <rect class="f" x="118" y="73" width="164" height="254" rx="14"/>
    <path class="t" stroke-width="12" d="M150 280 L228 130 M196 296 L252 190"/>${brilho(262, 112)}`,

  escudo: `<path class="f" d="M200 52 L322 98 V200 C322 272 272 322 200 352 C128 322 78 272 78 200 V98 Z"/>
    <path class="t" stroke-width="17" d="M143 205 L186 248 L262 160"/>`,

  porta: `<path class="t" d="M70 345 H330"/>
    <rect x="95" y="60" width="210" height="285" rx="10" fill="#2E0507" stroke="#E3CFA6" stroke-width="9"/>
    <rect class="f" x="95" y="60" width="78" height="285" rx="10"/><rect class="f" x="227" y="60" width="78" height="285" rx="10"/>
    <path class="d" d="M200 300 l-14 -18 h28 Z M200 330 l-14 -18 h28 Z" opacity=".85"/>`,

  chave: `<g transform="rotate(40 200 200)">
    <rect class="f" x="180" y="140" width="40" height="215" rx="20"/>
    <circle class="f" cx="200" cy="110" r="62"/>
    <rect x="182" y="40" width="36" height="64" fill="#8A151B"/><path class="t" d="M182 40 V100 M218 40 V100" stroke-width="9"/>
    <circle class="d" cx="200" cy="320" r="9"/></g>`,

  cabine: `<rect class="t" x="85" y="55" width="230" height="295" rx="14"/>
    <rect class="f" x="105" y="75" width="190" height="255" rx="8"/>
    <rect class="t fino" x="150" y="92" width="100" height="44" rx="10"/>
    <text x="200" y="125" text-anchor="middle" font-family="Space Mono, monospace" font-weight="700" font-size="34" fill="#E3CFA6">12</text>
    <path class="d" d="M105 215 H295" stroke="#E3CFA6" stroke-width="12" stroke-linecap="round"/>
    <path class="t fino" d="M105 300 H295"/>`,

  pessoas: `<circle class="f" cx="108" cy="190" r="28"/><path class="f" d="M62 335 V305 a46 50 0 0 1 92 0 V335 Z"/>
    <circle class="f" cx="292" cy="190" r="28"/><path class="f" d="M246 335 V305 a46 50 0 0 1 92 0 V335 Z"/>
    <circle class="d" cx="200" cy="150" r="42"/><path class="d" d="M128 345 V292 a72 72 0 0 1 144 0 V345 Z"/>`,

  lupa: `<circle class="f" cx="170" cy="170" r="98"/>
    <path class="t fino" d="M122 140 H218 M122 172 H198 M122 204 H208"/>
    <path class="t" stroke-width="30" d="M245 245 L330 330"/>
    <path class="d" d="M245 245 L330 330" stroke="#E3CFA6" stroke-width="30" stroke-linecap="round"/>`,

  carga: `<path class="f" d="M118 335 L142 168 H258 L282 335 Z"/>
    <circle class="t" cx="200" cy="130" r="38"/>
    <text x="200" y="292" text-anchor="middle" font-family="Space Mono, monospace" font-weight="700" font-size="62" fill="#E3CFA6">KG</text>`,

  vf: `<g transform="rotate(-9 135 200)"><rect class="f" x="62" y="95" width="145" height="210" rx="16"/>
      <path class="t" stroke-width="16" d="M95 205 L128 238 L178 168"/></g>
    <g transform="rotate(9 265 200)"><rect class="d" x="193" y="95" width="145" height="210" rx="16"/>
      <path d="M232 162 L298 238 M298 162 L232 238" stroke="#5C0C11" stroke-width="16" stroke-linecap="round"/></g>`,

  telefone: `<g transform="translate(62 82) scale(11)"><path class="d" d="M6.6 3.5h2.7l1.4 4-1.8 1.4a11 11 0 0 0 5.7 5.7l1.4-1.8 4 1.4v2.7a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"/></g>
    <path class="t" d="M262 100 A58 58 0 0 1 310 148 M262 52 A106 106 0 0 1 358 148"/>`,

  calendario: `<rect class="f" x="75" y="85" width="250" height="255" rx="24"/>
    <path class="d" d="M75 109 a24 24 0 0 1 24 -24 H301 a24 24 0 0 1 24 24 V150 H75 Z"/>
    <path class="t" stroke-width="14" d="M140 62 V108 M260 62 V108"/>
    <g class="d"><circle cx="130" cy="195" r="10"/><circle cx="200" cy="195" r="10"/><circle cx="270" cy="195" r="10"/>
    <circle cx="130" cy="250" r="10"/><circle cx="270" cy="250" r="10"/><circle cx="130" cy="305" r="10"/><circle cx="200" cy="305" r="10"/></g>
    <circle class="t" cx="200" cy="250" r="27"/>`,

  acessivel: `<circle class="d" cx="188" cy="88" r="20"/>
    <path class="t" stroke-width="16" d="M188 128 V222 H252 L288 305 M188 168 H250"/>
    <path class="t" stroke-width="16" d="M160 188 A74 74 0 1 0 252 292"/>`,

  engrenagem: `${dentes}<circle class="f" cx="200" cy="200" r="90"/><circle class="t" cx="200" cy="200" r="38"/><circle class="d" cx="200" cy="200" r="12"/>`,

  grade: `<rect class="f" x="85" y="85" width="230" height="230" rx="28"/>
    <path class="t" d="M125 135 H275 M125 170 H275 M125 205 H275 M125 240 H275 M125 275 H275"/>`,

  presente: `<rect class="f" x="100" y="190" width="200" height="145" rx="10"/><rect class="f" x="82" y="140" width="236" height="62" rx="10"/>
    <rect class="d" x="178" y="140" width="44" height="195"/>
    <path class="t" d="M200 140 C150 62 98 118 200 140 C302 118 250 62 200 140 Z"/>`,

  pata: `<path class="d" d="M200 215 C150 215 118 252 130 285 C140 313 175 305 200 297 C225 305 260 313 270 285 C282 252 250 215 200 215 Z"/>
    <ellipse class="d" cx="118" cy="190" rx="23" ry="32" transform="rotate(-25 118 190)"/>
    <ellipse class="d" cx="166" cy="135" rx="24" ry="34" transform="rotate(-8 166 135)"/>
    <ellipse class="d" cx="234" cy="135" rx="24" ry="34" transform="rotate(8 234 135)"/>
    <ellipse class="d" cx="282" cy="190" rx="23" ry="32" transform="rotate(25 282 190)"/>`,

  estrela: `<polygon class="d" points="${estrela(200, 208, 140, 58)}" stroke="#E3CFA6" stroke-width="9" stroke-linejoin="round"/>${brilho(95, 95, 12)}${brilho(318, 120, 10)}`,

  check: `<circle class="f" cx="200" cy="200" r="130"/><path class="t" stroke-width="24" d="M135 205 L184 254 L270 148"/>`,

  predio: `<rect class="f" x="112" y="62" width="176" height="283" rx="10"/>
    <g class="d"><rect x="138" y="92" width="34" height="26" rx="4"/><rect x="228" y="92" width="34" height="26" rx="4"/>
    <rect x="138" y="144" width="34" height="26" rx="4"/><rect x="228" y="144" width="34" height="26" rx="4"/>
    <rect x="138" y="196" width="34" height="26" rx="4"/><rect x="228" y="196" width="34" height="26" rx="4"/></g>
    <rect class="t" x="172" y="268" width="56" height="77" rx="6"/><path class="t fino" d="M200 268 V345"/>`,
};

export const NOMES_ILUSTRACAO = Object.keys(DESENHOS);

/** SVG completo da ilustração, com o anel que ecoa o símbolo da logo. */
export function svgDaIlustracao(nome) {
  if (!DESENHOS[nome]) throw new Error(`Ilustração "${nome}" não existe.`);
  return `<svg class="ilustracao" viewBox="0 0 400 400" preserveAspectRatio="xMinYMid meet" aria-hidden="true"><circle class="anel" cx="200" cy="200" r="192"/><g transform="translate(200 200) scale(1.12) translate(-200 -200)">${DESENHOS[nome]}</g></svg>`;
}
