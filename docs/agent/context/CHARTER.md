# CHARTER — Conduit Frontend

## Identidade
- **Nome:** Conduit Frontend
- **Repositório:** `angularjs-realworld-example-app`
- **Objetivo:** Migrar o frontend Conduit de AngularJS 1.5 para Angular 21,
  mantendo paridade visual e funcional completa, e adicionar dois incrementos
  autorizados (dark mode e rascunhos).
- **Resultado mínimo que prova valor:** app builda com Angular CLI, todas as
  telas e rotas equivalentes às atuais funcionando, contrato de API RealWorld
  preservado, tema claro visualmente inalterado.

## Personas
- **Leitor:** navega artigos, filtra por tag, lê feed global/pessoal.
- **Escritor autenticado:** cria/edita/publica artigos, gerencia rascunhos,
  comenta, favorita artigos, segue outros usuários.
- **Visitante anônimo:** acesso somente leitura; pode registrar-se ou fazer login.

## Escopo autorizado
Conforme `documentacao/GUIA-DE-REFATORACAO.md` (documento-fonte, autoritativo):

1. **Migração Angular 21** (§4.1) — reescrita completa; toolchain Gulp/Browserify
   substituído por Angular CLI.
2. **Dark mode** (§4.2) — camada de override CSS (custom properties + classe
   `theme-dark`), toggle no header, persistência em `localStorage`
   (`conduit.theme`).
3. **Rascunhos** (§4.3) — autosave com debounce no editor de novo artigo,
   restauração ao abrir, limpeza ao publicar. Chave `conduit.draft.new`
   (e `conduit.draft.<slug>` se cobrir edição — ponto de permissão).
4. **Tarefas gerais** (§5) — issues/DoR/DoD, Conventional Commits, OpenAPI do
   contrato consumido, testes de contrato + integração + E2E Playwright,
   StrykerJS ≥95%, Docker/Compose, LGTM, script Python.

## Fora de escopo (explícito)
- Alteração do backend ou do contrato da API RealWorld.
- Mudança de design system (paleta, tipografia, classes Conduit, Ionicons) no
  tema claro.
- Qualquer mudança de stack, framework ou arquitetura não listada acima sem
  aprovação via issue `needs-decision`.
- SSR, estratégia Signals vs RxJS, hashbang vs history routing — pontos de
  permissão: decidir antes de implementar.

## Riscos principais
| Risco | Severidade | Controle |
|---|---|---|
| `npm install` resolve versões diferentes (sem lockfile) | Médio | Pinar dependências antes de tocar o app legado |
| DevContainer Node 8 bloqueia tooling moderno | Alto | Atualizar `.devcontainer` para Node LTS como pré-requisito da migração |
| Esquema `Authorization: Token <jwt>` (não Bearer) | Alto | Reproduzir exatamente no `HttpClient` interceptor migrado; cobrir com teste de contrato |
| `Articles.save()` muta o modelo (`delete article.slug`) | Médio | Cuidado na lógica de rascunhos por slug |
| Design system 100% remoto (`main.css`) | Médio | Dark mode é camada de override local; nunca editar o remoto |
| Sem nenhum teste hoje | Alto | Fase 2 (rede de segurança) obrigatória antes da migração |
| `console.log` residual em `profile.controller.js` | Baixo | Não propagar para o app migrado |

## Stack atual (baseline — preservar enquanto não migrado)
| Componente | Detalhe |
|---|---|
| Framework | AngularJS `1.5.0-rc.2` |
| Roteamento | UI-Router `0.4.2`, modo hashbang |
| Build | Gulp 3 + Browserify + Babelify (ES6→ES5) + BrowserSync porta 4000 |
| Linguagem | ES6 (classes), sem TypeScript |
| Auth | JWT em `localStorage['jwtToken']`; interceptor `Authorization: Token <jwt>` |
| API base | `https://conduit.productionready.io/api` (em `app.constants.js`) |
| Testes | Nenhum |
| CI / Docker | Nenhum |
| Lint/Format | Nenhum |
| DevContainer | Node 8 (⚠️ bloqueador para tooling moderno) |

## Stack alvo (pós-migração)
| Componente | Detalhe |
|---|---|
| Framework | Angular 21 (standalone components) |
| Build | Angular CLI (esbuild) |
| Linguagem | TypeScript |
| Roteamento | Angular Router (decisão hashbang×history: ponto de permissão) |
| HTTP | `HttpClient` + interceptor (esquema `Token` preservado) |
| Testes | Jest ou Karma/Jasmine (a definir) + Playwright E2E + StrykerJS |
| Markdown | Substituta de `marked` com `DomSanitizer` (a definir — ponto de permissão) |
| Observabilidade | LGTM (Loki/Grafana/Tempo/Mimir) via Docker Compose |

## Definition of Done (por fase)
Uma fase só fecha quando:
- [ ] Critérios de aceite da fase satisfeitos.
- [ ] Testes de contrato verdes (sem regressão de API).
- [ ] E2E Playwright relevantes verdes.
- [ ] Cobertura de mutação dentro da meta (StrykerJS ≥95%, a partir da fase 5).
- [ ] Commits em Conventional Commits referenciando `#<id>`.
- [ ] Tema claro visualmente inalterado (quando aplicável).
- [ ] Prompts/skills registrados em `documentacao/` (§17 do guia).
- [ ] Riscos residuais documentados.

## Fontes autoritativas
- `documentacao/GUIA-DE-REFATORACAO.md` — documento-fonte de verdade; tem
  precedência sobre qualquer suposição do agente.
- `docs/agent/context/SOURCES.md` — registro de todos os context inputs.

## Pontos de permissão (não decidir sozinho — abrir issue `needs-decision`)
- Estratégia de estado: Signals vs RxJS/serviços.
- Roteamento: manter hashbang ou migrar para `history` API.
- SSR: adotar `@angular/ssr` ou permanecer SPA estático.
- Biblioteca de markdown substituta de `marked`.
- Vendorizar `main.css` remoto vs. manter como link externo.
- Rascunhos: cobrir edição de artigo existente além de "novo".
- Expiração/limpeza de rascunhos antigos.
- Mapeamento de observabilidade LGTM para o frontend (SSR vs. SPA).
- Qualquer mudança de design system ou arquitetura não listada em §4/§5 do guia.
