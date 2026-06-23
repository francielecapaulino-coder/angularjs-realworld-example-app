---
name: Bug report
description: Registrar um defeito com reprodução, impacto e verificação
title: "fix: "
labels: []
assignees: []
---

## Resumo
Descreva o defeito observado em uma frase.

## Ambiente
- Branch/commit:
- Navegador/versão:
- Node/devcontainer:
- API alvo:

## Passos para reproduzir
1.
2.
3.

## Resultado atual

## Resultado esperado

## Impacto
- Usuários afetados:
- Fluxos afetados:
- Risco de regressão:

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
- [ ] Defeito reproduzido antes da correção ou evidência equivalente registrada.
- [ ] Correção implementada sem ampliar o escopo.
- [ ] Caminho feliz e pelo menos um caminho de erro verificados quando aplicável.

## Definition of Done (DoD)
- [ ] Código atende aos critérios de aceite, sem mudanças não autorizadas de design/arquitetura.
- [ ] Testes de contrato verdes quando houver impacto no contrato/API.
- [ ] E2E Playwright relevantes verdes quando houver impacto funcional/UI.
- [ ] Cobertura de mutação dentro da meta quando aplicável.
- [ ] Commits em Conventional Commits referenciando esta issue.
- [ ] Tema claro visualmente inalterado quando aplicável.
- [ ] Prompts/skills registrados conforme `documentacao/GUIA-DE-REFATORACAO.md` §17.
- [ ] Riscos residuais documentados.
