# Definition of Done (DoD)

Consolida os criterios de conclusao ja praticados no projeto. Fontes originais:
`docs/agent/context/CHARTER.md` (secao "Definition of Done") e
`docs/agent/OPERATING-GUIDE.md` (secao "Definition of Done").

## Criterios de saida

Uma slice so e considerada "Done" quando:

1. **Build verde**: `npm run build` (app-ng) sem erros.
2. **Testes verdes** nos niveis aplicaveis:
   - unit (Vitest, `app-ng`)
   - contract (`npm run test:contract`)
   - e2e (`npx playwright test`)
3. **Gates deterministicos** do PLAN atendidos (build/unit/contract/e2e/secret_scan/config_review).
4. **Sem segredos** commitados (secret_scan limpo).
5. **CI verde** no PR (workflow `.github/workflows/ci.yml`).
6. **Documentacao** atualizada: `PROGRESS.md`/`EVIDENCE.md` da slice e, quando relevante, `STATE.md`.
7. **Rastreabilidade**: PR referencia a issue correspondente (ex.: `Closes #<n>`).
8. **Conventional Commits** no historico da slice.
9. **Revisao humana** concluida quando a categoria de risco exigir.

## Checklist rapido

- [ ] build + unit + contract + e2e verdes (evidencia capturada)
- [ ] gates do PLAN atendidos
- [ ] secret_scan limpo
- [ ] CI verde no PR
- [ ] docs da slice atualizadas
- [ ] PR referencia a issue (`Closes #<n>`)
- [ ] commits no padrao Conventional Commits
