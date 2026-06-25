# PLAN — 018-deploy-pipeline

## Status
State: IN PROGRESS — escopo reduzido a **CI de validação** (sem deploy), por decisão do usuário.

## Objetivo
Criar um workflow de **CI de validação** que rode as redes de segurança (build, unit,
contract, E2E) a cada push/PR. **Sem etapa de deploy** por enquanto (sem secrets, sem
publicação) — o deploy fica para uma slice futura quando o alvo for escolhido.
Não há CI/CD hoje; o app-ng é a aplicação oficial.

## Fatos da auditoria (estado atual)
- app-ng é **SPA puro** (history API; sem SSR — não há `server.ts`/`main.server.ts`;
  `prerendered-routes.json` vazio).
- Build output: `app-ng/dist/app-ng/browser` (contém `index.html`).
- Scripts raiz já prontos: `build`, `serve`, `test:unit`, `test:contract`, `test:e2e` (+`pretest:e2e`).
- Sem workflows em `.github/workflows/`. Repo no GitHub.
- `index.html` usa `<base href="/">`.

## Pontos críticos de SPA (devem ser tratados)
1. **Fallback de history API**: rotas limpas (ex.: `/article/:slug`) precisam servir
   `index.html` em paths desconhecidos. Estratégia depende do host (404.html no Pages;
   regra de redirect no Netlify/Vercel/Cloudflare).
2. **baseHref**: GitHub Pages "project site" serve sob `/<repo>/` → exige
   `ng build --base-href=/<repo>/`. Hosts em domínio raiz (Netlify/Vercel/Cloudflare/Pages
   com domínio próprio) mantêm `baseHref=/`.
3. **Gate antes do deploy**: build + unit + contract + E2E verdes; deploy só na branch principal.
4. **Segredos**: nenhum segredo de app (API é pública e mockada nos testes). Tokens de deploy
   ficam em GitHub Secrets (não no repo).

## Opções de alvo (DECISÃO PENDENTE)
- **A) GitHub Pages (via GitHub Actions)** — zero serviço externo; deploy do `browser/`.
  - Prós: nativo do GitHub, sem conta extra. Contras: baseHref `/<repo>/` (a menos de domínio
    próprio) e fallback via cópia `index.html`→`404.html`.
- **B) Netlify** — `netlify.toml` com publish dir + redirect SPA (`/* /index.html 200`).
  - Prós: fallback trivial, domínio raiz, previews de PR. Contras: conta/serviço externo + token.
- **C) Vercel** — `vercel.json` (rewrites para SPA).
  - Prós: previews, domínio raiz. Contras: conta/token externos.
- **D) Cloudflare Pages** — build command + output dir; SPA fallback nativo.
  - Prós: domínio raiz, fallback nativo. Contras: conta/token externos.

Recomendação padrão (sem serviço externo): **A) GitHub Pages**.

## Escopo — CI de validação (decisão do usuário)
- Incluído:
  - `.github/workflows/ci.yml`: em `push` e `pull_request` —
    - setup Node 22 (com cache npm),
    - `npm ci` na raiz e em `app-ng`,
    - `npm run build` (app-ng),
    - `npm run test:unit` (Vitest 93),
    - `npm run test:contract` (Jest/OpenAPI 11),
    - `npx playwright install --with-deps chromium` + `npm run test:e2e` (Playwright 37),
    - upload do `playwright-report` como artefato em falha.
  - README: seção "CI" documentando o que roda.
- Fora de escopo (slice futura):
  - Etapa de **deploy** e escolha do host (Pages/Netlify/Vercel/Cloudflare), com fallback SPA,
    baseHref e secrets. (Opções A–D acima preservadas para a slice de deploy.)
  - SSR/prerender.
  - Mudanças no código do app-ng.

## Operational path & risk
- risk_category: B  # CI de validação aditivo; sem deploy, sem secrets, reversível.
- operational_path: standard_path_B
- human_review: optional

## Deterministic gates
- config_review: workflow roda em push/PR; usa scripts já existentes; sem secrets; sem deploy.
- (validação local antes do commit) build + unit + contract + e2e verdes localmente.
- secret_scan: nenhum segredo no workflow.

## Condições de parada
- Se o E2E for instável no CI, estabilizar (workers=1, retries) — config já tem workers=1.
- Não adicionar etapa de deploy nesta slice (decidido CI-only).

## Pendências / decisão
- Branch principal: `master` (confirmado pelo repo).
- Deploy fica para a slice futura (alvo a escolher).
