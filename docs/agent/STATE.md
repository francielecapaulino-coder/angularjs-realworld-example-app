# STATE

State: REVIEWING
Current phase: 3 — Migração Angular 21
Last completed phase: 2 — Rede de segurança
Active work unit: 007-angular-auth-screens

## Decisões da Fase 3 (ADR-001 — aprovadas)
- Signals; history API; SPA estático; marked + DomSanitizer. Coexistência em `app-ng/`.

## Progresso da Fase 3
- 005 scaffold: COMPLETO (mergeado).
- 006 layout+auth (shell, rotas URLs limpas, interceptor `Token`, AuthService): COMPLETO (mergeado).
- 007 telas auth (login/register + ListErrors + attemptAuth): build + 24 testes verdes.
  Aguardando revisão humana do PR. `src/` legado intocado.

## Telas migradas vs. placeholders
- Migradas: `/login`, `/register` (AuthComponent).
- Placeholders ainda: `/` (home/feed), `/article/:slug`, `/editor`, `/editor/:slug`,
  `/profile/:username`, `/settings`.

## Invariantes preservadas
- Interceptor `Authorization: Token <jwt>` só p/ `apiBase`; esquema `Token` (não `Bearer`).
- Chave `localStorage['jwtToken']`; contrato RealWorld inalterado; tema claro inalterado.

## Briefing — o que o próximo agente faz primeiro
1. Ler `OPERATING-GUIDE.md`, este `STATE.md`, `docs/adr/ADR-001-...md`.
2. Rodar app-ng exige Node >=20.19/22.12 (`nvm use 22`): `cd app-ng && npm install && npm run build && CI=true npm test`.
3. Próximas slices Fase 3 (ordem sugerida):
   - Home/feed: lista de artigos (GET /articles), tags (GET /tags), paginação, tabs.
   - Article: GET /articles/:slug + comments + markdown sanitizado (marked + DomSanitizer, ADR-001).
   - Editor (POST/PUT artigo), Profile, Settings (+ logout).
   - Migrar a suite E2E da Fase 2 (hashbang → URLs limpas) quando houver telas suficientes.

## Não faça
- Não inventar requisitos de produto.
- Não reabrir os pontos de permissão já decididos (ver ADR-001) sem motivo novo.
- Não escrever código de produto antes de uma unidade de trabalho ser planejada.
- Não usar segredos/credenciais/dados sensíveis reais.
- Não commitar `documentacao/`, `harness/`, `AGENTS.md` ou `CLAUDE.md`.
