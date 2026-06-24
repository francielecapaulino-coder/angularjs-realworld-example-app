# PLAN — 007-angular-auth-screens

## Status
State: PLANNED

## Objetivo
Substituir os placeholders de `/login` e `/register` por telas reais de
autenticação no `app-ng/`, com formulários reativos, exibição de erros do
RealWorld (`{ field: [msgs] }`) e integração com `AuthService` (POST
`/users/login` e `/users`), salvando a sessão via `setAuth` e navegando para a home.

## Escopo
- Incluído (tudo em `app-ng/`):
  - `AuthService.attemptAuth(type, credentials)`: POST `/users/login` (login) ou
    `/users` (register); em sucesso chama `setAuth(user)`; retorna Observable.
  - `AuthComponent` (standalone, Reactive Forms): alterna login/register conforme
    a rota (`data: { authType }`), campos username (só register), email, password;
    botão de submit desabilitado durante envio; em sucesso navega para `/`; em erro
    exibe os erros do servidor.
  - `ListErrorsComponent` (standalone): renderiza o envelope `{ field: [msgs] }`
    (espelha `src/js/components/list-errors.html`).
  - Ligar rotas `/login` e `/register` ao `AuthComponent` (via `data.authType`),
    removendo os placeholders dessas duas rotas.
  - Templates fiéis ao `src/js/auth/auth.html` (classes `auth-page`, `form-control-lg`,
    placeholders "Username"/"Email"/"Password", botão `btn-primary`).
  - Testes vitest: `AuthService.attemptAuth` (login/register sucesso + erro),
    `AuthComponent` (campos por modo, submit sucesso navega, erro exibe mensagens),
    `ListErrorsComponent`.
- Fora de escopo:
  - Outras telas (home/feed, article, editor, profile, settings) — seguem placeholders.
  - Logout (slice posterior, junto com settings).
  - Migração da suite E2E (slice posterior).
  - Alterações em `src/` legado, contrato, design system.
- files_owned:
  - `app-ng/src/app/core/auth/auth.service.ts` (+ `.spec.ts`) — adiciona attemptAuth
  - `app-ng/src/app/pages/auth/auth.component.ts` + `.html` (+ `.spec.ts`)
  - `app-ng/src/app/shared/list-errors.component.ts` (+ `.spec.ts`)
  - `app-ng/src/app/app.routes.ts` (liga /login e /register)
  - `docs/agent/work/007-angular-auth-screens/PLAN.md`
  - `docs/agent/work/007-angular-auth-screens/PROGRESS.md`
  - `docs/agent/work/007-angular-auth-screens/REVIEW.md`
  - `docs/agent/STATE.md`

## Origem e fase
- Fase (ROADMAP): 3 — Migração Angular 21
- Decisões: `docs/adr/ADR-001-...md`.
- context_sources:
  - `src/js/auth/auth.controller.js` (submitForm, authType, errors)
  - `src/js/auth/auth.html` (form e seletores)
  - `src/js/services/user.service.js` (attemptAuth: POST /users[/login])
  - `src/js/components/list-errors.{component.js,html}` (envelope de erros)

## Dados, segurança e compliance
- Dados: credenciais (email/senha/username) digitadas pelo usuário em runtime;
  POST para o `apiBase`. Nenhuma credencial real em código/teste (usar
  `auth-007@example.test` / `user-007` / `pw-not-real-007`).
- Segurança: o token retornado é salvo via `setAuth`→`JwtService` (mesma chave
  `jwtToken`); o interceptor (slice 006) garante envio só ao `apiBase`.
- Erros: exibir mensagens do servidor sem vazar detalhes sensíveis; envelope
  RealWorld `{ field: [msgs] }`.
- Revisão humana: required (Categoria C — login/register/credenciais/token).

## API
- `POST /users/login` body `{ user: { email, password } }` → `{ user }`.
- `POST /users` body `{ user: { username, email, password } }` → `{ user }`.
- Erros `422` com `{ errors: { campo: [msgs] } }`.

## Operational path & risk
- risk_category: C  # login/register, credenciais e token de sessão.
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
  Categoria C: telas que coletam credenciais e estabelecem sessão (token).
  Erros aqui (enviar credencial ao destino errado, não tratar 422, vazar dados)
  impactam segurança. security_reviewer + >=4 gates + human_review obrigatórios.
```

## Deterministic gates (a rodar antes de READY)
- build: `cd app-ng && npm run build` verde.
- unit_tests: `cd app-ng && CI=true npm test` verde (auth.service, auth.component, list-errors).
- negative_tests:
  - login com 422 NÃO salva token e exibe `errors`;
  - register usa `POST /users` (sem `/login`); login usa `POST /users/login`;
  - submit desabilitado/`isSubmitting` durante envio;
  - sucesso chama `setAuth` (token salvo) e navega.
- secret_scan: nenhuma credencial/token real; apenas valores fictícios `*-007`.
- config_review: rotas `/login` e `/register` ligadas ao `AuthComponent`; `src/`
  legado inalterado; sem `Bearer`.

## Condições de parada
- Se o contrato de erro divergir de `{ errors: { campo: [msgs] } }`, registrar e ajustar o ListErrors.
- Se algo exigir alterar `src/` legado, parar e reclassificar.
- Se vitest exigir browser indisponível, documentar e validar no DevContainer.

## Riscos e pendências
- O `apiBase` pode estar indisponível em runtime; testes usam HttpClient mockado.
- Diferenças de UX moderna (validação de form reativa) vs. legado — manter paridade visual.
- **Pendência: aprovação do plano pelo usuário antes de implementar.**
