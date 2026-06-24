# PLAN — 003-contract-tests

## Status
State: PLANNED

## Objetivo
Implementar testes de contrato que validam, de forma determinística e sem
credenciais reais, que a API `conduit.productionready.io` respeita o contrato
documentado em `docs/api/realworld-openapi.yaml`: métodos, paths, header de
autenticação `Authorization: Token <jwt>` e envelopes de response.

## Escopo
- Incluído:
  - Adicionar `jest` e `js-yaml` como `devDependencies` em `package.json`.
  - Adicionar script `"test:contract"` em `package.json`.
  - Criar `tests/contract/api.contract.test.js` com suíte Jest cobrindo:
    - Endpoints públicos (GET /tags, GET /articles): status 200 e envelope correto.
    - Endpoints protegidos sem token (GET /user, GET /articles/feed): status 401.
    - Verificação negativa de scheme: confirmar que nenhum teste usa `Bearer`.
    - Validação estrutural de envelope: `{ tags }`, `{ articles, articlesCount }`.
  - Criar `.gitignore` local para `node_modules/` (se não existir / já coberto).
  - Registrar evidências em `docs/agent/work/003-contract-tests/PROGRESS.md`.
  - Atualizar `docs/agent/STATE.md` ao final.
- Fora de escopo:
  - Login com credenciais reais / fluxos autenticados com token real.
  - E2E Playwright (próxima slice — 004).
  - Cobertura de todos os 19 endpoints (apenas amostra representativa por
    categoria: pública, protegida, envelope).
  - Migração Angular 21.
  - Alterações em `src/`.
- files_owned:
  - `package.json`
  - `tests/contract/api.contract.test.js`
  - `docs/agent/work/003-contract-tests/PLAN.md`
  - `docs/agent/work/003-contract-tests/PROGRESS.md`
  - `docs/agent/work/003-contract-tests/REVIEW.md`
  - `docs/agent/STATE.md`

## Origem e fase
- Fase (ROADMAP): 2 — Rede de segurança
- Documento/bloco de origem: `docs/agent/context/ROADMAP.md` Fase 2 §critério
  "Testes de contrato verdes contra a API conduit.productionready.io"; STATE.md briefing.
- context_sources:
  - skills: []
  - design: null
  - docs:
    - `docs/api/realworld-openapi.yaml`
    - `docs/agent/context/CHARTER.md`
    - `docs/agent/context/ROADMAP.md`
    - `docs/agent/context/SOURCES.md`
- affects_design_system_core: false

## Dados, segurança e compliance
- Dados envolvidos: chamadas HTTP a endpoint público sem credencial real.
  Respostas de API pública são dados públicos; nenhum dado pessoal real
  é enviado ou armazenado.
- Credenciais: nenhuma credencial real nos testes. Testes de 401 enviam
  requisições sem token ou com token fictício `fake-jwt-token-test-only`.
- Auditoria/log: n/a — testes locais/CI.
- Revisão humana: required, por impacto em `package.json` (dependências
  novas) e integração com API externa.

## Tooling e dependências propostas
| Pacote | Versão | Papel |
|---|---|---|
| `jest` | `^29` | Test runner; compatível com Node 18+ e plano futuro Angular 21 |
| `js-yaml` | `^4` | Parse do `realworld-openapi.yaml` para validação estrutural |

> Justificativa: `jest` está previsto no CHARTER como runner alvo da Fase 3;
> `js-yaml` é leve, sem peer deps e já usada implicitamente pela cadeia de
> validação YAML anterior (Python/Ruby local). Nenhuma dependência de build
> Angular ou Gulp é adicionada.

## Endpoints cobertos pelos testes
| Endpoint | Método | Tipo | O que valida |
|---|---|---|---|
| `/tags` | GET | público | status 200, envelope `{ tags: [] }` |
| `/articles` | GET | público | status 200, envelope `{ articles, articlesCount }` |
| `/user` | GET | protegido | status 401 sem token |
| `/articles/feed` | GET | protegido | status 401 sem token |
| Schema check | — | estático | todos os paths do PLAN existem no OpenAPI |
| Scheme check | — | estático | nenhuma referência `Bearer` no OpenAPI |

## Critérios de aceite
- [ ] `npm run test:contract` executa e retorna exit 0.
- [ ] GET /tags retorna 200 com `{ tags: Array }`.
- [ ] GET /articles retorna 200 com `{ articles: Array, articlesCount: Number }`.
- [ ] GET /user sem token retorna 401.
- [ ] GET /articles/feed sem token retorna 401.
- [ ] Nenhum teste usa token real, credencial real ou dado pessoal.
- [ ] `package.json` atualizado com `jest`, `js-yaml` e script `test:contract`.
- [ ] Evidência registrada em `PROGRESS.md` e `REVIEW.md`.

## Operational path & risk
- risk_category: B  # toca package.json e integra API externa sem cruzar
                    # fronteira de auth (nenhum token real armazenado ou
                    # transmitido nos testes de validação de estrutura).
- operational_path: standard_path_B

## Model Profile
```yaml
risk_category: B
planner:   { tier: standard, effort: medium }
generator: { tier: standard, effort: high }
evaluator: { tier: standard, effort: medium }
reviewer:  { tier: standard, effort: medium }
deterministic_gates: [unit_tests, contract_tests, secret_scan, config_review]
human_review: required
budget_max_usd: 1.00
rationale: |
  Categoria B: adiciona dependências de teste (package.json) e chama API
  externa pública sem usar credenciais reais. Testes de 401 enviam apenas
  requisição sem header — sem token real. Nenhum código de produção em src/
  é alterado.
```

## Deterministic gates (a rodar antes de READY)
- unit_tests / contract_tests: `npm run test:contract` verde (exit 0).
- secret_scan: `grep -rn "Token\s\+[A-Za-z0-9]\{20\}" tests/` — nenhum token
  real. Confirmar apenas tokens fictícios.
- config_review: confirmar que `package.json` lista apenas `jest` e `js-yaml`
  como novas devDeps; confirmar que `package-lock.json` é atualizado de forma
  limpa; confirmar que `src/` não foi alterado.

## Condições de parada
- Se `conduit.productionready.io` estiver fora do ar, registrar no PROGRESS.md
  e aguardar aprovação para usar mock/stub em substituição.
- Se os testes exigirem credenciais reais para qualquer endpoint público,
  parar e reclassificar para Categoria C.
- Se for necessário instalar pacotes além de `jest` e `js-yaml`, parar e
  pedir aprovação.

## Riscos e pendências
- A API pública `conduit.productionready.io` pode estar temporariamente
  indisponível ou ter comportamento diferente do documentado.
- Resposta de 401 vs 403 para endpoints protegidos sem token pode variar;
  o teste deve aceitar ambos (or validar o que o OpenAPI documenta).
- **Pendência: aprovação do plano pelo usuário antes de implementar.**
