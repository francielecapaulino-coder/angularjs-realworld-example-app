# SOURCES — Conduit Frontend

Registro de todas as fontes que governam o trabalho agêntico neste repositório.

| Caminho | Tipo | Autoridade | Status | Escopo / gatilho |
|---|---|---|---|---|
| `documentacao/GUIA-DE-REFATORACAO.md` | prd+roadmap+adr | authoritative | referenced (não versionado — ver §13 do guia) | Toda e qualquer decisão de produto, arquitetura, design e processo neste repositório. Tem precedência sobre suposições do agente. |
| `docs/agent/context/CHARTER.md` | charter | authoritative | in-repo | Identidade, personas, escopo, riscos, stack, DoD — derivado do guia acima. |
| `docs/agent/context/ROADMAP.md` | roadmap | authoritative | in-repo | Fases, sequência e critérios de aceite por fase. |
| `docs/agent/OPERATING-GUIDE.md` | operating-guide | authoritative | in-repo | Contrato de trabalho do agente: ciclo, estados, categorias de risco, caminhos operacionais, papéis, gates, tiers. |
| `README.md` | onboarding | reference | in-repo | Getting started, URL da demo, link para tutorial Thinkster. |
| `src/js/config/app.constants.js` | config | reference | in-repo | URL base da API e chave JWT (`jwtToken`) — imutáveis até migração. |
| `docs/api/realworld-openapi.yaml` | api | authoritative | in-repo | Contrato RealWorld consumido pelo app atual; fonte para testes de contrato da Fase 2 e paridade da migração. |

## SKILL.md
Nenhum SKILL.md registrado até o momento. Se o usuário fornecer playbooks de
execução com frontmatter `name` + `description`, registrá-los aqui com o
`description` como gatilho de seleção.

## DESIGN.md
Nenhum DESIGN.md local. O design system é 100% remoto
(`//demo.productionready.io/main.css` + Ionicons + Google Fonts). As classes
e estrutura de marcação Conduit são a fonte de verdade visual — preservar
pixel-equivalente no tema claro. Dark mode é camada de override local (§4.2
do guia).

## Notas
- `documentacao/` **nunca deve ser commitado** (ver §13 do guia). O agente
  referencia o caminho, mas não o move nem o versiona.
- Quando um novo ADR, SKILL ou DESIGN for criado, adicionar uma linha nesta
  tabela antes de usá-lo.
