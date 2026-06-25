# PROGRESS — 017-verifyauth-timeout

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | builder | EVALUATING | timeout no verifyAuth + testes (network/timeout) + E2E de falha; build + 91 unit + 27 E2E verdes |

## Decisões
- Categoria C: muda a restauração de sessão (auth) — timeout + tratamento de falha.
- `VERIFY_AUTH_TIMEOUT_MS = 8000`; `timeout()` no pipe; `catchError` cobre 401/rede/timeout → purge + false.
- `verifyAuth` nunca rejeita → initializer conclui → guard redireciona a /login.
- Teste de timeout com **vitest fake timers** (zone-testing/fakeAsync não disponível no setup).
- Incidente corrigido: travessão (—) num comentário causou erro de encoding e esvaziou o spec;
  arquivo restaurado do git e reescrito em ASCII nos novos trechos.

## Arquivos alterados (app-ng/ + tests)
- `app-ng/src/app/core/auth/auth.service.ts` — `timeout` + `VERIFY_AUTH_TIMEOUT_MS` + doc.
- `app-ng/src/app/core/auth/auth.service.spec.ts` — +network error, +timeout (fake timers); 401 renomeado.
- `tests/e2e/conduit.e2e.test.js` — +suite "verifyAuth failure on bootstrap".

## Comandos e resultados
| Comando | Resultado |
|---|---|
| `cd app-ng && npm run build` | PASS — verde |
| `cd app-ng && CI=true npm test` | PASS — `unit_tests`/`negative_tests`: 91/91 (auth.service 12) |
| `npx playwright test` | PASS — `e2e_tests`: 27/27 (inclui falha de verifyAuth) |
| non-ASCII / U+FFFD | PASS — 0 caracteres corrompidos |
| `git grep` segredos | PASS — `secret_scan`: nenhum |

## Evidências
- Ver `EVIDENCE.md`.

## Riscos residuais / pendências
- Política de purge-em-erro mantida (erro de rede transitório força re-login no próximo boot).
- Requer revisão humana + security_reviewer (Categoria C — auth/sessão).
