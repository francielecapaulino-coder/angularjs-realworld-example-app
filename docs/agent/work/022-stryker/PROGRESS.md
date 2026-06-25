# PROGRESS - 022-stryker

State: EVALUATING

## Issue
#27

## Itens entregues
- `@stryker-mutator/core` (devDep do app-ng) + `stryker.config.json` (command runner).
- Script `npm run test:mutation` no app-ng.
- `.gitignore` ignora `reports/`, `.stryker-tmp/`, `stryker.log`.
- Execucao real e score capturado em `EVIDENCE.md`.

## Score REAL (baseline, escopo core auth/theme)
- **All files (escopo): 78.48%** (killed 62 / survived 17).
- auth.guard.ts 100% | jwt.service.ts 100% | theme.service.ts 82.22% | token.interceptor.ts 62.50%.
- Meta 95% documentada como referencia; build NUNCA falha por score (`break: null`).

## Decisoes / limitacoes
- Runner: `ng test` (Vitest via Angular CLI) sem vitest.config -> command runner do Stryker.
- Custo ~5min/arquivo (suite inteira por mutante) -> escopo baseline (4 arquivos de logica core);
  expandir em slices seguintes (condicao de parada do PLAN aplicada e documentada).

## Gates
- config_review: Stryker configurado; `break: null` (build nao falha por score). OK.
- build/unit: codigo de producao inalterado.
- evidence: score real versionado (EVIDENCE.md).

## Pendencias (slices seguintes)
- Matar mutantes sobreviventes (token.interceptor, theme.service).
- Expandir `mutate` para o restante dos services + editor.
