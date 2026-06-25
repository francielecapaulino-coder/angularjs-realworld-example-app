# PLAN - 019-governance

## Status
State: IMPLEMENTING

## Objetivo
Resolver as pendencias de governanca rapida da auditoria (`docs/audit-report.md`):
itens #6, #7, #10, #22 (estrutura), #23. Numa unica slice.

## Escopo
- Incluido:
  - Reabilitar GitHub Issues (`gh repo edit --enable-issues`) + validar templates (#6).
  - `docs/process/DEFINITION-OF-READY.md` e `DEFINITION-OF-DONE.md` (#7).
  - `docs/process/CODA-WORKFLOW.md` registrando o uso do CODA (#10).
  - `docs/process/SKILLS.md` documentando as skills disponiveis (#23).
  - `docs/prompts/` (README + TEMPLATE + 019-governance.md), com nota de lacuna
    retroativa para slices 002-018 (#22 parcial).
  - Atualizar `docs/audit-report.md` com os itens resolvidos.
- Fora de escopo:
  - Criar issues retroativas das slices passadas.
  - Adotar `Closes #X` (item #8) - sera aplicado nas proximas slices.
  - Features de frontend (#2, #3), mutation testing (#13), backend/infra.

## Operational path & risk
- risk_category: B  # docs + 1 mudanca de settings autorizada pelo usuario.
- human_review: optional

## Gates
- config_review: Issues habilitadas (`hasIssuesEnabled: true`); docs criados.
- secret_scan: sem segredos.
- encoding_check: sem caracteres U+FFFD nos arquivos novos/editados.

## Pendencias
- #8 (rastreabilidade issue->commit) depende de criar issues e usar `Closes #X`
  nas proximas slices.
