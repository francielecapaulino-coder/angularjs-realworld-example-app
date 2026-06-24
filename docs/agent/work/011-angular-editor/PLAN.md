# PLAN — 011-angular-editor

## Status
State: PLANNED

## Objetivo
Substituir os placeholders de `/editor` e `/editor/:slug` pelo editor de artigos real
no `app-ng/`: criar (POST) e editar (PUT) artigos com título, descrição, corpo
(markdown) e tags; exibir erros de validação da API; redirecionar para o artigo
após salvar. Proteger as rotas com um guard de autenticação (anônimo → `/login`).

## Escopo
- Incluído (tudo em `app-ng/`):
  - `ArticlesService.create(article)` → POST `/articles` (`{ article }`) → `Article`.
  - `ArticlesService.update(slug, article)` → PUT `/articles/:slug` (`{ article }`) → `Article`.
  - `authGuard` (functional `CanActivateFn`): se não autenticado → redireciona `/login`.
  - `EditorComponent`:
    - Reactive Form: `title`, `description`, `body`, e campo de tag (`tagField`).
    - Tags: adicionar com Enter (sem duplicar), remover ao clicar; `tagList` em signal.
    - Novo vs. edição: se a rota tem `:slug`, carrega o artigo (GET) e popula; submit faz
      PUT; senão POST.
    - Sucesso → navega `/article/:slug`; erro → exibe `ListErrorsComponent`
      (mesmo mapeamento de envelope de erro usado em auth).
  - Ligar rotas `/editor` e `/editor/:slug` ao `EditorComponent` (com `authGuard`).
  - Template fiel ao legado (`editor-page`, form, `tag-list`, `Publish Article`).
  - Testes vitest: service create/update; editor novo (POST+nav), edição (prefetch+PUT),
    add/remove tag, render de erro; guard (anônimo redirecionado).
- Fora de escopo:
  - Profile, settings (+ logout) — próximas slices.
  - Migração da suite E2E — slice posterior.
  - Alterações em `src/` legado, contrato, design system.
- files_owned:
  - `app-ng/src/app/core/articles/articles.service.ts` (+ spec) — create/update
  - `app-ng/src/app/core/auth/auth.guard.ts` (+ spec)
  - `app-ng/src/app/pages/editor/editor.component.ts` (+ html, spec)
  - `app-ng/src/app/app.routes.ts` (liga /editor e /editor/:slug com guard)
  - `docs/agent/work/011-angular-editor/{PLAN,PROGRESS,REVIEW}.md`
  - `docs/agent/STATE.md`

## Origem e fase
- Fase (ROADMAP): 3 — Migração Angular 21
- Decisões: `docs/adr/ADR-001-...md`.
- context_sources:
  - `src/js/editor/{editor.controller.js,editor.html}`
  - `src/js/services/articles.service.js` (`save` overload POST/PUT)
  - `app-ng` existente: `ListErrorsComponent`/`ApiErrors`, padrão de erro em `auth.component.ts`

## Dados, segurança e compliance
- Dados: criação/edição de conteúdo autenticado; token via interceptor (006).
- Segurança:
  - Rotas do editor exigem auth (guard) — anônimo redirecionado a `/login` (sem render do form).
  - Mutações (POST/PUT) só para `apiBase`.
  - Corpo é markdown (texto); a renderização sanitizada acontece na página de artigo (009).
  - Nenhuma credencial/token real em código/teste (`*-011` fictícios).
- Revisão humana: required (Categoria C — cria/edita conteúdo autenticado).

## API
- `POST /articles` `{ article: { title, description, body, tagList } }` → `{ article }`.
- `PUT /articles/:slug` `{ article: { ... } }` → `{ article }`.
- (edição) `GET /articles/:slug` para popular o form.

## Operational path & risk
- risk_category: C  # cria/edita conteúdo autenticado; rotas protegidas.
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
  Categoria C: o editor cria/edita conteúdo autenticado e introduz o primeiro guard
  de rota. Erros (form acessível por anônimo, PUT/POST trocados, erros de validação
  não exibidos) impactam segurança/integridade. security_reviewer + >=4 gates + human_review.
```

## Deterministic gates (a rodar antes de READY)
- build: `cd app-ng && npm run build` verde.
- unit_tests: `cd app-ng && CI=true npm test` verde.
- negative_tests:
  - guard: usuário anônimo é redirecionado a `/login` (e não acessa o editor);
  - novo artigo → POST `/articles`; edição → PUT `/articles/:slug` (método correto);
  - erros de validação da API são renderizados (ListErrors);
  - add tag não duplica; remove tag remove o item.
- secret_scan: nenhum token/segredo real.
- config_review: rotas do editor usam `authGuard`; mutações p/ `apiBase`; `src/` inalterado.

## Condições de parada
- Se o form do editor puder ser acessado por anônimo, PARAR (viola o guard).
- Se a edição enviar POST (em vez de PUT) ou vice-versa, PARAR.
- Se algo exigir alterar `src/` legado, parar e reclassificar.

## Riscos e pendências
- Guard é novo no app-ng; garantir que não quebra as rotas públicas existentes.
- `apiBase` pode estar indisponível; testes usam HttpClient mockado.
- Após esta slice, o link "New Post" no header (já existente) passa a levar a um editor real.
- **Pendência: aprovação do plano pelo usuário antes de implementar.**
