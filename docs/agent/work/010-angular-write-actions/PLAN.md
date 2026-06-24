# PLAN — 010-angular-write-actions

## Status
State: PLANNED

## Objetivo
Implementar as ações de escrita autenticadas no `app-ng/`: favoritar/desfavoritar
artigo, seguir/deixar de seguir autor, e comentar/excluir comentário; além de
montar o `ArticleActionsComponent` (favoritar+seguir, ou editar+excluir para o
autor) — **corrigindo o bug legado** (`article-actions` lia o binding no construtor).
Anônimos são redirecionados para `/register` (sem tentativa de mutação).

## Escopo
- Incluído (tudo em `app-ng/`):
  - `ArticlesService`: `favorite(slug)` (POST), `unfavorite(slug)` (DELETE),
    `delete(slug)` (DELETE /articles/:slug).
  - `ProfileService`: `get(username)` (GET), `follow(username)` (POST),
    `unfollow(username)` (DELETE) → `/profiles/:username[/follow]`.
  - `CommentsService`: `add(slug, body)` (POST), `destroy(slug, id)` (DELETE).
  - `FavoriteButtonComponent` (interativo): alterna favorito; otimista
    (favorited/favoritesCount); anônimo → `/register`.
  - `FollowButtonComponent` (interativo): alterna following; anônimo → `/register`.
  - `ArticleActionsComponent`: meta do autor + (autor → Edit/Delete; outro → Follow+Favorite).
    `canModify` calculado reativamente de `AuthService.currentUser` + `article.author`
    (em `$onInit`/computed, **nunca no construtor** — corrige o bug legado).
    Delete artigo → DELETE + navega `/`.
  - Integrar:
    - `FavoriteButtonComponent` no `ArticlePreviewComponent` (home) — substitui o botão display-only.
    - `ArticleActionsComponent` no `ArticleComponent` (banner + rodapé).
    - Formulário de comentário funcional (add + delete) no `ArticleComponent`.
  - Testes vitest cobrindo serviços, botões (incl. anônimo→register), ArticleActions
    (canModify autor vs. não-autor), e o comentar/excluir.
- Fora de escopo:
  - Editor (POST/PUT artigo), profile, settings — placeholders/próximas slices.
  - Migração da suite E2E — slice posterior.
  - Alterações em `src/` legado, contrato, design system.
- files_owned:
  - `app-ng/src/app/core/articles/articles.service.ts` (+ spec) — favorite/unfavorite/delete
  - `app-ng/src/app/core/profile/profile.service.ts` (+ spec)
  - `app-ng/src/app/core/comments/comments.service.ts` (+ spec) — add/destroy
  - `app-ng/src/app/shared/favorite-button.component.ts` (+ spec)
  - `app-ng/src/app/shared/follow-button.component.ts` (+ spec)
  - `app-ng/src/app/shared/article-actions.component.ts` (+ html, spec)
  - `app-ng/src/app/shared/article-preview.component.ts` (+ html) — usa favorite-button
  - `app-ng/src/app/pages/article/article.component.ts` (+ html, spec) — actions + comentar
  - `docs/agent/work/010-angular-write-actions/{PLAN,PROGRESS,REVIEW}.md`
  - `docs/agent/STATE.md`

## Origem e fase
- Fase (ROADMAP): 3 — Migração Angular 21
- Decisões: `docs/adr/ADR-001-...md`.
- context_sources:
  - `src/js/services/{articles,profile,comments}.service.js`
  - `src/js/components/buttons/{favorite-btn,follow-btn}.component.js`
  - `src/js/article/{article-actions.component.js,article-actions.html,article.controller.js}`

## Dados, segurança e compliance
- Dados: mutações autenticadas (favorite/follow/comment/delete) com token via interceptor (006).
- Segurança:
  - Mutações só para `apiBase` (interceptor garante header só ali).
  - Anônimo NÃO dispara mutação → redireciona para `/register`.
  - Delete de artigo só quando `canModify` (autor); delete de comentário só do próprio autor.
  - Nenhuma credencial/token real em código/teste (`*-010` fictícios).
- Revisão humana: required (Categoria C — múltiplas mutações autenticadas).

## API
- `POST/DELETE /articles/:slug/favorite` → `{ article }`.
- `POST/DELETE /profiles/:username/follow` → `{ profile }`.
- `POST /articles/:slug/comments` `{ comment: { body } }` → `{ comment }`; `DELETE .../comments/:id`.
- `DELETE /articles/:slug`.

## Operational path & risk
- risk_category: C  # múltiplas mutações autenticadas (favorite/follow/comment/delete).
- operational_path: strict_path_C_D

## Model Profile
```yaml
risk_category: C
planner:           { tier: deep,     effort: high }
generator:         { tier: deep,     effort: high }
evaluator:         { tier: deep,     effort: high }
reviewer:          { tier: standard, effort: medium }
security_reviewer: { tier: deep,     effort: high }
deterministic_gates: [build, unit_tests, negative_tests, secret_scan, config_review]
human_review: required
cross_family_evaluator: true
budget_max_usd: 3.00
rationale: |
  Categoria C: várias mutações autenticadas. Erros (mutar sem auth, deletar item de
  outro usuário, vazar token) impactam segurança. Inclui correção do bug legado de
  article-actions. security_reviewer + >=4 gates + human_review.
```

## Deterministic gates (a rodar antes de READY)
- build: `cd app-ng && npm run build` verde.
- unit_tests: `cd app-ng && CI=true npm test` verde.
- negative_tests:
  - favoritar/seguir anônimo → navega `/register`, **sem** POST/DELETE;
  - favorite alterna otimista (count +/-1, favorited toggle);
  - follow alterna otimista (following toggle);
  - ArticleActions: autor vê Edit/Delete; não-autor vê Follow+Favorite (regressão do bug legado);
  - delete de artigo só p/ autor; delete de comentário só p/ próprio.
- secret_scan: nenhum token/segredo real.
- config_review: mutações apontam para `apiBase`; `src/` legado inalterado; sem `Bearer`.

## Condições de parada
- Se uma mutação puder ser disparada por anônimo, PARAR (viola controle de auth).
- Se `canModify` não puder ser garantido sem o construtor, usar `computed`/`ngOnInit` (nunca construtor).
- Se algo exigir alterar `src/` legado, parar e reclassificar.

## Riscos e pendências
- Atualização otimista pode divergir do servidor em caso de erro; manter simples (reverter em erro se necessário).
- `apiBase` pode estar indisponível; testes usam HttpClient mockado.
- Após esta slice, atualizar o teste E2E baseline da Fase 2 (article-actions agora funciona autenticado)
  quando a suite E2E for migrada para URLs limpas.
- **Pendência: aprovação do plano pelo usuário antes de implementar.**
