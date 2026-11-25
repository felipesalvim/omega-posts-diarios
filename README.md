# Posts diários da Ômega Elevadores

Todo dia, às **18h (Fortaleza)**, um carrossel de 4 slides quadrados (1080×1080) é gerado e publicado no Instagram **@omegaelevadores**, sem ninguém precisar apertar nada. Roda 100% no GitHub, sem custo.

| Slide | Conteúdo |
|---|---|
| 1 | Capa: pilar do dia + título |
| 2 | Contexto |
| 3 | Na prática (ação) |
| 4 | Contra-capa: chamada final + WhatsApp, Instagram e site |

A logo fica no canto inferior direito de todos os slides.

## Como funciona

1. O texto vem de `conteudo/AAAA-MM.csv` (um arquivo por mês).
2. O GitHub Actions (`postar.yml`) valida o post do dia, gera os 4 JPEGs com o navegador Chromium e os publica no GitHub Pages.
3. O Instagram baixa as imagens pelo link público e publica o carrossel.
4. O dia é anotado em `registro/publicados.json`. Se o fluxo rodar duas vezes, não publica duas vezes.

## Escrevendo o conteúdo de cada mês

Copie `conteudo/2026-12.csv` como modelo. Colunas: `data, pilar, objetivo, titulo_capa, slide2_texto, slide3_texto, cta_final, legenda, status`.

- `status`: só posts **Aprovado** são publicados. Os de dezembro estão como **Rascunho**: leia, ajuste e troque para Aprovado.
- Até 40 palavras por slide de texto. Sem colchetes `[ ]` esquecidos.
- As hashtags são acrescentadas automaticamente à legenda.
- O workflow `estoque.yml` avisa (falha em vermelho) quando restam menos de 7 dias aprovados. Isso dá uma semana para preparar o mês seguinte.
- Rode `npm test` depois de editar: ele confere datas, tamanhos e colchetes.

## Ativação (uma vez só)

1. **Repositório:** crie `felipesalvim/omega-posts-diarios` como **público** e envie este projeto (`git push`).
2. **GitHub Pages:** Settings > Pages > Source: **GitHub Actions**.
3. **Conta do Instagram:** precisa ser profissional (Comercial ou Criador) e estar ligada à Página do Facebook (você já confirmou que está).
4. **App na Meta:** em developers.facebook.com, crie um app do tipo Empresa, adicione o produto **Instagram** com *Instagram API with Instagram Login*, inclua a conta @omegaelevadores e peça as permissões `instagram_business_basic` e `instagram_business_content_publish`. Gere um **token de longa duração** e anote o **ID da conta** (ID do usuário do Instagram).
5. **Segredos** (Settings > Secrets and variables > Actions):
   - `IG_USER_ID`: ID da conta do Instagram
   - `IG_ACCESS_TOKEN`: token de longa duração
   - `SEGREDOS_PAT`: token pessoal do GitHub (fine-grained, só neste repositório, permissão *Secrets: Read and write*), usado para renovar o token do Instagram sozinho
6. **Teste simulado:** Actions > *Postar carrossel do dia* > Run workflow, data `2026-12-01`, simular **marcado**. Ele gera as imagens (baixe em *imagens-simulacao*), confere a legenda e checa que o token enxerga @omegaelevadores, sem publicar nada.
7. **Teste real (opcional):** rode de novo com simular **desmarcado** para uma data aprovada. Vai publicar de verdade.
8. **Primeiro post automático:** 01/12/2026, 18h. Antes disso, troque os posts de dezembro para **Aprovado**.

> A versão da API do Instagram fica em `src/config.js` (`INSTAGRAM.versao`). Atualizada em 24/11/2026 para a v26.0, a que a documentação da Meta usa nos exemplos. Se um dia a API recusar, confira a versão atual.

## Manutenção

- **Token:** vale 60 dias. `renovar-token.yml` renova no dia 1 de cada mês e guarda o novo valor sozinho.
- **Agendador:** o GitHub pausa agendamentos de repositórios sem atividade por 60 dias. O commit diário do registro deve evitar isso, mas confira a aba Actions de vez em quando.
- **Falhou?** Veja o log em Actions. Causas comuns: post do dia ainda Rascunho, token expirado, ou colchetes sobrando no texto.
- **Rodar um dia atrasado:** Run workflow com a data desejada (simular desmarcado).

## Comandos locais

```bash
npm install && npx playwright install chromium
npm test                                  # confere tudo
node src/cli/preparar.js 2026-12-01       # gera as imagens em site/2026-12-01
node src/cli/estoque.js                   # quantos dias aprovados à frente
```
