# Slice 019 - Governanca rapida

- **Issue:** #21
- **Data:** 2026-06-25
- **Categoria de risco:** B (docs + 1 mudanca de settings autorizada)

## Prompt(s) do usuario

> "Preciso que você faça uma auditoria completa do projeto ... Não corrija nada
> automaticamente — apenas relate." (geração de `docs/audit-report.md`)

> "sim" (encaminhar as correcoes em slices, comecando pelas pendencias de governanca rapida)

> "faça tudo numa única slice. Autorizado a reabilitar Issues via
> gh repo edit --enable-issues. Para os prompts: crie docs/prompts/ com estrutura +
> template, documente a partir desta slice em diante, e registre no relatório que as
> slices anteriores (002–018) ficam como lacuna retroativa conhecida."

## Decisoes tomadas

- Itens cobertos: #6 (reabilitar Issues + validar templates), #7 (DoR + DoD consolidada),
  #10 (registrar uso do CODA), #22 (estrutura de prompts), #23 (doc de skills).
- Issues do GitHub reabilitadas via `gh repo edit --enable-issues` (autorizado).
- Prompts: registro comeca nesta slice; 002-018 ficam como lacuna retroativa conhecida.
- Fora de escopo: criar issues retroativas; features de frontend; mutation testing; backend/infra.

## Resultado

- Docs criados em `docs/process/` (DoR, DoD, SKILLS, CODA-WORKFLOW) e `docs/prompts/`
  (README, TEMPLATE, este arquivo). `docs/audit-report.md` atualizado.
- PR: (a abrir).
