# REVIEW — 009-angular-article-page

## Veredito
Result: PASS

## Checagem de escopo
- Spec seguido: sim. Tudo em `app-ng/`, dentro dos `files_owned`. `src/` legado intocado.
- Mudanças fora de escopo: nenhuma. Ações de escrita ficam para a próxima slice.

## Critérios de aceite
| Critério | Resultado | Evidência |
|---|---|---|
| GET /articles/:slug. | PASS | articles.service.spec.ts (get). |
| GET comments. | PASS | comments.service.spec.ts. |
| Markdown renderizado e sanitizado. | PASS | markdown.pipe.spec.ts (render + 4 XSS). |
| Sem bypassSecurityTrustHtml. | PASS | grep gate (só menção em comentário). |
| Comentários como texto. | PASS | CommentCard usa interpolação. |
| ArticleComponent: artigo/comentários/anônimo/autenticado. | PASS | article.component.spec.ts. |
| Rota /article/:slug ligada. | PASS | app.routes.ts. |
| `src/` legado inalterado. | PASS | git diff vazio. |

## Deterministic gates
| Gate | Resultado | Evidência |
|---|---|---|
| `build` | PASS | `npm run build` — 356.25 kB. |
| `unit_tests` | PASS | vitest 49/49 (14 arquivos). |
| `negative_tests` (XSS) | PASS | strip `<script>`, remove `onerror`, neutraliza `javascript:`→`unsafe:`; nenhuma chamada de bypass. |
| `secret_scan` | PASS | nenhum segredo/Bearer real. |
| `config_review` | PASS | rota ligada; src/ intocado. |

## Revisão de segurança (security_reviewer)
- Tipo: security
- Veredito: APPROVED
- threat_model / pontos verificados:
  - Ativo protegido: o DOM da página de artigo / sessão do usuário.
  - Fronteira de confiança: corpo do artigo e comentários = conteúdo NÃO confiável.
  - Vetores revisados:
    - XSS via `<script>` no corpo → MITIGADO: DomSanitizer remove `<script>` (teste).
    - XSS via event handler (`onerror`) → MITIGADO: removido (teste).
    - XSS via `javascript:` URL → MITIGADO: reescrito para `unsafe:` inerte (teste).
    - Bypass de sanitização → MITIGADO: proibição de `bypassSecurityTrustHtml` (gate grep);
      sanitização explícita + `[innerHTML]` (dupla sanitização, defense in depth).
    - Comentários como HTML → MITIGADO: renderizados como texto (interpolação).
- Achados:
| Severidade | Achado | Ação |
|---|---|---|
| Média | Categoria C exige revisão humana além da automatizada. | Aprovação humana no PR. |
| Baixa | `marked` é nova dependência; opções padrão usadas. | Revisar config se markdown avançado for necessário. |
| Baixa | Bug legado de `article-actions` ainda não corrigido (não usado nesta tela). | Corrigir na próxima slice (write actions). |
- human_review: required

## Próximo passo
- Merge após revisão humana.
- Próxima slice (C): ações de escrita — comentar (POST/DELETE), favoritar/seguir
  (POST/DELETE), editar/excluir artigo; corrigir o bug do `article-actions`.
  Depois: editor, profile, settings (+ logout) e migração da suite E2E para URLs limpas.
