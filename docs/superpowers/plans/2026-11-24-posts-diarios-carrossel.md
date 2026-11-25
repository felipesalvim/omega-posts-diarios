# Posts diários em carrossel (Ômega Elevadores) — Plano de construção

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar sozinho, todo dia às 18h (Fortaleza), um carrossel de 4 slides no Instagram da Ômega Elevadores, a partir de um CSV de conteúdo no repositório, sem custo.

**Architecture:** Um fluxo do GitHub Actions lê a linha da data de hoje no CSV, valida, desenha os 4 slides com modelos HTML/CSS (Playwright/Chromium → JPEG 1080×1080), publica as imagens no GitHub Pages e chama a API do Instagram (login do Instagram) para criar o carrossel. Um arquivo `registro/publicados.json` impede publicar duas vezes. Dois fluxos auxiliares avisam por e-mail (falha) quando falta conteúdo e renovam o token.

**Tech Stack:** Node.js 20 (ESM, `node:test`), Playwright (Chromium), `csv-parse`, `image-size` (dev), `@fontsource/dm-sans` e `@fontsource/space-mono` (dev, só para copiar as fontes), GitHub Actions + Pages, Instagram API with Instagram Login (`https://graph.instagram.com`).

**Spec:** https://claude.ai/artifact/VGBzhseS7hHcADht1t1TbD (documento "Posts diários em carrossel — Ômega Elevadores (desenho)", aprovado em 2026-11-24)

## Global Constraints

- 4 slides por post, nesta ordem: capa, conteúdo (contexto), conteúdo (ação), contra-capa. Cada um em **1080 × 1080 px, JPEG**.
- Logo da Ômega no **canto inferior direito de todos os slides**: ~220 px de largura, margem ~48 px das bordas. Logo colorida (`assets/logo-colorida.png`) em fundo claro; branca (`assets/logo-branca.png`) em fundo escuro. Texto nunca fica atrás da logo.
- Cores: vinho `#8A151B`, dourado `#A9824B`. Fontes: DM Sans e Space Mono, empacotadas no repositório (sem CDN).
- Contra-capa leva: WhatsApp (85) 3252.2240 · Instagram @omegaelevadores · site https://www.omegaelevadores.com.br/ · `cta_final` do dia · logo.
- Textos dos slides 2 e 3: ~35 palavras no máximo (erro acima de 40). Legenda final ≤ 2.200 caracteres. Nenhum texto com `[` ou `]`.
- Conteúdo em `conteudo/AAAA-MM.csv`, colunas exatas: `data` (AAAA-MM-DD), `pilar`, `objetivo`, `titulo_capa`, `slide2_texto`, `slide3_texto`, `cta_final`, `legenda`, `status` (`Rascunho` | `Aprovado` | `Publicado`). Só publica `Aprovado`.
- Roda todo dia às 18h de Fortaleza = cron `0 21 * * *` (UTC). Sem linha para hoje → não publica e falha (e-mail do GitHub). Aviso por e-mail quando restarem **menos de 7 dias** de conteúdo aprovado.
- Primeiro post: 2026-12-01. Todo mês entra um CSV novo, sem repetir o anterior.
- Repositório público `felipesalvim/omega-posts-diarios`. Imagens em `https://felipesalvim.github.io/omega-posts-diarios/AAAA-MM-DD/slide-N.jpg`. Token e IDs só em segredos do GitHub, nunca no código.
- Custo zero: nada de hospedagem, banco ou serviço pago.
- Instagram: carrossel de 2 a 10 imagens, só JPEG; imagens precisam estar em URL pública no momento da chamada.
- Hashtags fixas: `#ÔmegaElevadores #ElevadoresFortaleza #ManutençãoDeElevadores #Condomínio #Síndico #SegurançaPredial #Fortaleza`.

## Review Focus

