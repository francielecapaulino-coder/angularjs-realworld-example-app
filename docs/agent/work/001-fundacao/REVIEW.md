# REVIEW — 001-fundacao

## Veredito
Result: PASS

## Checagem de escopo
- Spec seguido: sim. As mudanças permaneceram no escopo: DevContainer,
  `.git/info/exclude`, templates de issue, branch `bleeding` local.
- Mudanças fora de escopo: nenhuma mudança em `src/`; `package.json` e
  `package-lock.json` aparecem no working tree, mas não pertencem a esta slice
  e não foram incluídos como evidência/aprovação deste review.

## Critérios de aceite
| Critério | Resultado | Evidência |
|---|---|---|
| `.devcontainer/devcontainer.json` aponta para Node 22 LTS (`"version": "22"`). | PASS | `grep -n '"version": "22"' .devcontainer/devcontainer.json` retornou linha 5; JSON válido via `python3 -m json.tool`. |
| `.git/info/exclude` local contém `documentacao/`, `harness/`, `AGENTS.md`, `CLAUDE.md` — nenhum desses aparece em `git status`. | PASS | `policy_check` retornou `PASS policy_check: caminhos proibidos ocultos pelo exclude local`. |
| Templates de issue publicados em `.github/ISSUE_TEMPLATE/` com checklists DoR e DoD conforme §6 do guia. | PASS | Arquivos criados: `.github/ISSUE_TEMPLATE/feature_request.md` e `.github/ISSUE_TEMPLATE/bug_report.md`, ambos com seções DoR/DoD. |
| Branch `bleeding` criada (local e remote `origin/bleeding`). | PASS | Branch local ativa e `git push -u origin bleeding` executado com sucesso; PR #1 criado. |
| Nenhum arquivo de `documentacao/` ou `harness/` commitado. | PASS | Esses caminhos estão ocultos por `.git/info/exclude` e não aparecem em `git status --short --untracked-files=all`. |

## Deterministic gates
| Gate | Resultado | Evidência |
|---|---|---|
| `schema_validation` | PASS | `python3 -m json.tool .devcontainer/devcontainer.json >/dev/null` executado com sucesso. |
| `config_review` | PASS | `grep -n '"version": "22"' .devcontainer/devcontainer.json` retornou `5:      "version": "22"`. |
| `policy_check` | PASS | `git status --short --untracked-files=all` não lista `documentacao/`, `harness/`, `AGENTS.md`, `CLAUDE.md`. |

## Achados
| Severidade | Achado | Ação requerida |
|---|---|---|
| Baixa | `package.json` e `package-lock.json` estão no working tree, mas não fazem parte desta slice. | Não incluir no commit/PR desta slice. |

## Próximo passo
- Revisar PR #1 e, se aprovado, rodar o Prompt 05 — Encerrar & Handoff.
