# REVIEW — 012-angular-profile-settings

## Veredito
Result: PASS

## Checagem de escopo
- Spec seguido: sim. Tudo em `app-ng/`, dentro dos `files_owned`. `src/` legado intocado.
- Mudanças fora de escopo: nenhuma. (Remoção do placeholder das rotas é consequência direta de migrar as últimas telas.)

## Critérios de aceite
| Critério | Resultado | Evidência |
|---|---|---|
| AuthService.update PUT /user → setAuth. | PASS | auth.service.spec. |
| Profile carrega + abas author/favorited. | PASS | profile.component.spec. |
| Profile próprio (Edit Settings) vs outro (Follow). | PASS | profile.component.spec. |
| Settings pré-preenche + PUT + nav. | PASS | settings.component.spec. |
| Senha só quando preenchida. | PASS | settings.component.spec. |
| Logout purga sessão + nav `/`. | PASS | settings.component.spec. |
| /settings protegido por authGuard. | PASS | app.routes + guard spec (011). |
| `src/` legado inalterado. | PASS | git diff vazio. |

## Deterministic gates
| Gate | Resultado | Evidência |
|---|---|---|
| `build` | PASS | `npm run build` — 376.50 kB. |
| `unit_tests` | PASS | vitest 89/89 (22 arquivos). |
| `negative_tests` | PASS | settings guardado; update PUT /user re-armazena sessão; logout limpa token; abas com filtro correto; próprio vs outro. |
| `secret_scan` | PASS | nenhum segredo/Bearer real; valores fictícios. |
| `config_review` | PASS | settings com authGuard; update p/ apiBase; src/ intocado. |

## Revisão de segurança (security_reviewer)
- Tipo: security
- Veredito: APPROVED
- threat_model / pontos verificados:
  - Ativo protegido: sessão/token do usuário e integridade da conta.
  - Fronteira: settings exige auth; profile é público (leitura).
  - Vetores revisados:
    - Acesso anônimo a settings → MITIGADO: `authGuard` → /login (rota usa guard; teste do guard em 011).
    - Token órfão após logout → MITIGADO: `purgeAuth()` remove token (JwtService.destroy) e zera o estado (teste).
    - Rotação de token no update → TRATADO: PUT /user retorna novo token, re-armazenado via setAuth (teste verifica jwt.get()).
    - Senha vazada/forçada → MITIGADO: senha só é enviada quando preenchida (teste); campo é password.
    - Update mal roteado → MITIGADO: PUT p/ `apiBase`/user (config_review).
- Achados:
| Severidade | Achado | Ação |
|---|---|---|
| Média | Categoria C exige revisão humana além da automatizada. | Aprovação humana no PR. |
| Baixa | Trocar username muda a URL do perfil. | Tratado: navega ao novo :username após update. |
| Baixa | E2E baseline da Fase 2 a atualizar. | Atualizar ao migrar a suite E2E. |
- human_review: required

## Próximo passo
- Merge após revisão humana.
- **Marco:** todas as telas principais do RealWorld migradas para Angular 21.
- Próxima fase: migrar a suite E2E da Fase 2 para URLs limpas (incl. baseline de
  `article-actions`) e planejar o descomissionamento do app AngularJS legado em `src/`.
