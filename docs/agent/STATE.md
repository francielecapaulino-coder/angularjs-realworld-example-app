# STATE

State: REVIEWING
Current phase: 3 — Migração Angular 21
Last completed phase: 2 — Rede de segurança
Active work unit: 011-angular-editor

## Decisões da Fase 3 (ADR-001 — aprovadas)
- Signals; history API; SPA estático; marked + DomSanitizer. Coexistência em `app-ng/`.

## Progresso da Fase 3
- 005 scaffold: COMPLETO (mergeado).
- 006 layout+auth: COMPLETO (mergeado).
- 007 telas auth (login/register): COMPLETO (mergeado).
- 008 home/feed: COMPLETO (mergeado).
- 009 página de artigo (markdown sanitizado + comentários leitura): COMPLETO (mergeado).
- 010 ações de escrita (favorite/follow/comment/delete + ArticleActions sem bug): COMPLETO (mergeado).
- 011 editor (create POST / update PUT + authGuard): build + 79 testes verdes.
  Aguardando revisão humana do PR. `src/` legado intocado.

## Telas/funcionalidades migradas vs. placeholders
- Migradas: `/` (home/feed), `/login`, `/register`, `/article/:slug` (leitura + escrita),
  `/editor` e `/editor/:slug` (protegidas por authGuard).
- Placeholders ainda: `/profile/:username`, `/settings`.

## Invariantes preservadas
- Interceptor `Authorization: Token <jwt>` só p/ `apiBase`; esquema `Token` (não `Bearer`).
- Mutações exigem auth (anônimo → /register nos botões; rotas do editor → /login via guard).
- Markdown sanitizado (sem bypass). Chave `localStorage['jwtToken']`; contrato RealWorld inalterado.
- Bug legado de `article-actions` corrigido no app-ng (canModify reativo).

## Briefing — o que o próximo agente faz primeiro
1. Ler `OPERATING-GUIDE.md`, este `STATE.md`, `docs/adr/ADR-001-...md`.
2. Rodar app-ng exige Node >=20.19/22.12 (`nvm use 22`): `cd app-ng && npm install && npm run build && CI=true npm test`.
3. Próximas slices Fase 3 (ordem sugerida):
   - Profile (GET `/profiles/:username` + abas "My Articles"/"Favorited", reusa ArticleList) — Categoria B/C.
   - Settings (update do usuário PUT `/user` + **logout**), protegida por `authGuard` — Categoria C.
   - Migrar a suite E2E da Fase 2 (hashbang → URLs limpas) e **atualizar o baseline** de `article-actions`.
4. Reusar `authGuard` (core/auth) para rotas autenticadas (settings; editor já usa).

## Não faça
- Não inventar requisitos de produto.
- Não reabrir os pontos de permissão já decididos (ver ADR-001) sem motivo novo.
- Não usar `bypassSecurityTrustHtml` para conteúdo não confiável.
- Não permitir acesso autenticado sem guard/checagem de sessão.
- Não escrever código de produto antes de uma unidade de trabalho ser planejada.
- Não usar segredos/credenciais/dados sensíveis reais.
- Não commitar `documentacao/`, `harness/`, `AGENTS.md` ou `CLAUDE.md`.
