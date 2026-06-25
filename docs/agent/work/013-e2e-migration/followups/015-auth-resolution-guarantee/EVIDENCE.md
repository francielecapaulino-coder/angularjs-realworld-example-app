# EVIDENCE — 015-auth-resolution-guarantee

Garantia validada: o `authGuard` só é avaliado após o estado de auth estar
definitivamente resolvido (autenticado ou não), nunca em estado pendente.

## Mecanismo (app-ng/src/app/app.config.ts)
- `withDisabledInitialNavigation()` impede a navegação inicial automática.
- `provideAppInitializer(() => restoreSessionThenNavigate(auth, router))`:
  - `await firstValueFrom(auth.verifyAuth())` → estado definitivo (User ou null);
  - `await router.initialNavigation()` → só então a 1ª navegação (e o guard) ocorre.
- `verifyAuth()` trata erros internamente (catchError → purgeAuth → of(false)); nunca rejeita.

## Evidência 1 — Teste de regressão unitário (Vitest)
Arquivo: `app-ng/src/app/app.config.spec.ts` — suíte
"restoreSessionThenNavigate (auth-resolution guarantee)":
- ✅ "awaits verifyAuth BEFORE calling router.initialNavigation":
  com `verifyAuth` pendente (Subject não resolvido), `initialNavigation` NÃO é chamado;
  após resolver, a ordem é exatamente `['verifyAuth:start', 'initialNavigation']`.
- ✅ "still navigates when the user is NOT authenticated (verifyAuth=false)":
  estado definitivo "não autenticado" ainda dispara a navegação (sem ficar pendente).

Resultado: `cd app-ng && CI=true npm test` → **91/91** (23 arquivos), incluindo os 2 novos.

## Evidência 2 — E2E (Playwright) que exercitam o guard com estado resolvido
Arquivo: `tests/e2e/conduit.e2e.test.js`. Execução (`-g "guard|Settings|Create article|Login"`): **9/9**.
- Anônimo → `/editor` e `/settings` redirecionam a `/login` (guard = não-autenticado resolvido).
- Autenticado (token injetado antes do load) → acesso direto a `/editor` e `/settings` renderiza
  (guard = autenticado resolvido; sem corrida/redirect indevido).
- Bônus: username aparece no nav logo após login (estado resolvido reativamente).

## Comandos
```
cd app-ng && npm run build              # OK
cd app-ng && CI=true npm test           # 91/91
npx playwright test -g "guard|Settings|Create article|Login"   # 9/9
```

## Conclusão
A garantia está em vigor e travada por teste de regressão (unit) + cobertura E2E.
Regressões na ordenação (remoção do initializer ou de withDisabledInitialNavigation)
quebram o spec unitário e/ou os E2E de acesso direto.
