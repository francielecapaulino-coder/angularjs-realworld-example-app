# Fluxo de trabalho via CODA

Este projeto e conduzido com o agente de engenharia **CODA**. Este documento registra,
de forma explicita, como o trabalho e organizado e onde ficam os artefatos.

## O que e o CODA neste projeto

CODA e o agente que planeja, implementa, testa e documenta cada slice de trabalho,
seguindo um fluxo de papeis (roles) e estados (states) e gerando evidencia concreta.

## Papeis (roles)

- **planner**: levanta contexto e escreve o PLAN da slice.
- **builder**: implementa o codigo/config.
- **evaluator**: roda os gates (build/unit/contract/e2e) e captura evidencia.
- **reviewer / security_reviewer**: revisao de qualidade e seguranca quando aplicavel.
- **closer**: faz merges e finalizacao.

## Estados (states)

`DISCOVERY -> PLANNED -> IMPLEMENTING -> EVALUATING -> FIXING -> DOCUMENTING -> READY`
(ver `docs/agent/OPERATING-GUIDE.md`).

## Onde ficam os artefatos

| Artefato | Local |
|---|---|
| Guia operacional do agente | `docs/agent/OPERATING-GUIDE.md` |
| Estado atual do projeto | `docs/agent/STATE.md` |
| Charter / contexto | `docs/agent/context/CHARTER.md` |
| Trabalho por slice (PLAN/PROGRESS/REVIEW/EVIDENCE) | `docs/agent/work/<slice>/` |
| Decisoes de arquitetura | `docs/adr/` |
| Prompts por slice | `docs/prompts/` |
| DoR / DoD / Skills | `docs/process/` |

## Rastreabilidade

Cada slice deve: ter uma **issue** (DoR), registrar **PLAN/PROGRESS**, e ter o **PR**
referenciando a issue (`Closes #<n>`) com **Conventional Commits**.

## Historico de slices conduzidas via CODA

Slices **002 a 018** (migracao AngularJS -> Angular 21, testes, CI) foram conduzidas via
CODA e estao documentadas em `docs/agent/work/`. A partir da slice **019** (governanca),
os **prompts** tambem passam a ser registrados em `docs/prompts/` (ver nota de lacuna
retroativa em `docs/prompts/README.md`).
