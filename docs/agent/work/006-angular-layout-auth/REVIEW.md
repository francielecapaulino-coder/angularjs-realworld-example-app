# REVIEW — 006-angular-layout-auth

## Veredito
Result: PASS

## Checagem de escopo
- Spec seguido: sim. Tudo em `app-ng/`, dentro dos `files_owned`. `src/` legado intocado.
- Mudanças fora de escopo: nenhuma. Telas reais como placeholders, conforme planejado.

## Critérios de aceite
| Critério | Resultado | Evidência |
|---|---|---|
| Shell (header+outlet+footer) renderiza. | PASS | app.spec.ts: header/outlet/footer presentes. |
| Interceptor adiciona `Token <jwt>` só p/ apiBase. | PASS | token.interceptor.spec.ts (5 testes). |
| Esquema `Token`, não `Bearer`. | PASS | teste dedicado + grep. |
| Token não vaza p/ origem externa. | PASS | teste com demo.productionready.io/main.css → sem header. |
| 401 limpa token. | PASS | teste interceptor + auth.service. |
| AuthService signal-based. | PASS | currentUser (signal), isAuthenticated (computed). |
| Header reativo ao auth. | PASS | header.component.spec.ts (logado/deslogado). |
| Roteamento URLs limpas (history). | PASS | provideRouter sem withHashLocation; base href. |
| Design system preservado. | PASS | index.html com Ionicons/Fonts/main.css. |
| `src/` legado inalterado. | PASS | git diff vazio. |

## Deterministic gates
| Gate | Resultado | Evidência |
|---|---|---|
| `build` | PASS | `npm run build` — bundle 236.15 kB. |
| `unit_tests` | PASS | vitest 15/15 (4 arquivos). |
| `negative_tests` | PASS | sem token=sem header; não-apiBase=sem header; Token≠Bearer; 401 limpa. |
| `secret_scan` | PASS | nenhum segredo real; `Bearer` só em comentário; token fictício. |
| `config_review` | PASS | history routing; src/ intocado; constantes corretas. |

## Revisão de segurança (security_reviewer)
- Tipo: security
- Veredito: APPROVED
- threat_model / pontos verificados:
  - Ativo protegido: token JWT da sessão em `localStorage['jwtToken']`.
  - Fronteira de confiança: o header `Authorization` só pode cruzar para o `apiBase`.
  - Vetores revisados:
    - Vazamento de credencial para terceiros/CDN → MITIGADO: `req.url.startsWith(apiBase)`;
      teste confirma que requisição a `demo.productionready.io` NÃO recebe o header.
    - Confusão de esquema (`Bearer` vs `Token`) → MITIGADO: usa `Token `; teste nega `Bearer`.
    - Envio de header sem credencial → MITIGADO: só adiciona quando há token.
    - Token órfão após 401 → MITIGADO: `jwt.destroy()` no 401.
- Achados:
| Severidade | Achado | Ação |
|---|---|---|
| Média | Categoria C exige revisão humana além da automatizada. | Exigir aprovação humana no PR. |
| Baixa | 401 não força reload (difere do legado). | Comportamento moderno intencional; documentado; validar via E2E futura. |
| Baixa | Token em `localStorage` é legível por JS (XSS) — herdado do contrato legado. | Fora de escopo da migração; manter paridade. Markdown será sanitizado (ADR-001) na slice de artigos. |
- human_review: required

## Próximo passo
- Merge após revisão humana.
- Próximas slices Fase 3: telas reais (auth/login, home/feed, article+markdown sanitizado,
  editor, profile, settings) + migração da suite E2E para URLs limpas.
