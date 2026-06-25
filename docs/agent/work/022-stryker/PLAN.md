# PLAN - 022-stryker

## Status
State: PLANNED

## Issue
#27

## Objetivo
Configurar mutation testing com Stryker no app-ng e reportar o score REAL atual,
sem falhar o build. Meta 95% documentada como referencia. (Auditoria item #13.)

## Decisoes tecnicas
- Runner: o app-ng usa `ng test` (`@angular/build:unit-test`, Vitest dirigido pelo CLI),
  sem `vitest.config` exposto. Por isso, usar o **command runner** do Stryker:
  `commandRunner.command = "npm test"` (cada mutante roda a suite; exit!=0 = morto).
  Necessario `CI=true` para o `ng test` rodar uma vez e sair.
- `thresholds.break = null` -> nunca falha o build nesta etapa.
- Escopo inicial de mutacao: logica de aplicacao em `src/app/**/*.ts`, excluindo specs,
  `main.ts`, `*.config.ts` e arquivos so de tipos/modelos. Se o tempo for inviavel no
  ambiente, reduzir o escopo (ex.: core services + editor) e documentar claramente.

## Escopo
- Incluido: `stryker.config.json`, script `test:mutation`, devDep `@stryker-mutator/core`,
  execucao real + relatorio do score em `docs/agent/work/022-stryker/`.
- Fora de escopo: atingir 95%; escrever testes novos para subir o score (slices seguintes).

## Operational path & risk
- risk_category: B  # tooling de teste aditivo; nao altera codigo de producao.
- human_review: optional

## Gates
- config_review: Stryker configurado; build nunca falha por score (break=null).
- build/unit: inalterados (sem mudanca de codigo de producao).
- evidence: score real capturado e versionado.

## Condicoes de parada
- Se a execucao completa exceder o tempo viavel, reduzir o escopo de `mutate` e
  registrar o subconjunto medido (sem falhar o build).