1. CSV com vírgulas, aspas e quebras de linha dentro da legenda: deve chegar intacto ao Instagram (Task 2).
2. Data de "hoje" em Fortaleza, não em UTC: execução manual à noite (UTC já no dia seguinte) escolhe o post certo (Task 3).
3. Rodar duas vezes no mesmo dia não duplica o post (Task 4 e Task 7).
4. Título ou texto longo não estoura nem passa por trás da logo (Task 5).
5. Falha no meio do carrossel (uma imagem recusada) não publica carrossel incompleto e não registra o dia como publicado (Task 6 e Task 7).

---

### Task 1: Esqueleto do repositório

**Files:**
- Create: `package.json`, `.gitignore`, `src/config.js`, `assets/logo-colorida.png`, `assets/logo-branca.png`, `assets/fonts/*.woff2`, `registro/publicados.json`, `test/config.test.js`
- Source das logos: `/mnt/user-data/uploads/c3bcaa0d-image.png` (colorida) e `/mnt/user-data/uploads/223c2019-image.png` (branca)

**Interfaces:**
- Produces (`src/config.js`): `FUSO: string`, `CORES: {vinho, dourado}`, `CONTATOS: {whatsapp, instagram, site, siteUrl}`, `HASHTAGS: string`, `LIMITES: {palavrasSlide: 40, legenda: 2200}`, `ESTOQUE_MINIMO_DIAS: 7`, `PAGES_BASE_URL: string`, `SLIDE_PX: 1080`, `INSTAGRAM: {host: 'https://graph.instagram.com', versao: 'v21.0'}`.

- [ ] **Step 1:** `mkdir omega-posts-diarios && cd omega-posts-diarios && git init -b main && npm init -y`. Em `package.json`: `"type": "module"`, `"scripts": {"test": "node --test test/"}`. Instalar `playwright csv-parse` e, como dev, `image-size @fontsource/dm-sans @fontsource/space-mono`.
- [ ] **Step 2: Write the failing test** `test/config.test.js`: `assert.equal(CORES.vinho, '#8A151B')`, `assert.equal(CONTATOS.whatsapp, '(85) 3252.2240')`, `assert.equal(PAGES_BASE_URL, 'https://felipesalvim.github.io/omega-posts-diarios')`, `assert.equal(ESTOQUE_MINIMO_DIAS, 7)`.
- [ ] **Step 3:** Run `npm test` → FAIL (módulo não existe).
- [ ] **Step 4:** Criar `src/config.js` com os valores das Global Constraints.
- [ ] **Step 5:** Copiar as duas logos para `assets/` com os nomes acima. Copiar de `node_modules/@fontsource/*/files/` os pesos `dm-sans-latin-400-normal`, `dm-sans-latin-700-normal`, `space-mono-latin-400-normal` e `space-mono-latin-700-normal` (`.woff2`) para `assets/fonts/`. Criar `registro/publicados.json` com `{}`. `.gitignore`: `node_modules/`, `tmp/`, `site/`.
- [ ] **Step 6:** `npm test` → PASS.
- [ ] **Step 7: Commit** — `git add . && git commit -m "chore: esqueleto do repositório e configuração"`

### Task 2: Leitura e validação do conteúdo

**Files:**
- Create: `src/conteudo.js`, `test/conteudo.test.js`, `test/fixtures/conteudo/2026-12.csv`

**Interfaces:**
- Consumes: `LIMITES` (Task 1).
- Produces:
  - `type Post = {data, pilar, objetivo, titulo_capa, slide2_texto, slide3_texto, cta_final, legenda, status}` (todos `string`)
  - `lerPosts(pasta: string): Post[]` — lê todos os `*.csv` da pasta em ordem de nome.
  - `validarPost(post: Post): string[]` — mensagens de erro em português; vazio = ok. Não olha `status`.
  - `validarCalendario(posts: Post[]): string[]` — data fora de `AAAA-MM-DD` ou duplicada.

