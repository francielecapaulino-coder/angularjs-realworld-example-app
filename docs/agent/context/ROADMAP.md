# ROADMAP — Conduit Frontend

Fonte: `documentacao/GUIA-DE-REFATORACAO.md` §15.
Sequência obrigatória: Fase 2 deve preceder a Fase 3.

---

## Fase 1 — Fundação
**Objetivo:** Estabelecer a infraestrutura de processo e eliminar bloqueadores
de tooling antes de qualquer código de produto.

**Escopo incluído:**
- Criar templates de issue no GitHub (DoR/DoD conforme §6 do guia).
- Configurar bleeding branch (`bleeding`) com Conventional Commits.
- Adicionar caminhos não-versionáveis ao `.git/info/exclude` local:
  `documentacao/`, `harness/`, `AGENTS.md`, `CLAUDE.md`.
- Atualizar `.devcontainer/devcontainer.json` para Node LTS compatível com
  Angular 21 (pré-requisito obrigatório da Fase 3).

**Fora de escopo:**
- Qualquer código de produto.
- Instalação do Angular CLI ou dependências da migração.
- Alterações em `src/`.

**Critérios de aceite:**
- [ ] Templates de issue publicados no repositório.
- [ ] Branch `bleeding` criada e configurada.
- [ ] `.git/info/exclude` atualizado localmente (não versionado).
- [ ] `.devcontainer/devcontainer.json` aponta para Node LTS (≥ 18).
- [ ] Nenhum arquivo de `documentacao/` ou `harness/` commitado.

**Status atual:** `COMPLETE`

---

## Fase 2 — Rede de segurança
**Objetivo:** Fixar o comportamento atual do app AngularJS como linha de base
verificável, antes de qualquer reescrita.

**Escopo incluído:**
- Documentar o contrato RealWorld consumido em **OpenAPI 3**
  (auth/users, articles, comments, profiles, tags, favorites — §10 do guia).
- Implementar **testes de contrato** que validam métodos, paths, headers
  `Authorization: Token <jwt>` e envelopes de request/response.
- Implementar **E2E Playwright mínimos** contra o app AngularJS atual,
  cobrindo: login/registro, listar/abrir artigo, criar artigo, favoritar,
  seguir usuário.
- Criar branch com **um teste Playwright quebrando** e branch com
  **o mesmo teste passando** (exigência §11).

**Fora de escopo:**
- Migração do framework.
- Dark mode, rascunhos.
- Testes de mutação (Fase 5).

**Critérios de aceite:**
- [x] Arquivo OpenAPI 3 (`docs/api/realworld-openapi.yaml`) gerado e revisado.
- [x] Testes de contrato verdes (slice 003; endpoint substituto
      `node-express-conduit.appspot.com` por indisponibilidade da API original).
- [x] E2E Playwright cobrindo os fluxos principais verdes (slice 004; 18 testes).
- [x] Branch `failing-e2e` (teste quebrando) e branch `passing-e2e`
      (teste passando) existem e demonstram a rede.

**Status atual:** `COMPLETE` (pendente revisão humana do PR da slice 004)

---

## Fase 3 — Migração Angular 21
**Objetivo:** Reescrever o frontend em Angular 21 com paridade completa de
rotas, telas, fluxos e contrato de API em relação ao app AngularJS.

**Pré-requisito obrigatório:** Fase 2 concluída (rede de segurança verde).

**Escopo incluído:**
- Substituir Gulp/Browserify pelo **Angular CLI** (esbuild).
- Reescrever todos os módulos como **standalone components** Angular 21.
- Reproduzir todas as rotas e telas (§3.2 do guia) com comportamento equivalente.
- Manter **`Authorization: Token <jwt>`** no interceptor `HttpClient`.
- Preservar chave `localStorage['jwtToken']`.
- Eliminar `'ngInject'` / `strictDi` (irrelevantes pós-migração).
- Não propagar `console.log` de `profile.controller.js`.

**Pontos de permissão (decidir antes de implementar — issue `needs-decision`):**
- Signals vs RxJS/serviços como estratégia de estado.
- Hashbang vs `history` API no roteamento.
- SSR (`@angular/ssr`) vs SPA estático.
- Biblioteca substituta de `marked` (com `DomSanitizer`).

