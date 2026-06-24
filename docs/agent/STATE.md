# STATE

State: READY
Current phase: 2 — Rede de segurança
Last completed phase: 1 — Fundação
Active work unit: none

## Briefing — o que o próximo agente faz primeiro
1. Ler `docs/agent/OPERATING-GUIDE.md` e este `STATE.md`.
2. Aguardar revisão humana do PR da slice `002-realworld-openapi` antes de merge, por Categoria C.
3. Após merge, iniciar a próxima slice da Fase 2 via Prompt 01: implementar testes de contrato contra `docs/api/realworld-openapi.yaml` e a API `conduit.productionready.io`.

## Não faça
- Não inventar requisitos de produto.
- Não escolher stack sem contexto (ver pontos de permissão em CHARTER.md).
- Não escrever código de produto antes de uma unidade de trabalho ser planejada.
- Não usar segredos/credenciais/dados sensíveis reais.
- Não commitar `documentacao/`, `harness/`, `AGENTS.md` ou `CLAUDE.md`.