- [ ] **Step 1: Write the failing tests** (`node:test`):
  - `lerPosts preserva vírgulas, aspas e quebras de linha na legenda`: fixture com legenda `Linha 1, com "aspas"\nLinha 2`; `assert.equal(posts[0].legenda, 'Linha 1, com "aspas"\nLinha 2')`.
  - `validarPost rejeita colchetes`: `titulo_capa: 'Olá [nome]'` → erro contém `colchetes`.
  - `validarPost rejeita campo vazio` (um erro por campo vazio, citando o nome da coluna).
  - `validarPost rejeita slide com mais de 40 palavras`.
  - `validarPost aceita post completo` → `[]`.
  - `validarCalendario acusa data duplicada e formato inválido`.
- [ ] **Step 2:** `npm test -- test/conteudo.test.js` → FAIL.
- [ ] **Step 3:** Implementar as três funções. `lerPosts` usa `csv-parse/sync` com `columns: true`, `skip_empty_lines: true`, `trim: true`. Colchetes: qualquer `[` ou `]` em qualquer campo de texto.
- [ ] **Step 4:** Rodar → PASS.
- [ ] **Step 5: Commit** — `feat: leitura e validação do conteúdo`

### Task 3: Escolha do post do dia, estoque e legenda

**Files:**
- Create: `src/agenda.js`, `src/legenda.js`, `test/agenda.test.js`, `test/legenda.test.js`

**Interfaces:**
- Consumes: `Post`, `FUSO`, `HASHTAGS`, `LIMITES`.
- Produces:
  - `hojeEmFortaleza(agora: Date): string` — `AAAA-MM-DD` no fuso `America/Fortaleza`.
  - `postDoDia(posts: Post[], hoje: string): Post | undefined`
  - `diasDeEstoque(posts: Post[], hoje: string): number` — quantos dias **consecutivos a partir de amanhã** têm post `Aprovado`.
  - `montarLegenda(post: Post): string` — `legenda`, linha em branco, `cta_final`, linha em branco, `HASHTAGS`.

- [ ] **Step 1: Write the failing tests:**
  - `hojeEmFortaleza(new Date('2026-12-02T01:00:00Z')) === '2026-12-01'` e `hojeEmFortaleza(new Date('2026-12-01T21:00:00Z')) === '2026-12-01'`.
  - `postDoDia` devolve `undefined` para data sem linha.
  - `diasDeEstoque` para posts aprovados em 12-02, 12-03, 12-04, lacuna em 12-05, aprovado em 12-06, com `hoje='2026-12-01'` → `3`; se 12-03 estiver `Rascunho` → `1`.
  - `montarLegenda` termina com `HASHTAGS` e tem no máximo `LIMITES.legenda` caracteres para um post de fixture.
- [ ] **Step 2:** Rodar → FAIL.
- [ ] **Step 3:** Implementar. `hojeEmFortaleza` com `Intl.DateTimeFormat('en-CA', {timeZone: FUSO})`.
- [ ] **Step 4:** Rodar → PASS.
- [ ] **Step 5: Commit** — `feat: agenda, estoque e legenda`

### Task 4: Registro de publicações

**Files:**
- Create: `src/registro.js`, `test/registro.test.js`

**Interfaces:**
- Produces:
  - `type Registro = Record<string, {mediaId: string, publicadoEm: string}>`
  - `lerRegistro(caminho: string): Registro` — arquivo ausente → `{}`.
  - `jaPublicado(registro: Registro, data: string): boolean`
  - `registrar(caminho: string, data: string, mediaId: string, agora?: Date): void` — escreve JSON com 2 espaços de indentação, chaves ordenadas por data.

- [ ] **Step 1: Write the failing tests** (usar `fs.mkdtempSync`): arquivo ausente → `{}`; depois de `registrar(c, '2026-12-01', 'M1')`, `jaPublicado(lerRegistro(c), '2026-12-01') === true` e `'2026-12-02'` → `false`; registrar duas datas mantém as duas, em ordem.
- [ ] **Step 2:** Rodar → FAIL. **Step 3:** Implementar. **Step 4:** Rodar → PASS.
- [ ] **Step 5: Commit** — `feat: registro de publicações`

