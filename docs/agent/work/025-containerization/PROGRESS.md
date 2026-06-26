# PROGRESS - 025-containerization

State: EVALUATING

## Issue
#33

## Itens entregues
- `api/Dockerfile`: multi-stage **Gradle/JDK 25** (`bootJar -x test`) -> `eclipse-temurin:25-jre`,
  usuario nao-root, `java -jar app.jar`, EXPOSE 8080.
- `app-ng/Dockerfile`: build **node:22** (`npm ci` + `npm run build`) -> **nginx:alpine** servindo
  `dist/app-ng/browser` + `nginx.conf` (SPA fallback + proxy `/api` -> `api:8080`).
- `docker-compose.yml`: `db` (Postgres 16, healthcheck pg_isready) + `api` (datasource via env,
  healthcheck TCP 8080, depends_on db healthy) + `web` (nginx, host :8080 -> 80).
- `.dockerignore` (api e app-ng), `app-ng/nginx.conf`.
- README: secao "Running the full stack with Docker".

## Validacao real (Docker 29.5.3 / Compose v5.1.4)
| Passo | Resultado |
|---|---|
| `docker compose config` | valido |
| `docker compose build` | **api + web Built** (Gradle BUILD SUCCESSFUL; npm build OK) |
| `docker compose up -d` | db **healthy**, api **healthy**, web **Up** |
| GET `:8080/` (web) | **200** + `<title>Conduit</title>` + `<app-root>` |
| GET `:8080/login` (SPA fallback) | **200** (index.html) |
| GET `:8080/api/articles` (proxy nginx -> api) | **401** (Spring Security do backend) |
| GET `:8081/api/articles` (api direto) | **401** (identico -> proxy correto) |
| Startup logs | "Starting ConduitBackendApiApplication ... Java 25.0.3"; HikariPool; Postgres ready |
| `docker compose down -v` | containers/rede/volume removidos |

> O **401** prova o roteamento: a request atravessa nginx -> `api:8080` e o Spring Security
> responde (backend skeleton, sem endpoints). Falha de proxy daria 502/504, nao 401.

## Notas / decisoes
- Sem actuator no backend -> healthcheck por **TCP 8080** (eclipse-temurin tem bash/`/dev/tcp`).
- `bootJar -x test`: testes do backend rodam no **CI** (exigem Postgres); imagem fica self-contained.
- Portas: web `:8080` (app), api `:8081` (debug/smoke direto), db interno.
- CI **nao** roda compose nesta slice (decisao #6 pendente); validacao real feita localmente.
  Integration test automatizado contra a stack fica na slice **025a**.
