# Evidência — 002-realworld-openapi

## Resumo
- **Fase:** 2 — Rede de segurança
- **Status:** REVIEWING / security approved
- **Categoria de risco:** C
- **Human review:** required antes de merge
- **Fontes:**
  - `docs/agent/work/002-realworld-openapi/PLAN.md`
  - `docs/agent/work/002-realworld-openapi/PROGRESS.md`
  - `docs/agent/work/002-realworld-openapi/REVIEW.md`
  - `docs/api/realworld-openapi.yaml`

## Implementações evidenciadas
- Criado `docs/api/realworld-openapi.yaml` com OpenAPI 3.0.3 para o contrato RealWorld consumido pelo app AngularJS atual.
- Registrado `docs/api/realworld-openapi.yaml` em `docs/agent/context/SOURCES.md` como fonte `api`, `authoritative`, `in-repo`.
- Documentados endpoints consumidos: auth/users, current user, profiles/follow, articles/feed/favorite, comments e tags.
- Documentado `TokenAuth` como `apiKey` no header `Authorization`, com valor esperado `Token <jwt>`.
- Exemplos usam dados fictícios (`example.test`, `fake-jwt-token`).

## Critérios de aceite aprovados
| Critério | Status | Evidência |
|---|---|---|
| `docs/api/realworld-openapi.yaml` existe e usa OpenAPI 3.x válido. | PASS | `REVIEW.md`: `schema_validation` — `OpenAPI 3.0.3 YAML válido`. |
| Todos os endpoints consumidos pelos serviços atuais estão documentados. | PASS | `REVIEW.md`: `contract_tests` — 19 operações documentadas. |
| Security scheme documenta `Authorization: Token <jwt>` e não usa esquema alternativo. | PASS | `REVIEW.md`: `TokenAuth` é `apiKey` no header `Authorization`; `negative_tests` confirmou ausência de esquema alternativo. |
| Envelopes principais (`user`, `article`, `articles`, `comment`, `comments`, `profile`, `tags`) representados em schemas. | PASS | `REVIEW.md`: `envelope_check` confirmou os schemas de resposta. |
| Respostas mínimas de erro para auth/validação sem segredos reais. | PASS | `REVIEW.md`: endpoints protegidos têm `401`; `secret_scan` não encontrou segredos; exemplos fictícios. |
| `SOURCES.md` registra o OpenAPI como fonte `api`, `authoritative`, `in-repo`. | PASS | `REVIEW.md`: `config_review` confirmou linha em `SOURCES.md`. |
| Documentação e riscos atualizados. | PASS | `PROGRESS.md` e `REVIEW.md` registram decisões, gates, riscos e `human_review: required`. |

## Gates / testes executados
| Gate | Status | Evidência |
|---|---|---|
| `schema_validation` | PASS | Ruby `YAML.load_file` carregou o YAML e confirmou `openapi: 3.0.3`, `paths` e `components`. |
| `contract_tests` | PASS | Script Ruby confirmou 19 operações esperadas no OpenAPI. |
| `negative_tests` | PASS | Script Ruby confirmou `TokenAuth` + `401` em endpoints protegidos e ausência de esquema alternativo. |
| `secret_scan` | PASS | `grep -nE 'AKIA...|ghp_...|sk_live_...|PRIVATE KEY|Bearer ...' docs/api/realworld-openapi.yaml` não encontrou segredos. |
| `config_review` | PASS | Script Ruby confirmou server `https://conduit.productionready.io/api`, `TokenAuth` e registro em `SOURCES.md`. |
| `envelope_check` | PASS | Script Ruby confirmou schemas dos envelopes principais. |

## Revisão de segurança
| Item | Status | Evidência |
|---|---|---|
| Threat model revisado | APPROVED | `REVIEW.md`: ativo protegido, fronteira de confiança e vetores revisados. |
| Auth/token | APPROVED | `TokenAuth` no header `Authorization`; valor esperado `Token <jwt>`. |
| Exemplos sem segredos reais | APPROVED | `fake-jwt-token`, `example.test`; `secret_scan` PASS. |
| Base URL preservada | APPROVED | `https://conduit.productionready.io/api`. |
| Revisão humana | REQUIRED | Categoria C; aprovação humana antes de merge. |

## Riscos residuais
- A documentação não executa chamadas reais contra `conduit.productionready.io`; divergências runtime devem ser detectadas na próxima slice de testes de contrato.
- `package.json` e `package-lock.json` seguem como mudanças locais fora do escopo e não devem entrar no commit/PR desta slice.
