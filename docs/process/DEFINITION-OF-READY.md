# Definition of Ready (DoR)

A unidade de trabalho (slice) so entra em execucao quando TODOS os criterios abaixo
estao satisfeitos. A DoR complementa a Definition of Done (ver `DEFINITION-OF-DONE.md`).

## Criterios de entrada

1. **Issue criada** no GitHub, com titulo em Conventional Commits (ex.: `feat: dark mode toggle`).
2. **Objetivo claro**: uma frase descrevendo o resultado esperado e o "por que".
3. **Escopo delimitado**: o que esta dentro e o que esta fora da slice.
4. **Criterios de aceitacao** verificaveis (preferencialmente testaveis).
5. **Categoria de risco** atribuida (A/B/C) e necessidade de revisao humana definida.
6. **Plano** registrado em `docs/agent/work/<slice>/PLAN.md` (gates deterministicos previstos).
7. **Dependencias** identificadas (outras slices, libs, settings, secrets).
8. **Sem ambiguidade bloqueante**: duvidas relevantes foram esclarecidas antes de iniciar.

## Checklist rapido

- [ ] Issue aberta e referenciavel (`#<n>`)
- [ ] Objetivo + escopo (in/out) escritos
- [ ] Criterios de aceitacao definidos
- [ ] Risco classificado (A/B/C) + revisao humana decidida
- [ ] PLAN.md criado com gates
- [ ] Dependencias mapeadas
