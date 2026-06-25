# Prompts por slice

Esta pasta registra os prompts (instrucoes do usuario) que guiaram cada slice de trabalho,
para rastreabilidade do processo conduzido via CODA.

## Estrutura

- `TEMPLATE.md` — modelo a copiar para cada nova slice.
- `<NNN>-<slug>.md` — um arquivo por slice (ex.: `019-governance.md`).

## Convencao

- O nome do arquivo usa o mesmo numero/slug da pasta em `docs/agent/work/<slice>/`.
- Registrar o(s) prompt(s) relevante(s) e o resultado/decisao de alto nivel.
- Nao incluir segredos, tokens ou dados sensiveis reais.

## Lacuna retroativa conhecida (slices 002-018)

Os prompts das slices **002 a 018** **nao** foram capturados no momento da execucao e,
portanto, **nao estao documentados aqui**. O registro de prompts passa a valer a partir da
slice **019 (governanca)** em diante. As decisoes dessas slices anteriores permanecem
documentadas em `docs/agent/work/<slice>/PLAN.md` e `PROGRESS.md`, ainda que sem o prompt
literal. Esta lacuna esta registrada tambem em `docs/audit-report.md`.
