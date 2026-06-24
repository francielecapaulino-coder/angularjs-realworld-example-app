# STATE

State: REVIEWING
Current phase: 2 — Rede de segurança
Last completed phase: 1 — Fundação
Active work unit: 004-e2e-playwright

## Briefing — o que o próximo agente faz primeiro
1. Ler `docs/agent/OPERATING-GUIDE.md` e este `STATE.md`.
2. Ler `docs/agent/work/004-e2e-playwright/REVIEW.md` — veredito PASS, aguardando revisão humana.
3. Rodar E2E exige Node >=18 (DevContainer Node 22 ou `nvm use 22`), build do app
   (`node_modules/.bin/gulp html browserify`) e então `npm run test:e2e`.
4. Após revisão e merge: a Fase 2 está completa (OpenAPI + contrato + E2E +
   branches failing-e2e/passing-e2e). Iniciar Fase 3 (Migração Angular 21),
   começando pelos pontos de permissão em CHARTER.md (Signals×RxJS, hashbang×history,
   SSR, lib de markdown) via issue `needs-decision`.

## Não faça
- Não inventar requisitos de produto.
- Não escolher stack sem contexto (ver pontos de permissão em CHARTER.md).
- Não escrever código de produto antes de uma unidade de trabalho ser planejada.
- Não usar segredos/credenciais/dados sensíveis reais.
- Não commitar `documentacao/`, `harness/`, `AGENTS.md` ou `CLAUDE.md`.
