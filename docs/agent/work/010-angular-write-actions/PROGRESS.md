# PROGRESS — 010-angular-write-actions

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/010-angular-write-actions/PLAN.md` criado |
| 2026-06-24 | builder | EVALUATING | services + favorite/follow buttons + ArticleActions + comentar/excluir; build + 69 testes verdes |

## Decisões
- Categoria C: mutações autenticadas (favorite/follow/comment/delete).
- Anônimo → `/register` (sem POST/DELETE); confirmado por gate negativo + testes.
- `ArticleActionsComponent`: `canModify` via `computed` (AuthService.currentUser + article.author),
  nunca no construtor — **corrige o bug legado** (regressão coberta por teste autor/não-autor).
- Atualização otimista de favorited/favoritesCount/following.
- Comentários: add (prepend) / delete (próprio comentário via canDelete); body como texto.
- Valores de teste fictícios `*-010`/`*-009`.

## Conformidade com PLAN / ADR-001
| Item | Estado |
|---|---|
| favorite/unfavorite/delete article | ✓ (ArticlesService + testes) |
| follow/unfollow/get profile | ✓ (ProfileService + testes) |
| add/destroy comment | ✓ (CommentsService + testes) |
| Anônimo não dispara mutação | ✓ (botões → /register; gate + testes) |
| canModify reativo (sem bug do construtor) | ✓ (ArticleActions computed; testes autor/não-autor/anônimo) |
| Mutações só p/ apiBase | ✓ (config_review) |
| src/ legado inalterado | ✓ |

## Arquivos criados/alterados (app-ng/, exceto docs)
- `src/app/core/articles/articles.service.ts` (+ spec) — favorite/unfavorite/delete
- `src/app/core/profile/profile.service.ts` (+ spec)
- `src/app/core/comments/comments.service.ts` (+ spec) — add/destroy
- `src/app/shared/favorite-button.component.ts` (+ spec)
- `src/app/shared/follow-button.component.ts` (+ spec)
- `src/app/shared/article-actions.component.ts` + html (+ spec)
- `src/app/shared/article-preview.component.ts` + html — usa favorite-button
- `src/app/shared/comment-card.component.ts` — canDelete + delete
- `src/app/pages/article/article.component.ts` + html (+ spec) — actions + comentar/excluir
- `src/` legado: **inalterado**

## Comandos e resultados
| Comando | Resultado |
|---|---|
| `cd app-ng && npm run build` | PASS — `build`: bundle 369.00 kB |
| `cd app-ng && CI=true npm test` | PASS — `unit_tests`/`negative_tests`: vitest 69/69 (18 arquivos) |
| `grep navigate(['/register'])` em botões | PASS — `negative_tests`: anônimo redireciona sem mutação |
| `grep` segredos/Bearer | PASS — `secret_scan`: nenhum |
| `grep apiBase` nos services de mutação | PASS — `config_review`: mutações só p/ apiBase |
| `git diff --name-only HEAD -- src/` | PASS — `config_review`: src/ legado inalterado |

## Cobertura de testes nesta slice (20 novos, total 69)
- articles.service (3): favorite POST; unfavorite DELETE; delete DELETE.
- profile.service (3): follow POST; unfollow DELETE; get GET.
- comments.service (2): add POST {comment:{body}}; destroy DELETE.
- favorite-button (3): **anônimo→/register sem request**; favorite otimista; unfavorite.
- follow-button (3): **anônimo→/register sem request**; follow; unfollow.
- article-actions (4): não-autor vê Follow+Favorite (**regressão do bug legado**); autor vê Edit/Delete; anônimo vê Follow+Favorite; emite deleteArticle.
- article.component (2): addComment prepend; deleteArticle navega home.

## Riscos residuais / pendências
- Atualização otimista pode divergir em erro (mantido simples; sem reversão automática).
- `apiBase` pode estar indisponível; testes mockados.
- Atualizar o teste E2E baseline da Fase 2 (article-actions agora funciona autenticado)
  quando a suite E2E for migrada para URLs limpas.
- Requer revisão humana + security_reviewer antes de merge (Categoria C).