### Task 5: Modelos dos slides e renderização

**Files:**
- Create: `src/slides/montar.js`, `src/slides/renderizar.js`, `src/slides/templates/capa.html`, `conteudo.html`, `contracapa.html`, `src/slides/templates/estilo.css`, `test/slides.test.js`

**Interfaces:**
- Consumes: `Post`, `CORES`, `CONTATOS`, `SLIDE_PX`.
- Produces:
  - `type Slide = {tipo: 'capa'|'conteudo'|'contracapa', fundo: 'escuro'|'claro', etiqueta: string, texto: string, indice: number}` (em `contracapa`, `texto` = `cta_final`).
  - `montarSlides(post: Post): Slide[]` — sempre 4: capa (escuro, `etiqueta`=`pilar`, `texto`=`titulo_capa`), conteúdo "CONTEXTO" (claro, `slide2_texto`), conteúdo "NA PRÁTICA" (claro, `slide3_texto`), contra-capa (escuro, `cta_final`).
  - `htmlDoSlide(slide: Slide): string` — página completa que referencia `../assets/` (o HTML é gravado em `tmp/`).
  - `renderizarSlides(post: Post, pastaSaida: string): Promise<string[]>` — grava `slide-1.jpg` … `slide-4.jpg` (JPEG qualidade 90) e devolve os 4 caminhos.

Decisões de visual (minhas, ajustáveis): capa com fundo vinho, etiqueta do pilar em dourado (Space Mono, caixa alta), título DM Sans 700 branco e uma linha dourada; conteúdo com fundo `#F6F1EA`, texto `#2B2B2B`, indicador `2/4` e `3/4`; contra-capa em vinho com o `cta_final` grande e os 3 contatos. Todo texto fica numa área que termina acima de `48 + altura da logo + 32` px da borda inferior. O tamanho da fonte do título/texto encolhe por script na própria página até caber na área.

- [ ] **Step 1: Write the failing tests:**
  - `montarSlides devolve 4 slides na ordem capa, conteudo, conteudo, contracapa`, com `fundo` `['escuro','claro','claro','escuro']`.
  - `htmlDoSlide usa logo branca em fundo escuro e colorida em fundo claro` (`includes('logo-branca.png')` / `includes('logo-colorida.png')`).
  - `contra-capa contém os três contatos` (`(85) 3252.2240`, `@omegaelevadores`, `omegaelevadores.com.br`).
  - `renderizarSlides gera 4 JPEGs 1080x1080`: usar `image-size`; `assert.deepEqual([w,h],[1080,1080])` em cada.
  - `título longo não estoura`: post com `titulo_capa` de 14 palavras; após renderizar a capa, na página, `elementoTexto.scrollHeight <= elementoTexto.clientHeight` e o `bottom` do texto menor que `1080 - 48 - 220` (teste abre o HTML com Playwright diretamente).
- [ ] **Step 2:** `npx playwright install chromium`; rodar → FAIL.
- [ ] **Step 3:** Implementar templates com placeholders `{{texto}}`, `{{etiqueta}}`, `{{indice}}`; `htmlDoSlide` escapa HTML antes de substituir. `renderizarSlides` grava os HTMLs em `tmp/`, abre cada um com `page.goto(pathToFileURL(...))`, viewport 1080×1080, espera `document.fonts.ready`, `page.screenshot({type: 'jpeg', quality: 90})`.
- [ ] **Step 4:** Rodar → PASS. Abrir os 4 JPEGs de um post de fixture e conferir a olho a capa, um conteúdo e a contra-capa; ajustar o CSS se algo estiver feio.
- [ ] **Step 5: Commit** — `feat: modelos e renderização dos slides`

### Task 6: Cliente do Instagram e espera do Pages

