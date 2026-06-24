# ADR-001 — Stack da Migração Angular 21

- **Status:** Aceito
- **Data:** 2026-06-24
- **Fase:** 3 — Migração Angular 21
- **Decisores:** Usuário (pontos de permissão do CHARTER) + agente (proposta)
- **Contexto-fonte:** `docs/agent/context/CHARTER.md` (pontos de permissão),
  `docs/agent/context/ROADMAP.md` Fase 3, `documentacao/GUIA-DE-REFATORACAO.md` §4.1.

## Contexto
A Fase 2 (rede de segurança) está completa: contrato OpenAPI, testes de contrato
e E2E Playwright cobrindo os fluxos principais, com branches `failing-e2e`/`passing-e2e`.
A Fase 3 reescreve o frontend de AngularJS 1.5 para Angular 21 com paridade visual
e funcional. O CHARTER define quatro pontos de permissão que exigiam decisão do
usuário antes da implementação.

## Decisões

### 1. Estratégia de estado — **Signals**
Usar Angular Signals como mecanismo primário de estado reativo. Escopo do Conduit
(usuário atual, listas de artigos, formulários) é simples o suficiente para Signals,
que é a abordagem idiomática do Angular 21.
- Consequência: serviços expõem `signal`/`computed`; HTTP via `HttpClient` pode
  retornar Observables convertidos para Signals quando conveniente.

### 2. Roteamento — **history API (PathLocationStrategy)**
Migrar de hashbang (`#!/`) para URLs limpas (`/login`, `/article/:slug`).
- Consequência: o servidor estático (Nginx, Fase 6) precisa de fallback de todas
  as rotas para `index.html`. O `<base href="/">` deve estar presente.
- Impacto nos testes: os E2E da Fase 2 navegam via `/#!/...`; ao migrar, a suite
  E2E deverá ser atualizada para as novas URLs (parte do critério de aceite da Fase 3).

### 3. Renderização — **SPA estático**
Permanecer SPA estático (sem `@angular/ssr`). Build do Angular CLI gera artefatos
estáticos servidos por Nginx, alinhado à Fase 6 (Docker/Nginx) e ao app atual.
- Consequência: observabilidade da Fase 6 mira o frontend estático; sem servidor Node.

### 4. Markdown — **marked (versão atual) + DomSanitizer**
Manter `marked` (atualizada para versão suportada) e sanitizar a saída HTML com
`DomSanitizer` antes de injetar no DOM.
- Consequência: menor risco de divergência de renderização vs. app atual; sanitização
  obrigatória para evitar XSS no corpo de artigos/comentários.

## Invariantes preservadas (não negociáveis)
- Header de auth `Authorization: Token <jwt>` no interceptor `HttpClient`.
- Chave `localStorage['jwtToken']` preservada.
- Contrato RealWorld inalterado (`docs/api/realworld-openapi.yaml`).
- Tema claro visualmente inalterado.
- Eliminar `'ngInject'`/`strictDi`; não propagar `console.log` de `profile.controller.js`.

## Alternativas consideradas
- Estado: RxJS+serviços ou híbrido — preteridos por Signals ser idiomático e simples aqui.
- Roteamento: manter hashbang — preterido; history API é o padrão moderno (com custo de fallback no servidor).
- SSR: preterido por complexidade desproporcional ao escopo atual.
- Markdown: `markdown-it`/`ngx-markdown` — preteridos para minimizar divergência de renderização.

## Impacto / próximos passos
- Atualizar a suite E2E da Fase 2 para as novas URLs (history API) como parte da Fase 3.
- Primeira slice da Fase 3: scaffold Angular CLI + interceptor `Token` + preservação
  de `localStorage['jwtToken']`, sem alterar contrato nem design system.
