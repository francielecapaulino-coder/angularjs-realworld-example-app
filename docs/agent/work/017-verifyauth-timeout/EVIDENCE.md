# EVIDENCE — 017-verifyauth-timeout

Falhas do `verifyAuth` no bootstrap são tratadas de forma limpa e sem travar:
401 (expirado), erro de rede e requisição travada → sessão limpa + `/login`.

## Mecanismo (app-ng/src/app/core/auth/auth.service.ts)
- Constante: `export const VERIFY_AUTH_TIMEOUT_MS = 8000;`
- Pipe do `verifyAuth`:
  ```ts
  this.http.get(...).pipe(
    timeout(VERIFY_AUTH_TIMEOUT_MS),  // hang -> TimeoutError
    tap(set user), map(() => true),
    catchError(() => { this.purgeAuth(); return of(false); }), // 401/rede/timeout
  )
  ```
- `verifyAuth` NUNCA rejeita → o APP_INITIALIZER sempre conclui → navegação inicial
  ocorre → guard redireciona a `/login` em rotas protegidas. Sem app preso no spinner.

## Evidência 1 — Unit (Vitest), `auth.service.spec.ts` (12 testes)
- ✅ 401 (token expirado) → false + purge (token removido).
- ✅ Erro de rede (`req.error`) → false + purge.
- ✅ **Timeout** (fake timers: requisição nunca responde; `advanceTimersByTimeAsync(8000)`)
  → resolve false + purge (não trava).
Resultado: `cd app-ng && CI=true npm test` → **91/91** (auth.service: 12).

## Evidência 2 — E2E (Playwright), `tests/e2e/conduit.e2e.test.js`
Suíte "verifyAuth failure on bootstrap":
- Boot com token, navegando direto a `/settings`; `GET /user` é **abortado** (erro de rede).
- ✅ App redireciona limpo a `/login` (sem travar), e `localStorage['jwtToken']` fica null.
Resultado: `npx playwright test` → **27/27** (inclui esta suíte).

## Comandos
```
cd app-ng && npm run build                                   # OK
cd app-ng && CI=true npm test                                # 91/91 (auth.service 12)
npx playwright test -g "verifyAuth failure"                  # 1/1
npx playwright test                                          # 27/27
```

## Conclusão
Token expirado, erro de rede e travamento resultam todos em redirect limpo a `/login`,
sem travar o app, com timeout razoável (8000ms). Coberto por unit + E2E.
