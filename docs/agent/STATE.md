# STATE

State: REVIEWING
Current phase: 4 — Corte/validação E2E → descomissionamento
Last completed phase: 3 — Migração Angular 21 (todas as telas migradas)
Active work unit: 014-decommission-legacy

## Decisões da Fase 3/4 (ADR-001 — aprovadas)
- Signals; history API; SPA estático; marked + DomSanitizer. app-ng é a aplicação oficial.
- Legado AngularJS **arquivado** em `legacy/` (decisão do usuário — não apagado).

## Progresso
- Fase 3 (005-012): COMPLETA e mergeada. Todas as telas principais migradas para Angular 21.
- 013 (Fase 4) migracao da suite E2E para o app-ng + **correcao de corrida de sessao**: MERGEADA (PR #14).
  - Continuacao da slice 013 (follow-ups, consolidados no PR #19): garantia de resolucao de auth
    (teste), loading spinner no bootstrap, e timeout do verifyAuth + ampla cobertura E2E.
    Docs em `docs/agent/work/013-e2e-migration/followups/`. build + 93 unit + 37 E2E verdes.
- 014 (Fase 4) descomissionamento do legado: legado arquivado em `legacy/`; package.json/README/.gitignore
  repontados p/ app-ng. Gates verdes (contract 11/11, unit 93/93, E2E 37/37). Aguardando revisao humana (PR #15).

## MARCO
- **Migração concluída**: app-ng (Angular 21) é a aplicação oficial; AngularJS arquivado em `legacy/`.

## Estrutura atual
- `app-ng/` — aplicação oficial (Angular 21).
- `legacy/` — app AngularJS 1.5 arquivado (não buildado/servido/testado).
- `tests/contract/` — contract tests (API/OpenAPI). `tests/e2e/` — Playwright (serve o app-ng).
- Scripts raiz: `build`/`serve`/`test:unit`/`test:contract`/`test:e2e` (+`pretest:e2e`) → app-ng.

## Invariantes preservadas
- Interceptor `Authorization: Token <jwt>` só p/ `apiBase`; esquema `Token` (não `Bearer`).
- Mutações exigem auth (botões → /register; rotas editor/settings → /login via guard, refresh-safe).
- Sessão restaurada antes da navegação inicial (APP_INITIALIZER). Markdown sanitizado (sem bypass).
- Chave `localStorage['jwtToken']`; contrato RealWorld inalterado; tema claro inalterado.

## Briefing — o que o próximo agente faz primeiro
1. Ler `OPERATING-GUIDE.md`, este `STATE.md`, `docs/adr/ADR-001-...md`.
2. App oficial em `app-ng/` (Node >=20.19/22.12, `nvm use 22`):
   `cd app-ng && npm install && npm run build && CI=true npm test`.
3. Da raiz: `npm run test:contract` e `npm run test:e2e` (Playwright sobe `serve` apontando p/ app-ng).
4. Trabalho remanescente (opcional / próximas fases):
   - Pipeline de deploy/hosting do app-ng (infraestrutura).
   - Limpeza dos comentários "mirrors legacy src/js/..." no app-ng (cosmético).
   - Eventual remoção definitiva de `legacy/` quando não for mais necessário como referência.

## Não faça
- Não reintroduzir o app legado no fluxo de build/serve/test.
- Não reabrir os pontos já decididos (ver ADR-001) sem motivo novo.
- Não usar `bypassSecurityTrustHtml` para conteúdo não confiável.
- Não permitir acesso autenticado sem guard/checagem de sessão (refresh-safe).
- Não escrever código de produto antes de uma unidade de trabalho ser planejada.
- Não usar segredos/credenciais/dados sensíveis reais.
- Não commitar `documentacao/`, `harness/`, `AGENTS.md` ou `CLAUDE.md`.
