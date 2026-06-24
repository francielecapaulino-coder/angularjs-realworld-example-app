# STATE

State: REVIEWING
Current phase: 3 — Migração Angular 21
Last completed phase: 2 — Rede de segurança
Active work unit: 005-angular-scaffold

## Decisões da Fase 3 (ADR-001 — aprovadas pelo usuário)
- Estado: **Angular Signals**.
- Roteamento: **history API (PathLocationStrategy)**, URLs limpas; fallback de servidor.
- Renderização: **SPA estático** (sem SSR); Nginx (Fase 6).
- Markdown: **marked (atual) + DomSanitizer**.
- Coexistência: projeto novo em **`app-ng/`**, migração incremental.
- Registro: `docs/adr/ADR-001-angular-21-migration-stack.md`.

## Invariantes preservadas
- Interceptor `Authorization: Token <jwt>` no `HttpClient` (a implementar na próxima slice).
- Chave `localStorage['jwtToken']`.
- Contrato RealWorld inalterado; tema claro inalterado.
- Suite E2E da Fase 2 (hashbang `#!/`) migrará para URLs limpas quando as telas existirem.

## Briefing — o que o próximo agente faz primeiro
1. Ler `docs/agent/OPERATING-GUIDE.md`, este `STATE.md` e `docs/adr/ADR-001-...md`.
2. Scaffold da Fase 3 COMPLETO (slice 005): `app-ng/` gerado, build + smoke test verdes,
   conforme ADR-001. Aguardando revisão humana do PR. `src/` legado intocado.
3. Rodar app-ng exige Node >=20.19/22.12 (DevContainer Node 22 ou `nvm use 22`):
   `cd app-ng && npm install && npm run build && CI=true npm test`.
4. Próxima slice (Fase 3): migrar layout (header/footer) + roteamento + interceptor
   `Authorization: Token` preservando `localStorage['jwtToken']`. Categoria C (auth) —
   strict_path_C_D, >= 4 gates, human_review.

## Não faça
- Não inventar requisitos de produto.
- Não reabrir os pontos de permissão já decididos (ver ADR-001) sem motivo novo.
- Não escrever código de produto antes de uma unidade de trabalho ser planejada.
- Não usar segredos/credenciais/dados sensíveis reais.
- Não commitar `documentacao/`, `harness/`, `AGENTS.md` ou `CLAUDE.md`.