**Files:**
- Create: `src/instagram.js`, `src/pages.js`, `test/instagram.test.js`, `test/pages.test.js`

**Interfaces:**
- Consumes: `INSTAGRAM`.
- Produces (todos aceitam `fetchImpl?: typeof fetch` e `esperar?: (ms: number) => Promise<void>` para teste):
  - `publicarCarrossel(a: {igUserId: string, token: string, imageUrls: string[], legenda: string}): Promise<{mediaId: string}>`
    1. rejeita se `imageUrls.length` fora de 2–10;
    2. para cada URL: `POST {host}/{versao}/{igUserId}/media` com `{image_url, is_carousel_item: true}` → `id`;
    3. espera cada item chegar a `status_code === 'FINISHED'` (`GET /{id}?fields=status_code`; `ERROR` ou `EXPIRED` → erro; até 30 tentativas, 2 s);
    4. `POST /{igUserId}/media` com `{media_type: 'CAROUSEL', children: ids.join(','), caption: legenda}` → espera `FINISHED`;
    5. `POST /{igUserId}/media_publish` com `{creation_id}` → `{mediaId: id}`.
    Autenticação: cabeçalho `Authorization: Bearer ${token}`; corpo JSON. Qualquer resposta não-OK lança `Error` com a mensagem da API.
  - `consultarConta(a: {igUserId, token}): Promise<{username: string}>` — `GET /{igUserId}?fields=username`.
  - `renovarToken(a: {token: string}): Promise<{token: string, expiraEmSegundos: number}>` — `GET {host}/refresh_access_token?grant_type=ig_refresh_token&access_token=…`.
  - `aguardarUrls(urls: string[], o?: {fetchImpl?, esperar?, tentativas?: number /*60*/, intervaloMs?: number /*10000*/}): Promise<void>` — `HEAD` em cada URL até todas devolverem 200; esgotando as tentativas, lança erro citando a URL.

- [ ] **Step 1: Write the failing tests** com `fetchImpl` falso que grava as chamadas:
  - caminho feliz com 4 imagens: ordem das chamadas = 4× `/media` (itens), 4× status, 1× `/media` (`CAROUSEL`, `children` = `'c1,c2,c3,c4'`), status, `/media_publish`; retorno `{mediaId}`.
  - `falha na 3ª imagem não chama media_publish nem cria o carrossel`: `rejects` e nenhuma chamada a `media_publish`.
  - `status ERROR` do item → `rejects`.
  - `rejeita 1 imagem e 11 imagens`.
  - `renovarToken` devolve o token novo; `consultarConta` devolve `username`.
  - `aguardarUrls` tenta de novo após 404 e resolve; com 404 sempre → `rejects` citando a URL.
- [ ] **Step 2:** Rodar → FAIL. **Step 3:** Implementar com `fetch` nativo do Node 20. **Step 4:** Rodar → PASS.
- [ ] **Step 5: Commit** — `feat: cliente do Instagram e espera do Pages`

### Task 7: Fluxo diário, CLIs e workflows

**Files:**
- Create: `src/fluxo.js`, `src/cli/preparar.js`, `src/cli/publicar.js`, `src/cli/estoque.js`, `src/cli/renovar-token.js`, `.github/workflows/postar.yml`, `.github/workflows/estoque.yml`, `.github/workflows/renovar-token.yml`, `test/fluxo.test.js`

**Interfaces:**
- Consumes: tudo das Tasks 2–6.
- Produces:
  - `type Contexto = {data: string, legenda: string, urls: string[]}`
  - `prepararDia(a: {hoje: string, pastaConteudo: string, pastaSite: string, caminhoRegistro: string}): Promise<Contexto | null>` — `null` se `hoje` já consta no registro. Lança erro se não há linha para hoje, se `status !== 'Aprovado'` ou se `validarPost`/`validarCalendario` acusam erros (mensagem lista todos). Renderiza em `pastaSite/<hoje>/slide-N.jpg`; `urls` = `PAGES_BASE_URL/<hoje>/slide-N.jpg`.
  - `publicarDia(a: {contexto: Contexto, igUserId: string, token: string, caminhoRegistro: string, simular: boolean, fetchImpl?, esperar?}): Promise<{mediaId: string}>` — espera as URLs, publica, registra. Com `simular`, não chama o Instagram nem registra e devolve `{mediaId: 'simulado'}`.
