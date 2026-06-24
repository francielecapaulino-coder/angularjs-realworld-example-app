# PROGRESS — 004-e2e-playwright

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/004-e2e-playwright/PLAN.md` criado |
| 2026-06-24 | builder | EVALUATING | `playwright.config.js` + `tests/e2e/conduit.e2e.test.js` criados; 18/18 testes PASS |

## Decisões
- Categoria C: exercita fluxo de auth JWT (token em localStorage, header `Authorization: Token`).
- `@playwright/test@^1.61` + `serve@^14` instalados. Playwright requer Node >=18;
  ambiente local Node 10 não roda — usado Node 22 via `nvm` (alinhado ao DevContainer).
- Todas as chamadas de API interceptadas via `page.route()` contra
  `**/conduit.productionready.io/api/**`; nenhuma chamada de rede real.
- Token fictício `fake-jwt-token-e2e-test-only`; nenhuma credencial real.

## Descobertas sobre o app legado (comportamento real capturado)
1. **Hashbang `#!/`**: AngularJS 1.5 + UI-Router 0.4 usam prefixo `#!/`. Navegar para
   `/#/login` (sem `!`) cai no `otherwise('/')` → home. Testes usam `/#!/...`.
2. **Rota do editor `/editor/:slug`**: novo artigo exige slug vazio → URL `/#!/editor/`
   (com barra final). `/#!/editor` não casa e redireciona para home.
3. **Header não reativo**: `header.component.js` tem `$scope.$watch('User.current')`
   quebrado (observa propriedade de escopo inexistente). O username só aparece no nav
   após reload. Teste de login captura: token salvo + navegação para home; teste
   separado valida o nav após reload.
4. **Bug em `article-actions`** (Categoria: baseline de regressão): o construtor lê
   `this.article.author` antes de `$onInit` (binding indisponível). Quando autenticado,
   lança `TypeError` e os botões follow/favorite transcluídos não renderizam. Capturado
   em teste de baseline. Favoritar é testado no preview da home (funciona); follow é
   testado para visitante anônimo (funciona). Se a migração Angular 21 corrigir o bug,
   o teste de baseline deve ser atualizado.

## Arquivos alterados
- `package.json` (scripts `build`, `serve:build`, `test:e2e` + devDeps)
- `playwright.config.js` (novo)
- `tests/e2e/conduit.e2e.test.js` (novo)
- `.gitignore` (test-results/, playwright-report/)
- `package-lock.json`
- `docs/agent/work/004-e2e-playwright/PLAN.md`
- `docs/agent/work/004-e2e-playwright/PROGRESS.md`
- `docs/agent/work/004-e2e-playwright/REVIEW.md`
- `docs/agent/STATE.md`

## Comandos e resultados
| Comando | Resultado |
|---|---|
| `npm install --save-dev @playwright/test@^1.44 serve@^14` | PASS — instalados |
| `npx playwright install chromium` | PASS — browser instalado |
| `node_modules/.bin/gulp html browserify` | PASS — app buildado em `./build/` |
| `npm run test:e2e` | PASS — 18/18 testes verdes (~7 s) |
| `npm run test:contract` (não-regressão) | PASS — 11/11 ainda verdes |
| `secret_scan` (tests/e2e + playwright.config.js) | PASS — nenhum segredo real |
| `config_review` — src/ inalterado | PASS — nenhum arquivo em src/ alterado |

## Fluxos cobertos (18 testes)
- Home: carrega, lista artigos, título no preview, links Sign in/up (4)
- Login: form renderiza, submit salva token + vai pra home, username no nav após reload (3)
- Registro: form renderiza, submit vai pra home (2)
- Artigo: clicar preview navega, página mostra título/autor (2)
- Criar artigo (autenticado): editor renderiza campos, submit publica e navega (2)
- Favoritar (autenticado): botão visível no preview, clique alterna para btn-primary (2)
- Follow (anônimo): follow-btn visível, favorite-btn visível no artigo (2)
- Baseline legado: article-actions não renderiza botões quando autenticado (bug) (1)

## Riscos residuais / pendências
- `@playwright/test` exige Node >=18; rodar via DevContainer (Node 22) ou nvm.
- gulp 3 buildou OK no Node local 10; validar build no DevContainer Node 22.
- `conduit.productionready.io` inacessível; testes 100% mock (independente da API).
- Bug legado de `article-actions` documentado como baseline; corrigir na migração.
- Branches `failing-e2e` e `passing-e2e` a criar (ROADMAP §11).
- Requer revisão humana antes de merge.