**Fora de escopo:**
- Dark mode e rascunhos (Fase 4).
- Alteração do design system ou da API RealWorld.

**Critérios de aceite:**
- [ ] App builda sem erros com Angular CLI.
- [ ] Testes de contrato (Fase 2) continuam verdes.
- [ ] E2E Playwright (Fase 2) continuam verdes.
- [ ] Revisão visual: tema claro pixel-equivalente ao atual.
- [ ] Pontos de permissão decididos e registrados antes da implementação.

**Status atual:** `EMPTY`

---

## Fase 4 — Incrementos: Dark Mode e Rascunhos
**Objetivo:** Adicionar os dois incrementos autorizados sobre o app migrado.

### 4a — Dark Mode (§4.2)
**Escopo:**
- CSS custom properties + classe `theme-dark` no elemento raiz/`<body>`.
- Serviço de tema Angular; toggle no header/nav (sem reorganizar o header).
- Persistência em `localStorage['conduit.theme']` (sem colidir com `jwtToken`).
- Camada de override local apenas para o modo escuro; tema claro inalterado.

**Ponto de permissão:** vendorizar `main.css` remoto vs. manter como link
externo — confirmar antes de implementar se o override exigir isso.

**Critérios de aceite:**
- [ ] Alternância clara↔escura funcional e persistente entre sessões.
- [ ] Sem regressão visual no tema claro.
- [ ] Toggle coberto por E2E Playwright.

### 4b — Rascunhos (§4.3)
**Escopo:**
- Autosave com debounce a cada alteração dos campos do editor de **novo** artigo.
- Restaurar rascunho ao abrir o editor (se houver).
- Limpar rascunho ao publicar com sucesso.
- Chave `localStorage['conduit.draft.new']`.

**Pontos de permissão:** cobrir edição de artigo existente (além de "novo");
estratégia de expiração/limpeza de rascunhos antigos.

**Critérios de aceite:**
- [ ] Escrever parcialmente → recarregar → conteúdo restaurado.
- [ ] Publicar → rascunho removido.
- [ ] Fluxo coberto por E2E Playwright.

**Status atual:** `EMPTY`

---

## Fase 5 — Qualidade
**Objetivo:** Atingir a meta de cobertura de mutação e consolidar a suite de
testes.

**Escopo incluído:**
- **StrykerJS** sobre a base migrada: meta ≥ 95% de mutation score.
- Ampliar cobertura E2E Playwright.
- Garantir branches passa/quebra (Playwright) documentadas.

**Critérios de aceite:**
- [ ] StrykerJS rodando e reportando ≥ 95% mutation score.
- [ ] E2E cobrindo todos os fluxos principais + dark mode + rascunhos.
- [ ] Branches `failing-e2e` e `passing-e2e` atualizadas.

**Status atual:** `EMPTY`

---

## Fase 6 — Operação
**Objetivo:** Containerizar a aplicação e ligar a stack de observabilidade.

**Escopo incluído:**
- **Dockerfile** para o app migrado (build Angular CLI → Nginx estático **ou**
  imagem Node se SSR — depende da decisão de §4.1/Fase 3).
- **`docker-compose`** orquestrando frontend + stack LGTM (Loki, Grafana,
  Tempo, Mimir).
- **Script Python** que sobe o Compose, aguarda a subida e valida logs de
  inicialização/encerramento; idempotente e usável em CI local.

**Ponto de permissão:** mapeamento de "contador por endpoint" e "start/stop"
para o frontend (SSR vs. SPA estático — depende da decisão de SSR na Fase 3).

**Critérios de aceite:**
- [ ] `docker-compose up` sobe frontend e stack LGTM sem erros.
- [ ] Script Python retorna sucesso validando logs esperados.
- [ ] Nenhum artefato de build commitado.

**Status atual:** `EMPTY`

---

## Sequência e dependências

```
Fase 1 (Fundação)
  └─▶ Fase 2 (Rede de segurança)   ← obrigatória antes da Fase 3
        └─▶ Fase 3 (Migração Angular 21)
              └─▶ Fase 4 (Dark mode + Rascunhos)
                    └─▶ Fase 5 (Qualidade)
                          └─▶ Fase 6 (Operação)
```

> A ordem das fases 4–6 pode variar conforme prioridade do time, **exceto**
> que a Fase 2 precede obrigatoriamente a Fase 3.
