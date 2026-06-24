# REVIEW — 007-angular-auth-screens

## Veredito
Result: PASS

## Checagem de escopo
- Spec seguido: sim. Tudo em `app-ng/`, dentro dos `files_owned`. `src/` legado intocado.
- Mudanças fora de escopo: nenhuma. Demais telas seguem placeholders.

## Critérios de aceite
| Critério | Resultado | Evidência |
|---|---|---|
| Login → POST /users/login + setAuth. | PASS | auth.service.spec.ts. |
| Register → POST /users (rota distinta). | PASS | auth.service.spec.ts. |
| 422 não salva token, exibe erros. | PASS | auth.service + auth.component spec. |
| AuthComponent alterna login/register. | PASS | auth.component.spec.ts (username só register). |
| Submit desabilitado durante envio. | PASS | `fieldset [disabled]="isSubmitting()"`. |
| ListErrors renderiza `{ field: [msgs] }`. | PASS | list-errors.component.spec.ts. |
| Rotas /login e /register ligadas. | PASS | app.routes.ts. |
| `src/` legado inalterado. | PASS | git diff vazio. |

## Deterministic gates
| Gate | Resultado | Evidência |
|---|---|---|
| `build` | PASS | `npm run build` — 286.33 kB. |
| `unit_tests` | PASS | vitest 24/24 (6 arquivos). |
| `negative_tests` | PASS | 422 não salva token; register≠login; submit desabilitado; erro exibido. |
| `secret_scan` | PASS | nenhum segredo; valores fictícios `-007`; sem `Bearer`. |
| `config_review` | PASS | rotas corretas; src/ intocado. |

## Revisão de segurança (security_reviewer)
- Tipo: security
- Veredito: APPROVED
- threat_model / pontos verificados:
  - Ativo protegido: credenciais (email/senha) e token de sessão.
  - Fronteira: POST de credenciais só para `apiBase` (garantido pelo interceptor 006);
    token salvo via `setAuth`→`JwtService` (`localStorage['jwtToken']`).
  - Vetores revisados:
    - Credencial enviada a destino errado → MITIGADO: URL construída a partir de `apiBase`;
      interceptor (006) garante header só p/ apiBase.
    - Sessão estabelecida com resposta inválida → MITIGADO: `setAuth` só em sucesso (2xx);
      teste 422 confirma que não autentica.
    - Vazamento de detalhes de erro → erros do servidor exibidos como `{ field: [msgs] }`
      (mensagens do RealWorld), sem stack/credenciais.
    - Credencial em código/teste → apenas valores fictícios `-007`.
- Achados:
| Severidade | Achado | Ação |
|---|---|---|
| Média | Categoria C exige revisão humana além da automatizada. | Aprovação humana no PR. |
| Baixa | Token em `localStorage` (herdado, paridade com legado). | Fora de escopo; manter contrato. |
- human_review: required

## Próximo passo
- Merge após revisão humana.
- Próximas slices: home/feed (lista de artigos + tags), article + markdown sanitizado,
  editor, profile, settings (com logout); depois migrar a suite E2E para URLs limpas.
