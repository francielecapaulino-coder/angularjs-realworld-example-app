# PLAN — 005-angular-scaffold

## Status
State: PLANNED

## Objetivo
Criar o scaffold do projeto Angular 21 em um diretório separado `app-ng/`,
coexistindo com o app AngularJS legado em `src/`, com build verde via Angular CLI.
Esta slice valida a toolchain; NÃO migra telas nem toca `src/`.

## Escopo
- Incluído:
  - Gerar projeto Angular 21 em `app-ng/` via Angular CLI (`@angular/cli@21`),
    standalone, roteamento history (PathLocationStrategy), CSS, sem SSR (SPA estático).
  - Garantir `ng build` (produção) verde.
  - Garantir `ng test` (unit, Karma/Jasmine padrão do scaffold) verde no smoke test inicial.
  - Adicionar `.gitignore` para `app-ng/node_modules`, `app-ng/dist`, `.angular/`.
  - NÃO instalar `app-ng/node_modules` no repositório (ignorado); documentar comandos.
  - Registrar evidências em `PROGRESS.md` e `REVIEW.md`.
  - Atualizar `docs/agent/STATE.md`.
- Fora de escopo:
  - Qualquer tela, rota de produto, serviço HTTP, interceptor de auth.
  - Alterações em `src/` legado.
  - Alteração do contrato RealWorld ou do design system.
  - Migração da suite E2E para URLs limpas (slice posterior).
  - Atualização do `package.json` raiz (o app-ng tem seu próprio package.json).
- files_owned:
  - `app-ng/**` (gerado pelo CLI)
  - `.gitignore` (entradas do app-ng)
  - `docs/agent/work/005-angular-scaffold/PLAN.md`
  - `docs/agent/work/005-angular-scaffold/PROGRESS.md`
  - `docs/agent/work/005-angular-scaffold/REVIEW.md`
  - `docs/agent/STATE.md`

## Origem e fase
- Fase (ROADMAP): 3 — Migração Angular 21
- Decisões: `docs/adr/ADR-001-angular-21-migration-stack.md` (aprovadas pelo usuário).
- Estratégia de coexistência aprovada: diretório separado `app-ng/`; primeira slice
  = scaffold + build verde (sem telas).
- context_sources:
  - docs: `docs/adr/ADR-001-angular-21-migration-stack.md`, `CHARTER.md`, `ROADMAP.md`.

## Versão Angular
- Angular CLI **21** (`@angular/cli@21`, v21-lts 21.2.17) — conforme CHARTER/ROADMAP.
  Observação: `latest` no npm é 22.0.4; fixamos em 21 por ser o alvo documentado.
  Mudar para 22 seria um novo ponto de decisão.

## Dados, segurança e compliance
- Dados envolvidos: nenhum dado de usuário; apenas scaffold de projeto.
- Credenciais: nenhuma. Sem interceptor de auth nesta slice.
- Revisão humana: required (toca toolchain de build/deploy — pré-requisito da migração).

## Operational path & risk
- risk_category: B  # touches_build_deploy: adiciona nova toolchain Angular CLI.
                    # Não cruza fronteira de auth/secrets (sem código de auth nesta slice).
                    # Não altera src/ legado nem o contrato.
- operational_path: standard_path_B

## Model Profile
```yaml
risk_category: B
planner:   { tier: standard, effort: medium }
generator: { tier: standard, effort: medium }
evaluator: { tier: standard, effort: medium }
reviewer:  { tier: standard, effort: low }
deterministic_gates: [build, unit_tests, config_review, secret_scan]
human_review: required
budget_max_usd: 1.00
rationale: |
  Categoria B por adicionar toolchain Angular CLI (touches_build_deploy). Sem
  código de auth/produto nesta slice, então não escala para C. Gates focam em
  build verde, smoke unit test e revisão de config (sem SSR, history routing).
```

## Execução não-interativa (CRÍTICO)
`ng new` é interativo. Usar flags para evitar prompts:
```
npx @angular/cli@21 new app-ng \
  --directory app-ng \
  --routing \
  --style=css \
  --ssr=false \
  --skip-git \
  --package-manager=npm \
  --defaults
```
- `--defaults` + flags explícitas evitam todos os prompts.
- `--skip-git` porque já estamos em um repositório git.
- Rodar com Node 22 (nvm use 22), pois o CLI exige Node moderno.

## Deterministic gates (a rodar antes de READY)
- build: `cd app-ng && npm run build` verde (artefatos em `app-ng/dist`).
- unit_tests: smoke test do scaffold verde (headless). Se Karma exigir browser
  não disponível, documentar e usar `--watch=false --browsers=ChromeHeadless`.
- config_review: confirmar `PathLocationStrategy` (history), sem SSR, standalone,
  `<base href="/">` presente; `src/` legado inalterado.
- secret_scan: nenhum segredo no scaffold gerado.

## Condições de parada
- Se o Angular CLI 21 exigir Node incompatível com o DevContainer (Node 22) — parar e reportar.
- Se `ng new` falhar por prompt interativo não coberto — parar, capturar o prompt e re-rodar com flag.
- Se o scaffold tentar escrever fora de `app-ng/` (ex.: package.json raiz) — parar e reclassificar.
- Se o smoke unit test exigir browser indisponível no ambiente — documentar como
  pendência e marcar o gate como "validado no DevContainer".

## Riscos e pendências
- Angular CLI requer Node >=20.19/22.12; ambiente local usa nvm (Node 22).
- `app-ng/node_modules` é grande; deve ficar fora do versionamento (.gitignore).
- A suite E2E da Fase 2 só será migrada para URLs limpas em slice posterior;
  até lá, os E2E continuam apontando para o app legado.
- **Pendência: aprovação do plano pelo usuário antes de executar o scaffold.**
