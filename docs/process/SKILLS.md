# Skills disponiveis (CODA)

Skills sao conjuntos de instrucoes reutilizaveis para tarefas especializadas, executadas
pelo agente via `run_skill`. As skills abaixo estao disponiveis neste ambiente e podem ser
usadas nas proximas slices de QE/testes.

| Skill | Para que serve | Quando usar |
|---|---|---|
| `globant-qe-web-explorer` | Explora uma area da aplicacao via browser (clica, preenche, valida estados, documenta seletores). Modo automation produz `validated-test-cases.md`. | Descoberta de comportamento/seletores antes de automatizar. |
| `globant-qe-test-plan` | Gera um plano de teste ISTQB (escopo, abordagem, tecnicas por user story, criterios de entrada/saida, riscos, RACI, cronograma, metricas). | Quando se precisa de um plano de teste formal. |
| `globant-qe-test-scenario-designer` | Desenha cenarios de teste UI (positivos, negativos, edge), dados de teste, pontos de validacao e prioridade, a partir de user stories. | Criar casos de teste a partir de requisitos antes da automacao. |
| `globant-qe-mcp-test-executor` | Executa casos de teste documentados passo a passo via Playwright MCP (navega, interage, valida, reporta) sem gerar codigo de automacao. | Rodar casos manualmente via automacao de browser para verificar comportamento. |
| `globant-qe-bug-report-writer` | Converte resultados de teste (TCE/A11y/Regression) em relatorios de bug normalizados; modo consolidate agrega bugs em inventario priorizado. | Transformar resultados crus em bug reports / consolidar bugs. |

## Como usar

- O agente carrega a skill com `run_skill("<nome>")` e segue as instrucoes retornadas.
- A saida de cada skill deve ser salva no local definido pela propria skill; se nao houver,
  combinar o destino antes de executar.

## Skills potencialmente uteis (ainda nao usadas)

Para as pendencias da auditoria, estas skills podem apoiar slices futuras:
- **Dark mode / draft (frontend)**: `globant-qe-test-scenario-designer` + `globant-qe-web-explorer`
  para desenhar e validar cenarios antes/depois da implementacao.
- **Cobertura E2E / regressao**: `globant-qe-mcp-test-executor` para execucao guiada.
