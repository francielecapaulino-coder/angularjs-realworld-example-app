# PROGRESS — 009-angular-article-page

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/009-angular-article-page/PLAN.md` criado |
| 2026-06-24 | builder | EVALUATING | marked + MarkdownPipe + services + ArticleComponent + CommentCard + rota; build + 49 testes verdes |

## Decisões
- Categoria C: corpo do artigo (markdown não confiável) → HTML no DOM (vetor XSS).
- Sanitização: `DomSanitizer.sanitize(SecurityContext.HTML, marked.parse(body))` + `[innerHTML]`.
  **Sem `bypassSecurityTrustHtml`** (confirmado por grep no gate).
- `marked@^15` adicionado ao app-ng (a opção legada `{ sanitize: true }` não existe mais;
  sanitização agora é responsabilidade do DomSanitizer — alinhado ao ADR-001).
- Comentários exibidos como TEXTO (interpolação), nunca como HTML.
- Esta slice é leitura (artigo + comentários); ações de escrita na próxima slice C.
- Descoberta: o DomSanitizer neutraliza `javascript:` reescrevendo para `unsafe:javascript:`
  (forma inerte) — o teste valida essa neutralização, não a remoção literal da string.

## Conformidade com PLAN / ADR-001
| Item | Estado |
|---|---|
| GET /articles/:slug | ✓ (articles.service.get) |
| GET /articles/:slug/comments | ✓ (comments.service.getAll) |
| Markdown via marked + DomSanitizer | ✓ (MarkdownPipe) |
| Sem bypassSecurityTrustHtml | ✓ (grep gate) |
| Comentários como texto | ✓ (CommentCard interpolação) |
| Rota /article/:slug → ArticleComponent | ✓ |
| Ações de escrita fora de escopo | ✓ (form desabilitado; favoritar/seguir/editar próxima slice) |

## Arquivos criados/alterados (app-ng/, exceto docs)
- `package.json` (+ marked@^15)
- `src/app/core/models/comment.model.ts`
- `src/app/core/articles/articles.service.ts` (+ spec) — adiciona `get`
- `src/app/core/comments/comments.service.ts` (+ spec)
- `src/app/shared/markdown.pipe.ts` (+ spec, com 4 testes de XSS)
- `src/app/shared/comment-card.component.ts`
- `src/app/pages/article/article.component.ts` + html (+ spec)
- `src/app/app.routes.ts` — /article/:slug → ArticleComponent
- `src/` legado: **inalterado**

## Comandos e resultados
| Comando | Resultado |
|---|---|
| `npm install marked@^15` | PASS — marked@15.0.12 |
| `cd app-ng && npm run build` | PASS — `build`: bundle 356.25 kB |
| `cd app-ng && CI=true npm test` | PASS — `unit_tests`/`negative_tests`: vitest 49/49 (14 arquivos) |
| `grep .bypassSecurityTrust (chamada)` | PASS — `negative_tests`: nenhuma chamada de bypass (só menção em comentário) |
| `grep` segredos/Bearer | PASS — `secret_scan`: nenhum |
| `grep` rota | PASS — `config_review`: /article/:slug → ArticleComponent |
| `git diff --name-only HEAD -- src/` | PASS — `config_review`: src/ legado inalterado |

## Cobertura de testes nesta slice (12 novos, total 49)
- markdown.pipe (6): vazio; markdown básico; **strip `<script>`**; **remove `onerror`**;
  **neutraliza `javascript:` (unsafe:)**; mantém links seguros.
- articles.service.get (1): GET /articles/:slug + unwrap.
- comments.service (1): GET comments + unwrap.
- article.component (4): render artigo+body sanitizado+tags; prompt anônimo;
  form (desabilitado) autenticado; render comentários.

## Riscos residuais / pendências
- `apiBase` pode estar indisponível; testes mockados.
- Ações de escrita (comentar/favoritar/seguir/editar) na próxima slice C; inclui
  corrigir o bug legado de `article-actions`.
- Requer revisão humana + security_reviewer antes de merge (Categoria C).
