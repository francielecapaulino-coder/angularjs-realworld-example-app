# PLAN — 004-e2e-playwright

## Status
State: PLANNED

## Objetivo
Implementar testes E2E Playwright cobrindo os fluxos principais do app AngularJS
atual — home, login, registro, abrir artigo, criar artigo, favoritar e seguir usuário —
usando `page.route()` para interceptar chamadas à API (que segue inacessível) com
respostas mock controladas. Criar as branches `failing-e2e` e `passing-e2e` exigidas
pelo ROADMAP §11.

## Escopo
- Incluído:
  - Adicionar `@playwright/test@^1.44` e `serve@^14` como `devDependencies`.
  - Adicionar scripts `test:e2e` e `serve:build` em `package.json`.
  - Criar `playwright.config.js` com `webServer` servindo `./build/` na porta 4100.
  - Criar `tests/e2e/conduit.e2e.test.js` cobrindo os 7 fluxos (ver tabela abaixo).
  - Criar branch `failing-e2e`: um teste com asserção intencionalmente errada.
  - Criar branch `passing-e2e`: mesmos testes todos verdes.
  - Registrar evidências em `PROGRESS.md` e `REVIEW.md`.
  - Atualizar `docs/agent/STATE.md`.
- Fora de escopo:
  - Alterações em `src/`.
  - Testes contra backend real com credenciais reais.
  - Cobertura de StrykerJS (Fase 5).
  - Migração Angular 21.
- files_owned:
  - `package.json`
  - `playwright.config.js`
  - `tests/e2e/conduit.e2e.test.js`
  - `docs/agent/work/004-e2e-playwright/PLAN.md`
  - `docs/agent/work/004-e2e-playwright/PROGRESS.md`
  - `docs/agent/work/004-e2e-playwright/REVIEW.md`
  - `docs/agent/STATE.md`
  - branch `failing-e2e` (git)
  - branch `passing-e2e` (git)

## Origem e fase
- Fase (ROADMAP): 2 — Rede de segurança
- Documento/bloco de origem: `docs/agent/context/ROADMAP.md` Fase 2 §critérios
  "E2E Playwright cobrindo os fluxos principais verdes" e "branches failing/passing".
- context_sources:
  - skills: []
  - design: null
  - docs:
    - `docs/api/realworld-openapi.yaml`
    - `src/js/config/app.constants.js` — API base URL + jwtKey
    - `src/js/config/app.config.js` — hashbang routing
    - `src/js/auth/auth.html` / `auth.config.js` — seletores login/register
    - `src/js/home/home.html` / `home.config.js`
    - `src/js/editor/editor.html` / `editor.config.js`
    - `src/js/article/article.html` / `article.config.js`
    - `src/js/profile/profile.html` / `profile.config.js`
    - `src/js/components/buttons/favorite-btn.html`
    - `src/js/components/buttons/follow-btn.html`
    - `src/js/components/article-helpers/article-preview.html`
    - `src/js/layout/header.html`
    - `gulpfile.js` — build output em `./build/`, servidor porta 4000
- affects_design_system_core: false

## Dados, segurança e compliance
- Dados envolvidos: respostas mock com dados fictícios (`test-user@example.test`,
  `demo-author`, `fake-jwt-token-e2e-test`). Nenhum dado real de usuário.
- Credenciais: nenhuma credencial real. O mock de login retorna um token fictício
  explicitamente identificado como tal; nenhum token real é armazenado ou transmitido.
- `localStorage`: testes podem ler/escrever `jwtToken` via `page.evaluate()` apenas
  com valor fictício.
- Auditoria/log: n/a — testes locais/CI.
- Revisão humana: required, por risco C (simula fluxo completo de auth JWT, mesmo com mock).

## Tooling e dependências propostas
| Pacote | Versão | Papel |
|---|---|---|
| `@playwright/test` | `^1.44` | Test runner E2E; requer Node >=14 (usar DevContainer Node 22) |
| `serve` | `^14` | Serve estático de `./build/` para webServer do Playwright |

> Pré-requisito: app já buildado em `./build/` (rodar `./node_modules/.bin/gulp html browserify`
> no DevContainer antes de `npm run test:e2e`). Os testes não iniciam o build automaticamente.

