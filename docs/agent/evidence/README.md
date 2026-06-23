# Evidências de Testes e Critérios de Aceite

Pasta consolidada para evidenciar, por slice, quais verificações foram executadas
e quais critérios de aceite foram aprovados.

## Convenções
- `PASS`: verificado por gate determinístico, review ou evidência registrada.
- `APPROVED`: aprovado por reviewer/security_reviewer quando aplicável.
- `human_review: required`: aprovação humana ainda necessária antes de merge para
  slices Categoria C/D.
- Mudanças locais fora de escopo (`package.json` e `package-lock.json`) não são
  evidência válida de nenhuma slice listada aqui.

## Índice
| Slice | Fase | Estado | Evidência |
|---|---|---|---|
| `001-fundacao` | 1 — Fundação | READY / merged | `docs/agent/evidence/001-fundacao.md` |
| `002-realworld-openapi` | 2 — Rede de segurança | REVIEWING / security approved | `docs/agent/evidence/002-realworld-openapi.md` |

## Fontes primárias
- `docs/agent/work/<slug>/PLAN.md`
- `docs/agent/work/<slug>/PROGRESS.md`
- `docs/agent/work/<slug>/REVIEW.md`
- PRs associados, quando houver.
