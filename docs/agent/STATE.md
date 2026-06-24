# STATE

State: BLOCKED (pending_decision)
Current phase: 3 — Migração Angular 21
Last completed phase: 2 — Rede de segurança
Active work unit: none (aguardando decisões dos pontos de permissão)

## Briefing — o que o próximo agente faz primeiro
1. Ler `docs/agent/OPERATING-GUIDE.md` e este `STATE.md`.
2. Fase 2 COMPLETA: OpenAPI (002) + testes de contrato (003) + E2E Playwright (004)
   + branches `failing-e2e`/`passing-e2e`. Todos os PRs mergeados.
3. A Fase 3 (Migração Angular 21) está BLOQUEADA pelos pontos de permissão do
   CHARTER — decisões arquiteturais que NÃO podem ser tomadas pelo agente sozinho:
   - Estratégia de estado: Signals vs RxJS/serviços.
   - Roteamento: manter hashbang (`#!/`) ou migrar para `history` API.
   - SSR: adotar `@angular/ssr` ou permanecer SPA estático.
   - Biblioteca de markdown substituta de `marked` (com `DomSanitizer`).
4. Após as decisões do usuário: abrir issue `needs-decision` registrando-as e
   planejar a primeira slice da Fase 3 (ex.: scaffold Angular CLI + interceptor
   `Authorization: Token`, preservando `localStorage['jwtToken']`).

## Não faça
- Não inventar requisitos de produto.
- Não escolher stack/arquitetura sem decisão do usuário (pontos de permissão).
- Não escrever código de produto antes de uma unidade de trabalho ser planejada.
- Não usar segredos/credenciais/dados sensíveis reais.
- Não commitar `documentacao/`, `harness/`, `AGENTS.md` ou `CLAUDE.md`.
