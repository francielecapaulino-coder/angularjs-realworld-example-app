# REVIEW — 014-decommission-legacy

## Veredito
Result: PASS

## Checagem de escopo
- Spec seguido: sim, com a decisão do usuário de **arquivar** (não apagar) o legado.
- Mudanças no `app-ng`: nenhuma de código (apenas o build é consumido pelos scripts raiz).
- `legacy/` contém o app AngularJS intacto (apenas movido).

## Critérios de aceite
| Critério | Resultado | Evidência |
|---|---|---|
| Legado arquivado em legacy/ (histórico preservado). | PASS | git mv; `ls legacy/`. |
| package.json sem deps/scripts legados; build/serve → app-ng. | PASS | grep + inspeção. |
| README atualizado p/ Angular 21. | PASS | README.md. |
| Contract/unit/E2E verdes pós-corte. | PASS | 11/11, 89/89, 26/26. |
| Nenhuma referência legada funcional pendente. | PASS | config_review. |

## Deterministic gates
| Gate | Resultado | Evidência |
|---|---|---|
| `build` | PASS | `cd app-ng && npm run build`. |
| `unit_tests` | PASS | vitest 89/89. |
| `e2e_tests` | PASS | playwright 26/26 (serve app-ng). |
| `contract_tests` | PASS | jest 11/11 (API/OpenAPI). |
| `secret_scan` | PASS | nenhum segredo real. |
| `config_review` | PASS | src/+gulpfile arquivados; package.json/README/.gitignore limpos. |

## Revisão de segurança (security_reviewer)
- Tipo: security
- Veredito: APPROVED
- threat_model / pontos verificados:
  - Ativo protegido: a aplicação oficial entregue (agora app-ng) e as redes de segurança.
  - Vetores revisados:
    - Entrega do app errado → MITIGADO: `build`/`serve`/`pretest:e2e` apontam p/ app-ng;
      E2E serve `app-ng/dist/...` e passa 26/26.
    - Cobertura perdida no corte → MITIGADO: contract+unit+E2E verdes pós-arquivamento.
    - Código legado executável acidentalmente → MITIGADO: `legacy/` não é buildado/servido/testado;
      `legacy/README.md` sinaliza desativação.
    - Segredos → nenhum; scan limpo.
  - Invariantes do app-ng preservadas (interceptor Token, guards refresh-safe, sanitização).
- Achados:
| Severidade | Achado | Ação |
|---|---|---|
| Média | Categoria C (mudança de entrega) exige revisão humana. | Aprovação humana no PR. |
| Baixa | Comentários "mirrors legacy src/js/..." no app-ng referenciam caminho antigo. | Documentais; sem impacto funcional. Opcional ajustar depois. |
| Baixa | Deploy/hosting real não coberto. | Tarefa de infraestrutura separada. |
- human_review: required

## Próximo passo
- Merge após revisão humana.
- **Migração concluída**: app-ng é a aplicação oficial; legado arquivado em `legacy/`.
- Opcional (futuro): pipeline de deploy do app-ng; limpeza dos comentários "mirrors legacy".
