# STATE

State: PLANNED
Current phase: 2 — Rede de segurança
Last completed phase: 1 — Fundação
Active work unit: 004-e2e-playwright

## Briefing — o que o próximo agente faz primeiro
1. Ler `docs/agent/OPERATING-GUIDE.md` e este `STATE.md`.
2. Ler `docs/agent/work/004-e2e-playwright/PLAN.md`.
3. Aguardar confirmação humana do plano (pending_decision ativo).
4. Após aprovação: atuar como **builder** — instalar `@playwright/test@^1.44` e
   `serve@^14`, criar `playwright.config.js` e `tests/e2e/conduit.e2e.test.js`,
   adicionar scripts em `package.json`, rodar gates e registrar evidências.

## Não faça
- Não inventar requisitos de produto.
- Não escolher stack sem contexto (ver pontos de permissão em CHARTER.md).
- Não escrever código de produto antes de uma unidade de trabalho ser planejada.
- Não usar segredos/credenciais/dados sensíveis reais.
- Não commitar `documentacao/`, `harness/`, `AGENTS.md` ou `CLAUDE.md`.
