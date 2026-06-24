# REVIEW — 005-angular-scaffold

## Veredito
Result: PASS

## Checagem de escopo
- Spec seguido: sim. Scaffold em `app-ng/`, dentro dos `files_owned`. `src/` legado intocado.
- Mudanças fora de escopo: nenhuma. `package.json` raiz não alterado (app-ng tem o seu próprio).

## Critérios de aceite
| Critério | Resultado | Evidência |
|---|---|---|
| Projeto Angular 21 gerado em `app-ng/`. | PASS | scaffold criado com `@angular/cli@21.2.17`. |
| `ng build` verde. | PASS | bundle 213.66 kB; dist gerado em 5.7 s. |
| Smoke unit test verde. | PASS | vitest 2/2 passed. |
| Conforme ADR-001 (Signals, history, SPA). | PASS | `signal` em app.ts; `provideRouter` history; `--ssr=false`; `<base href="/">`. |
| `app-ng/node_modules`/`dist` ignorados. | PASS | `.gitignore` do CLI cobre; git não rastreia node_modules. |
| `src/` legado inalterado. | PASS | `git diff --name-only HEAD -- src/` vazio. |

## Deterministic gates
| Gate | Resultado | Evidência |
|---|---|---|
| `build` | PASS | `npm run build` verde. |
| `unit_tests` | PASS | `CI=true npm test` — vitest 2/2. |
| `config_review` | PASS | history routing, sem SSR, standalone, base href; src/ intocado. |
| `secret_scan` | PASS | nenhum segredo em app-ng/src + configs. |

## Achados
| Severidade | Achado | Ação requerida |
|---|---|---|
| Baixa | Test runner do scaffold é **vitest** (não Karma/Jest que o CHARTER cogitava). | Aceitável — é o padrão do Angular 21, headless-friendly. Registrar; revisar na slice de testes. |
| Baixa | Angular CLI exige Node >=20.19/22.12. | Usar DevContainer (Node 22) ou nvm. Documentado. |
| Informativo | npm `latest` é Angular 22; fixado em 21 conforme CHARTER. | Mudar para 22 seria novo ponto de decisão. |

## Próximo passo
- Merge após revisão humana.
- Próxima slice (Fase 3): migrar layout + roteamento + interceptor `Authorization: Token`
  preservando `localStorage['jwtToken']` (Categoria C, strict_path).

## Revisão
- Tipo: functional + config
- Veredito: APPROVED
- Pontos verificados: build/test verdes; conformidade com ADR-001; src/ preservado;
  node_modules fora do versionamento; sem segredos.
- human_review: required
