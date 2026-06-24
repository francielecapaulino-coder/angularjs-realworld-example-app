# STATE

State: REVIEWING
Current phase: 2 — Rede de segurança
Last completed phase: 1 — Fundação
Active work unit: 003-contract-tests

## Briefing — o que o próximo agente faz primeiro
1. Ler `docs/agent/OPERATING-GUIDE.md` e este `STATE.md`.
2. Ler `docs/agent/work/003-contract-tests/REVIEW.md` — veredito PASS, aguardando revisão humana.
3. Após revisão e merge, iniciar a próxima slice da Fase 2: **E2E Playwright** cobrindo
   login/registro, listar/abrir artigo, criar artigo, favoritar, seguir usuário contra
   o app AngularJS atual.

## Não faça
- Não inventar requisitos de produto.
- Não escolher stack sem contexto (ver pontos de permissão em CHARTER.md).
- Não escrever código de produto antes de uma unidade de trabalho ser planejada.
- Não usar segredos/credenciais/dados sensíveis reais.
- Não commitar `documentacao/`, `harness/`, `AGENTS.md` ou `CLAUDE.md`.
