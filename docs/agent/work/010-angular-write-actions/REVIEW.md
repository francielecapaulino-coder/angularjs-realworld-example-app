# REVIEW — 010-angular-write-actions

## Veredito
Result: PASS

## Checagem de escopo
- Spec seguido: sim. Tudo em `app-ng/`, dentro dos `files_owned`. `src/` legado intocado.
- Mudanças fora de escopo: nenhuma. Editor/profile/settings seguem placeholders.

## Critérios de aceite
| Critério | Resultado | Evidência |
|---|---|---|
| favorite/unfavorite/delete article. | PASS | articles.service.spec.ts. |
| follow/unfollow/get profile. | PASS | profile.service.spec.ts. |
| add/destroy comment. | PASS | comments.service.spec.ts. |
| Anônimo → /register sem mutação. | PASS | favorite/follow button specs + gate grep. |
| canModify reativo (corrige bug legado). | PASS | article-actions.spec.ts (autor/não-autor/anônimo). |
| Comentar/excluir na página. | PASS | article.component.spec.ts. |
| `src/` legado inalterado. | PASS | git diff vazio. |

## Deterministic gates
| Gate | Resultado | Evidência |
|---|---|---|
| `build` | PASS | `npm run build` — 369.00 kB. |
| `unit_tests` | PASS | vitest 69/69 (18 arquivos). |
| `negative_tests` | PASS | anônimo→/register sem request; toggles otimistas; canModify autor/não-autor; delete navega. |
| `secret_scan` | PASS | nenhum segredo/Bearer real; valores fictícios. |
| `config_review` | PASS | mutações só p/ apiBase; src/ intocado. |

## Revisão de segurança (security_reviewer)
- Tipo: security
- Veredito: APPROVED
- threat_model / pontos verificados:
  - Ativo protegido: sessão do usuário e integridade dos dados (favorites/follows/comments/artigos).
  - Fronteira: mutações exigem auth; token enviado só p/ apiBase (interceptor 006).
  - Vetores revisados:
    - Mutação por anônimo → MITIGADO: botões redirecionam p/ `/register` sem chamar a API
      (testes `expectNone`).
    - Token vazado em mutação → MITIGADO: URLs a partir de `apiBase`; interceptor restringe header.
    - Exclusão indevida → API exige autoria; UI só mostra Delete (artigo) p/ autor (`canModify`)
      e Delete (comentário) p/ próprio (`canDelete`).
    - Bug legado de `article-actions` (crash autenticado) → CORRIGIDO: `canModify` via computed,
      sem acesso a binding no construtor; teste de regressão confirma renderização.
- Achados:
| Severidade | Achado | Ação |
|---|---|---|
| Média | Categoria C exige revisão humana além da automatizada. | Aprovação humana no PR. |
| Baixa | Atualização otimista sem reversão automática em erro. | Aceitável; melhorar com toast/rollback em slice futura se necessário. |
| Baixa | E2E baseline da Fase 2 (article-actions buggy) ficará desatualizado. | Atualizar ao migrar a suite E2E para URLs limpas. |
- human_review: required

## Próximo passo
- Merge após revisão humana.
- Próximas slices: editor (POST/PUT artigo), profile (GET + abas), settings (+ logout);
  depois migrar a suite E2E da Fase 2 para URLs limpas e atualizar o baseline de article-actions.
