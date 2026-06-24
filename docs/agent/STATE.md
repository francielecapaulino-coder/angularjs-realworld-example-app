# STATE

State: REVIEWING
Current phase: 3 — Migração Angular 21
Last completed phase: 2 — Rede de segurança
Active work unit: 008-angular-home-feed

## Decisões da Fase 3 (ADR-001 — aprovadas)
- Signals; history API; SPA estático; marked + DomSanitizer. Coexistência em `app-ng/`.

## Progresso da Fase 3
- 005 scaffold: COMPLETO (mergeado).
- 006 layout+auth (shell, rotas, interceptor `Token`, AuthService): COMPLETO (mergeado).
- 007 telas auth (login/register + ListErrors + attemptAuth): COMPLETO (mergeado).
- 008 home/feed (services articles/tags, ArticlePreview/List, Home, rota /): build + 37 testes verdes.
  Aguardando revisão humana do PR. `src/` legado intocado.

## Telas migradas vs. placeholders
- Migradas: `/` (home/feed), `/login`, `/register`.
- Placeholders ainda: `/article/:slug`, `/editor`, `/editor/:slug`, `/profile/:username`, `/settings`.

## Invariantes preservadas
- Interceptor `Authorization: Token <jwt>` só p/ `apiBase`; esquema `Token` (não `Bearer`).
- Chave `localStorage['jwtToken']`; contrato RealWorld inalterado; tema claro inalterado.

## Briefing — o que o próximo agente faz primeiro
1. Ler `OPERATING-GUIDE.md`, este `STATE.md`, `docs/adr/ADR-001-...md`.
2. Rodar app-ng exige Node >=20.19/22.12 (`nvm use 22`): `cd app-ng && npm install && npm run build && CI=true npm test`.
3. Próximas slices Fase 3 (ordem sugerida):
   - Página de artigo: GET /articles/:slug + comentários + markdown sanitizado (marked + DomSanitizer, ADR-001).
   - Ações de favoritar/seguir (Categoria C — POST/DELETE favorite/follow).
   - Editor (POST/PUT artigo), Profile, Settings (+ logout).
   - Migrar a suite E2E da Fase 2 (hashbang → URLs limpas).

## Não faça
- Não inventar requisitos de produto.
- Não reabrir os pontos de permissão já decididos (ver ADR-001) sem motivo novo.
- Não escrever código de produto antes de uma unidade de trabalho ser planejada.
- Não usar segredos/credenciais/dados sensíveis reais.
- Não commitar `documentacao/`, `harness/`, `AGENTS.md` ou `CLAUDE.md`.
