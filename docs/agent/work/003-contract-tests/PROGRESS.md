# PROGRESS — 003-contract-tests

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/003-contract-tests/PLAN.md` criado |
| 2026-06-24 | builder | EVALUATING | `tests/contract/api.contract.test.js` criado; `package.json` atualizado; 11 testes PASS |

## Decisões
- `jest@^29` → `jest@^27` (Node local v10.24.1 não suporta jest 28+; jest 27 suporta Node >=10.13).
- `js-yaml@^4` → `js-yaml@^3` (js-yaml 4 requer Node >=12; v3 suporta Node >=10).
- `conduit.productionready.io` indisponível (HTTP 530, 2026-06-24) → substituído por
  `node-express-conduit.appspot.com`, que implementa o mesmo contrato RealWorld e
  respondeu corretamente a todos os endpoints testados.
- Abordagem híbrida aprovada pelo usuário: testes estáticos (validação do OpenAPI YAML)
  + testes de rede ao vivo contra endpoint alternativo disponível.
- Token fictício `fake-jwt-token-test-only` usado explicitamente e identificado em comentário.
- Nenhuma credencial real usada em nenhum teste.

## Arquivos alterados
- `package.json` (scripts + devDependencies)
- `tests/contract/api.contract.test.js` (novo)
- `package-lock.json` (atualizado por npm)
- `docs/agent/work/003-contract-tests/PLAN.md`
- `docs/agent/work/003-contract-tests/PROGRESS.md`
- `docs/agent/work/003-contract-tests/REVIEW.md`
- `docs/agent/STATE.md`

## Comandos e resultados
| Comando | Resultado |
|---|---|
| `npm install --save-dev jest@^27 js-yaml@^3` | PASS — jest@27.5.1 e js-yaml@3.14.2 instalados |
| `npm run test:contract` | PASS — 11/11 testes verdes (4.2 s) |
| `secret_scan` refinado (JWT real, chave AWS, Bearer real) | PASS — nenhum segredo real nos testes |
| `config_review` — src/ inalterado | PASS — nenhum arquivo em src/ alterado |
| `config_review` — package.json limpo | PASS — apenas jest e js-yaml adicionados; script test:contract presente |

## Resultados detalhados dos testes
```
PASS tests/contract/api.contract.test.js
  Contract — Static: OpenAPI spec structure
    ✓ spec file exists and is valid YAML/OpenAPI 3
    ✓ all required paths and methods are present in the spec
    ✓ security scheme uses "Token" (not "Bearer")
    ✓ main response envelopes are defined as schemas
    ✓ protected endpoints declare 401 response
    ✓ no real secrets in spec examples (no real JWT pattern)
  Contract — Live API: node-express-conduit.appspot.com
    ✓ GET /tags returns 200 with { tags: Array }
    ✓ GET /articles returns 200 with { articles: Array, articlesCount: Number }
    ✓ GET /user without token returns 401
    ✓ GET /articles/feed without token returns 401
    ✓ GET /user with fictitious token returns 401 (not 500)
Tests: 11 passed, 11 total — Time: 4.231 s
```

## Riscos residuais / pendências
- `conduit.productionready.io` segue inacessível; os testes de rede usam
  `node-express-conduit.appspot.com` como substituto temporário.
- Versões downgrade de jest (^27) e js-yaml (^3) para compatibilidade com Node 10 local;
  no DevContainer (Node 22) `jest@^29` seria o alvo original.
- Requer revisão humana antes de merge.
