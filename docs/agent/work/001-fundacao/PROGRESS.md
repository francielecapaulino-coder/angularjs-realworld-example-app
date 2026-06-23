# PROGRESS — 001-fundacao

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-23 | planner | PLANNED | docs/agent/work/001-fundacao/PLAN.md criado |
| 2026-06-23 16:58:57 -03 | builder | IMPLEMENTING | `.devcontainer/devcontainer.json`, `.git/info/exclude`, `.github/ISSUE_TEMPLATE/*`; gates locais PASS |
| 2026-06-23 16:58:57 -03 | evaluator | EVALUATING | docs/agent/work/001-fundacao/REVIEW.md |
| 2026-06-23 16:58:57 -03 | builder | EVALUATING | Branch `bleeding` enviada e PR #1 criado: https://github.com/francielecapaulino-coder/angularjs-realworld-example-app/pull/1 |

## Decisões
- Node 22 LTS escolhido para o devcontainer: compatível com Angular 21
  (`^20.19.0 || ^22.12.0 || ^24.0.0`); versão 22 tem suporte ativo mais longo
  que 20 em 2026.
- Templates de issue criados como arquivos Markdown simples, sem dependência de
  labels, projects ou automações externas.

## Arquivos alterados
- `.devcontainer/devcontainer.json`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.git/info/exclude` (local, não versionado)
- `docs/agent/work/001-fundacao/PLAN.md`
- `docs/agent/work/001-fundacao/PROGRESS.md`
- `docs/agent/work/001-fundacao/REVIEW.md`
- `docs/agent/STATE.md`

## Comandos e resultados
| Comando | Resultado |
|---|---|
| `python3 -m json.tool .devcontainer/devcontainer.json >/dev/null` | PASS — devcontainer JSON válido |
| `grep -n '"version": "22"' .devcontainer/devcontainer.json` | PASS — Node 22 configurado |
| `git status --short --untracked-files=all \| grep -E '(^\| )documentacao/\|(^\| )harness/\|AGENTS\\.md\|CLAUDE\\.md'` | PASS — caminhos proibidos ocultos pelo exclude local |
| `node -e "const pkg=require('./package.json'); console.log(pkg.engines ? JSON.stringify(pkg.engines) : 'PASS engines_check: package.json sem engines conflitante')"` | PASS — `package.json` sem `engines` conflitante |
| `git push -u origin bleeding` | PASS — branch `origin/bleeding` criada |
| `gh pr create --base master --head bleeding` | PASS — PR #1 criado |

## Riscos residuais / pendências
- `package.json` sem campo `engines`; informar time que ambiente local requer
  Node ≥ 20.19 a partir desta slice.
- PR #1 aguarda revisão/merge humano.
