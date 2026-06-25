# PROGRESS — 018-deploy-pipeline (CI-only)

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | PLAN.md (opções de host A–D) |
| 2026-06-24 | builder | EVALUATING | escopo reduzido a CI-only (decisão do usuário); `.github/workflows/ci.yml` + README; passos validados localmente |

## Decisões
- Categoria B: CI de validação aditivo (sem deploy, sem secrets).
- Deploy adiado para slice futura (alvo a escolher; opções A–D preservadas no PLAN).
- Workflow roda em push/PR para `master`, Node 22, cache npm dos dois lockfiles.
- Reusa os scripts existentes (build/test:contract/test:e2e) + Vitest do app-ng.
- Incidente recorrente de encoding: travessão (—) num texto novo esvaziou o README;
  restaurado do git e a seção CI reinserida em ASCII (hífen).

## Arquivos alterados
- `.github/workflows/ci.yml` (novo) — build + unit + contract + e2e; artefato do report em falha.
- `README.md` — seção "Continuous Integration".
- `docs/agent/work/018-deploy-pipeline/{PLAN,PROGRESS}.md`.

## Validação local (espelha os passos do workflow)
| Passo do CI | Resultado |
|---|---|
| `npm run build --prefix app-ng` | OK |
| `CI=true npm test --prefix app-ng` (unit) | 93/93 |
| `npm run test:contract` | 11/11 |
| `npx playwright test` (e2e) | 37/37 |
| YAML lint (`yaml.safe_load`) | válido |
| chars corrompidos no README | 0 |

Observação: GitHub Actions não roda localmente; validei reproduzindo a mesma
sequência de comandos do workflow + lint do YAML.

## Riscos residuais / pendências
- O E2E no CI sobe `serve` e instala o browser do Playwright (`--with-deps chromium`);
  a config já usa `workers=1` para estabilidade.
- Deploy fica para a próxima slice (escolha de host + fallback SPA + baseHref + secrets).
