# PLAN — 001-fundacao

## Status
State: PLANNED

## Objetivo
Estabelecer a infraestrutura de processo da Fase 1: atualizar o DevContainer
para Node 22 LTS (pré-requisito da migração Angular 21), proteger arquivos
não-versionáveis via `.git/info/exclude`, criar templates de issue com DoR/DoD
e configurar a bleeding branch.

## Escopo
- Incluído:
  - Atualizar `.devcontainer/devcontainer.json`: `"version": "22"` (Node 22 LTS)
  - Atualizar `.git/info/exclude` local com: `documentacao/`, `harness/`,
    `AGENTS.md`, `CLAUDE.md`
  - Criar templates de issue no GitHub (feature request e bug report) com
    checklist DoR/DoD conforme §6 do guia
  - Criar a branch `bleeding` no repositório remoto
- Fora de escopo:
  - Qualquer alteração em `src/`
  - Instalação do Angular CLI ou outras dependências da migração
  - Configuração de CI/CD
  - Criação de Dockerfile
- files_owned:
  - `.devcontainer/devcontainer.json`
  - `.git/info/exclude`               # local, não versionado
  - `.github/ISSUE_TEMPLATE/`         # novo diretório
  - branch `bleeding`                 # ação git, não arquivo

## Origem e fase
- Fase (ROADMAP): 1 — Fundação
- Documento/bloco de origem: `documentacao/GUIA-DE-REFATORACAO.md` §5.1, §6, §7, §13
- context_sources:
  - skills: []
  - design: null
- affects_design_system_core: false

## Dados, segurança e compliance
- Dados envolvidos / sensibilidade: nenhum dado de usuário; apenas config de
  ambiente e templates de processo.
- Permissões / minimização / mascaramento: n/a
- Auditoria / log: n/a — mudanças de infra de processo; sem operações sensíveis.
- Revisão humana: não requerida (risco B).

## API, entidades e integrações
- Endpoints/contratos: n/a
- Entidades/tabelas: n/a
- Integrações externas: GitHub (criação de templates de issue via arquivos
  `.github/ISSUE_TEMPLATE/`) — não há chamada de API; são arquivos versionados.
- Jobs/eventos: n/a

## Critérios de aceite
- [ ] `.devcontainer/devcontainer.json` aponta para Node 22 LTS
      (`"version": "22"`).
- [ ] `.git/info/exclude` local contém `documentacao/`, `harness/`,
      `AGENTS.md`, `CLAUDE.md` — nenhum desses aparece em `git status`.
- [ ] Templates de issue publicados em `.github/ISSUE_TEMPLATE/` com
      checklists DoR e DoD conforme §6 do guia.
- [ ] Branch `bleeding` criada (local e remote `origin/bleeding`).
- [ ] Nenhum arquivo de `documentacao/` ou `harness/` commitado.

## Operational path & risk
- risk_category: B   # gatilho: `touches_build_deploy` — atualização do
                     # devcontainer altera o ambiente de build de desenvolvimento.
- operational_path: standard_path_B

## Model Profile
```yaml
risk_category: B
planner:   { tier: standard, effort: medium }
generator: { tier: light,    effort: low    }   # mudanças mecânicas: editar JSON,
                                                 # criar arquivos Markdown, um git push
evaluator: { tier: standard, effort: low    }   # verificar config simples + gates
reviewer:  { tier: light,    effort: low    }   # revisão de qualidade básica;
                                                 # sem módulo sensível
cross_family_evaluator: false   # não é fact-sensitive (sem regulação/recall de API)
budget_max_usd: 0.50            # ~4 turnos × $0.08 × 1.5
rationale: |
  Risco B pelo devcontainer (touches_build_deploy). As demais tarefas (exclude,
  templates, branch) são puramente docs/config local — risco A individualmente,
  mas agrupadas com o devcontainer ficam no mesmo standard_path_B. Generator
  light porque as mudanças são mecânicas e bem delimitadas. Evaluator standard
  para garantir que config_review e policy_check são verificados com rigor.
```

## Deterministic gates (a rodar antes de READY)
- config_review: inspecionar `.devcontainer/devcontainer.json` resultante —
  versão Node e imagem base corretas para Angular 21.
- schema_validation: JSON do devcontainer é válido (sem erros de sintaxe).
- policy_check: `git status` e `git ls-files --others` não listam
  `documentacao/`, `harness/`, `AGENTS.md`, `CLAUDE.md` após atualização
  do `.git/info/exclude`.

## Condições de parada
- Se a versão de Node LTS a usar no devcontainer estiver em conflito com alguma
  outra ferramenta pinada no projeto (ex.: engines no `package.json`) — parar
  e perguntar antes de commitar.
- Se a criação da branch `bleeding` falhar por política de proteção do remoto —
  parar e reportar ao usuário.
- Se os templates de issue exigirem labels/projetos não existentes no repositório
  — criar apenas os arquivos Markdown sem referenciar automações externas.

## Riscos e pendências
- Risco: `package.json` atual não tem campo `engines`; após a atualização do
  devcontainer, qualquer desenvolvedor que tente rodar `npm install` com Node 8
  local pode ter surpresas — aceitável, pois Node 8 já é EOL e o devcontainer
  resolve o ambiente padronizado.
- Pendência: nenhuma decisão bloqueante identificada para esta slice.
