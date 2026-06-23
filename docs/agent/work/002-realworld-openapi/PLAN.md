# PLAN — 002-realworld-openapi

## Status
State: READY

## Objetivo
Documentar em OpenAPI 3 o contrato RealWorld consumido pelo app AngularJS atual,
servindo como fonte para testes de contrato da Fase 2 e rede de segurança antes
da migração Angular 21.

## Escopo
- Incluído:
  - Criar `docs/api/realworld-openapi.yaml` com os endpoints RealWorld
    consumidos pelo app atual.
  - Cobrir auth/users, profiles, articles, comments, favorites e tags.
  - Preservar explicitamente o esquema `Authorization: Token <jwt>`.
  - Documentar envelopes principais de request/response: `{ user }`,
    `{ article }`, `{ articles }`, `{ comment }`, `{ comments }`, `{ profile }`,
    `{ tags }`.
  - Registrar a nova fonte em `docs/agent/context/SOURCES.md`.
  - Registrar evidências em `docs/agent/work/002-realworld-openapi/PROGRESS.md`
    e avaliação futura em `REVIEW.md`.
- Fora de escopo:
  - Testes de contrato executáveis.
  - E2E Playwright.
  - Alterações em `src/`.
  - Alterações em `package.json` ou `package-lock.json`.
  - Mudança da URL base consumida pelo app (`https://conduit.productionready.io/api`).
  - Migração Angular 21.
- files_owned:
  - `docs/api/realworld-openapi.yaml`
  - `docs/agent/context/SOURCES.md`
  - `docs/agent/work/002-realworld-openapi/PLAN.md`
  - `docs/agent/work/002-realworld-openapi/PROGRESS.md`
  - `docs/agent/work/002-realworld-openapi/REVIEW.md`
  - `docs/agent/STATE.md`

## Origem e fase
- Fase (ROADMAP): 2 — Rede de segurança
- Documento/bloco de origem: `documentacao/GUIA-DE-REFATORACAO.md` §10 e §11;
  `docs/agent/context/ROADMAP.md` Fase 2.
- context_sources:
  - skills: []
  - design: null
  - docs:
    - `docs/agent/context/CHARTER.md`
    - `docs/agent/context/ROADMAP.md`
    - `docs/agent/context/SOURCES.md`
    - `src/js/services/user.service.js`
    - `src/js/services/articles.service.js`
    - `src/js/services/comments.service.js`
    - `src/js/services/profile.service.js`
    - `src/js/services/tags.service.js`
    - `src/js/config/auth.interceptor.js`
    - RealWorld public API docs: `https://docs.realworld.show/specifications/backend/endpoints/`
    - RealWorld OpenAPI reference: `https://github.com/realworld-apps/realworld/blob/main/specs/api/openapi.yml`
- affects_design_system_core: false

## Dados, segurança e compliance
- Dados envolvidos / sensibilidade: documentação de payloads de usuário, artigo,
  comentário e token JWT fictício; nenhum segredo real, credencial real ou dado
  pessoal real deve ser usado.
- Permissões / minimização / mascaramento: exemplos devem usar valores fictícios
  (`user@example.test`, `fake-jwt-token`, `demo-user`). Não registrar token real.
- Auditoria / log (sem PII, sem secrets): n/a — slice documental.
- Revisão humana: required, por risco C (auth/token + contrato de integração externa).

## API, entidades e integrações
- Base URL consumida pelo app legado: `https://conduit.productionready.io/api`.
- Auth/header: `Authorization: Token <jwt>` (não `Bearer`).
- Endpoints mínimos derivados do codebase e da especificação RealWorld:
  - `POST /users/login`
  - `POST /users`
  - `GET /user`
  - `PUT /user`
  - `GET /profiles/{username}`
  - `POST /profiles/{username}/follow`
  - `DELETE /profiles/{username}/follow`
  - `GET /articles`
  - `GET /articles/feed`
  - `GET /articles/{slug}`
  - `POST /articles`
  - `PUT /articles/{slug}`
  - `DELETE /articles/{slug}`
  - `POST /articles/{slug}/favorite`
  - `DELETE /articles/{slug}/favorite`
  - `GET /articles/{slug}/comments`
  - `POST /articles/{slug}/comments`
  - `DELETE /articles/{slug}/comments/{id}`
  - `GET /tags`

