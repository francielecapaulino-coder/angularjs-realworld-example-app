# PLAN — 012-angular-profile-settings

## Status
State: PLANNED

## Objetivo
Substituir os placeholders de `/profile/:username` e `/settings` pelas telas reais no
`app-ng/`: a página de **perfil** (cabeçalho + abas "My Articles"/"Favorited",
reusando `ArticleListComponent` e `FollowButtonComponent`) e a página de
**settings** (atualizar o usuário via PUT `/user` + **logout**), protegida por
`authGuard`. Com isso, todas as telas principais do RealWorld ficam migradas.

## Escopo
- Incluído (tudo em `app-ng/`):
  - `AuthService.update(user)` → PUT `/user` (`{ user }`) → `setAuth(updated)` (atualiza
    currentUser + token) → emite `User`.
  - `ProfileComponent` (rota `/profile/:username`):
    - Carrega o perfil via `ProfileService.get`.
    - Cabeçalho: avatar, username, bio. Se for o próprio usuário → link "Edit Profile Settings"
      (`/settings`); senão → `FollowButtonComponent`.
    - Abas (signal `tab`: `'my' | 'favorited'`): "My Articles" (filtro `author`) e
      "Favorited Articles" (filtro `favorited`), passando `listConfig` ao `ArticleListComponent`.
  - `SettingsComponent` (rota `/settings`, `authGuard`):
    - Reactive Form: `image`, `username`, `bio`, `email`, `password` (senha opcional).
    - Pré-preenche com `AuthService.currentUser`.
    - Submit → `AuthService.update` → navega `/profile/:username`; erro → `ListErrorsComponent`.
    - Botão **Logout** → `AuthService.purgeAuth()` + navega `/`.
  - Ligar rotas: `/profile/:username` → ProfileComponent; `/settings` → SettingsComponent + `authGuard`.
  - Templates fiéis ao legado (`profile-page`, `user-info`, `articles-toggle`, `settings-page`).
  - Testes vitest: AuthService.update; ProfileComponent (load, próprio vs. outro, troca de aba →
    filtro correto); SettingsComponent (pré-preenche, PUT+nav, logout purga+nav, erros).
- Fora de escopo:
  - Migração da suite E2E — slice posterior.
  - Alterações em `src/` legado, contrato, design system.
  - Remoção do app AngularJS legado — fase de descomissionamento posterior.
- files_owned:
  - `app-ng/src/app/core/auth/auth.service.ts` (+ spec) — `update`
  - `app-ng/src/app/pages/profile/profile.component.ts` (+ html, spec)
  - `app-ng/src/app/pages/settings/settings.component.ts` (+ html, spec)
  - `app-ng/src/app/app.routes.ts` (liga profile e settings)
  - `docs/agent/work/012-angular-profile-settings/{PLAN,PROGRESS,REVIEW}.md`
  - `docs/agent/STATE.md`

## Origem e fase
- Fase (ROADMAP): 3 — Migração Angular 21
- Decisões: `docs/adr/ADR-001-...md`.
- context_sources:
  - `src/js/profile/{profile.controller.js,profile-articles.controller.js,profile.html}`
  - `src/js/settings/{settings.controller.js,settings.html}`
  - `app-ng` existente: `ArticleListComponent` (`listConfig: ArticleQuery`),
    `FollowButtonComponent`, `ListErrorsComponent`/`ApiErrors`, `authGuard`, `AuthService`.

## Dados, segurança e compliance
- Dados: leitura de perfil (pública) + atualização do próprio usuário (autenticada) + logout.
- Segurança:
  - `/settings` exige auth (`authGuard`) — anônimo → `/login`.
  - `update` → PUT `/user` só p/ `apiBase`; resposta atualiza token via `setAuth`.
  - **Logout** limpa token (`purgeAuth`) e estado; navega para `/`.
  - Nenhuma credencial/token real em código/teste (`*-012` fictícios).
- Revisão humana: required (Categoria C — muta a sessão/token e gerencia logout).

## API
- `PUT /user` `{ user: { image, username, bio, email, password? } }` → `{ user }` (com token).
- `GET /profiles/:username` → `{ profile }` (via ProfileService — slice 010).
- `GET /articles?author=…` / `?favorited=…` (via ArticleListComponent — slice 008).

## Operational path & risk
- risk_category: C  # muta a sessão (PUT /user atualiza token) + logout.
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
  Categoria C: settings atualiza o usuário (PUT /user retorna novo token, persistido via
  setAuth) e executa logout (limpa token/sessão). Erros (settings acessível por anônimo,
  logout que não limpa o token, update mal roteado) impactam segurança. security_reviewer
  + >=4 gates + human_review.
```

## Deterministic gates (a rodar antes de READY)
- build: `cd app-ng && npm run build` verde.
- unit_tests: `cd app-ng && CI=true npm test` verde.
- negative_tests:
  - `/settings` guardado: anônimo → `/login` (guard já testado; rota usa `authGuard`);
  - `update` faz PUT `/user` com `{ user }` e re-armazena a sessão (token novo);
  - **logout** chama `purgeAuth` (token removido) e navega `/`;
  - profile: aba "Favorited" passa filtro `favorited`; "My Articles" passa `author`;
  - profile próprio mostra "Edit Profile Settings" (sem FollowButton); outro mostra FollowButton.
- secret_scan: nenhum token/segredo real.
- config_review: `/settings` com `authGuard`; mutações p/ `apiBase`; `src/` inalterado.

## Condições de parada
- Se `/settings` puder ser acessado por anônimo, PARAR (viola o guard).
- Se o logout não limpar o token, PARAR (sessão órfã).
- Se algo exigir alterar `src/` legado, parar e reclassificar.

## Riscos e pendências
- Mudar o `username` no settings altera a URL do perfil; navegar para o novo `:username`.
- `apiBase` pode estar indisponível; testes usam HttpClient mockado.
- Após esta slice, todas as telas principais estarão migradas → próxima fase: migrar a
  suite E2E para URLs limpas, atualizar baseline de `article-actions` e planejar o
  descomissionamento do AngularJS legado.
- **Pendência: aprovação do plano pelo usuário antes de implementar.**
