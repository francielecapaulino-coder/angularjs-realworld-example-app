# PLAN — 014-decommission-legacy

## Status
State: PLANNED

## Objetivo
Descomissionar o app AngularJS 1.5 legado agora que todas as telas foram migradas
para o Angular 21 (`app-ng/`) e a suite E2E valida o app novo. Remover `src/` legado,
`gulpfile.js` e a toolchain/deps legadas do `package.json` raiz; repontar os scripts
para o `app-ng`; atualizar o README. As redes de segurança (contract, unit, E2E)
permanecem verdes como gate do corte.

## Escopo
- Decisão do usuário: **ARQUIVAR** o legado (mover para `legacy/`) em vez de apagar.
- Incluído:
  - **Arquivar** o app AngularJS legado: mover `src/` → `legacy/src/` e `gulpfile.js`
    → `legacy/gulpfile.js` (via `git mv`, preservando histórico). Adicionar `legacy/README.md`
    explicando que o conteúdo está desativado (apenas referência histórica).
  - `package.json` (raiz):
    - Remover deps legadas: `angular`, `angular-ui-router`, `babel-preset-es2015`,
      `babelify`, `browserify`, `browserify-ngannotate`, `gulp*`, `vinyl-source-stream`,
      `merge-stream`, `marked@0.3.5`, `browser-sync`.
    - Scripts: remover `build` (gulp) e `serve:build` (build legado);
      adicionar `build` → delega ao `app-ng` (`cd app-ng && npm ci && npm run build`),
      `serve` → SPA do app-ng (`serve -s app-ng/dist/app-ng/browser -l 4100 --no-clipboard`);
      manter `test:contract` (jest/API) e `test:e2e` (playwright→app-ng);
      adicionar `pretest:e2e` que garante o build do app-ng.
    - Manter devDeps usadas: `@playwright/test`, `jest`, `js-yaml`, `serve`.
  - `README.md`: atualizar para o fluxo do app-ng (build/serve/test); remover instruções gulp/browserify.
  - Confirmar que `playwright.config.js` (já aponta p/ app-ng) e os contract tests seguem válidos.
- Fora de escopo:
  - Alterar o código do `app-ng` (apenas remoção do legado + infra de build/scripts/README).
  - Alterar o contrato OpenAPI ou os contract tests (apenas mantê-los verdes).
  - Pipeline de deploy/hosting real (fica para infraestrutura, se aplicável).
- files_owned:
  - `src/**` → `legacy/src/**` (mover), `gulpfile.js` → `legacy/gulpfile.js` (mover)
  - `legacy/README.md` (novo — aviso de arquivamento)
  - `package.json` (raiz), `README.md`
  - `docs/agent/work/014-decommission-legacy/{PLAN,PROGRESS,REVIEW}.md`
  - `docs/agent/STATE.md`

## Origem e fase
- Fase (ROADMAP): 4 — Corte/validação E2E → descomissionamento.
- Decisões: `docs/adr/ADR-001-...md` (app-ng como aplicação oficial, SPA estático).
- context_sources:
  - `package.json` (scripts/deps legados), `gulpfile.js`, `src/` (app legado)
  - `tests/contract/api.contract.test.js` (valida a API/OpenAPI — independente do app)
  - `playwright.config.js` (serve o app-ng), `app-ng/` (app oficial)

## Dados, segurança e compliance
- Dados: nenhum dado sensível; remoção de código legado.
- Segurança:
  - Garantir que nenhuma referência ao app legado permaneça em scripts/CI.
  - O app-ng mantém todas as invariantes (interceptor Token, guards, sanitização).
  - Nenhuma credencial/segredo real.
- Revisão humana: required (Categoria C — mudança de entrega irreversível; remove o app legado).

## Operational path & risk
- risk_category: C  # remoção irreversível do app legado / mudança da aplicação oficial.
- operational_path: strict_path_C_D

## Model Profile
```yaml
risk_category: C
planner:           { tier: deep,     effort: high }
generator:         { tier: deep,     effort: high }
evaluator:         { tier: deep,     effort: high }
reviewer:          { tier: standard, effort: medium }
security_reviewer: { tier: deep,     effort: high }
deterministic_gates: [build, unit_tests, e2e_tests, contract_tests, secret_scan, config_review]
human_review: required
cross_family_evaluator: true
budget_max_usd: 3.00
rationale: |
  Categoria C: remover o app legado e repontar a entrega para o app-ng é irreversível
  no working tree (recuperável só via histórico git). As redes de segurança (contract,
  unit, E2E) precisam permanecer verdes pós-corte como prova de que o app-ng cobre o
  comportamento esperado. security_reviewer + gates + human_review.
```

## Deterministic gates (a rodar antes de READY)
- build: `cd app-ng && npm run build` verde (app oficial).
- unit_tests: `cd app-ng && CI=true npm test` verde (89/89).
- e2e_tests: `npm run test:e2e` verde (26/26) servindo o app-ng.
- contract_tests: `npm run test:contract` verde (API/OpenAPI — não depende do legado).
- secret_scan: nenhum segredo real.
- config_review:
  - `src/` legado e `gulpfile.js` removidos;
  - `package.json` sem deps/scripts legados; `build`/`serve` apontam p/ app-ng;
  - README sem instruções gulp/browserify; nenhuma referência pendente ao app legado.

## Condições de parada
- Se algum gate (contract/unit/E2E) ficar vermelho após a remoção, PARAR e investigar
  (indica cobertura faltante no app-ng — não prosseguir com o corte).
- Se algo no `app-ng` precisar mudar para os gates passarem, PARAR e reclassificar
  (esta slice é remoção/infra, não alteração do app).
- Se houver dúvida sobre apagar vs. arquivar `src/`, confirmar com o usuário.

## Riscos e pendências
- Remoção é irreversível no working tree (recuperável via histórico git/branch).
- `test:e2e` exige build do app-ng; `pretest:e2e` mitiga isso.
- Possíveis referências residuais ao legado (README, devcontainer, .gitignore `build/`).
- **Decisão pendente:** apagar `src/` definitivamente (recuperável via git) — confirmar no plano.
- **Pendência: aprovação do plano pelo usuário antes de implementar.**
