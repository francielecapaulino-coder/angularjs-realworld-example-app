# PROGRESS — 014-decommission-legacy

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/014-decommission-legacy/PLAN.md` criado |
| 2026-06-24 | builder | EVALUATING | legado arquivado em `legacy/`; package.json/README/.gitignore limpos; gates verdes |

## Decisões
- Categoria C (Fase 4): app-ng vira a aplicação oficial; AngularJS legado **arquivado** (decisão do usuário, não apagado).
- `git mv src → legacy/src` e `gulpfile.js → legacy/gulpfile.js` (preserva histórico).
- `legacy/README.md` adicionado (aviso: desativado, referência histórica).
- `package.json` raiz: deps/scripts legados removidos; `build`/`serve` apontam p/ app-ng;
  `test:unit`/`test:contract`/`test:e2e` + `pretest:e2e` (garante build).
- README raiz reescrito para o fluxo do app-ng. `.gitignore` repontado p/ `legacy/...`.
- Comentários "mirrors legacy src/js/..." no app-ng mantidos (documentais, não funcionais).

## Conformidade com PLAN
| Item | Estado |
|---|---|
| Arquivar src/ e gulpfile.js em legacy/ | ✓ (git mv) |
| legacy/README.md de aviso | ✓ |
| package.json sem deps/scripts legados | ✓ (grep limpo) |
| build/serve apontam p/ app-ng | ✓ |
| README atualizado (sem gulp/browserify) | ✓ |
| Redes de segurança verdes pós-corte | ✓ (contract/unit/E2E) |

## Arquivos alterados
- `src/` → `legacy/src/` (movido, 66 arquivos)
- `gulpfile.js` → `legacy/gulpfile.js` (movido)
- `legacy/README.md` (novo)
- `package.json` (raiz — limpo e repontado p/ app-ng)
- `README.md` (reescrito p/ Angular 21)
- `.gitignore` (caminho do template legado → legacy/)

## Comandos e resultados
| Comando | Resultado |
|---|---|
| `npm run test:contract` | PASS — `contract_tests`: jest 11/11 (API/OpenAPI) |
| `cd app-ng && npm run build` | PASS — `build` verde |
| `cd app-ng && CI=true npm test` | PASS — `unit_tests`: vitest 89/89 (22 arquivos) |
| `npx playwright test` | PASS — `e2e_tests`: 26/26 servindo o app-ng |
| `grep` package.json | PASS — `config_review`: sem gulp/browserify/angular legado; build/serve → app-ng |
| `ls` legacy/ vs raiz | PASS — `config_review`: src/ e gulpfile arquivados; raiz limpa |
| `git grep` segredos | PASS — `secret_scan`: nenhum |

## Riscos residuais / pendências
- Legado preservado em `legacy/` (não buildado/servido/testado); recuperável e rastreável.
- `test:e2e` depende do build do app-ng → coberto por `pretest:e2e`.
- Deploy/hosting real fica para infraestrutura (fora do escopo).
- Requer revisão humana + security_reviewer antes de merge (Categoria C — mudança de entrega).
