# STATE

State: PLANNED
Current phase: 2 — Rede de segurança
Last completed phase: 1 — Fundação
Active work unit: 003-contract-tests

## Briefing — o que o próximo agente faz primeiro
1. Ler `docs/agent/OPERATING-GUIDE.md` e este `STATE.md`.
2. Ler `docs/agent/work/003-contract-tests/PLAN.md`.
3. Aguardar confirmação humana do plano (pending_decision ativo).
4. Após aprovação: atuar como **builder** — instalar `jest@^29` e `js-yaml@^4`,
   criar `tests/contract/api.contract.test.js`, adicionar script `test:contract`
   em `package.json`, rodar gates e registrar evidências em `PROGRESS.md`.

## Não faça
- Não inventar requisitos de produto.
- Não escolher stack sem contexto (ver pontos de permissão em CHARTER.md).
- Não escrever código de produto antes de uma unidade de trabalho ser planejada.
- Não usar segredos/credenciais/dados sensíveis reais.
- Não commitar `documentacao/`, `harness/`, `AGENTS.md` ou `CLAUDE.md`.
