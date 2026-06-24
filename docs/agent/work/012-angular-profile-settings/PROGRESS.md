# PROGRESS — 012-angular-profile-settings

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/012-angular-profile-settings/PLAN.md` criado |
| 2026-06-24 | builder | EVALUATING | AuthService.update + ProfileComponent + SettingsComponent + rotas; build + 89 testes verdes |

## Decisões
- Categoria C: settings muta a sessão (PUT /user → novo token via setAuth) + logout (purgeAuth).
- `/settings` protegido por `authGuard`; `/profile/:username` público.
- Profile reusa `ArticleListComponent` (abas author/favorited via `listConfig` computed) e `FollowButtonComponent`.
- Settings reusa `ListErrorsComponent`/`ApiErrors`; pré-preenche de `currentUser`; senha enviada só se preenchida.
- Logout = `purgeAuth()` + navega `/`.
- `PlaceholderComponent` removido das rotas (todas as telas migradas); arquivo mantido, sem rota.
- Valores de teste fictícios `*-012`.

## Conformidade com PLAN / ADR-001
| Item | Estado |
|---|---|
| AuthService.update PUT /user → setAuth | ✓ (auth.service.spec) |
| Profile carrega + abas author/favorited | ✓ (profile.component.spec) |
| Profile próprio (Edit Settings) vs outro (Follow) | ✓ (profile.component.spec) |
| Settings pré-preenche + PUT + nav | ✓ (settings.component.spec) |
| Senha só quando preenchida | ✓ (settings.component.spec) |
| Logout purga sessão + nav `/` | ✓ (settings.component.spec) |
| /settings com authGuard | ✓ (app.routes + guard spec da slice 011) |
| src/ legado inalterado | ✓ |

## Arquivos criados/alterados (app-ng/, exceto docs)
- `src/app/core/auth/auth.service.ts` (+ spec) — `update` + tipo `UserUpdate`
- `src/app/pages/profile/profile.component.ts` + html (+ spec)
- `src/app/pages/settings/settings.component.ts` + html (+ spec)
- `src/app/app.routes.ts` — profile/settings ligados; settings com authGuard; placeholder removido
- `src/` legado: **inalterado**

## Comandos e resultados
| Comando | Resultado |
|---|---|
| `cd app-ng && npm run build` | PASS — `build`: bundle 376.50 kB |
| `cd app-ng && CI=true npm test` | PASS — `unit_tests`/`negative_tests`: vitest 89/89 (22 arquivos) |
| `grep authGuard` em /settings | PASS — `negative_tests`/`config_review`: settings protegido |
| `grep purgeAuth()` no logout | PASS — `negative_tests`: logout limpa a sessão |
| `grep apiBase}/user` | PASS — `config_review`: update p/ apiBase |
| `grep` segredos/Bearer | PASS — `secret_scan`: nenhum |
| `git diff --name-only HEAD -- src/` | PASS — `config_review`: src/ legado inalterado |

## Cobertura de testes nesta slice (10 novos, total 89)
- auth.service (1): update PUT {user} → re-armazena sessão com novo token.
- profile.component (4): load + aba My Articles (author); troca p/ Favorited (favorited);
  próprio (Edit Settings, sem Follow); outro (Follow).
- settings.component (5): pré-preenche; PUT omitindo senha vazia + nav; inclui senha quando
  preenchida; **logout purga sessão + nav `/`**; erros de API renderizados.

## Riscos residuais / pendências
- Mudar `username` no settings altera a URL do perfil; navegamos para o novo `:username`.
- `apiBase` pode estar indisponível; testes mockados.
- **Todas as telas principais do RealWorld estão migradas.** Próxima fase: migrar a suite E2E
  para URLs limpas, atualizar baseline de `article-actions` e planejar o descomissionamento
  do AngularJS legado.
- Requer revisão humana + security_reviewer antes de merge (Categoria C).
