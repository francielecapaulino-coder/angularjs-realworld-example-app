# REVIEW — 004-e2e-playwright

## Veredito
Result: PASS

## Checagem de escopo
- Spec seguido: sim. Arquivos dentro dos `files_owned`. `src/` não alterado.
- Mudanças fora de escopo: nenhuma. Apenas `package.json`, `package-lock.json`,
  `playwright.config.js`, `tests/e2e/`, `.gitignore` e docs da slice.

## Critérios de aceite
| Critério | Resultado | Evidência |
|---|---|---|
| `npm run test:e2e` retorna exit 0 (todos passam). | PASS | 18/18 testes verdes. |
| Todos os fluxos principais têm teste verde. | PASS | home, login, registro, abrir artigo, criar artigo, favoritar, seguir. |
| Nenhum teste usa credencial/token/dado real. | PASS | secret_scan PASS; token `fake-jwt-token-e2e-test-only`. |
| `playwright.config.js` com webServer porta 4100. | PASS | serve estático de `./build` na 4100. |
| Branch `failing-e2e` com teste falhando. | PASS | criada a partir desta branch (ver PROGRESS). |
| Branch `passing-e2e` com todos verdes. | PASS | criada a partir desta branch. |
| `src/` não alterado. | PASS | `git diff --name-only HEAD -- src/` vazio. |
| `npm run test:contract` ainda verde. | PASS | 11/11 sem regressão. |

## Deterministic gates
| Gate | Resultado | Evidência |
|---|---|---|
| `playwright_tests` | PASS | `npm run test:e2e` — 18/18 verdes. |
| `contract_tests` | PASS | `npm run test:contract` — 11/11 verdes (não-regressão). |
| `negative_tests` | PASS | branch `failing-e2e` falha de forma controlada; `passing-e2e` verde. |
| `secret_scan` | PASS | nenhum JWT/chave/Bearer real em tests/e2e + playwright.config.js. |
| `config_review` | PASS | src/ inalterado; apenas @playwright/test + serve adicionados. |

## Achados
| Severidade | Achado | Ação requerida |
|---|---|---|
| Média | Bug legado em `article-actions` (acesso a binding no construtor) impede follow/favorite quando autenticado. | Documentado como baseline; corrigir na migração Angular 21 e atualizar o teste de baseline. |
| Baixa | `@playwright/test` exige Node >=18; Node local 10 não roda. | Rodar no DevContainer (Node 22) ou via nvm. Documentado. |
| Baixa | Header não reativo (`$scope.$watch` quebrado). | Comportamento atual capturado em teste; migração deve corrigir. |
| Informativo | API real inacessível; testes usam mock via `page.route()`. | Torna os testes determinísticos; sem dependência de rede. |

## Próximo passo
- Merge após revisão humana.
- Com isso, a Fase 2 (rede de segurança) fica completa: OpenAPI + testes de
  contrato + E2E + branches failing/passing. Habilita início da Fase 3 (migração).

## Revisão (reviewer / security_reviewer)
- Tipo: functional + security
- Veredito: APPROVED
- Pontos verificados: nenhuma credencial real; token fictício; auth simulada via
  mock; src/ preservado; fluxos principais cobertos; bug legado documentado como
  baseline em vez de mascarado.
- human_review: required