## Fluxos cobertos
| # | Fluxo | Seletores-chave | Mock de API |
|---|---|---|---|
| 1 | Home — listar artigos | `.article-preview`, `.preview-link` | `GET /articles` → `{ articles, articlesCount }` |
| 2 | Home — listar tags | `.tag-list` no sidebar | `GET /tags` → `{ tags }` |
| 3 | Login — formulário e redirect | `input[placeholder="Email"]`, `input[placeholder="Password"]`, `button.btn-primary` | `POST /users/login` → `{ user }` fictício |
| 4 | Registro — formulário | `input[placeholder="Username"]`, e-mail, senha | `POST /users` → `{ user }` fictício |
| 5 | Abrir artigo — página de detalhe | `.preview-link` → `.article-page` | `GET /articles` + `GET /articles/{slug}` + `GET /articles/{slug}/comments` |
| 6 | Criar artigo — editor e publicar | `input[placeholder="Article Title"]`, `button[ng-click=...]` | Injetar token via `localStorage`, `POST /articles` → `{ article }` fictício |
| 7 | Favoritar artigo | `favorite-btn button.btn-sm` | Injetar token, `POST /articles/{slug}/favorite` → artigo atualizado |
| 8 | Seguir usuário | `follow-btn button.action-btn` (na página do artigo) | Injetar token, `POST /profiles/{username}/follow` → `{ profile }` |

## Critérios de aceite
- [ ] `npm run test:e2e` executa e retorna exit 0 (todos os testes passam).
- [ ] Todos os 8 fluxos têm pelo menos um teste verde.
- [ ] Nenhum teste usa credencial real, token real ou dado pessoal real.
- [ ] `playwright.config.js` configurado com `webServer` porta 4100.
- [ ] Branch `failing-e2e` existe com pelo menos um teste falhando de forma controlada.
- [ ] Branch `passing-e2e` existe com todos os testes verdes.
- [ ] `src/` não foi alterado.
- [ ] `npm run test:contract` ainda verde (sem regressão).

## Operational path & risk
- risk_category: C  # simula fluxo completo de auth JWT (login, token em localStorage,
                    # header Authorization: Token); mesmo sendo mock, a lógica de auth
                    # do app está sendo exercitada e validada.
- operational_path: strict_path_C_D

## Model Profile
```yaml
risk_category: C
planner:           { tier: standard, effort: high }
generator:         { tier: standard, effort: xhigh }
evaluator:         { tier: deep,     effort: high  }
reviewer:          { tier: standard, effort: medium }
security_reviewer: { tier: deep,     effort: high  }
deterministic_gates:
  - playwright_tests
  - contract_tests
  - negative_tests
  - secret_scan
  - config_review
human_review: required
budget_max_usd: 2.00
rationale: |
  Categoria C porque exercita o fluxo completo de auth JWT do app: injeção de
  token em localStorage, header Authorization: Token, e respostas mock que
  simulam login/logout. Generator xhigh porque exige mapeamento preciso de
  seletores AngularJS + lógica de mock de rede. Evaluator deep para confirmar
  que nenhum teste vaza credencial real ou valida comportamento de segurança
  de forma insuficiente.
```

## Deterministic gates (a rodar antes de READY)
- `playwright_tests`: `npm run test:e2e` verde (exit 0).
- `contract_tests`: `npm run test:contract` ainda verde (sem regressão).
- `negative_tests`: branch `failing-e2e` com pelo menos um teste falhando
  (exit != 0); branch `passing-e2e` com todos verdes.
- `secret_scan`: nenhum token real, JWT real, senha real nos arquivos de teste.
- `config_review`: `src/` não modificado; `package.json` adicionou apenas
  `@playwright/test` e `serve`; `playwright.config.js` não expõe segredos.

## Condições de parada
- Se o build do app falhar no DevContainer (incompatibilidade gulp 3 / Node 22),
  registrar no PROGRESS.md e pedir aprovação para approach alternativo (ex.: pre-built
  estático commitado, ou servidor de fixture HTML puro).
- Se seletores de HTML não baterem com o DOM real do app após build, parar, registrar
  os seletores reais e ajustar antes de continuar.
- Se qualquer mock exigir token real ou credencial real, parar imediatamente.
- Se `@playwright/test` não instalar (versão incompatível com Node 10 local),
  documentar que a suite roda apenas no DevContainer e prosseguir.

## Riscos e pendências
- Node 10 local não suporta `@playwright/test@^1.44` (requer Node >=14); testes
  rodam no DevContainer (Node 22).
- gulp 3 pode ter problemas com Node 22 no DevContainer; build pode exigir ajuste.
- Seletores mapeados via HTML estático podem divergir do DOM renderizado pelo AngularJS;
  ajuste fino pode ser necessário após ver o app rodando.
- `conduit.productionready.io` segue inacessível; todos os testes dependem de mock.
- **Pendência: aprovação do plano pelo usuário antes de implementar.**
