# EVIDENCE — 016-bootstrap-loading

Garantia de UX: nenhuma tela branca perceptível durante o bootstrap quando o
`verifyAuth()` faz chamada de rede (GET /user).

## Mecanismo (app-ng/src/index.html)
- Loader estático dentro de `<app-root>`:
  ```html
  <app-root>
    <div class="app-loading" role="status" aria-live="polite" aria-label="Loading">
      <div class="app-loading__spinner"></div>
    </div>
  </app-root>
  ```
- CSS inline no `<head>` (mostra sem esperar CSS de componente); spinner verde Conduit;
  respeita `prefers-reduced-motion`.
- Cobre TODO o pré-render: download do bundle + bootstrap + `APP_INITIALIZER`
  (`verifyAuth` em voo). O Angular substitui o conteúdo de `<app-root>` no primeiro
  render → o loader desaparece automaticamente (sem JS extra).

## Evidência 1 — Build preserva o loader
`cd app-ng && npm run build` → `dist/app-ng/browser/index.html` contém `app-loading`
(grep: 7 ocorrências). PASS.

## Evidência 2 — E2E com GET /user atrasado (Playwright)
Arquivo: `tests/e2e/conduit.e2e.test.js` — suíte "Bootstrap loading state":
- Mock dedicado atrasa `GET /user` em 1500ms (simula rede lenta no restore de sessão).
- ✅ `.app-loading` fica **visível** durante o bootstrap (initializer bloqueado).
- ✅ Após o GET /user resolver e o app renderizar, `.home-page` aparece e
  `.app-loading` some (`toHaveCount(0)`).

Resultados:
```
npx playwright test -g "Bootstrap loading"   # 1/1
npx playwright test                          # 27/27 (suite completa)
cd app-ng && CI=true npm test                # 89/89 (inalterado; mudança só no shell)
```

## Conclusão
O loading state cobre a janela de rede do `verifyAuth` no bootstrap, eliminando a
tela branca perceptível, e é validado por E2E (com atraso de rede) + verificação de build.
