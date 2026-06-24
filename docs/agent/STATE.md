# STATE

State: PLANNED (decisões tomadas; pronto para planejar slice 1 da Fase 3)
Current phase: 3 — Migração Angular 21
Last completed phase: 2 — Rede de segurança
Active work unit: none (próxima: scaffold Angular CLI)

## Decisões da Fase 3 (ADR-001 — aprovadas pelo usuário)
- Estado: **Angular Signals**.
- Roteamento: **history API (PathLocationStrategy)**, URLs limpas; fallback de servidor para index.html.
- Renderização: **SPA estático** (sem SSR); servido por Nginx (Fase 6).
- Markdown: **marked (atual) + DomSanitizer**.
- Registro: `docs/adr/ADR-001-angular-21-migration-stack.md`.
  (Issues do GitHub estão desabilitadas no repo; o ADR é o registro autoritativo.)

## Invariantes preservadas
- Interceptor `Authorization: Token <jwt>` no `HttpClient`.
- Chave `localStorage['jwtToken']`.
- Contrato RealWorld inalterado; tema claro inalterado.
- Suite E2E da Fase 2 (hashbang `#!/`) deverá migrar para URLs limpas como parte da Fase 3.

## Briefing — o que o próximo agente faz primeiro
1. Ler `docs/agent/OPERATING-GUIDE.md`, este `STATE.md` e `docs/adr/ADR-001-...md`.
2. Planejar a **primeira slice da Fase 3**: scaffold do projeto Angular 21 (Angular CLI/esbuild)
   coexistindo com o app atual, sem alterar `src/` legado ainda; configurar interceptor
   `Token` e preservação de `localStorage['jwtToken']`. Decidir estratégia de coexistência
   (novo diretório ex.: `app-ng/`) e como manter os testes da Fase 2 verdes durante a transição.
3. Categoria de risco esperada: C (auth/token no novo interceptor). Seguir strict_path_C_D.

## Não faça
- Não inventar requisitos de produto.
- Não reabrir os pontos de permissão já decididos (ver ADR-001) sem motivo novo.
- Não escrever código de produto antes de uma unidade de trabalho ser planejada.
- Não usar segredos/credenciais/dados sensíveis reais.
- Não commitar `documentacao/`, `harness/`, `AGENTS.md` ou `CLAUDE.md`.
