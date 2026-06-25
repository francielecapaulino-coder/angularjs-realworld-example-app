# PLAN — 018-deploy-pipeline

## Status
State: PLANNED (aguardando decisão do alvo de hospedagem)

## Objetivo
Criar uma pipeline de CI/CD que valide e publique o app-ng (Angular 21 SPA) a cada
push na branch principal, com as redes de segurança (unit, contract, E2E) como
gate antes do deploy. Não há CI/CD hoje; o app-ng é a aplicação oficial.

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

## Escopo (após a decisão)
- Incluído:
  - `.github/workflows/ci.yml`: em PR e push — `npm ci` (raiz e app-ng), `build`,
    `test:unit`, `test:contract`, `test:e2e` (Playwright headless; instalar browsers).
  - `.github/workflows/deploy.yml` (ou job de deploy no ci): só na branch principal,
    após o gate, publica o `browser/` no alvo escolhido.
  - Tratamento do fallback SPA conforme o host (Pages: gerar `404.html`; Netlify/Vercel/CF:
    arquivo de config) e do `baseHref` (se Pages project site).
  - README: seção "Deploy" documentando o fluxo e a URL pública.
- Fora de escopo:
  - SSR/prerender (o app é SPA; pode ser slice futura se desejado).
  - Mudanças no código do app-ng além de `index.html`/config de build estritamente necessárias.

## Operational path & risk
- risk_category: C  # cria pipeline de publicação (entrega ao público) + usa secrets de deploy.
- operational_path: strict_path_C_D
- human_review: required

## Deterministic gates (quando implementado)
- build: `npm run build` verde no CI.
- unit_tests / contract_tests / e2e_tests: verdes no CI antes do deploy.
- secret_scan: nenhum segredo no repo; tokens só em GitHub Secrets.
- config_review: deploy só na branch principal; fallback SPA + baseHref corretos para o host.

## Condições de parada
- Se o deploy exigir credenciais/serviço que o usuário não quer configurar, parar e ajustar o alvo.
- Se o E2E for instável no CI, estabilizar (workers=1, retries) antes de habilitar o deploy.

## Pendências / decisão
- **DECISÃO NECESSÁRIA:** escolher o alvo de hospedagem (A/B/C/D). O restante do plano
  (fallback, baseHref, secrets) deriva dessa escolha.
- Confirmar o nome da branch principal (atual: `master`).
