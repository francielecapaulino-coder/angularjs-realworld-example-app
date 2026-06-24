# Evidência — 001-fundacao

## Resumo
- **Fase:** 1 — Fundação
- **Status:** READY / merged
- **PRs:**
  - PR #1 — `chore: establish agent foundation` — merged
  - PR #2 — `docs: close foundation work unit` — merged
- **Fontes:**
  - `docs/agent/work/001-fundacao/PLAN.md`
  - `docs/agent/work/001-fundacao/PROGRESS.md`
  - `docs/agent/work/001-fundacao/REVIEW.md`

## Implementações evidenciadas
- DevContainer atualizado para Node 22 LTS.
- Templates de issue com DoR/DoD criados em `.github/ISSUE_TEMPLATE/`.
- `.git/info/exclude` local configurado para proteger caminhos não versionáveis.
- Branch `bleeding` criada e enviada ao remoto.
- Contexto operacional do agente materializado em `docs/agent/`.

## Critérios de aceite aprovados
| Critério | Status | Evidência |
|---|---|---|
| `.devcontainer/devcontainer.json` aponta para Node 22 LTS (`"version": "22"`). | PASS | `REVIEW.md`: `grep -n '"version": "22"' .devcontainer/devcontainer.json`; JSON válido via `python3 -m json.tool`. |
| `.git/info/exclude` local contém `documentacao/`, `harness/`, `AGENTS.md`, `CLAUDE.md`. | PASS | `REVIEW.md`: `policy_check` retornou `PASS policy_check: caminhos proibidos ocultos pelo exclude local`. |
| Templates de issue publicados com checklists DoR e DoD. | PASS | `REVIEW.md`: `.github/ISSUE_TEMPLATE/feature_request.md` e `.github/ISSUE_TEMPLATE/bug_report.md`. |
| Branch `bleeding` criada local e remotamente. | PASS | `REVIEW.md`: `git push -u origin bleeding`; PR #1 criado. |
| Nenhum arquivo de `documentacao/` ou `harness/` commitado. | PASS | `REVIEW.md`: caminhos ocultos por `.git/info/exclude`; não apareceram em `git status --short --untracked-files=all`. |

## Gates / testes executados
| Gate | Status | Evidência |
|---|---|---|
| `schema_validation` | PASS | `python3 -m json.tool .devcontainer/devcontainer.json >/dev/null`. |
| `config_review` | PASS | `grep -n '"version": "22"' .devcontainer/devcontainer.json`. |
| `policy_check` | PASS | `git status --short --untracked-files=all` não listou caminhos proibidos. |
| `engines_check` | PASS | `package.json` sem campo `engines` conflitante. |

## Riscos residuais
- `package.json` e `package-lock.json` aparecem como mudanças locais fora de escopo em worktrees posteriores; não pertencem à slice `001-fundacao`.
