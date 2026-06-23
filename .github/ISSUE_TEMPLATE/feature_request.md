---
name: Feature request
description: Planejar uma mudança rastreável ao roadmap do projeto
title: "feat: "
labels: []
assignees: []
---

## Contexto
Descreva a mudança e indique a fase/tarefa do roadmap que ela atende.

## Escopo
### Incluído
-

### Fora de escopo
-

## Invariantes a preservar
- [ ] Contrato da API RealWorld preservado (`Authorization: Token <jwt>`, envelopes e paths existentes).
- [ ] Tema claro Conduit visualmente preservado quando a mudança tocar UI.
- [ ] Nenhuma mudança de arquitetura/design system fora do autorizado sem issue `needs-decision`.

## Definition of Ready (DoR)
- [ ] Escopo descrito e rastreável a uma tarefa de `documentacao/GUIA-DE-REFATORACAO.md` §4/§5.
- [ ] Critérios de aceite explícitos.
- [ ] Invariantes que não podem ser tocados estão listados.
- [ ] Pontos de permissão identificados e, se houver, já decididos.
- [ ] Plano de teste definido (contrato/integração/E2E/mutação, conforme aplicável).

## Critérios de aceite
- [ ]

## Plano de verificação
- [ ] Build/lint/typecheck aplicáveis executados.
- [ ] Testes relevantes executados.
- [ ] Evidência registrada na work unit.

## Definition of Done (DoD)
- [ ] Código atende aos critérios de aceite, sem mudanças não autorizadas de design/arquitetura.
- [ ] Testes de contrato verdes quando houver impacto no contrato/API.
- [ ] E2E Playwright relevantes verdes quando houver impacto funcional/UI.
- [ ] Cobertura de mutação dentro da meta quando aplicável.
- [ ] Commits em Conventional Commits referenciando esta issue.
- [ ] Tema claro visualmente inalterado quando aplicável.
- [ ] Prompts/skills registrados conforme `documentacao/GUIA-DE-REFATORACAO.md` §17.
- [ ] Riscos residuais documentados.
