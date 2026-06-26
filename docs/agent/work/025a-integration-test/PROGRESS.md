# PROGRESS - 025a-integration-test

State: EVALUATING

## Issue
#35

## Itens entregues
- `scripts/run-integration.sh`: `docker compose up -d --build` -> espera api **healthy** +
  web **200** -> roda Playwright (config de integracao) -> **trap EXIT** sempre faz `down -v`.
- `playwright.integration.config.js`: `testDir ./tests/integration`, `baseURL :8080`, **sem webServer**.
- `tests/integration/realstack.spec.js`: 5 testes reais (sem mocks):
  - API direta (`:8081/api/articles`) -> 401 (backend real vivo).
  - mesma chamada via nginx (`:8080/api/articles`) -> 401 (proxy real comprovado).
  - app real (servido pelo nginx): home renderiza; navbar/Sign in/Sign up; roteamento `/login`.
- `package.json`: script `test:integration`.
- README: secao "Real integration test" + distincao das 3 camadas.

## Validacao real (Docker 29.5.3 / Compose v5.1.4, Node 22)
| Passo | Resultado |
|---|---|
| `npm run test:integration` | stack up (db/api healthy, web 200) -> **5 passed (2.6s)** -> `down -v` (trap) |
| stack pos-run | nenhum container/rede/volume remanescente |
| e2e mockado (regressao) | **39 passed** (suites isoladas: tests/e2e vs tests/integration) |
| encoding_check | 0 U+FFFD |

## Distincao (porque 025a != contract != e2e)
- contract (tests/contract): estatico vs OpenAPI + LIVE publica; NAO usa este backend.
- e2e (tests/e2e): `page.route` mocka a rede; nunca bate em backend real.
- integration (tests/integration): **stack REAL** (web+api+db do compose), sem mocks.

## Notas
- Backend skeleton -> `/api/*` = 401; testes afirmam o "wiring" real. Crescem com o backend
  (register/login/article) quando houver endpoints.
- CI **nao** roda o compose nesta slice (decisao #6 pendente). Harness pronto para virar job dedicado.
- Requer Node >= 18 no PATH (nvm use 22) para o Playwright; o shell base pode ter Node antigo.
