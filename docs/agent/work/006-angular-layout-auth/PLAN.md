# PLAN — 006-angular-layout-auth

## Status
State: PLANNED

## Objetivo
Construir o app shell do Angular 21 em `app-ng/`: layout (header + footer),
roteamento com URLs limpas (history) e o **interceptor de autenticação
`Authorization: Token <jwt>`** preservando `localStorage['jwtToken']`, com um
`AuthService` baseado em Signals que alimenta o header. Telas de conteúdo
(login, artigos, editor, perfil, settings) ficam como placeholders nesta slice.

## Escopo
- Incluído (tudo dentro de `app-ng/`):
  - **Design system**: replicar no `app-ng/src/index.html` os links remotos do app
    legado (Ionicons CDN, Google Fonts, `//demo.productionready.io/main.css`) para
    preservar o tema claro pixel-equivalente.
  - **Constantes/ambiente**: `apiBase` (`https://conduit.productionready.io/api`),
    `jwtKey` (`jwtToken`), `appName` (`conduit`) via `environment` ou arquivo de constantes.
  - **JWT service** (`jwt.ts`): `get/save/destroy` lendo `localStorage['jwtToken']`.
  - **Token interceptor** (`token.interceptor.ts`): adiciona `Authorization: Token <jwt>`
    APENAS para requisições que começam com `apiBase` e quando há token; em `401`
    limpa o token (sem reload forçado — comportamento moderno; documentar diferença).
  - **AuthService** (signal-based): `currentUser` (signal), `isAuthenticated` (computed),
    `verifyAuth()` (GET /user com token), `setAuth/purgeAuth`.
  - **Layout standalone**: `HeaderComponent` (navbar reativa ao `AuthService`),
    `FooterComponent` (logo + ano corrente), `AppComponent` com `<app-header>` +
    `<router-outlet>` + `<app-footer>`.
  - **Roteamento URLs limpas** (`app.routes.ts`): `/` (home placeholder), `/login`,
    `/register`, `/article/:slug`, `/editor`, `/editor/:slug`, `/profile/:username`,
    `/settings` — apontando para componentes placeholder mínimos (a serem substituídos
    em slices futuras). `provideHttpClient(withInterceptors([tokenInterceptor]))`.
  - **Testes unit (vitest)**: interceptor (adiciona/omite header corretamente),
    AuthService (signals), HeaderComponent (alterna menus por auth).
- Fora de escopo:
  - Conteúdo real das telas (formulários, listas, markdown) — placeholders só.
  - Chamadas reais de favoritar/seguir/criar artigo.
  - Migração da suite E2E da Fase 2 (slice posterior, quando houver telas).
  - Alterações em `src/` legado, contrato RealWorld, design system remoto.
  - SSR.
- files_owned:
  - `app-ng/src/**` (novos arquivos de shell/auth/rotas)
  - `app-ng/src/index.html`
  - `docs/agent/work/006-angular-layout-auth/PLAN.md`
  - `docs/agent/work/006-angular-layout-auth/PROGRESS.md`
  - `docs/agent/work/006-angular-layout-auth/REVIEW.md`
  - `docs/agent/STATE.md`

## Origem e fase
- Fase (ROADMAP): 3 — Migração Angular 21
- Decisões: `docs/adr/ADR-001-angular-21-migration-stack.md`.
- context_sources:
  - `src/js/config/app.constants.js` (apiBase, jwtKey, appName)
  - `src/js/config/auth.interceptor.js` (Token header + 401)
  - `src/js/services/jwt.service.js` (localStorage)
  - `src/js/services/user.service.js` (verifyAuth)
  - `src/js/layout/{header,footer,app-view}.html` + componentes
  - `src/index.html` (CSS do design system)

## Dados, segurança e compliance
- Dados: token JWT do usuário em `localStorage['jwtToken']`. Nenhum token real em
  código/teste; testes usam token fictício `fake-jwt-token-006`.
- Segurança: o interceptor injeta credencial; deve enviar o header SOMENTE para o
  `apiBase` (evitar vazar token para terceiros/CDNs). Gate negativo cobre isso.
- 401: limpar token. Diferença vs. legado (que fazia `window.location.reload()`)
  documentada; comportamento moderno evita loop de reload.
- Revisão humana: required (Categoria C — auth/token/JWT).

## API, entidades e integrações
- Base URL: `https://conduit.productionready.io/api` (preservada do legado).
- Header: `Authorization: Token <jwt>` (NÃO `Bearer`).
- Endpoint usado: `GET /user` (verifyAuth).

## Operational path & risk
- risk_category: C  # interceptor de auth/JWT, sessão/token. Gatilho claro de C.
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
budget_max_usd: 2.50
rationale: |
  Categoria C: implementa o interceptor que injeta o token JWT e o serviço de
  sessão. Erro aqui (enviar Token para domínio errado, não usar esquema Token,
  vazar credencial) compromete a segurança. security_reviewer + >=4 gates +
  human_review obrigatórios.
```

## Deterministic gates (a rodar antes de READY)
- build: `cd app-ng && npm run build` verde.
- unit_tests: `cd app-ng && CI=true npm test` verde (interceptor, AuthService, header).
- negative_tests:
  - interceptor NÃO adiciona header para URL fora do `apiBase`;
  - interceptor NÃO adiciona header quando não há token;
  - usa esquema `Token ` (não `Bearer`);
  - 401 limpa o token.
- secret_scan: nenhum token/segredo real; apenas `fake-jwt-token-006` em testes.
- config_review: history routing (sem `withHashLocation`), CSS do design system
  presente no index.html, `apiBase`/`jwtKey` corretos, `src/` legado inalterado.

## Condições de parada
- Se reproduzir o design system exigir vendorizar `main.css` remoto (em vez de link),
  parar — é ponto de permissão (CHARTER §4.2). Nesta slice manter como link externo.
- Se o interceptor precisar enviar token para domínio != apiBase, parar e reavaliar (risco).
- Se algo exigir alterar `src/` legado, parar e reclassificar.
- Se vitest exigir browser indisponível, documentar e validar no DevContainer.

## Riscos e pendências
- Diferença de comportamento no 401 (sem reload forçado) — documentada; E2E futura valida.
- Placeholders de tela podem exigir ajustes quando as telas reais chegarem.
- `apiBase` aponta para API possivelmente indisponível; verifyAuth real depende disso,
  mas os testes usam HttpClient mockado (sem rede).
- **Pendência: aprovação do plano pelo usuário antes de implementar.**
