# REVIEW — 013-e2e-migration

## Veredito
Result: PASS

## Checagem de escopo
- Spec seguido: sim, com **re-escopo aprovado pelo usuário**: a migração E2E revelou uma
  corrida real de sessão no app-ng; a correção entrou nesta slice (acionou a condição de
  parada do PLAN → reclassificado/aprovado). Continua Categoria C.
- `src/` legado: inalterado. Mudanças no app-ng limitadas à inicialização (app.config/app.ts) + spec.

## Critérios de aceite
| Critério | Resultado | Evidência |
|---|---|---|
| webServer serve o app-ng (SPA). | PASS | playwright.config. |
| URLs limpas + seletores app-*. | PASS | suite reescrita; 26/26. |
| Baseline invertido (ações renderizam autenticado). | PASS | Suite 7. |
| Coberturas novas (comentar/settings/logout/abas/guard). | PASS | Suites 5/7/9/10. |
| Guard anônimo → /login (refresh-safe). | PASS | Suite "Editor guard" + correção do initializer. |
| `src/` legado inalterado. | PASS | git diff vazio. |

## Deterministic gates
| Gate | Resultado | Evidência |
|---|---|---|
| `build` | PASS | `npm run build` — 376.88 kB. |
| `e2e_tests` | PASS | `npx playwright test` — 26/26 (9.1s). |
| `unit_tests` (regressão da mudança no app.config) | PASS | vitest 89/89. |
| `negative_tests` | PASS | anônimo→/login; logout limpa jwtToken; baseline invertido. |
| `secret_scan` | PASS | apenas `*-e2e` fictícios. |
| `config_review` | PASS | webServer→app-ng; src/ intocado. |

## Revisão de segurança (security_reviewer)
- Tipo: security
- Veredito: APPROVED
- threat_model / pontos verificados:
  - Ativo protegido: a rede de segurança E2E (autoriza o descomissionamento) e a sessão do usuário.
  - Achado crítico desta slice: **corrida de sessão** — guard avaliava antes do verifyAuth,
    deslogando indevidamente em refresh de rotas autenticadas. CORRIGIDO via APP_INITIALIZER
    bloqueando a navegação inicial; E2E de acesso direto provam a correção.
  - Vetores revisados:
    - Falsa confiança por E2E frouxo → MITIGADO: asserções específicas (URLs, render de ações, token).
    - Token órfão no logout → coberto (Suite 10 verifica jwtToken == null).
    - Credenciais reais → nenhuma; só fictícios `*-e2e`; rede mockada.
- Achados:
| Severidade | Achado | Ação |
|---|---|---|
| Alta (resolvido) | Corrida de sessão deslogava em refresh de /editor e /settings. | CORRIGIDO (APP_INITIALIZER + disabled initial navigation). |
| Média | Categoria C exige revisão humana. | Aprovação humana no PR. |
| Baixa | E2E exige build prévio do app-ng. | Documentado no playwright.config e no PROGRESS. |
- human_review: required

## Próximo passo
- Merge após revisão humana.
- Próxima slice (C): descomissionamento do AngularJS legado (`src/`, gulp, deps legadas),
  servindo o app-ng como a aplicação oficial.
