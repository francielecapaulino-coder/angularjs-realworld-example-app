# STATE

State: REVIEWING
Current phase: 3 — Migração Angular 21
Last completed phase: 2 — Rede de segurança
Active work unit: 006-angular-layout-auth

## Decisões da Fase 3 (ADR-001 — aprovadas pelo usuário)
- Estado: Angular Signals. Roteamento: history API. Render: SPA estático. Markdown: marked + DomSanitizer.
- Coexistência: projeto novo em `app-ng/`, migração incremental.

## Progresso da Fase 3
- 005 scaffold: COMPLETO (mergeado).
- 006 layout+auth: shell (header/footer), roteamento URLs limpas, interceptor
  `Authorization: Token` + AuthService (Signals). Build + 15 testes verdes.
  Aguardando revisão humana do PR. `src/` legado intocado.

## Invariantes preservadas (verificadas na slice 006)
- Interceptor `Authorization: Token <jwt>` só p/ `apiBase`; esquema `Token` (não `Bearer`).
- Chave `localStorage['jwtToken']`.
- Design system remoto preservado no `app-ng/src/index.html`.
- Contrato RealWorld inalterado; tema claro inalterado.

## Briefing — o que o próximo agente faz primeiro
1. Ler `OPERATING-GUIDE.md`, este `STATE.md` e `docs/adr/ADR-001-...md`.
2. Rodar app-ng exige Node >=20.19/22.12 (DevContainer Node 22 ou `nvm use 22`):
   `cd app-ng && npm install && npm run build && CI=true npm test`.
3. Próximas slices Fase 3 (substituir placeholders por telas reais), sugestão de ordem:
   - Auth screens (login/register) ligando ao `AuthService.setAuth` + tratamento de erros.
   - Home/feed (lista de artigos, tags, paginação).
   - Article + markdown sanitizado (marked + DomSanitizer, ADR-001).
   - Editor, Profile, Settings.
   - Migrar a suite E2E da Fase 2 (hashbang → URLs limpas) quando as telas existirem.

## Não faça
- Não inventar requisitos de produto.
- Não reabrir os pontos de permissão já decididos (ver ADR-001) sem motivo novo.
- Não escrever código de produto antes de uma unidade de trabalho ser planejada.
- Não usar segredos/credenciais/dados sensíveis reais.
- Não commitar `documentacao/`, `harness/`, `AGENTS.md` ou `CLAUDE.md`.