## Critérios de aceite
- [ ] `docs/api/realworld-openapi.yaml` existe e usa OpenAPI 3.x válido.
- [ ] Todos os endpoints consumidos pelos serviços atuais estão documentados.
- [ ] O security scheme documenta `Authorization: Token <jwt>` e não usa
      `Bearer`.
- [ ] Os envelopes principais (`user`, `article`, `articles`, `comment`,
      `comments`, `profile`, `tags`) estão representados em schemas.
- [ ] A especificação inclui respostas de erro mínimas para auth/validação
      (`401`, `403`/`422` quando aplicável) sem exemplos com segredos reais.
- [ ] `SOURCES.md` registra `docs/api/realworld-openapi.yaml` como fonte
      `api`, `authoritative`, `in-repo` para testes de contrato futuros.
- [ ] Documentação e riscos atualizados.

## Operational path & risk
- risk_category: C   # gatilho: contrato de API inclui auth/sessão/token JWT
                     # e integração externa RealWorld.
- operational_path: strict_C_D

## Model Profile
```yaml
risk_category: C
planner:   { tier: standard, effort: high }
generator: { tier: standard, effort: high }
evaluator: { tier: deep,     effort: high }
reviewer:  { tier: standard, effort: medium }
security_reviewer: { tier: deep, effort: xhigh }
deterministic_gates: [schema_validation, contract_tests, negative_tests, secret_scan, config_review]
human_review: required
cross_family_evaluator: true
budget_max_usd: 1.50
rationale: |
  Categoria C porque a documentação define contrato de autenticação/token e
  integração externa que será usada por testes de contrato e pela migração. O
  generator deve cruzar codebase + documentação oficial RealWorld sem inventar
  endpoints. O evaluator/security_reviewer usam perfil mais forte porque erro
  no esquema `Token`/envelopes pode comprometer a rede de segurança da migração.
```

## Deterministic gates (a rodar antes de READY)
- schema_validation: validar sintaxe YAML/OpenAPI 3.x com ferramenta local
  disponível (`python` YAML se disponível, `npx swagger-cli` se já existir no
  ambiente, ou validação estrutural reproduzível equivalente sem introduzir
  dependência não planejada).
- contract_tests: conferir automaticamente ou via script determinístico que os
  paths/métodos listados no PLAN existem no OpenAPI.
- negative_tests: conferir que endpoints protegidos possuem resposta `401` e
  security scheme adequado; verificar que o esquema não usa `Bearer`.
- secret_scan: buscar tokens/segredos reais no arquivo (`jwt`, `token`, chaves)
  e confirmar apenas exemplos fictícios.
- config_review: confirmar que o servidor documentado não altera a base real do
  app legado e que `SOURCES.md` foi atualizado.

## Condições de parada
- Se o contrato oficial RealWorld divergir do que o codebase consome, parar e
  registrar a divergência no `PROGRESS.md`; o app legado é a fonte primária para
  o contrato consumido por este repositório.
- Se for necessário instalar novas dependências para validar OpenAPI, parar e
  pedir aprovação ou criar slice separada de tooling.
- Se qualquer exemplo exigir token real, credencial real ou dado pessoal real,
  parar e substituir por dados fictícios.
- Se a mudança exigir alterar `package.json`, `package-lock.json` ou `src/`,
  parar e voltar ao Prompt 01 para reclassificar.

## Riscos e pendências
- Risco: a API pública RealWorld atual pode ter evoluído em relação ao backend
  legado `conduit.productionready.io`; a especificação desta slice deve capturar
  o contrato consumido pelo app atual, usando a spec oficial apenas como
  referência.
- Risco: exemplos de auth podem acidentalmente sugerir `Bearer`; revisão de
  segurança deve bloquear se isso ocorrer.
- Pendência: aprovação do plano pelo usuário antes de implementar.