- CLIs (finos, só leem variáveis de ambiente e chamam as funções): `preparar.js` grava `tmp/contexto.json` e escreve `pular=true|false` em `$GITHUB_OUTPUT`; `publicar.js` lê `tmp/contexto.json`, `IG_USER_ID`, `IG_ACCESS_TOKEN`, `SIMULAR`; `estoque.js` sai com código 1 e mensagem clara se `diasDeEstoque < ESTOQUE_MINIMO_DIAS`; `renovar-token.js` imprime só o token novo na saída padrão.

- [ ] **Step 1: Write the failing tests** (`test/fluxo.test.js`, fixtures em `test/fixtures/`, `fetchImpl` e `esperar` falsos):
  - `prepararDia gera 4 JPEGs e as 4 URLs públicas` (`urls[0] === 'https://felipesalvim.github.io/omega-posts-diarios/2026-12-01/slide-1.jpg'`).
  - `prepararDia devolve null quando o dia já foi publicado`.
  - `prepararDia lança erro para data sem linha`, `para status Rascunho` e `para texto com colchetes`.
  - `publicarDia registra o dia no registro após publicar` e `rodar duas vezes seguidas: a segunda prepararDia devolve null`.
  - `publicarDia com falha do Instagram não registra o dia`.
  - `publicarDia com simular não chama fetch e não registra`.
- [ ] **Step 2:** Rodar → FAIL. **Step 3:** Implementar `fluxo.js` e os 4 CLIs. **Step 4:** Rodar → PASS.
- [ ] **Step 5: Workflows.**
  - `postar.yml`: gatilhos `schedule` (`0 21 * * *`) e `workflow_dispatch` (inputs `data` opcional e `simular` booleano, padrão `true`); `permissions: contents: write, pages: write, id-token: write`; `concurrency: postar`; job com `environment: github-pages`. Passos: checkout, `actions/setup-node@v4` (Node 20, cache npm), `npm ci`, `npx playwright install --with-deps chromium`, `node src/cli/preparar.js` (id `preparar`); se `pular != 'true'`: `actions/upload-pages-artifact@v3` (path `site`), `actions/deploy-pages@v4`, `node src/cli/publicar.js` com `IG_USER_ID`/`IG_ACCESS_TOKEN` dos segredos e `SIMULAR: ${{ github.event_name == 'workflow_dispatch' && inputs.simular }}`; se simulação, `actions/upload-artifact@v4` com `site/` para ver as imagens; por fim `git add registro && git commit && git push` só se houve mudança.
  - `estoque.yml`: diário às 12:00 UTC; roda `node src/cli/estoque.js`.
  - `renovar-token.yml`: mensal (`0 12 1 * *`) e manual; roda `renovar-token.js`, mascara o valor (`::add-mask::`) e grava com `gh secret set IG_ACCESS_TOKEN` usando o segredo `SEGREDOS_PAT`.
  - Conferir a sintaxe de cada YAML com `npx --yes yaml-lint .github/workflows/*.yml` (ou equivalente): sem erros.
- [ ] **Step 6: Commit** — `feat: fluxo diário, CLIs e workflows`

### Task 8: Conteúdo de dezembro de 2026

**Files:**
- Create: `conteudo/2026-12.csv`, `test/conteudo-real.test.js`

**Interfaces:**
- Consumes: `lerPosts`, `validarPost`, `validarCalendario`.

