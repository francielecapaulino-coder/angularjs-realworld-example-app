# EVIDENCE - 022-stryker (mutation testing baseline)

## Como rodar
```bash
cd app-ng
CI=true npm run test:mutation   # Stryker command runner (ng test por mutante)
```
Relatorios gerados (ignorados pelo git): `app-ng/reports/mutation/index.html` e `.../mutation.json`.

## Configuracao
- `app-ng/stryker.config.json`: `testRunner: command`, `commandRunner.command: "npm test"`.
- `thresholds.break: null` -> o build NUNCA falha por score nesta etapa (decisao do usuario, Opcao 1).
- Meta de referencia documentada: **95%** (a perseguir em slices seguintes).

## Por que command runner + escopo baseline
- O app-ng roda testes via `ng test` (`@angular/build:unit-test`, Vitest dirigido pelo
  Angular CLI), sem `vitest.config` exposto -> o plugin vitest-runner do Stryker nao se aplica
  diretamente; o **command runner** e o caminho compativel.
- Custo: cada mutante re-roda a suite inteira (~5 min/arquivo neste ambiente). Mutar todo o
  `src/app` em uma passada nao e viavel agora. Medimos um **escopo baseline** de logica core
  de auth/theme; expandir em slices seguintes.

## Score REAL medido (2026-06-25)

Escopo: `theme.service.ts`, `jwt.service.ts`, `auth.guard.ts`, `token.interceptor.ts`.

| Arquivo | Mutation score | killed | survived |
|---|---:|---:|---:|
| auth.guard.ts | **100.00%** | 7 | 0 |
| jwt.service.ts | **100.00%** | 3 | 0 |
| theme.service.ts | **82.22%** | 37 | 8 |
| token.interceptor.ts | **62.50%** | 15 | 9 |
| **All files (escopo)** | **78.48%** | 62 | 17 |

- Tempo: ~4min13s (concurrency 2). `Ran 1.00 tests per mutant on average`.
- Comparacao com a meta **95%**: **abaixo** no escopo medido (78.48%), puxado por
  `token.interceptor.ts` (62.50%) e `theme.service.ts` (82.22%). `auth.guard`/`jwt` ja em 100%.

## Proximos passos (fora desta slice)
- Adicionar testes para matar mutantes sobreviventes em `token.interceptor.ts` e `theme.service.ts`.
- Expandir o escopo de `mutate` (services de articles/comments/profile/tags, editor) por etapas.
- Avaliar acelerar via runner nativo (se o `ng test`/Vitest expuser config compativel com Stryker).
