# STATE

State: REVIEWING
Current phase: 4 — Corte/validação E2E
Last completed phase: 3 — Migração Angular 21 (todas as telas migradas)
Active work unit: 013-e2e-migration

## Decisões da Fase 3 (ADR-001 — aprovadas)
- Signals; history API; SPA estático; marked + DomSanitizer. Coexistência em `app-ng/`.

## Progresso
- Fase 3 (005–012): COMPLETA e mergeada. Todas as telas principais migradas para Angular 21.
- 013 (Fase 4) migração da suite E2E para o app-ng + **correção de corrida de sessão**: MERGEADA (PR #14).
  - Continuação da slice 013 (follow-ups, consolidados em 1 PR): garantia de resolução de auth
    (teste), loading spinner no bootstrap, e timeout do verifyAuth + ampla cobertura E2E.
    Docs em `docs/agent/work/013-e2e-migration/followups/`. build + 93 unit + 37 E2E verdes.
- 014 (Fase 4) descomissionamento do legado: PR #15 aberto (à parte).

## Correção relevante (013)
- Restauração de sessão movida para `provideAppInitializer` + `withDisabledInitialNavigation`:
  `verifyAuth()` resolve antes da navegação inicial → `authGuard` avalia com sessão restaurada.
  Refresh em /editor e /settings não desloga mais; username aparece no nav sem reload.

## Telas/funcionalidades migradas
- `/` (home/feed), `/login`, `/register`, `/article/:slug` (leitura + escrita),
  `/editor` e `/editor/:slug` (authGuard), `/profile/:username` (abas), `/settings` (authGuard + logout).
- E2E (Playwright) valida o app-ng com URLs limpas (26 testes, 10 suites).

## Invariantes preservadas
- Interceptor `Authorization: Token <jwt>` só p/ `apiBase`; esquema `Token` (não `Bearer`).
- Mutações exigem auth (botões → /register; rotas editor/settings → /login via guard, refresh-safe).
- Markdown sanitizado (sem bypass). Logout limpa token. Update rotaciona token via setAuth.
- Chave `localStorage['jwtToken']`; contrato RealWorld inalterado; tema claro inalterado.
- Bug legado de `article-actions` corrigido (E2E baseline invertido).

## Briefing — o que o próximo agente faz primeiro
1. Ler `OPERATING-GUIDE.md`, este `STATE.md`, `docs/adr/ADR-001-...md`.
2. Rodar app-ng (Node >=20.19/22.12, `nvm use 22`): `cd app-ng && npm install && npm run build && CI=true npm test`.
3. Rodar E2E: build do app-ng primeiro, depois `npm run test:e2e` (Playwright sobe `serve` apontando p/ app-ng).
4. Próxima slice (Fase 4 — descomissionamento, Categoria C):
   - Servir o app-ng como a aplicação oficial (raiz/deploy).
   - Remover/arquivar o AngularJS legado em `src/`, o `gulpfile.js` e dependências legadas;
     ajustar `package.json` (scripts), README e quaisquer configs de build legado.
   - Validar que a suite E2E continua verde apontando para o app-ng após o corte.

## Não faça
- Não inventar requisitos de produto.
- Não reabrir os pontos de permissão já decididos (ver ADR-001) sem motivo novo.
- Não usar `bypassSecurityTrustHtml` para conteúdo não confiável.
- Não permitir acesso autenticado sem guard/checagem de sessão (refresh-safe).
- Não escrever código de produto antes de uma unidade de trabalho ser planejada.
- Não usar segredos/credenciais/dados sensíveis reais.
- Não commitar `documentacao/`, `harness/`, `AGENTS.md` ou `CLAUDE.md`.