- [ ] **Step 1: Write the failing test** `test/conteudo-real.test.js`: lê `conteudo/`, e para o mês de dezembro `assert.equal(posts.length, 31)`, datas `2026-12-01` a `2026-12-31` sem lacunas, `validarCalendario(posts)` e `validarPost` de cada um devolvem `[]`, e nenhum texto contém `[`.
- [ ] **Step 2:** Rodar → FAIL.
- [ ] **Step 3:** Escrever os 31 posts, mantendo o mix semanal do calendário aprovado (segunda: segurança; terça: mito ou verdade; quarta: bastidores; quinta: manutenção na prática; sexta: modernização; sábado: curiosidade e convivência; domingo: marca e valores), com o tema do mês "fim de ano no condomínio". Cada post: título de capa curto, `slide2_texto` (contexto), `slide3_texto` (ação), `cta_final` com o WhatsApp, `legenda` curta. Tudo `status: Rascunho`. Onde faltar dado real da Ômega (foto, nome, número de atendimentos), escrever texto que não dependa dele, sem colchetes.
- [ ] **Step 4:** Rodar → PASS. Enviar o CSV a Felipe para revisão; ele troca `Rascunho` por `Aprovado` nos dias que aprovar (a revisão técnica fica com o responsável da Ômega).
- [ ] **Step 5: Commit** — `feat: conteúdo de dezembro de 2026 (rascunho)`

### Task 9: Ativação e teste ponta a ponta (feito com Felipe)

**Files:**
- Create: `README.md` (passo a passo abaixo, em português)

Passos manuais de Felipe estão marcados com **[Felipe]**.

- [ ] **Step 1: [Felipe]** Criar o repositório vazio e público `felipesalvim/omega-posts-diarios` (ou dar acesso para o Claude criar). Fazer o primeiro `git push`.
- [ ] **Step 2: [Felipe]** Em Settings → Pages, escolher Source: **GitHub Actions**.
- [ ] **Step 3: [Felipe]** Em developers.facebook.com, criar um app, adicionar o produto **Instagram** (API com login do Instagram), adicionar a conta @omegaelevadores como testadora/função no app e gerar o token no painel com as permissões `instagram_business_basic` e `instagram_business_content_publish`. Anotar o **ID da conta do Instagram** e o **token**.
- [ ] **Step 4: [Felipe]** Em Settings → Secrets and variables → Actions, criar `IG_USER_ID`, `IG_ACCESS_TOKEN` e `SEGREDOS_PAT` (token fino do GitHub, válido só neste repositório, com permissão **Secrets: Read and write**).
- [ ] **Step 5:** Rodar `postar.yml` à mão com `simular = true` e `data = 2026-12-01` (com o dia 1 marcado `Aprovado`). Esperado: execução verde, 4 imagens no artefato `site`, nenhuma publicação no Instagram. Conferir as imagens.
- [ ] **Step 6:** Conferir a conta: rodar `consultarConta` com os segredos (script de uma linha no README). Esperado: `username` = `omegaelevadores`.
- [ ] **Step 7: [Felipe, decisão]** Teste real: rodar `postar.yml` com `simular = false` e `data = 2026-12-01`. Isso publica de verdade o post do dia 1 e o registra; o disparo das 18h do mesmo dia será pulado. Esperado: carrossel de 4 imagens no feed. Se preferir não postar antes de 1º/12, apagar o post de teste no Instagram e remover a data de `registro/publicados.json`.
- [ ] **Step 8:** Rodar `renovar-token.yml` à mão. Esperado: execução verde e o segredo `IG_ACCESS_TOKEN` atualizado. Se a renovação for recusada (por exemplo, token com menos de 24 h), repetir no dia seguinte.
- [ ] **Step 9:** Conferir, em 2027-01-31, que o agendador continua ativo (o GitHub pode pausar agendamentos de repositório público sem atividade); se pausar, o commit do registro diário deve evitá-lo, caso contrário acrescentar um commit mensal vazio no `renovar-token.yml`.
- [ ] **Step 10: Commit** — `docs: README com a ativação`
